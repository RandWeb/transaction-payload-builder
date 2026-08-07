# TASK 05 — تایپ‌های دامنه و اسکیماهای Zod

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.
> ✅ **Q2 پاسخ داده شد** — ساختار واقعی پیام تراکنش قطعی شد (نسخه ۲ این تسک).
> 🔴 همچنان وابسته به **Q3 (نگاشت کد↔فیلد)**, **Q4 (شکل Payload خروجی)**, **Q5 (فیلدهای خالی)**.

**پیش‌نیاز:** 01 · **خروجی:** قرارداد داده‌ی کل پروژه (Single Source of Truth)

---

## هدف
تعریف **یک‌بار و برای همیشه‌ی** مدل داده بر اساس **ساختار واقعی پیام Fraud**:
پیام ورودی → کاتالوگ Attribute ها → Mapping → Payload → Submission → Template.

رویکرد: **Zod-First** — تمام تایپ‌ها با `z.infer` مشتق می‌شوند تا Drift ایجاد نشود (⛔ بدون `interface` دستی موازی).

---

## 📐 ساختار قطعی پیام ورودی

```
{
  "mainTransaction": {
    "fraudMessageId": "1403082116532207730195",   // شناسه پیام (رشته عددی)
    "sysName":        "CORE",                     // سیستم مبدأ
    "businessId":     "PASSARGAD",                // شناسه کسب‌وکار
    "attrsList": [                                // آرایه طرف‌های تراکنش (Leg)
      { /* ۵۰ کلید PascalCase — تمام مقادیر string یا string[] */ },
      { /* ... */ }
    ]
  }
}
```

### قواعد دامنه‌ای کشف‌شده
1. هر عضو `attrsList` یک **Leg (طرف تراکنش)** است، نه یک Attribute مستقل.
2. `IsDebtor === "1"` → Leg **بدهکار** (برداشت) · `"0"` → Leg **بستانکار** (واریز).
3. تعداد کلیدهای هر Leg **ثابت و برابر ۵۰** است → منطبق بر بازه کدهای مقصد `951..1000`.
4. تمام مقادیر **رشته‌اند**؛ فیلد خالی به‌صورت `""` می‌آید (نه `null`).
5. فیلدهای `SrcNationalCode` و `DestNationalCode` از نوع **`string[]`** هستند.
6. مقادیر هویتی (سپرده، شبا، کد ملی) از قبل با **SHA-1** هش شده‌اند (۴۰ کاراکتر hex).
7. `AccountId` **هش نشده** و به‌صورت خام است.

---

## شرح کار

### ۵-۱ لایه‌ی دو‌سطحی (Raw ↔ Normalized)

> 🔴 **تصمیم معماری الزامی:** دو مدل جدا نگه می‌داریم تا هم وفاداری به ورودی حفظ شود و هم UI با داده‌ی تایپ‌دار کار کند.

| لایه | نقش | محل |
|------|-----|-----|
| **Raw** | آینه‌ی دقیق JSON ورودی — همه چیز `string` / `string[]` | `schemas/fraud-message.schema.ts` |
| **Normalized** | مدل دامنه‌ای تایپ‌دار (number, boolean, Date) | `schemas/normalized-transaction.schema.ts` |

⛔ Mapping Engine **روی لایه Raw** کار می‌کند (چون مقصد هم رشته‌محور است) و Normalized فقط برای **نمایش، اعتبارسنجی و فیلتر در UI** استفاده می‌شود.

---

### ۵-۲ اسکیمای Raw — `features/transactions/schemas/fraud-message.schema.ts`

