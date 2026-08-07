/**
 * هدف فایل: Repository تاریخچه ارسال و Audit روی SQLite.
 * جایگاه معماری: shared/db/repositories و مرز ذخیره‌سازی Submission.
 */
import { AppError } from '@/shared/api/api-error';
import type { SqliteClient } from '@/shared/db/sqlite-client';
import { submissionSchema, type Submission } from '@/shared/db/submission-record';
import { readString } from '@/shared/db/repositories/repository-utils';
import type { Result } from '@/shared/types/result.types';

export interface SubmissionFilter {
  readonly status?: Submission['status'];
  readonly mappingVersion?: string;
  readonly query?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

export interface SubmissionUpdate {
  readonly response?: unknown;
  readonly error?: unknown;
  readonly httpStatus?: number;
  readonly durationMs: number;
  readonly status: Submission['status'];
}

export interface SubmissionPage {
  readonly items: readonly Submission[];
  readonly page: number;
  readonly pageSize: number;
}

export interface SubmissionRepository {
  readonly list: (filter: SubmissionFilter, page: number, pageSize: number) => Promise<Result<SubmissionPage>>;
  readonly getById: (id: string) => Promise<Result<Submission | null>>;
  readonly create: (submission: Submission) => Promise<Result<void>>;
  readonly update: (id: string, update: SubmissionUpdate) => Promise<Result<void>>;
  readonly deleteAll: () => Promise<Result<void>>;
  readonly pruneOlderThan: (maxRecords: number) => Promise<Result<void>>;
}

/**
 * Repository Submission را با صفحه‌بندی و Prune سقف نگه‌داری می‌سازد.
 *
 * @param client - کلاینت SQLite.
 * @returns متدهای تاریخچه ارسال.
 */
export function createSubmissionRepository(client: SqliteClient): SubmissionRepository {
  const rowToSubmission = (row: Record<string, unknown>): Result<Submission> => {
    const request = readString(row, 'request_json');
    if (!request.ok) return request;
    const snapshot = readString(row, 'transaction_snapshot_json');
    if (!snapshot.ok) return snapshot;

    const snapshotValue = JSON.parse(snapshot.data) as unknown;
    const snapshotResult = submissionSchema.shape.transactionSnapshot.safeParse(snapshotValue);
    if (!snapshotResult.success) return { ok: false, error: AppError.validation('Snapshot ذخیره‌شده معتبر نیست.', snapshotResult.error.issues) };

    const submissionLike = {
      id: row.id,
      createdAt: row.created_at,
      createdAtJalali: row.created_at_jalali ?? row.created_at,
      requestId: row.request_id,
      request: JSON.parse(request.data) as unknown,
      response: typeof row.response_json === 'string' ? (JSON.parse(row.response_json) as unknown) : undefined,
      error: typeof row.error_json === 'string' ? (JSON.parse(row.error_json) as unknown) : undefined,
      httpStatus: typeof row.http_status === 'number' ? row.http_status : undefined,
      durationMs: row.duration_ms,
      status: row.status,
      mappingVersion: row.mapping_version,
      transactionSnapshot: snapshotResult.data,
      legCount: row.leg_count,
      fraudMessageId: row.fraud_message_id,
    };

    const result = submissionSchema.safeParse(submissionLike);
    if (!result.success) return { ok: false, error: AppError.validation('رکورد Audit ذخیره‌شده معتبر نیست.', result.error.issues) };
    return { ok: true, data: result.data };
  };

  return {
    list: async (filter, page, pageSize) => {
      await Promise.resolve();
      const conditions: string[] = [];
      const params: (string | number)[] = [];
      if (filter.status !== undefined) {
        conditions.push('status = ?');
        params.push(filter.status);
      }
      if (filter.mappingVersion !== undefined) {
        conditions.push('mapping_version = ?');
        params.push(filter.mappingVersion);
      }
      if (filter.query !== undefined && filter.query.trim().length > 0) {
        conditions.push('fraud_message_id LIKE ?');
        params.push(`%${filter.query.trim()}%`);
      }
      if (filter.dateFrom !== undefined && filter.dateFrom.trim().length > 0) {
        conditions.push('created_at_jalali >= ?');
        params.push(filter.dateFrom.trim());
      }
      if (filter.dateTo !== undefined && filter.dateTo.trim().length > 0) {
        conditions.push('created_at_jalali <= ?');
        params.push(filter.dateTo.trim());
      }
      params.push(pageSize, Math.max(0, page - 1) * pageSize);
      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const rows = client.query(
        `SELECT * FROM submissions ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        params,
      );
      if (!rows.ok) return rows;
      const items: Submission[] = [];
      for (const row of rows.data) {
        const submission = rowToSubmission(row);
        if (!submission.ok) return submission;
        items.push(submission.data);
      }
      return { ok: true, data: { items, page, pageSize } };
    },
    getById: async (id) => {
      await Promise.resolve();
      const rows = client.query(
        'SELECT * FROM submissions WHERE id = ? LIMIT 1',
        [id],
      );
      if (!rows.ok) return rows;
      const row = rows.data[0];
      if (row === undefined) return { ok: true, data: null };
      return rowToSubmission(row);
    },
    create: async (submission) => {
      const parsedSubmission = submissionSchema.safeParse(submission);
      if (!parsedSubmission.success) return { ok: false, error: AppError.validation('رکورد Audit برای ذخیره معتبر نیست.', parsedSubmission.error.issues) };
      const result = client.execute(
        'INSERT INTO submissions (id, created_at, created_at_jalali, request_id, mapping_version, request_json, response_json, error_json, http_status, duration_ms, status, leg_count, fraud_message_id, transaction_snapshot_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          submission.id,
          submission.createdAt,
          submission.createdAtJalali,
          submission.requestId,
          submission.mappingVersion,
          JSON.stringify(submission.request),
          submission.response === undefined ? null : JSON.stringify(submission.response),
          submission.error === undefined ? null : JSON.stringify(submission.error),
          submission.httpStatus ?? null,
          submission.durationMs,
          submission.status,
          submission.legCount,
          submission.fraudMessageId,
          JSON.stringify(submission.transactionSnapshot),
        ],
      );
      if (!result.ok) return result;
      const pruneResult = await createSubmissionRepository(client).pruneOlderThan(1000);
      if (!pruneResult.ok) return pruneResult;
      return client.persist();
    },
    update: async (id, update) => {
      const result = client.execute(
        'UPDATE submissions SET response_json = ?, error_json = ?, http_status = ?, duration_ms = ?, status = ? WHERE id = ?',
        [
          update.response === undefined ? null : JSON.stringify(update.response),
          update.error === undefined ? null : JSON.stringify(update.error),
          update.httpStatus ?? null,
          update.durationMs,
          update.status,
          id,
        ],
      );
      if (!result.ok) return result;
      return client.persist();
    },
    deleteAll: async () => {
      const result = client.execute('DELETE FROM submissions');
      if (!result.ok) return result;
      return client.persist();
    },
    pruneOlderThan: async (maxRecords) => {
      const result = client.execute('DELETE FROM submissions WHERE id NOT IN (SELECT id FROM submissions ORDER BY created_at DESC LIMIT ?)', [maxRecords]);
      if (!result.ok) return result;
      return client.persist();
    },
  };
}
