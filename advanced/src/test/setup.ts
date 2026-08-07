/**
 * هدف فایل: آماده‌سازی محیط تست برای Vitest و React Testing Library.
 * جایگاه معماری: تنظیمات مشترک تست برای کل پروژه.
 */
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class MemoryRequest implements IDBRequest<unknown> {
  public error: DOMException | null = null;
  public result: unknown = undefined;
  public source: IDBObjectStore | IDBIndex | IDBCursor | null = null;
  public transaction: IDBTransaction | null = null;
  public readyState: IDBRequestReadyState = 'done';
  public onsuccess: ((this: IDBRequest<unknown>, ev: Event) => unknown) | null = null;
  public onerror: ((this: IDBRequest<unknown>, ev: Event) => unknown) | null = null;
  public addEventListener(): void {
    return undefined;
  }
  public removeEventListener(): void {
    return undefined;
  }
  public dispatchEvent(): boolean { return true; }
}

Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: {
    open: () => new MemoryRequest(),
    deleteDatabase: () => new MemoryRequest(),
    cmp: (first: unknown, second: unknown) => (first === second ? 0 : String(first) > String(second) ? 1 : -1),
    databases: () => Promise.resolve([]),
  },
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});