#### الف) اسکیماهای پایه (Primitives)
```ts
/** رشته‌ای که ممکن است خالی باشد (فیلد بدون مقدار در پیام ورودی) */
export const rawStringSchema = z.string();

/** مقدار هش‌شده SHA-1 یا رشته خالی */
export const sha1OrEmptySchema = z.string().regex(/^$|^[0-9a-f]{40}$/, {
  message: 'مقدار باید هش SHA-1 معتبر (۴۰ کاراکتر) یا خالی باشد.',
});

/** مقدار بولی به‌صورت رشته: "0" | "1" | "" */
export const rawBooleanSchema = z.enum(['0', '1', '']);

/** مبلغ به‌صورت رشته‌ی عددی صحیح نامنفی، یا خالی */
export const rawAmountSchema = z.string().regex(/^$|^\d{1,19}$/, {
  message: 'مبلغ باید رشته‌ای فقط شامل ارقام لاتین باشد.',
});

/**
 * تاریخ و زمان با فرمت مشاهده‌شده در پیام واقعی:
 * "YYYY-MM-DD HH:mm:ss" با کسر ثانیه اختیاری و طول متغیر (۱ تا ۳ رقم)
 * نمونه: "2024-10-21 16:53:22.11"
 */
export const rawDateTimeSchema = z.string().regex(
  /^$|^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,3})?$/,
  { message: 'قالب تاریخ باید «YYYY-MM-DD HH:mm:ss[.SSS]» باشد.' },
);

/** لیست کد ملی هش‌شده */
export const rawHashListSchema = z.array(sha1OrEmptySchema);
```

#### ب) اسکیمای یک Leg — `transactionLegSchema`
شامل **دقیقاً ۵۰ کلید** با `.strict()` تا کلید ناشناخته خطا بدهد:

```ts
export const transactionLegSchema = z.object({
  AccountId:                rawStringSchema,
  AcquireBankBin:           rawStringSchema,
  AcquireBankCode:          rawStringSchema,
  AppliedPinValidationType: rawStringSchema,
  BranchCode:               rawStringSchema,
  CauseTypeCode:            rawStringSchema,
  ChequeNumber:             rawStringSchema,
  DestBankBin:              rawStringSchema,
  DestBankCode:             rawStringSchema,
  DestCardNumber:           rawStringSchema,
  DestCardTypeCode:         rawStringSchema,
  DestDepositNumber:        sha1OrEmptySchema,
  DestDepositType:          rawStringSchema,
  DestIban:                 sha1OrEmptySchema,
  DestNationalCode:         rawHashListSchema,
  FraudMessageId:           rawStringSchema,
  GateSequence:             rawStringSchema,
  HasAcceptedDoc:           rawBooleanSchema,
  IpAddress:                rawStringSchema,
  IsBranch:                 rawBooleanSchema,
  IsDebtor:                 rawBooleanSchema,
  IsReverse:                rawBooleanSchema,
  MerchantCategoryCode:     rawStringSchema,
  OrgName:                  rawStringSchema,
  PinType:                  rawStringSchema,
  ProviderType:             rawStringSchema,
  PspCompanyName:           rawStringSchema,
  ReferenceNumber:          rawStringSchema,
  SequenceCounter:          rawStringSchema,
  SrcBankBin:               rawStringSchema,
  SrcBankCode:              rawStringSchema,
  SrcCardNumber:            rawStringSchema,
  SrcCardTypeCode:          rawStringSchema,
  SrcDepositNumber:         sha1OrEmptySchema,
  SrcDepositType:           rawStringSchema,
  SrcIban:                  sha1OrEmptySchema,
  SrcNationalCode:          rawHashListSchema,
  TerminalCode:             rawStringSchema,
  TerminalType:             rawStringSchema,
  TerminalUId:              rawStringSchema,
  Tool:                     rawStringSchema,
  TransactionAmount:        rawAmountSchema,
  TransactionChannel:       rawStringSchema,
  TransactionDate:          rawDateTimeSchema,
  TransactionFirstName:     rawStringSchema,
  TransactionLastName:      rawStringSchema,
  TransactionSideFirstName: rawStringSchema,
  TransactionSideLastName:  rawStringSchema,
  TransactionTypeCode:      rawStringSchema,
  WorkingDate:              rawStringSchema,
}).strict();
```

> ⚠️ **الزام تست:** یک تست باید تأیید کند `Object.keys(transactionLegSchema.shape).length === 50`
> و این عدد با `ATTRIBUTE_CATALOG.length` و طول بازه کدها **یکسان** است.

#### ج) اسکیمای Header و ریشه
```ts
export const mainTransactionSchema = z.object({
  fraudMessageId: z.string().regex(/^\d{18,26}$/, {
    message: 'شناسه پیام تقلب باید رشته‌ای عددی با طول ۱۸ تا ۲۶ رقم باشد.',
  }),
  sysName:    z.string().min(1, 'نام سیستم مبدأ الزامی است.'),
  businessId: z.string().min(1, 'شناسه کسب‌وکار الزامی است.'),
  attrsList:  z.array(transactionLegSchema)
               .min(1, 'پیام باید حداقل یک طرف تراکنش داشته باشد.'),
});

export const fraudMessageSchema = z.object({
  mainTransaction: mainTransactionSchema,
});
```

