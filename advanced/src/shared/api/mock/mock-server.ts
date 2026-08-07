/**
 * هدف فایل: Adapter داخلی Mock API برای رهگیری درخواست‌های HTTP بدون MSW.
 * جایگاه معماری: shared/api/mock و مصرف کنترل‌شده توسط http-client.
 */
import type { MockScenario } from './mock-scenarios';
import { createMockSuccessResponse, mockValidationErrorResponse } from './mock-data';

export interface MockRequest {
  readonly url: string;
  readonly method: string;
  readonly body?: unknown;
  readonly signal?: AbortSignal;
}

const wait = (delayMs: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, delayMs);
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });

const jsonResponse = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/**
 * درخواست Mock را بر اساس سناریوی انتخاب‌شده پاسخ می‌دهد.
 *
 * @param request - درخواست انتزاعی HTTP.
 * @param scenario - سناریوی Mock.
 * @param timeoutMs - زمان timeout برای سناریوی timeout.
 * @returns پاسخ Fetch-compatible.
 */
export async function handleMockRequest(request: MockRequest, scenario: MockScenario, timeoutMs: number): Promise<Response> {
  const baseDelay = scenario === 'slow' ? 5_000 : 200 + Math.floor(Math.random() * 600);
  if (scenario === 'timeout') await wait(timeoutMs + 50, request.signal);
  else await wait(baseDelay, request.signal);

  if (scenario === 'network-error') throw new TypeError('Mock network failure');
  if (!request.url.endsWith('/transaction') || request.method.toUpperCase() !== 'POST') {
    return jsonResponse({ message: 'مسیر Mock پیدا نشد.' }, 404);
  }
  if (scenario === 'validation-error') return jsonResponse(mockValidationErrorResponse, 400);
  if (scenario === 'server-error') return jsonResponse({ message: 'خطای داخلی سرویس Mock.' }, 500);
  return jsonResponse(createMockSuccessResponse(), 200);
}
