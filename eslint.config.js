import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    // This single configuration now works because the tsconfig files are mutually exclusive.
    // The parser will correctly resolve which tsconfig to use for each file.
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023, // Updated to be more general
      globals: {
        ...globals.browser,
        ...globals.node, // Allow both browser and node globals
      },
      parserOptions: {
        // Pointing to both is now safe and correct.
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // It's good practice to disable the refresh plugin for non-src files.
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true, checkJS: false },
      ],
    }
  },
  // Add a specific override to turn off React Refresh for config files.
  {
    files: ['vite.config.ts', 'eslint.config.js'],
    rules: {
      'react-refresh/only-export-components': 'off'
    }
  }
])