#### د) قواعد سطح پیام با `superRefine`
| # | قاعده | شدت |
|---|-------|-----|
| R1 | `FraudMessageId` هر Leg باید با `mainTransaction.fraudMessageId` **یکسان** باشد | ❌ خطا |
| R2 | باید **حداقل یک Leg با `IsDebtor === "1"`** وجود داشته باشد | ❌ خطا |
| R3 | باید **حداقل یک Leg با `IsDebtor === "0"`** وجود داشته باشد | ⚠️ هشدار |
| R4 | مجموع مبالغ بستانکار باید با مجموع مبالغ بدهکار **برابر** باشد | ⚠️ هشدار (شماره Q11) |
| R5 | `TransactionTypeCode` در همه Leg ها یکسان باشد | ⚠️ هشدار |
| R6 | اختلاف `TransactionDate` بین Leg ها بیش از ۲۴ ساعت نباشد | ⚠️ هشدار |
| R7 | هر Leg بدهکار باید `SrcDepositNumber` یا `SrcCardNumber` یا `SrcIban` داشته باشد | ❌ خطا |
| R8 | هر Leg بستانکار باید `DestDepositNumber` یا `DestCardNumber` یا `DestIban` داشته باشد | ❌ خطا |
| R9 | `AccountId` در Leg ها تکراری نباشد | ⚠️ هشدار |

> 🔴 پیاده‌سازی: خطاها با `ctx.addIssue` و هشدارها با تابع جدای
> `collectMessageWarnings(message): ValidationIssue[]` — چون Zod مفهوم Warning ندارد.

---

### ۵-۳ کاتالوگ Attribute ها — `features/mappings/data/attribute-catalog.ts`

> ⭐ این کاتالوگ **قلب پروژه** است و UI ویرایشگر Mapping، برچسب‌های فارسی، Mask و Transform پیش‌فرض را تغذیه می‌کند.

```ts
export type AttributeKind = 'scalar' | 'list';

export type AttributeSemantic =
  | 'text' | 'code' | 'amount' | 'datetime'
  | 'boolean01' | 'hash' | 'ip' | 'card' | 'iban' | 'nationalId';

export type AttributeSide = 'src' | 'dest' | 'terminal' | 'common';

export type AttributeDescriptor = {
  /** نام کلید در attrsList (PascalCase) */
  name: keyof TransactionLeg;
  /** برچسب فارسی برای نمایش در UI */
  labelFa: string;
  kind: AttributeKind;
  semantic: AttributeSemantic;
  side: AttributeSide;
  /** آیا داده حساس است و باید Mask شود (§۱۰) */
  sensitive: boolean;
  /** Transform پیش‌فرض پیشنهادی برای Mapping */
  suggestedTransform: TransformName;
  /** توضیح فارسی */
  descriptionFa: string;
};

export const ATTRIBUTE_CATALOG: readonly AttributeDescriptor[] = [ /* ۵۰ رکورد */ ];
```

#### جدول کامل ۵۰ Attribute (مرتب‌سازی الفبایی → کد ۹۵۱ تا ۱۰۰۰)

