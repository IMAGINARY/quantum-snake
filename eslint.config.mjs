import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs', // Ignore ESLint configuration files, because they are not TypeScript files.
      'dist-dev', // Ignore the development build directory.
      '.*/**/*', // Ignore all files in hidden directories.
    ],
  },
  { files: ['src/ts/**/*.ts'] },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      'no-underscore-dangle': [
        'error',
        {
          allowAfterThis: true,
        },
      ],
      'no-unused-vars': 'off',
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/no-floating-promises': [
        'error',
        { ignoreVoid: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      'import/prefer-default-export': 'off',
    },
  },
);
