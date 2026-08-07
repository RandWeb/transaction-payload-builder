/**
 * هدف فایل: API عمومی لایه دیتابیس محلی.
 * جایگاه معماری: shared/db برای مصرف کنترل‌شده در Feature ها و Settings.
 */
export { exportDatabaseBlob, importDatabaseBytes } from './db-export';
export { createSqliteClient, getSqliteClient } from './sqlite-client';
export type { DatabaseFileStore, SqliteClient } from './sqlite-client';
export { submissionResponseSchema, submissionSchema } from './submission-record';
export type { Submission, SubmissionMeta, SubmissionResponse } from './submission-record';
export { templateSchema, templateTransactionSchema } from './template-record';
export type { Template } from './template-record';
export { createMappingRepository } from './repositories/mapping.repository';
export type { MappingRepository, MappingVersionRecord, MappingVersionSummary } from './repositories/mapping.repository';
export { createSubmissionRepository } from './repositories/submission.repository';
export type { SubmissionFilter, SubmissionPage, SubmissionRepository } from './repositories/submission.repository';
export { createTemplateRepository } from './repositories/template.repository';
export type { TemplateRepository } from './repositories/template.repository';