| کد پیشنهادی | نام Attribute | برچسب فارسی | نوع | معنا | طرف | حساس |
|---|---|---|---|---|---|---|
| 951 | `AccountId` | شناسه حساب | scalar | code | common | ❌ |
| 952 | `AcquireBankBin` | بین بانک پذیرنده | scalar | code | terminal | ❌ |
| 953 | `AcquireBankCode` | کد بانک پذیرنده | scalar | code | terminal | ❌ |
| 954 | `AppliedPinValidationType` | نوع اعتبارسنجی رمز اعمال‌شده | scalar | code | terminal | ❌ |
| 955 | `BranchCode` | کد شعبه | scalar | code | common | ❌ |
| 956 | `CauseTypeCode` | کد نوع علت | scalar | code | common | ❌ |
| 957 | `ChequeNumber` | شماره چک | scalar | code | common | ✅ |
| 958 | `DestBankBin` | بین بانک مقصد | scalar | code | dest | ❌ |
| 959 | `DestBankCode` | کد بانک مقصد | scalar | code | dest | ❌ |
| 960 | `DestCardNumber` | شماره کارت مقصد | scalar | card | dest | ✅ |
| 961 | `DestCardTypeCode` | کد نوع کارت مقصد | scalar | code | dest | ❌ |
| 962 | `DestDepositNumber` | شماره سپرده مقصد | scalar | hash | dest | ✅ |
| 963 | `DestDepositType` | نوع سپرده مقصد | scalar | code | dest | ❌ |
| 964 | `DestIban` | شبای مقصد | scalar | hash | dest | ✅ |
| 965 | `DestNationalCode` | کد ملی مقصد | **list** | nationalId | dest | ✅ |
| 966 | `FraudMessageId` | شناسه پیام تقلب | scalar | code | common | ❌ |
| 967 | `GateSequence` | توالی درگاه | scalar | code | terminal | ❌ |
| 968 | `HasAcceptedDoc` | دارای سند پذیرفته‌شده | scalar | boolean01 | common | ❌ |
| 969 | `IpAddress` | نشانی IP | scalar | ip | terminal | ✅ |
| 970 | `IsBranch` | انجام‌شده در شعبه | scalar | boolean01 | common | ❌ |
| 971 | `IsDebtor` | طرف بدهکار | scalar | boolean01 | common | ❌ |
| 972 | `IsReverse` | تراکنش برگشتی | scalar | boolean01 | common | ❌ |
| 973 | `MerchantCategoryCode` | کد گروه پذیرنده (MCC) | scalar | code | terminal | ❌ |
| 974 | `OrgName` | نام سازمان | scalar | text | common | ❌ |
| 975 | `PinType` | نوع رمز | scalar | code | terminal | ❌ |
| 976 | `ProviderType` | نوع ارائه‌دهنده | scalar | code | terminal | ❌ |
| 977 | `PspCompanyName` | نام شرکت PSP | scalar | text | terminal | ❌ |
| 978 | `ReferenceNumber` | شماره مرجع | scalar | code | common | ❌ |
| 979 | `SequenceCounter` | شمارنده توالی | scalar | code | common | ❌ |
| 980 | `SrcBankBin` | بین بانک مبدأ | scalar | code | src | ❌ |
| 981 | `SrcBankCode` | کد بانک مبدأ | scalar | code | src | ❌ |
| 982 | `SrcCardNumber` | شماره کارت مبدأ | scalar | card | src | ✅ |
| 983 | `SrcCardTypeCode` | کد نوع کارت مبدأ | scalar | code | src | ❌ |
| 984 | `SrcDepositNumber` | شماره سپرده مبدأ | scalar | hash | src | ✅ |
| 985 | `SrcDepositType` | نوع سپرده مبدأ | scalar | code | src | ❌ |
| 986 | `SrcIban` | شبای مبدأ | scalar | hash | src | ✅ |
| 987 | `SrcNationalCode` | کد ملی مبدأ | **list** | nationalId | src | ✅ |
| 988 | `TerminalCode` | کد پایانه | scalar | code | terminal | ❌ |
| 989 | `TerminalType` | نوع پایانه | scalar | code | terminal | ❌ |
| 990 | `TerminalUId` | شناسه یکتای پایانه | scalar | code | terminal | ❌ |
| 991 | `Tool` | ابزار تراکنش | scalar | code | terminal | ❌ |
| 992 | `TransactionAmount` | مبلغ تراکنش (ریال) | scalar | amount | common | ❌ |
| 993 | `TransactionChannel` | کانال تراکنش | scalar | code | common | ❌ |
| 994 | `TransactionDate` | تاریخ و زمان تراکنش | scalar | datetime | common | ❌ |
| 995 | `TransactionFirstName` | نام صاحب تراکنش | scalar | text | common | ✅ |
| 996 | `TransactionLastName` | نام خانوادگی صاحب تراکنش | scalar | text | common | ✅ |
| 997 | `TransactionSideFirstName` | نام طرف مقابل | scalar | text | common | ✅ |
| 998 | `TransactionSideLastName` | نام خانوادگی طرف مقابل | scalar | text | common | ✅ |
| 999 | `TransactionTypeCode` | کد نوع تراکنش | scalar | code | common | ❌ |
| 1000 | `WorkingDate` | تاریخ روز کاری | scalar | datetime | common | ❌ |

