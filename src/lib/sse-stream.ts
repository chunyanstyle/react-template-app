/**
 * SSE（Server-Sent Events）流式请求封装。
 * 使用 fetch + ReadableStream 解析 text/event-stream，支持自定义 Method、Header、Body 与中止。
 */

/** 单条 SSE 事件（多行 data: 已按规范合并为一段字符串） */
export type SseEvent = {
  /** 服务端 `event:` 字段，缺省视为 `message` */
  event: string
  /** 服务端 `id:` 字段 */
  id?: string
  /** 合并后的 `data:` 正文（可能为空字符串，用于心跳等） */
  data: string
}

export type FetchSseInit = Omit<RequestInit, "body"> & {
  body?: BodyInit | null
}

/** HTTP 状态非 2xx 时抛出，便于调用方区分网络与业务错误 */
export class SseHttpError extends Error {
  readonly status: number
  readonly statusText: string

  constructor(
    message: string,
    options: { status: number; statusText: string },
  ) {
    super(message)
    this.name = "SseHttpError"
    this.status = options.status
    this.statusText = options.statusText
  }
}

/** 流已结束但 body 不可读（极少见） */
export class SseNoBodyError extends Error {
  constructor(message = "响应无可读 body（response.body 为空）") {
    super(message)
    this.name = "SseNoBodyError"
  }
}

/**
 * 将一段原始 SSE 文本块解析为若干 SseEvent（不含未闭合的半包，由调用方缓冲）。
 * 遵循常见约定：以空行分隔事件；多行 `data:` 用 `\n` 拼接；忽略以 `:` 开头的注释行。
 */
function parseSseTextBlock(block: string): SseEvent | null {
  const lines = block.split("\n")
  let event = "message"
  let id: string | undefined
  const dataLines: string[] = []

  for (const raw of lines) {
    const line = raw.replace(/\r$/, "")
    if (line === "" || line.startsWith(":")) continue
    const colon = line.indexOf(":")
    if (colon === -1) continue
    const field = line.slice(0, colon).trim()
    // 规范：冒号后若为空格则去掉第一个空格
    let value = line.slice(colon + 1)
    if (value.startsWith(" ")) value = value.slice(1)

    if (field === "event") {
      event = value || "message"
    } else if (field === "id") {
      id = value
    } else if (field === "data") {
      dataLines.push(value)
    }
    // 其它字段（retry 等）此处忽略，需要时可扩展
  }

  if (dataLines.length === 0 && !id && event === "message") {
    return null
  }

  return {
    event,
    id,
    data: dataLines.join("\n"),
  }
}

/**
 * 使用 fetch 建立 SSE 流并按事件产出。
 *
 * @example
 * ```ts
 * for await (const evt of readSseStream("/api/chat", { method: "POST", body: JSON.stringify({ q: "hi" }) })) {
 *   console.log(evt.data)
 * }
 * ```
 */
export async function* readSseStream(
  url: string | URL,
  init: FetchSseInit = {},
): AsyncGenerator<SseEvent, void, undefined> {
  const { headers: initHeaders, signal, ...rest } = init
  const headers = new Headers(initHeaders)
  if (!headers.has("Accept")) {
    headers.set("Accept", "text/event-stream")
  }

  const response = await fetch(url, {
    ...rest,
    headers,
    signal,
    cache: "no-store",
  })

  if (!response.ok) {
    throw new SseHttpError(`SSE 请求失败: ${response.status}`, {
      status: response.status,
      statusText: response.statusText,
    })
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new SseNoBodyError()
  }

  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // 统一换行，便于按「空行」切事件
      buffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

      let sep: number
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, sep)
        buffer = buffer.slice(sep + 2)
        const parsed = parseSseTextBlock(rawEvent)
        if (parsed) yield parsed
      }
    }

    // 流结束：处理尾部未以 \n\n 结尾的残留（部分服务端会省略最后空行）
    const tail = buffer.trim()
    if (tail) {
      const parsed = parseSseTextBlock(tail)
      if (parsed) yield parsed
    }
  } finally {
    reader.releaseLock()
  }
}

export type SubscribeSseHandlers = {
  /** 每解析出一条 SSE 事件 */
  onEvent: (evt: SseEvent) => void | Promise<void>
  /** 流正常读完 */
  onComplete?: () => void | Promise<void>
  /** 任意未捕获错误（含 SseHttpError、AbortError） */
  onError?: (err: unknown) => void | Promise<void>
}

/**
 * 回调式订阅 SSE，适合不方便使用 for-await 的场景。
 * - `signal` 中止时会抛出 DOMException `AbortError`，并走 `onError`（若提供）。
 */
export async function subscribeSse(
  url: string | URL,
  init: FetchSseInit,
  handlers: SubscribeSseHandlers,
): Promise<void> {
  const { onEvent, onComplete, onError } = handlers
  try {
    for await (const evt of readSseStream(url, init)) {
      await onEvent(evt)
    }
    await onComplete?.()
  } catch (err) {
    await onError?.(err)
    throw err
  }
}
