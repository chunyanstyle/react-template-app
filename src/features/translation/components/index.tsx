import * as React from "react"
import { ArrowRight, Copy, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select"

/** 目标语言选项：value 用于表单/逻辑，标签为界面展示文案 */
const TARGET_LANG_OPTIONS = [
  { value: "zh", label: "中文" },
  { value: "en", label: "英文" },
  { value: "ja", label: "日语" },
  { value: "ko", label: "韩语" },
  { value: "fr", label: "法语" },
  { value: "de", label: "德语" },
  { value: "es", label: "西班牙语" },
  { value: "it", label: "俄语" },
  { value: "ar", label: "阿拉伯语" },
  { value: "th", label: "泰语" },
  { value: "vi", label: "越南语" },
  { value: "pt", label: "葡萄牙语" },
  { value: "id", label: "印尼语" },
  { value: "ms", label: "马来语" },
  { value: "el", label: "希腊语" },
  { value: "he", label: "希伯来语" },
  { value: "uk", label: "乌克兰语" },
  { value: "fa", label: "波斯语" },
  { value: "hi", label: "印地语" },
] as const

export type TargetLangValue = (typeof TARGET_LANG_OPTIONS)[number]["value"]

export interface TranslationViewProps {
  /** 译文正文（主内容区） */
  translatedText: string
  /** 点击复制成功后的额外回调（提示已由 react-hot-toast 处理） */
  onCopy?: () => void
  /** 点击「重新生成」 */
  onRegenerate?: () => void
  /** 受控：当前目标语言 */
  targetLang?: TargetLangValue | null
  /** 受控：目标语言变更 */
  onTargetLangChange?: (lang: TargetLangValue) => void
  className?: string
}

/**
 * 翻译结果展示：顶栏语言识别与目标语、可滚动正文、底部复制/重新生成。
 * 外层建议使用 h-dvh + flex 列，本组件用 flex-1 min-h-0 占满剩余高度；
 * 顶栏与底栏不随正文滚动，正文在中间区域单独纵向滚动。
 */
export function TranslationView({
  translatedText,
  onCopy,
  onRegenerate,
  targetLang: targetLangControlled,
  onTargetLangChange,
  className,
}: TranslationViewProps) {
  const [targetLangInternal, setTargetLangInternal] =
    React.useState<TargetLangValue>("zh")

  const isControlled = targetLangControlled !== undefined
  const targetLang = isControlled
    ? (targetLangControlled ?? "zh")
    : targetLangInternal

  const setTargetLang = React.useCallback(
    (v: TargetLangValue) => {
      if (!isControlled) setTargetLangInternal(v)
      onTargetLangChange?.(v)
    },
    [isControlled, onTargetLangChange],
  )

  /** 将当前译文写入剪贴板，成功/失败用 react-hot-toast 提示 */
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(translatedText)
      toast.success("已复制到剪贴板")
      onCopy?.()
    } catch {
      toast.error("复制失败，请检查浏览器权限或非安全环境")
    }
  }, [translatedText, onCopy])

  return (
    <article
      className={cn(
        // 纵向 flex：固定头尾 + 中间 flex-1 滚动，占满父级高度（父级需有明确高度）
        "flex min-h-0 w-full max-w-none flex-col overflow-hidden rounded-[10px] bg-white shadow-none",
        className,
      )}
    >
      {/* 顶栏（固定于卡片顶部）：自动识别 / 箭头 / 目标语言，不参与正文滚动 */}
      <header className="grid w-full shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4">
        {/* 与右侧 SelectTrigger 同为 h-9 */}
        <div
          className="flex h-9 w-full min-w-0 items-center rounded-lg border border-[#E0E0E0] bg-white px-3 text-sm text-[#666666]"
          aria-readonly
        >
          自动识别
        </div>
        <div
          className="flex shrink-0 items-center justify-center text-[#999999]"
          aria-hidden
        >
          <ArrowRight className="size-4" strokeWidth={2} />
        </div>
        <div className="flex min-w-0 w-full flex-col">
          <Select
            items={TARGET_LANG_OPTIONS}
            value={targetLang}
            onValueChange={(v) => {
              if (v) setTargetLang(v as TargetLangValue)
            }}
          >
            <SelectTrigger
              size="default"
              className={cn(
                "h-9 w-full min-w-0 rounded-lg border-[#E0E0E0] bg-white px-3 py-0 text-sm text-[#333333] shadow-none hover:bg-[#fafafa] focus-visible:ring-[#cccccc]/40",
                "data-[size=default]:h-9 data-placeholder:text-[#666666]",
              )}
            >
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {TARGET_LANG_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="cursor-pointer rounded-md py-2 pr-8 pl-3 text-sm text-[#333333] focus:bg-[#f5f5f5] data-highlighted:bg-[#f5f5f5]">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* 译文主区域：占据头尾之间的剩余高度，仅此处纵向滚动 */}
      <div
        className="min-h-0 flex-1 overflow-y-auto px-3 py-3 whitespace-pre-wrap text-left text-[15px] leading-[1.6] text-[#333333] sm:px-4 sm:text-base"
        lang={targetLang === "zh" ? "zh-CN" : targetLang}
      >
        {translatedText}
      </div>

      {/* 底栏（固定于卡片底部）：复制、重新生成，不随译文滚动 */}
      <footer className="flex shrink-0 flex-wrap items-center gap-6 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-[#666666] transition-colors hover:text-[#0464FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cccccc]/50 focus-visible:ring-offset-2 [&_svg]:shrink-0"
        >
          <Copy className="size-4" strokeWidth={2} aria-hidden />
          复制
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-[#666666] transition-colors hover:text-[#0464FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cccccc]/50 focus-visible:ring-offset-2 [&_svg]:shrink-0"
        >
          <RefreshCw className="size-4" strokeWidth={2} aria-hidden />
          重新生成
        </button>
      </footer>
    </article>
  )
}
