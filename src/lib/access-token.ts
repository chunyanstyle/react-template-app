const ACCESS_TOKEN_STORAGE_KEY = 'hc-access_token'

export function getAccessToken(): string | null {
  try {
    const value = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
    return value?.trim() ? value : null
  } catch {
    return null
  }
}

export function setAccessToken(token: string): void {
  const trimmed = token.trim()
  if (trimmed === '') return

  try {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, trimmed)
  } catch {
    // 隐私模式、配额满等场景下忽略
  }
}

/** 供 fetch 使用的 Authorization 头；无 token 时不设置 */
export function getAuthorizationHeaders(): HeadersInit | undefined {
  const token = getAccessToken()
  if (!token) return undefined

  return { Authorization: `Bearer ${token}` }
}