> 🔴 **این تخصیص کد موقتی است** (مرتب‌سازی الفبایی برای قطعی و بازتولیدپذیر بودن).
> ⛔ **تا تأیید Q3 نهایی نیست.** اگر جدول رسمی کد↔فیلد از سمت سرویس مقصد وجود دارد، همان جایگزین می‌شود.

---

### ۵-۴ Mapping — `features/mappings/schemas/mapping.schema.ts`

```ts
export const transformNameSchema = z.enum([
  'none',            // بدون تغییر
  'trim',            // حذف فاصله ابتدا و انتها
  'upper',           // حروف بزرگ
  'lower',           // حروف کوچک
  'digitsToLatin',   // تبدیل ارقام فارسی/عربی به لاتین
  'toNumber',        // رشته → عدد
  'toBoolean',       // "0"/"1" → false/true
  'dateTimeToIso',   // "2024-10-21 16:53:22.11" → ISO-8601  ← جایگزین jalaliToIso
  'dateTimeToJalali',// → تاریخ شمسی برای نمایش
  'maskCard',        // ماسک شماره کارت
  'firstOfList',     // اولین عضو آرایه
  'joinList',        // آرایه → رشته با جداکننده
  'keepList',        // حفظ آرایه به همان شکل
  'emptyToNull',     // "" → null
]);

export const mappingFieldSchema = z.object({
  /** کد مقصد به‌صورت رشته‌ی عددی در بازه ۹۵۱ تا ۱۰۰۰ */
  code: z.string().regex(/^\d{3,4}$/).refine(
    (c) => Number(c) >= TARGET_CODE_MIN && Number(c) <= TARGET_CODE_MAX,
    { message: `کد مقصد باید بین ${TARGET_CODE_MIN} و ${TARGET_CODE_MAX} باشد.` },
  ),
  /** نام Attribute در attrsList */
  sourceField: z.enum(ATTRIBUTE_NAMES),   // ← بسته و تایپ‌دار، نه رشته آزاد
  labelFa:     z.string().min(1),
  valueType:   z.enum(['string', 'number', 'boolean', 'datetime', 'list']),
  required:    z.boolean(),
  transform:   transformNameSchema.default('none'),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]).optional(),
  description:  z.string().optional(),
  /** آیا این فیلد در UI باید Mask شود */
  sensitive:    z.boolean().default(false),
});

export const mappingSchema = z.object({
  version:   z.string().regex(/^\d+\.\d+\.\d+$/, 'نسخه باید طبق Semver باشد.'),
  createdAt: z.string(),
  targetCodeRange: z.object({ min: z.number(), max: z.number() }),
  fields:    z.array(mappingFieldSchema).min(1),
}).superRefine((m, ctx) => {
  // ⛔ کد تکراری
  // ⛔ sourceField تکراری
  // ⛔ تعداد فیلدها بیش از ظرفیت بازه کدها
  // ⚠️ Attribute موجود در کاتالوگ که در Mapping نیست
  // ⛔ ناسازگاری kind کاتالوگ با valueType (مثلاً list → number)
});
```

قواعد سازگاری Transform با نوع (جدول اعتبارسنجی):
| valueType | Transform های مجاز |
|---|---|
| `string` | none, trim, upper, lower, digitsToLatin, maskCard, emptyToNull, firstOfList, joinList |
| `number` | toNumber, digitsToLatin |
| `boolean` | toBoolean |
| `datetime` | dateTimeToIso, dateTimeToJalali, none |
| `list` | keepList, none |

---

### ۵-۵ Payload — `features/payload/schemas/payload.schema.ts`

> 🔴 **وابسته به Q4.** فرض کاری فعلی (تا تأیید نهایی): مقصد همان **ساختار پوششی** را می‌خواهد و فقط کلیدهای Leg به کد عددی تبدیل می‌شوند.

```ts
/** مقدار مجاز یک فیلد در Payload */
export const payloadValueSchema = z.union([
  z.string(), z.number(), z.boolean(), z.array(z.string()), z.null(),
]);

/** یک Leg تبدیل‌شده: کلید = کد مقصد */
export const payloadLegSchema = z.record(
  z.string().regex(/^(9[5-9]\d|1000)$/),
  payloadValueSchema,
);

export const payloadSchema = z.object({
  mainTransaction: z.object({
    fraudMessageId: z.string(),
    sysName:        z.string(),
    businessId:     z.string(),
    attrsList:      z.array(payloadLegSchema).min(1),
  }),
});
```

