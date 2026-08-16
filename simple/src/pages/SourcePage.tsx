import { useTransaction } from "@/contexts/TransactionContext";
import { JsonEditor } from "@/components/ui/JsonEditor";

export default function SourcePage() {
  const { sourceJson, setSourceJson, errors } = useTransaction();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-black" style={{ color: "var(--color-text-primary-raw)" }}>
          📥 تراکنش مبدأ
        </h2>
        <p style={{ color: "var(--color-text-secondary-raw)" }}>
          JSON تراکنش ورودی را وارد یا جای‌گذاری کنید. می‌توانید از دکمه «مرتب‌سازی» برای فرمت کردن JSON استفاده کنید.
        </p>
      </div>

      <JsonEditor
        label="JSON تراکنش مبدأ"
        id="source-json"
        value={sourceJson}
        onChange={setSourceJson}
        error={errors.source}
        placeholder={`{
  "mainTransaction": {
    "fraudMessageId": "...",
    "sysName": "...",
    "businessId": "...",
    "attrsList": [
      { "AcquireBankCode": "57", "SrcNationalCode": ["hash1"] }
    ]
  }
}`}
      />
    </div>
  );
}
