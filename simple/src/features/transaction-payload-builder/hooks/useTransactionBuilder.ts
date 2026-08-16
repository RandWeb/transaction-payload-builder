import { useEffect, useState } from "react";
import { validateMapping, validateSourceTransaction } from "../utils/validation.utils";
import { transformTransaction } from "../utils/transform.utils";
import { type ErrorState, type TransformationResult } from "../types/transform.types";
import { submitTransaction } from "../services/transaction.service";

/** هوک مدیریت حالت‌های برنامه */
export function useTransactionBuilder() {
  const [sourceJson, setSourceJson] = useState("");
  const [mappingJson, setMappingJson] = useState("");

  const [errors, setErrors] = useState<ErrorState>({
    source: undefined,
    mapping: undefined,
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/default-mapping.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load default mapping");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setMappingJson(JSON.stringify(data, null, 2));
        }
      })
      .catch(() => {
        /* ignore – user can still enter manually */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [result, setResult] = useState<TransformationResult | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const handleTransform = () => {
    setSubmitStatus(null);
    const sourceVal = validateSourceTransaction(sourceJson);
    const mappingVal = validateMapping(mappingJson);

    if (!sourceVal.ok || !mappingVal.ok) {
      setErrors({
        source: sourceVal.ok ? undefined : sourceVal.issues[0]?.message,
        mapping: mappingVal.ok ? undefined : mappingVal.issues[0]?.message,
      });
      setResult(null);
      return;
    }

    setErrors({});
    const transformed = transformTransaction(sourceVal.data, mappingVal.data);
    setResult(transformed);
  };

  const handleSubmit = async () => {
    if (!result?.payload) return;
    setIsSubmitting(true);
    setSubmitStatus(null);

    const res = await submitTransaction(result.payload);
    setSubmitStatus({ type: res.success ? "success" : "error", msg: res.message });
    setIsSubmitting(false);
  };

  return {
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
  };
}
