import { useTransactionBuilder } from "./features/transaction-payload-builder/hooks/useTransactionBuilder";
import { JsonEditor } from "./components/ui/JsonEditor";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { WarningPanel } from "./features/transaction-payload-builder/components/WarningPanel";
import { PayloadPreview } from "./features/transaction-payload-builder/components/PayloadPreview";

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
    <div className="min-h-screen p-4 font-sans md:p-8" style={{ background: "var(--color-surface-raw)" }}>
      <main className="mx-auto max-w-6xl space-y-8">
        {/* ── Header + Theme Toggle ── */}
        <header
          className="flex items-center justify-between border-b pb-6"
          style={{ borderColor: "var(--color-border-subtle-raw)" }}
        >
          <div>
            <h1 className="text-3xl font-black" style={{ color: "var(--color-text-primary-raw)" }}>
              مبدل Payload تراکنش
            </h1>
            <p className="mt-2" style={{ color: "var(--color-text-secondary-raw)" }}>
              تراکنش‌های خام را به کدهای API نگاشت کنید.
            </p>
          </div>
          <ThemeToggle />
        </header>

        {/* ── Editors ── */}
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

        {/* ── Transform Button ── */}
        <div className="flex justify-center">
          <button
            onClick={handleTransform}
            className="rounded-full px-12 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{
              background: "var(--color-accent-raw)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            پردازش و تبدیل
          </button>
        </div>

        {/* ── Results ── */}
        {result && (
          <div className="space-y-8" style={{ animation: "fadeSlideIn 0.5s ease" }}>
            <WarningPanel warnings={result.warnings} />
            <PayloadPreview payload={result.payload} />

            {/* ── Submit Section ── */}
            <div
              className="flex flex-col items-center gap-4 rounded-2xl border p-6"
              style={{
                background: "var(--color-surface-card-raw)",
                borderColor: "var(--color-border-card-raw)",
              }}
            >
              <h4 className="font-bold" style={{ color: "var(--color-text-primary-raw)" }}>
                ارسال به API مقصد
              </h4>
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-10 py-3 font-bold text-white transition-colors disabled:opacity-50 md:w-auto"
                style={{
                  background: isSubmitting ? "var(--color-text-muted-raw)" : "var(--color-success-raw)",
                }}
              >
                {isSubmitting ? "در حال ارسال..." : "تایید و ارسال نهایی"}
              </button>

              {submitStatus && (
                <div
                  className="text-sm font-medium"
                  style={{
                    color:
                      submitStatus.type === "success"
                        ? "var(--color-success-raw)"
                        : "var(--color-error-raw)",
                  }}
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
