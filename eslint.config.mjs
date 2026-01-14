import nextConfig from 'eslint-config-next'
import tseslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

const customIgnores = [
  'node_modules/**',
  '.next/**',
  'out/**',
  'build/**',
  'dist/**',
  '*.config.js',
  '*.config.ts',
  '*.config.mjs',
  '**/*.py',
  '**/*.pyc',
  '**/__pycache__/**',
  '**/*.ps1',
  '**/*.sh',
  'INPUT_DOC_FOR_CURSOR/**',
  'scripts/**',
]

const customTsRules = {
  '@typescript-eslint/no-unused-vars': [
    'warn',
    {
      argsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/no-explicit-any': 'warn',
  'prettier/prettier': 'warn',
}

export default [
  {
    ignores: customIgnores,
  },
  ...nextConfig,
  prettierConfig, // Must come after nextConfig to override conflicting rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
    },
    rules: {
      ...customTsRules,
    },
  },
]
