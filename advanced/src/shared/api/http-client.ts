/**
 * هدف فایل: Wrapper امن و تست‌پذیر روی Fetch API برای ارتباط با سرویس مقصد.
 * جایگاه معماری: shared/api و تنها مسیر عمومی درخواست‌های HTTP برنامه.
 */
import type { z } from 'zod';

import { env } from '@/config/env';
import { AppError } from '@/shared/api/api-error';
import { createRequestId } from '@/shared/api/request-id';
import type { Result } from '@/shared/types/result.types';
import { handleMockRequest } from './mock/mock-server';
import { getMockScenario, type MockScenario } from './mock/mock-scenarios';

export interface HttpClientConfig {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly useMockApi: boolean;
  readonly appEnv: 'development' | 'test' | 'production';
  readonly apiToken?: string;
  readonly mockScenario?: MockScenario;
}

export interface HttpRequestOptions<TResponse> {
  readonly path: string;
  readonly method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly body?: unknown;
  readonly responseSchema: z.ZodType<TResponse>;
  readonly requestId?: string;
  readonly signal?: AbortSignal;
}

export interface HttpSuccess<TResponse> {
  readonly data: TResponse;
  readonly requestId: string;
  readonly durationMs: number;
  readonly httpStatus: number;
}

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const maxRetryCount = 1;

const sleep = (delayMs: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, delayMs));

const joinUrl = (baseUrl: string, path: string): string => {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const shouldRetry = (error: AppError): boolean => error.code === 'NETWORK' || (error.httpStatus !== undefined && error.httpStatus >= 500);

const parseResponseJson = async (response: Response, requestId: string): Promise<Result<unknown>> => {
  try {
    return { ok: true, data: await response.json() };
  } catch (cause) {
    return { ok: false, error: AppError.validation('پاسخ سرویس مقصد JSON معتبر نیست.', { requestId, cause }) };
  }
};

const createHeaders = (requestId: string, apiToken?: string): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-Id': requestId,
  };
  if (apiToken !== undefined && apiToken.trim().length > 0) headers.Authorization = `Bearer ${apiToken}`;
  return headers;
};

const toHttpError = async (response: Response, requestId: string): Promise<AppError> => {
  const parsedJson = await parseResponseJson(response, requestId);
  const details = parsedJson.ok ? parsedJson.data : parsedJson.error.details;
  if (response.status >= 400 && response.status < 500) {
    return new AppError({ code: 'VALIDATION', messageFa: `درخواست توسط سرویس مقصد رد شد. کد وضعیت: ${response.status}`, httpStatus: response.status, details, traceId: requestId });
  }
  return AppError.server(`سرویس مقصد با خطای ${response.status} پاسخ داد.`, { httpStatus: response.status, details, traceId: requestId });
};

const defaultConfig: HttpClientConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeoutMs: env.VITE_REQUEST_TIMEOUT_MS,
  useMockApi: env.VITE_USE_MOCK_API,
  appEnv: env.VITE_APP_ENV,
  apiToken: env.VITE_API_TOKEN,
  mockScenario: env.VITE_MOCK_SCENARIO,
};

export interface HttpClient {
  readonly request: <TResponse>(options: HttpRequestOptions<TResponse>) => Promise<Result<HttpSuccess<TResponse>>>;
}

/**
 * کلاینت HTTP را با config و fetch تزریق‌پذیر می‌سازد.
 *
 * @param config - تنظیمات env یا تست.
 * @param fetcher - تابع Fetch جایگزین برای تست‌ها.
 * @returns کلاینت HTTP با خروجی Result.
 */
export function createHttpClient(config: HttpClientConfig = defaultConfig, fetcher: FetchLike = fetch): HttpClient {
  const request = async <TResponse>(options: HttpRequestOptions<TResponse>): Promise<Result<HttpSuccess<TResponse>>> => {
    const requestId = options.requestId ?? createRequestId();
    const startedAt = performance.now();
    const url = joinUrl(config.baseUrl, options.path);
    let lastError: AppError | null = null;

    for (let attempt = 0; attempt <= maxRetryCount; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), config.timeoutMs);
      const abortFromCaller = (): void => controller.abort();
      options.signal?.addEventListener('abort', abortFromCaller, { once: true });
      try {
        const init: RequestInit = {
          method: options.method ?? 'GET',
          headers: createHeaders(requestId, config.apiToken),
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
          signal: controller.signal,
        };
        const response = config.useMockApi
          ? await handleMockRequest({ url, method: init.method ?? 'GET', body: options.body, signal: controller.signal }, getMockScenario(config.mockScenario), config.timeoutMs)
          : await fetcher(url, init);
        window.clearTimeout(timeoutId);
        options.signal?.removeEventListener('abort', abortFromCaller);

        if (!response.ok) {
          const httpError = await toHttpError(response, requestId);
          lastError = httpError;
          if (attempt < maxRetryCount && shouldRetry(httpError)) {
            await sleep(150 * (attempt + 1));
            continue;
          }
          return { ok: false, error: httpError };
        }

        const parsedJson = await parseResponseJson(response, requestId);
        if (!parsedJson.ok) return parsedJson;
        const parsedResponse = options.responseSchema.safeParse(parsedJson.data);
        if (!parsedResponse.success) {
          return { ok: false, error: AppError.validation('ساختار پاسخ سرویس مقصد معتبر نیست.', parsedResponse.error.issues) };
        }
        const durationMs = Math.round(performance.now() - startedAt);
        if (config.appEnv === 'development') console.warn('درخواست HTTP تکمیل شد.', { requestId, durationMs, status: response.status });
        return { ok: true, data: { data: parsedResponse.data, requestId, durationMs, httpStatus: response.status } };
      } catch (cause) {
        window.clearTimeout(timeoutId);
        options.signal?.removeEventListener('abort', abortFromCaller);
        const networkError = cause instanceof DOMException && cause.name === 'AbortError'
          ? AppError.network('مهلت پاسخ‌گویی سرویس مقصد تمام شد.', { cause, traceId: requestId })
          : AppError.network('ارتباط با سرویس مقصد برقرار نشد.', { cause, traceId: requestId });
        lastError = networkError;
        if (attempt < maxRetryCount) {
          await sleep(150 * (attempt + 1));
          continue;
        }
        return { ok: false, error: networkError };
      }
    }

    return { ok: false, error: lastError ?? AppError.network('درخواست به سرویس مقصد ناموفق بود.', { traceId: requestId }) };
  };

  return { request };
}

export const httpClient = createHttpClient();
