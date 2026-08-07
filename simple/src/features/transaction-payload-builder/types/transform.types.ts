import { type OutputPayload } from './transaction.types';

/** هشدارهایی که در صورت عدم وجود فیلد در مپینگ تولید می‌شوند */
export interface TransformationWarning {
  fieldPath: string; // مثال: attrsList[0].UnknownField
  fieldName: string;
  code: 'FIELD_NOT_IN_MAPPING';
}

/** خروجی نهایی موتور تبدیل */
export interface TransformationResult {
  payload: OutputPayload;
  warnings: TransformationWarning[];
}

export interface ErrorState {
  source?: string | undefined;
  mapping?: string | undefined;
}
