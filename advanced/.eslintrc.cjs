/**
 * هدف فایل: اعمال قواعد کیفیت کد، TypeScript و مرزبندی معماری.
 * جایگاه معماری: دروازه کنترل کیفیت پیش از تحویل هر تسک.
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.app.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  ignorePatterns: ['dist', 'coverage', 'node_modules'],
  rules: {
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/features/*/**'],
            message: 'Feature ها فقط باید از API عمومی index.ts یکدیگر استفاده کنند.',
          },
        ],
      },
    ],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
  overrides: [
    {
      files: ['*.config.ts', '*.config.js', '.eslintrc.cjs'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['src/shared/components/ui/Toast.tsx', 'src/shared/components/ui/index.ts', 'src/shared/index.ts'],
      rules: {
        'react-refresh/only-export-components': 'off',
      },
    },
  ],
};
