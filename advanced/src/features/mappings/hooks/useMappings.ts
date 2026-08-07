/**
 * هدف فایل: مدیریت نسخه‌های Mapping از SQLite و همگام‌سازی Mapping فعال با Workspace Store.
 * جایگاه معماری: features/mappings/hooks و مرز UI با Repository.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Mapping } from '@/features/mappings';
import { createMappingRepository, type MappingVersionSummary } from '@/shared/db/repositories/mapping.repository';
import { getSqliteClient } from '@/shared/db/sqlite-client';
import { usePayloadActions } from '@/stores';

interface UseMappingsState {
  readonly activeMapping: Mapping | null;
  readonly versions: readonly MappingVersionSummary[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly reload: () => Promise<void>;
  readonly saveVersion: (mapping: Mapping, version: string, activate: boolean) => Promise<string | null>;
  readonly activateVersion: (version: string) => Promise<string | null>;
  readonly deleteVersion: (version: string) => Promise<string | null>;
  readonly getVersion: (version: string) => Promise<Mapping | string | null>;
}

/**
 * Repository Mapping را lazy می‌سازد و عملیات نسخه‌ها را برای UI آماده می‌کند.
 *
 * @returns وضعیت نسخه‌ها و عملیات save/activate/delete.
 */
export function useMappings(): UseMappingsState {
  const [activeMapping, setActiveMappingState] = useState<Mapping | null>(null);
  const [versions, setVersions] = useState<readonly MappingVersionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setActiveMapping } = usePayloadActions();

  const loadRepository = useCallback(async () => {
    const client = await getSqliteClient();
    if (!client.ok) return client;
    return { ok: true as const, data: createMappingRepository(client.data) };
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const repository = await loadRepository();
    if (!repository.ok) {
      setError(repository.error.messageFa);
      setIsLoading(false);
      return;
    }

    const [activeResult, versionsResult] = await Promise.all([repository.data.getActive(), repository.data.listVersions()]);
    if (!activeResult.ok) {
      setError(activeResult.error.messageFa);
    } else if (!versionsResult.ok) {
      setError(versionsResult.error.messageFa);
    } else {
      setActiveMappingState(activeResult.data);
      setActiveMapping(activeResult.data);
      setVersions(versionsResult.data);
      setError(null);
    }
    setIsLoading(false);
  }, [loadRepository, setActiveMapping]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveVersion = useCallback(async (mapping: Mapping, version: string, activate: boolean): Promise<string | null> => {
    const repository = await loadRepository();
    if (!repository.ok) return repository.error.messageFa;
    const result = await repository.data.save(mapping, version, activate);
    if (!result.ok) return result.error.messageFa;
    await reload();
    return null;
  }, [loadRepository, reload]);

  const activateVersion = useCallback(async (version: string): Promise<string | null> => {
    const repository = await loadRepository();
    if (!repository.ok) return repository.error.messageFa;
    const result = await repository.data.setActive(version);
    if (!result.ok) return result.error.messageFa;
    await reload();
    return null;
  }, [loadRepository, reload]);

  const deleteVersion = useCallback(async (version: string): Promise<string | null> => {
    const repository = await loadRepository();
    if (!repository.ok) return repository.error.messageFa;
    const result = await repository.data.delete(version);
    if (!result.ok) return result.error.messageFa;
    await reload();
    return null;
  }, [loadRepository, reload]);

  const getVersion = useCallback(async (version: string): Promise<Mapping | string | null> => {
    const repository = await loadRepository();
    if (!repository.ok) return repository.error.messageFa;
    const result = await repository.data.getByVersion(version);
    if (!result.ok) return result.error.messageFa;
    return result.data;
  }, [loadRepository]);

  return useMemo(
    () => ({ activeMapping, versions, isLoading, error, reload, saveVersion, activateVersion, deleteVersion, getVersion }),
    [activeMapping, activateVersion, deleteVersion, error, getVersion, isLoading, reload, saveVersion, versions],
  );
}
