/**
 * هدف فایل: تنظیم Vite برای اجرای React و مسیرهای Alias پروژه.
 * جایگاه معماری: نقطه اتصال ابزار Build به ساختار قفل‌شده پوشه‌ها.
 */
import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * پیکربندی اصلی Vite برای پروژه FraudTransactionForge.
 *
 * @returns تنظیمات Build و Alias قابل استفاده در توسعه و خروجی Production.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          workspaceDomain: [
            './src/features/mappings/index.ts',
            './src/features/mappings/engine/payload-builder.ts',
            './src/features/payload/hooks/usePayloadPreview.ts',
            './src/features/submissions/hooks/useSubmitTransaction.ts',
          ],
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
