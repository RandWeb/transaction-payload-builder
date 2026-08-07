import type {
  MappingDictionary,
  SourceTransaction,
  AttrsListItem,
} from '../types/transaction.types';
import type { TransformationResult, TransformationWarning } from '../types/transform.types';
import { getReverseMapping } from './mapping.utils';

/** موتور اصلی تبدیل داده‌ها */
export function transformTransaction(
  source: SourceTransaction,
  mapping: MappingDictionary,
): TransformationResult {
  const { mainTransaction } = source;
  const reverseMap = getReverseMapping(mapping);
  const warnings: TransformationWarning[] = [];

  // تبدیل attrsList
  const transformedAttrsList: AttrsListItem[] = mainTransaction.attrsList.map((item, index) => {
    const newItem: AttrsListItem = {};

    Object.entries(item).forEach(([fieldName, value]) => {
      const targetCode = reverseMap[fieldName];

      if (targetCode) {
        // فیلد در نگاشت وجود دارد
        newItem[targetCode] = value;
      } else {
        // فیلد در نگاشت نیست -> تولید هشدار و نادیده گرفتن فیلد
        warnings.push({
          fieldPath: `attrsList[${index}].${fieldName}`,
          fieldName,
          code: 'FIELD_NOT_IN_MAPPING',
        });
      }
    });

    return newItem;
  });

  return {
    payload: {
      fraudMessageId: mainTransaction.fraudMessageId,
      sysName: mainTransaction.sysName,
      businessId: mainTransaction.businessId,
      attrsList: transformedAttrsList,
    },
    warnings,
  };
}
