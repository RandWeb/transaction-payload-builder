/**
 * هدف فایل: تست‌های ساختاری برای حفظ مرزهای معماری و قوانین کدنویسی.
 * جایگاه معماری: src/test/architecture و محافظت از قوانین GLOBAL-RULES.
 */
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();

const sourceFiles = import.meta.glob('/src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true });
const cssFiles = import.meta.glob('/src/**/*.css', { query: '?raw', import: 'default', eager: true });

const entries = Object.entries(sourceFiles)
  .map(([path, content]) => ({ path: path.replace(/^\//, ''), content }))
  .filter((entry) => !entry.path.endsWith('.test.ts') && !entry.path.endsWith('.test.tsx'));

describe('قوانین معماری', () => {
  it('باید engine مستقل از React و Store بماند', () => {
    const engineFiles = entries.filter((entry) => entry.path.startsWith('src/features/mappings/engine/'));
    const violations = engineFiles.filter((entry) => /from ['"]react['"]|from ['"]@\/stores/.test(entry.content));

    expect(violations.map((entry) => entry.path)).toEqual([]);
  });

  it('باید shared بدون import از features باشد', () => {
    const sharedFiles = entries.filter((entry) => entry.path.startsWith('src/shared/'));
    const violations = sharedFiles.filter((entry) => /from ['"]@\/features/.test(entry.content));

    expect(violations.map((entry) => entry.path)).toEqual([]);
  });

  it('نباید any یا ts-ignore در سورس وجود داشته باشد', () => {
    const violations = entries.filter((entry) => /(:\s*any\b|as\s+any\b|<any>|@ts-ignore)/.test(entry.content));

    expect(violations.map((entry) => entry.path)).toEqual([]);
  });

  it('نباید رنگ hex خارج از index.css وجود داشته باشد', () => {
    const sourceViolations = [...entries, ...Object.entries(cssFiles).map(([path, content]) => ({ path: path.replace(/^\//, ''), content }))]
      .filter((entry) => entry.path !== 'src/index.css')
      .filter((entry) => /#[0-9a-fA-F]{3,8}\b/.test(entry.content));

    expect(sourceViolations.map((entry) => entry.path)).toEqual([]);
  });

  it('باید فایل‌های وظیفه تست در مسیر پروژه قابل خواندن باشند', () => {
    const taskPath = join(projectRoot, 'docs/tasks/16-write-unit-and-integration-tests.md');

    expect(readFileSync(taskPath, 'utf8')).toContain('TASK 16');
    expect(relative(projectRoot, taskPath).replaceAll('\\', '/')).toBe('docs/tasks/16-write-unit-and-integration-tests.md');
  });
});
