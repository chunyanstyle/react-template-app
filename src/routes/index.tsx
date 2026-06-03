import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { setAccessToken } from '@/lib/access-token'

/**
 * 与 translate 页一致，便于 `/` 或 `/hc-translate/?text=xxx&auth=xxx` 重定向时保留正文参数。
 * `auth` 为 access_token，写入 localStorage 后不再出现在地址栏。
 */
const indexSearchSchema = z.object({
  text: z.string().optional(),
  auth: z.string().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: indexSearchSchema,
  beforeLoad: ({ search }) => {
    if (search.auth) {
      setAccessToken(search.auth)
    }

    throw redirect({
      to: '/translate',
      search: { text: search.text },
      replace: true,
    })
  },
})
