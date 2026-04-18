import { defineConfig } from 'oxfmt'

export default defineConfig({
  semi: false,
  singleQuote: true,
  sortTailwindcss: {
    functions: ['clsx', 'cn', 'cva'],
  },
  sortImports: true,
  ignorePatterns: [],
})
