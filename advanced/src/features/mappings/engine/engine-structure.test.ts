/**
 * هدف فایل: تست ساختاری برای حفظ Pure بودن Engine و جلوگیری از وابستگی به React یا Store.
 * جایگاه معماری: تست معماری features/mappings/engine.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const engineDirectory = join(process.cwd(), 'src', 'features', 'mappings', 'engine');

const readEngineSourceFiles = (): readonly string[] =>
  readdirSync(engineDirectory)
    .filter((filename) => filename.endsWith('.ts') && !filename.endsWith('.test.ts'))
    .map((filename) => readFileSync(join(engineDirectory, filename), 'utf8'));

describe('mappingEngineStructure', () => {
  it('نباید از React یا Store داخل engine استفاده کند', () => {
    const source = readEngineSourceFiles().join('\n');

    expect(source).not.toContain("from 'react'");
    expect(source).not.toContain('@/stores');
    expect(source).not.toContain('useWorkspaceStore');
  });
});
