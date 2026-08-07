/**
 * هدف فایل: تایپ‌های گزارش ساخت Payload و فیلدهای مشتق‌شده Mapping.
 * جایگاه معماری: features/mappings/types و قرارداد مشترک Engine و UI.
 */
import type { Payload } from '@/features/payload';
import type { PayloadValue } from '@/features/payload';
import type { MappingRequiredCodes } from './mapping.types';

export type TransformName = 'none' | 'trim' | 'upper' | 'lower' | 'digitsToLatin' | 'jalaliToIso' | 'toNumber' | 'toBoolean' | 'maskCard';
export type ResolvedValueSource = 'attribute' | 'default';
export type OmitToken = 'OMIT';

export interface MappingField {
  readonly code: string;
  readonly sourceField: string;
  readonly labelFa: string;
  readonly valueType: 'string' | 'array' | 'unknown';
  readonly required: boolean;
  readonly defaultValue?: PayloadValue;
  readonly transform: TransformName;
}

export type { MappingRequiredCodes };

export interface ResolvedValue {
  readonly value: PayloadValue;
  readonly source: ResolvedValueSource;
}

export interface BuildValidationIssue {
  readonly path: readonly (string | number)[];
  readonly message: string;
  readonly code?: string;
  readonly sourceField?: string;
}

export interface BuildReport {
  readonly mappedFields: readonly {
    readonly code: string;
    readonly attrsListIndex?: number;
    readonly sourceField: string;
    readonly labelFa: string;
    readonly rawValue: unknown;
    readonly finalValue: unknown;
    readonly transform: TransformName;
    readonly source: ResolvedValueSource;
  }[];
  readonly omittedFields: readonly { readonly code: string; readonly sourceField: string; readonly reason: string }[];
  readonly unmappedFields: readonly { readonly fieldName: string; readonly attrsListIndex: number; readonly value: unknown; readonly message: string }[];
  readonly unmappedAttributes: readonly { readonly name: string; readonly value: unknown }[];
  readonly errors: readonly BuildValidationIssue[];
  readonly warnings: readonly BuildValidationIssue[];
}

export interface BuildOutput {
  readonly payload: Payload;
  readonly mappingVersion: string;
  readonly builtAt: string;
  readonly report: BuildReport;
}
