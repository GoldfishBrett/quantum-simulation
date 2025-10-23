import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// --- RECOMMENDED IMPORTS ---
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', '.vite-cache']),

  {
    // Apply to all TypeScript and React files
    files: ['**/*.{ts,tsx}'],

    // --- RECOMMENDED PLUGINS ---
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y
    },

    // --- RECOMMENDED EXTENDS ---
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended, // Core TypeScript rules
      react.configs.recommended,    // Core React rules
      reactHooks.configs.recommended, // React Hooks rules
      jsxA11y.configs.recommended,  // Accessibility rules
    ],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser, // Standard browser globals
        ...globals.node,    // For config files
      },

      // 1. Use TypeScript parser
      parser: tseslint.parser,

      // 2. Configure parser for React
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
    },

    // --- RECOMMENDED SETTINGS & RULES ---
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },

    rules: {
      // Enable React Refresh plugin
      'react-refresh/only-export-components': 'warn',

      'react/react-in-jsx-scope': 'off',
    },
  },
])