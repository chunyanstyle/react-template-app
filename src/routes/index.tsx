import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

/** 与 translate 页一致，便于 `/` 或 `/hc-translate/?text=xxx` 重定向时保留查询参数 */
const indexSearchSchema = z.object({
  text: z.string().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: indexSearchSchema,
  beforeLoad: ({ search }) => {
    throw redirect({
      to: '/translate',
      search: { text: search.text },
    })
  },
})
