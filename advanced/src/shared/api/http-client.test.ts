/**
 * هدف فایل: تست رفتار Timeout، Retry و اعتبارسنجی پاسخ HTTP Client.
 * جایگاه معماری: تست واحد shared/api بدون شبکه واقعی.
 */
import { z } from 'zod';
import { describe, expect, it, vi } from 'vitest';

import { createHttpClient, type HttpClientConfig } from './http-client';

const schema = z.object({ ok: z.boolean() });
const config: HttpClientConfig = {
  baseUrl: 'https://api.test',
  timeoutMs: 50,
  useMockApi: false,
  appEnv: 'test',
};

describe('httpClient', () => {
  it('باید خطای 4xx را بدون retry برگرداند', async () => {
    const fetcher = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>().mockResolvedValue(new Response(JSON.stringify({ error: 'bad' }), { status: 400 }));
    const client = createHttpClient(config, fetcher);

    const result = await client.request({ path: '/transaction', method: 'POST', body: {}, responseSchema: schema });

    expect(result.ok).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('باید خطای 5xx را یک بار retry کند', async () => {
    const fetcher = vi
      .fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'server' }), { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const client = createHttpClient(config, fetcher);

    const result = await client.request({ path: '/transaction', method: 'POST', body: {}, responseSchema: schema });

    expect(result.ok).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('باید پاسخ نامعتبر را خطای VALIDATION کند', async () => {
    const fetcher = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>().mockResolvedValue(new Response(JSON.stringify({ bad: true }), { status: 200 }));
    const client = createHttpClient(config, fetcher);

    const result = await client.request({ path: '/transaction', responseSchema: schema });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VALIDATION');
  });

  it('باید X-Request-Id یکتا و Token اختیاری را در Header بگذارد', async () => {
    const fetcher = vi
      .fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const client = createHttpClient({ ...config, apiToken: 'secret-token' }, fetcher);

    const first = await client.request({ path: '/transaction', responseSchema: schema });
    const second = await client.request({ path: '/transaction', responseSchema: schema });
    const firstHeaders = fetcher.mock.calls[0]?.[1]?.headers as Record<string, string>;

    expect(first.ok && second.ok && first.data.requestId !== second.data.requestId).toBe(true);
    expect(firstHeaders['X-Request-Id']).toBeDefined();
    expect(firstHeaders.Authorization).toBe('Bearer secret-token');
  });

  it('باید سناریوی Mock موفق را بدون شبکه واقعی پاسخ دهد', async () => {
    const fetcher = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();
    const client = createHttpClient({ ...config, timeoutMs: 1_000, useMockApi: true, mockScenario: 'success' }, fetcher);

    const result = await client.request({ path: '/transaction', method: 'POST', body: {}, responseSchema: z.object({ referenceId: z.string().uuid(), status: z.literal('accepted'), receivedAt: z.string() }) });

    expect(result.ok).toBe(true);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('باید سناریوهای خطای Mock را شبیه‌سازی کند', async () => {
    const validationClient = createHttpClient({ ...config, timeoutMs: 1_000, useMockApi: true, mockScenario: 'validation-error' });
    const serverClient = createHttpClient({ ...config, timeoutMs: 1_000, useMockApi: true, mockScenario: 'server-error' });
    const networkClient = createHttpClient({ ...config, timeoutMs: 1_000, useMockApi: true, mockScenario: 'network-error' });
    const timeoutClient = createHttpClient({ ...config, timeoutMs: 10, useMockApi: true, mockScenario: 'timeout' });

    const validationResult = await validationClient.request({ path: '/transaction', method: 'POST', body: {}, responseSchema: schema });
    const serverResult = await serverClient.request({ path: '/transaction', method: 'POST', body: {}, responseSchema: schema });
    const networkResult = await networkClient.request({ path: '/transaction', method: 'POST', body: {}, responseSchema: schema });
    const timeoutResult = await timeoutClient.request({ path: '/transaction', method: 'POST', body: {}, responseSchema: schema });

    expect(validationResult.ok).toBe(false);
    if (!validationResult.ok) expect(validationResult.error.code).toBe('VALIDATION');
    expect(serverResult.ok).toBe(false);
    if (!serverResult.ok) expect(serverResult.error.code).toBe('SERVER');
    expect(networkResult.ok).toBe(false);
    if (!networkResult.ok) expect(networkResult.error.code).toBe('NETWORK');
    expect(timeoutResult.ok).toBe(false);
    if (!timeoutResult.ok) expect(timeoutResult.error.messageFa).toContain('مهلت');
  });

  it('باید سناریوی Mock کند را با timeout کافی موفق کند', async () => {
    const client = createHttpClient({ ...config, timeoutMs: 6_000, useMockApi: true, mockScenario: 'slow' });

    const result = await client.request({ path: '/transaction', method: 'POST', body: {}, responseSchema: z.object({ referenceId: z.string().uuid(), status: z.literal('accepted'), receivedAt: z.string() }) });

    expect(result.ok).toBe(true);
  });
});
