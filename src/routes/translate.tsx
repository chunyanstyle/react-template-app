import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import {
  TranslationView,
  type TargetLangValue,
} from '@/features/translation/components'
import {
  getAuthorizationHeaders,
  setAccessToken,
} from '@/lib/access-token'

/**
 * 校验并解析查询串：应用内路径 `/translate?text=xxx`（部署后完整 URL 含 Vite `base`，如 `/hc-translate/translate?text=xxx`）
 * 可选 `auth` 为 access_token，落库后从地址栏移除。生成链接时请对正文使用 encodeURIComponent。
 */
const translateSearchSchema = z.object({
  text: z.string().optional(),
  auth: z.string().optional(),
})

export const Route = createFileRoute('/translate')({
  validateSearch: translateSearchSchema,
  beforeLoad: ({ search }) => {
    if (!search.auth) return

    setAccessToken(search.auth)
    throw redirect({
      to: '/translate',
      search: { text: search.text },
      replace: true,
    })
  },
  component: RouteComponent,
})

type TranslateTextResponse = {
  translated_text: string
}

/** 无 ?text= 时的示例文案（便于本地预览样式） */
const SAMPLE_TRANSLATION = '未检测到文本'

async function translateText(text: string, targetLang: TargetLangValue) {
  const formData = new FormData()
  formData.set('text', text)
  formData.set('target_lang', targetLang)

  const authHeaders = getAuthorizationHeaders()
  const response = await fetch('/dwt-tl/translate/text', {
    method: 'POST',
    body: formData,
    ...(authHeaders ? { headers: authHeaders } : {}),
  })

  if (!response.ok) {
    throw new Error(`翻译请求失败: ${response.status}`)
  }

  const data = (await response.json()) as Partial<TranslateTextResponse>

  if (typeof data.translated_text !== 'string') {
    throw new Error('翻译响应格式无效')
  }

  return data.translated_text
}

function getErrorText(error: unknown) {
  if (error instanceof Error && error.message !== '') {
    return error.message
  }

  return '翻译失败，请稍后重试。'
}

function RouteComponent() {
  const { text } = Route.useSearch()
  const sourceText = text?.trim() ?? ''
  const [targetLang, setTargetLang] = React.useState<TargetLangValue>('zh')
  const [refreshSeed, setRefreshSeed] = React.useState(0)

  const translationQuery = useQuery({
    queryKey: ['translate-text', sourceText, targetLang, refreshSeed],
    queryFn: () => translateText(sourceText, targetLang),
    enabled: sourceText !== '',
    retry: false,
    staleTime: 0,
  })

  const translatedText = React.useMemo(() => {
    if (sourceText === '') {
      return SAMPLE_TRANSLATION
    }

    if (translationQuery.isPending) {
      return '翻译中...'
    }

    if (translationQuery.isError) {
      return getErrorText(translationQuery.error)
    }

    return translationQuery.data ?? ''
  }, [sourceText, translationQuery.data, translationQuery.error, translationQuery.isError, translationQuery.isPending])

  return (
    // 占满视口高度，子组件用 flex 分配：顶栏 / 可滚译文 / 底栏
    // 底部预留 50px，避免底栏操作区被 Home 指示条、浏览器工具栏等遮挡
    <div className="flex h-dvh w-full min-h-0 flex-col overflow-hidden px-2 pt-3 pb-[60px]">
      <TranslationView
        className="min-h-0 flex-1"
        translatedText={translatedText}
        targetLang={targetLang}
        onTargetLangChange={setTargetLang}
        onCopy={() => console.log('已复制')}
        onRegenerate={() => {
          if (sourceText !== '') {
            setRefreshSeed((value) => value + 1)
          }
        }}
      />
    </div>
  )
}
