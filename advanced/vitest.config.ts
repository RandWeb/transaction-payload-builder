/**
 * هدف فایل: تنظیم Vitest برای تست‌های واحد و کامپوننتی پروژه.
 * جایگاه معماری: زیرساخت تست مشترک برای تمام Feature ها و Shared ها.
 */
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';

/**
 * پیکربندی تست با محیط شبیه مرورگر برای React Testing Library.
 *
 * @returns تنظیمات Vitest شامل Alias و فایل Setup مشترک.
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/test/setup.ts',
    coverage: {
      provider: 'v8',
      thresholds: {
        'src/features/mappings/engine/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/shared/lib/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/features/transactions/utils/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/shared/api/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/stores/**': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/shared/db/repositories/**': {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@/features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@/shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@/stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@/config': fileURLToPath(new URL('./src/config', import.meta.url)),
    },
  },
});
