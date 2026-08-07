/**
 * هدف فایل: API عمومی Feature قالب‌ها.
 * جایگاه معماری: مرز عمومی features/templates.
 */
export { templateSchema } from './schemas/template.schema';
export {
  createTemplate,
  defaultTemplates,
  duplicateTemplate,
  exportTemplateToJson,
  getTemplateById,
  listTemplates,
  parseTemplateJson,
  removeTemplate,
  seedDefaultTemplates,
  templateNameExists,
  updateTemplate,
} from './api/templates-api';
export { LoadTemplateDialog } from './components/LoadTemplateDialog';
export { SaveTemplateDialog } from './components/SaveTemplateDialog';
export { TemplateActionButton, TemplateCard } from './components/TemplateCard';
export { TemplateList } from './components/TemplateList';
export { useTemplates } from './hooks/useTemplates';
export { summarizeTemplate } from './utils/template-summary';
export type { LoadTemplateDialogProps } from './components/LoadTemplateDialog';
export type { SaveTemplateDialogProps } from './components/SaveTemplateDialog';
export type { TemplateCardProps } from './components/TemplateCard';
export type { TemplateSummary } from './utils/template-summary';
export type { TemplateInput } from './api/templates-api';
export type { Template } from './schemas/template.schema';
