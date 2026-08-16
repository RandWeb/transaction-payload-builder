import { useTransaction } from "@/contexts/TransactionContext";
import { JsonEditor } from "@/components/ui/JsonEditor";

export default function MappingPage() {
  const { mappingJson, setMappingJson, errors } = useTransaction();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-black" style={{ color: "var(--color-text-primary-raw)" }}>
          🗺️ نگاشت فیلدها (Mapping)
        </h2>
        <p style={{ color: "var(--color-text-secondary-raw)" }}>
          دیکشنری نگاشت را وارد کنید. کلید = کد خروجی، مقدار = نام فیلد در attrsList.
        </p>
      </div>

      <div
        className="rounded-lg border p-4 text-sm"
        style={{
          background: "var(--color-accent-soft-raw)",
          borderColor: "var(--color-accent-raw)",
          color: "var(--color-accent-raw)",
        }}
      >
        <p className="mb-2 font-bold">💡 راهنما:</p>
        <ul className="list-inside list-disc space-y-1 text-xs opacity-80">
          <li>کلید (key) = کد عددی فیلد در payload خروجی</li>
          <li>مقدار (value) = نام دقیق فیلد داخل attrsList</li>
          <li>فیلدهایی که در نگاشت نباشند، از خروجی حذف می‌شوند</li>
        </ul>
      </div>

      <JsonEditor
        label="JSON نگاشت (Mapping)"
        id="mapping-json"
        value={mappingJson}
        onChange={setMappingJson}
        error={errors.mapping}
        placeholder={`{
  "1000": "AcquireBankCode",
  "1001": "SrcNationalCode"
}`}
      />
    </div>
  );
}
