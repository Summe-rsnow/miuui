import type { ImagePreviewOriginRect } from "../types"

function resolveHtmlElement(target: unknown): HTMLElement | null {
  if (!target) return null
  if (typeof HTMLElement !== "undefined" && target instanceof HTMLElement) return target
  const maybeComp = target as { $el?: unknown }
  return typeof HTMLElement !== "undefined" && maybeComp.$el instanceof HTMLElement
    ? maybeComp.$el
    : null
}

/** 采集触发元素在视口中的矩形与圆角，用于灯箱放大/收回 FLIP 动效。 */
export function captureOriginRect(target: unknown): ImagePreviewOriginRect | null {
  const el = resolveHtmlElement(target)
  if (!el || typeof window === "undefined") return null
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  const borderRadius = window.getComputedStyle(el).borderRadius
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    borderRadius: borderRadius && borderRadius !== "0px" ? borderRadius : undefined,
  }
}

/** 将单一或多角 px 圆角按缩放比例反推为 WAAPI 关键帧可用的安全圆角值。 */
export function scaleBorderRadius(radius: string | undefined, scale: number): string | undefined {
  if (!radius) return undefined
  const trimmed = radius.trim()
  if (!trimmed || trimmed.includes("/")) return undefined
  const tokens = trimmed.split(/\s+/)
  if (tokens.length === 0 || tokens.length > 4) return undefined
  const factor = Math.max(0.2, scale)
  const scaled: string[] = []
  for (const token of tokens) {
    const match = token.match(/^(\d+(?:\.\d+)?)px$/)
    if (!match) return undefined
    scaled.push(`${(Number(match[1]) / factor).toFixed(2)}px`)
  }
  return scaled.join(" ")
}
