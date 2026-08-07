/**
 * هدف فایل: مدیریت server-state قالب‌ها با TanStack Query و API قالب‌ها.
 * جایگاه معماری: features/templates/hooks و پل UI با templates-api.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Template } from '@/features/templates';
import {
  createTemplate,
  duplicateTemplate,
  listTemplates,
  removeTemplate,
  templateNameExists,
  updateTemplate,
  type TemplateInput,
} from '../api/templates-api';

export const templatesQueryKey = ['templates'] as const;

/**
 * لیست قالب‌ها و عملیات create/update/delete/duplicate را برای UI آماده می‌کند.
 *
 * @returns query قالب‌ها و mutationهای مرتبط.
 */
export function useTemplates() {
  const queryClient = useQueryClient();
  const invalidateTemplates = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: templatesQueryKey });
  };

  const templatesQuery = useQuery({
    queryKey: templatesQueryKey,
    queryFn: listTemplates,
  });

  const createMutation = useMutation({
    mutationFn: (input: TemplateInput) => createTemplate(input),
    onSuccess: invalidateTemplates,
  });

  const updateMutation = useMutation({
    mutationFn: (template: Template) => updateTemplate(template),
    onSuccess: invalidateTemplates,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeTemplate(id),
    onSuccess: invalidateTemplates,
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateTemplate(id),
    onSuccess: invalidateTemplates,
  });

  return {
    templatesQuery,
    templates: templatesQuery.data?.ok ? templatesQuery.data.data : [],
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    removeTemplate: removeMutation.mutateAsync,
    duplicateTemplate: duplicateMutation.mutateAsync,
    templateNameExists,
    isMutating: createMutation.isPending || updateMutation.isPending || removeMutation.isPending || duplicateMutation.isPending,
  };
}
