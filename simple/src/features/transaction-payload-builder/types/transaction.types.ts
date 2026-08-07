/** مقدار مجاز برای هر فیلد داخل attrsList: رشته یا آرایه‌ای از رشته */
export type AttrValue = string | string[];

/** یک آیتم از attrsList — مجموعه‌ای از جفت‌های نام فیلد/مقدار */
export type AttrsListItem = Record<string, AttrValue>;

/** بدنهٔ اصلی تراکنش ورودی */
export interface MainTransaction {
  fraudMessageId: string;
  sysName: string;
  businessId: string;
  attrsList: AttrsListItem[];
}

/** ساختار کامل JSON مبدأ که کاربر وارد می‌کند */
export interface SourceTransaction {
  mainTransaction: MainTransaction;
}

/** Payload نهایی که به API ارسال می‌شود (بدون لایهٔ mainTransaction) */
export interface OutputPayload {
  fraudMessageId: string;
  sysName: string;
  businessId: string;
  attrsList: AttrsListItem[];
}

/**
 * دیکشنری نگاشت.
 * کلید  = کد خروجی (مثلاً "1000")
 * مقدار = نام دقیق فیلد در attrsList مبدأ (مثلاً "AcquireBankCode")
 */
export type MappingDictionary = Record<string, string>;
