/** کدهای خطای اعتبارسنجی — برای ترجمه و تست پایدارتر از متن آزادند */
export type ValidationCode =
  | 'EMPTY_INPUT'
  | 'INVALID_JSON'
  | 'NOT_AN_OBJECT'
  | 'MISSING_MAIN_TRANSACTION'
  | 'MISSING_FIELD'
  | 'INVALID_FIELD_TYPE'
  | 'ATTRS_LIST_NOT_ARRAY'
  | 'ATTRS_ITEM_NOT_OBJECT'
  | 'INVALID_ATTR_VALUE_TYPE'
  | 'MAPPING_NOT_OBJECT'
  | 'MAPPING_VALUE_NOT_STRING'
  | 'MAPPING_EMPTY';

/** یک خطای اعتبارسنجی همراه با مسیر دقیق وقوع آن */
export interface ValidationIssue {
  code: ValidationCode;
  /** مسیر JSON محل خطا، مثل: mainTransaction.attrsList[2].SrcNationalCode */
  path: string;
  /** پیام قابل نمایش به کاربر (فارسی) */
  message: string;
}

/** نتیجهٔ اعتبارسنجی به سبک discriminated union برای type-narrowing امن */
export type ValidationResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly issues: readonly ValidationIssue[] };