خروجی نمونه:
```json
{
  "mainTransaction": {
    "fraudMessageId": "1403082116532207730195",
    "sysName": "CORE",
    "businessId": "PASSARGAD",
    "attrsList": [
      { "951": "31470574184", "971": true, "992": 124000000, "994": "2024-10-21T16:53:22.110Z", "987": ["3de5...", "f263..."] }
    ]
  }
}
```

> ⚠️ ترتیب کلیدها **قطعی و صعودی** بر اساس کد عددی (نه رشته‌ای) — برای Diff پایدار و تست‌پذیری.

---

### ۵-۶ Normalized — `features/transactions/schemas/normalized-transaction.schema.ts`

مدل دامنه‌ای برای UI (فیلتر، جستجو، نمایش):
```ts
export type NormalizedLeg = {
  index: number;
  accountId: string;
  role: 'debtor' | 'creditor' | 'unknown';   // مشتق از IsDebtor
  amountRial: number;
  amountToman: number;                        // amountRial / 10 (§۴ واحد پول)
  occurredAt: Date | null;
  occurredAtJalali: string;                   // برای نمایش
  transactionType: string;
  srcNationalIds: string[];
  destNationalIds: string[];
  isBranch: boolean;
  isReverse: boolean;
  raw: TransactionLeg;                        // ارجاع به داده خام
};

export type NormalizedFraudMessage = {
  fraudMessageId: string;
  sysName: string;
  businessId: string;
  legs: NormalizedLeg[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  legCount: number;
  warnings: ValidationIssue[];
};
```

---

### ۵-۷ Submission و Template

```ts
export const submissionSchema = z.object({
  id:        z.string().uuid(),
  createdAt: z.string(),                    // ISO
  createdAtJalali: z.string(),              // شمسی برای نمایش
  requestId: z.string().uuid(),             // X-Request-Id
  request:   payloadSchema,
  response:  z.unknown().optional(),
  error:     z.unknown().optional(),
  httpStatus: z.number().int().optional(),
  durationMs: z.number().int().nonnegative(),
  status:     z.enum(['pending', 'success', 'failed', 'cancelled']),
  /** ⚠️ الزام Audit §۱ */
  mappingVersion:      z.string(),
  transactionSnapshot: fraudMessageSchema,   // با فیلدهای حساس Mask شده
  legCount:            z.number().int().positive(),
  fraudMessageId:      z.string(),           // برای جستجو در تاریخچه
});

export const templateSchema = z.object({
  id:          z.string().uuid(),
  name:        z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  message
- [ ] سایر بندهای DoD §۱۳.

---

## اصلاحیه قرارداد قطعی برای Payload Builder

این اصلاحیه بر بخش‌های Mapping و Payload همین تسک اولویت دارد و باید در زمان پیاده‌سازی لحاظ شود:

- `transaction.json` ورودی ساختار ریشه‌ی `mainTransaction` دارد و `businessId`، `sysName`، `fraudMessageId` و `attrsList` باید با همان نام validate شوند.
- هر عضو `attrsList` یک object از `fieldName -> value` است.
- مقدار مجاز در ورودی و payload فقط `string` یا `array of string` است؛ `number`، `boolean`، `null` و object مجاز نیستند.
- `mapping.json` رسمی پروژه object خام `mappingCode -> fieldName` است، نه آرایه‌ی `fields`.
- برای ساخت payload باید reverse lookup مشتق شود: `fieldName -> mappingCode`.
- schema مربوط به Mapping باید duplicate بودن `fieldName` را خطای blocking بداند.
- payload نهایی برای `POST /transaction` ریشه‌ی flat دارد: `businessId`, `sysName`, `fraudMessageId`, `attrsList`.
- داخل `attrsList` فقط کلیدهای قابل mapping به کد عددی تبدیل می‌شوند؛ فیلدهای unmapped در payload نمی‌آیند و در report ثبت می‌شوند.
- schema و typeهای report باید `unmappedFields` را با `fieldName`, `attrsListIndex`, `value`, `message` پوشش دهند.
- هیچ schema یا type نباید نیاز به type conversion عددی/تاریخی برای payload ایجاد کند.
