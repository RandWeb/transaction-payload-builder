/**
 * هدف فایل: نقطه ورود React و اتصال برنامه به DOM.
 * جایگاه معماری: مرز Bootstrap کلاینتی پروژه FraudTransactionForge.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers';
import '@/index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('ریشه برنامه پیدا نشد. لطفاً فایل index.html را بررسی کنید.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
