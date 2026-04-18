//  @ts-check
import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import pluginRouter from '@tanstack/eslint-plugin-router'
import pluginReact from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  // 1. 基础配置 - 最先
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
  },

  // 2. JavaScript 推荐规则
  js.configs.recommended,

  // 3. TypeScript 推荐规则
  ...tseslint.configs.recommended,

  // 4. React 推荐规则
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'], // Add this if you are using React 17+

  // 5. React Hooks 规则
  reactHooks.configs.flat.recommended,

  // 6. 其他插件规则
  ...pluginRouter.configs['flat/recommended'],
  ...pluginQuery.configs['flat/recommended'],
])
