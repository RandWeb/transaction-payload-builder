import { useTransactionBuilder } from './features/transaction-payload-builder/hooks/useTransactionBuilder';
import { JsonEditor } from './components/ui/JsonEditor';
import { WarningPanel } from './features/transaction-payload-builder/components/WarningPanel';
import { PayloadPreview } from './features/transaction-payload-builder/components/PayloadPreview';

export default function App() {
  const {
    sourceJson,
    setSourceJson,
    mappingJson,
    setMappingJson,
    errors,
    result,
    isSubmitting,
    submitStatus,
    handleTransform,
    handleSubmit,
  } = useTransactionBuilder();

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans md:p-8 dark:bg-slate-950">
      <main className="mx-auto max-w-6xl space-y-8 ">
        <header className="border-b border-slate-200 pb-6 dark:border-slate-800 ">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            مبدل Payload تراکنش
          </h1>
          <p className="mt-2 text-slate-500">تراکنش‌های خام را به کدهای API نگاشت کنید.</p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <JsonEditor
            label="JSON تراکنش مبدأ"
            id="source-json"
            value={sourceJson}
            onChange={setSourceJson}
            error={errors.source}
            placeholder='{ "mainTransaction": { ... } }'
          />
          <JsonEditor
            label="JSON نگاشت (Mapping)"
            id="mapping-json"
            value={mappingJson}
            onChange={setMappingJson}
            error={errors.mapping}
            placeholder='{ "1000": "Field_Name" }'
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleTransform}
            className="rounded-full bg-blue-600 px-12 py-3 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:bg-blue-700 active:scale-95"
          >
            پردازش و تبدیل
          </button>
        </div>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
            <WarningPanel warnings={result.warnings} />

            <PayloadPreview payload={result.payload} />

            <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h4 className="font-bold">ارسال به API مقصد</h4>
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-10 py-3 font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-slate-400 md:w-auto"
              >
                {isSubmitting ? 'در حال ارسال...' : 'تایید و ارسال نهایی'}
              </button>

              {submitStatus && (
                <div
                  className={`text-sm font-medium ${submitStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}
                >
                  {submitStatus.msg}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
