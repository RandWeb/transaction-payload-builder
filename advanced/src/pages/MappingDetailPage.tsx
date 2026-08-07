/**
 * هدف فایل: صفحه Placeholder جزئیات نسخه Mapping.
 * جایگاه معماری: pages و مقصد مسیر `/mappings/:version`.
 */
import { useParams } from 'react-router-dom';

import { PageHeader } from '@/shared/components/PageHeader';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

export default function MappingDetailPage(): JSX.Element {
  const { version = 'نامشخص' } = useParams();
  useDocumentTitle(`Mapping ${version}`);
  return <PageHeader title={`جزئیات Mapping ${version}`} subtitle="جزئیات نسخه در تسک‌های بعدی تکمیل می‌شود." />;
}
