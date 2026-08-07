/**
 * هدف فایل: بازنشر قرارداد Submission و Audit برای مرز عمومی feature ارسال.
 * جایگاه معماری: features/submissions/types و wrapper روی قرارداد shared/db بدون تعریف تکراری.
 */
export { submissionResponseSchema, submissionSchema } from '@/shared/db/submission-record';
export type { Submission, SubmissionMeta, SubmissionResponse } from '@/shared/db/submission-record';
