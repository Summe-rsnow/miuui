const SAFE_PROTOCOL: Record<string, true> = {
  "http:": true,
  "https:": true,
  "mailto:": true,
  "tel:": true,
}

/**
 * Normalises a navigation target and drops executable schemes.
 *
 * Relative paths, hash links and query-only links are passed through untouched.
 * Absolute URLs are allowed only for `http`, `https`, `mailto` and `tel`; anything
 * else (`javascript:`, `data:`, `vbscript:`, …) resolves to `undefined` so callers
 * can omit the attribute instead of shipping a live script URL.
 */
export function safeHref(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined

  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(trimmed)
  const rawScheme = schemeMatch?.[1]
  if (!rawScheme) return trimmed

  const scheme = `${rawScheme.toLowerCase()}:`
  return Object.hasOwn(SAFE_PROTOCOL, scheme) ? trimmed : undefined
}
