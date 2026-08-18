import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // showcase/ is a Docusaurus site whose theme swizzles are JSX in .js files.
  // Flat config lints .js by default, and no config object here supplies a JSX
  // parser, so every one of them failed to parse — the gate had been red since
  // 2026-07-21 and nobody could read it. Ignored like tests/fixture/**, which is
  // the same kind of directory: a demo app, not this package's source.
  { ignores: ['dist', 'node_modules', 'tests/fixture/**', 'showcase/**'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      // Disable noisy type-checked rules that don't catch real bugs
      // (matches dgmo + app convention).
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  // Disable type-checked linting for files outside the TS project.
  {
    files: ['**/*.config.ts', '**/*.config.mjs', '**/*.config.js'],
    ...tseslint.configs.disableTypeChecked,
  }
);
