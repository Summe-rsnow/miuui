import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance,
  type ComputedRef,
  type Ref,
  type StyleValue,
} from "vue"
import { mergeStyle } from "./usePluginResolution"

export interface IndicatorMetrics {
  x: number
  y: number
  width: number
  height: number
}

export interface UseSlidingIndicatorOptions {
  containerRef: Ref<ComponentPublicInstance | HTMLElement | null>
  activeKey: () => string | number | undefined
  enabled?: () => boolean
  axis?: () => "both" | "horizontal"
  fallbackSelector?: string
  watchSources: () => readonly unknown[]
  baseStyle?: () => string | Record<string, string> | undefined
}

export interface UseSlidingIndicatorReturn {
  setItemRef: (key: string | number, node: unknown) => void
  indicatorMetrics: Ref<IndicatorMetrics | null>
  indicatorAnimated: Ref<boolean>
  indicatorStyle: ComputedRef<StyleValue | undefined>
  measure: () => void
}

function unwrapElement(node: unknown): HTMLElement | null {
  if (!node) return null
  if (node instanceof HTMLElement) return node
  const maybeComp = node as { $el?: unknown }
  return maybeComp.$el instanceof HTMLElement ? maybeComp.$el : null
}

export function useSlidingIndicator(
  options: UseSlidingIndicatorOptions,
): UseSlidingIndicatorReturn {
  const itemElements = new Map<string, HTMLElement>()
  const indicatorMetrics = ref<IndicatorMetrics | null>(null)
  const indicatorAnimated = ref(false)
  let resizeObserver: ResizeObserver | null = null

  function setItemRef(key: string | number, node: unknown): void {
    const id = String(key)
    const el = unwrapElement(node)
    if (el) itemElements.set(id, el)
    else itemElements.delete(id)
  }

  function measure(): void {
    if (options.enabled && !options.enabled()) {
      indicatorMetrics.value = null
      return
    }
    const containerEl = unwrapElement(options.containerRef.value)
    const key = options.activeKey()
    const keyStr = key !== undefined ? String(key) : ""
    const activeEl =
      (keyStr ? itemElements.get(keyStr) : null) ??
      (options.fallbackSelector && containerEl
        ? containerEl.querySelector<HTMLElement>(options.fallbackSelector)
        : null)
    if (!activeEl || activeEl.offsetWidth <= 0 || activeEl.offsetHeight <= 0) {
      indicatorMetrics.value = null
      return
    }
    indicatorMetrics.value = {
      x: activeEl.offsetLeft,
      y: activeEl.offsetTop,
      width: activeEl.offsetWidth,
      height: activeEl.offsetHeight,
    }
    if (!indicatorAnimated.value && typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        indicatorAnimated.value = true
      })
    }
  }

  const indicatorStyle = computed(() => {
    const base = options.baseStyle?.()
    const m = indicatorMetrics.value
    if (!m) return base
    const axis = options.axis?.() ?? "both"
    const geom: Record<string, string> =
      axis === "both"
        ? {
            width: `${m.width}px`,
            height: `${m.height}px`,
            transform: `translate3d(${m.x}px, ${m.y}px, 0)`,
          }
        : {
            width: `${m.width}px`,
            transform: `translate3d(${m.x}px, 0, 0)`,
          }
    return mergeStyle(base, geom)
  })

  onMounted(async () => {
    await nextTick()
    measure()
    const containerEl = unwrapElement(options.containerRef.value)
    if (containerEl && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => measure())
      resizeObserver.observe(containerEl)
    }
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  watch(
    options.watchSources,
    async () => {
      await nextTick()
      measure()
    },
    { flush: "post", deep: true },
  )

  return {
    setItemRef,
    indicatorMetrics,
    indicatorAnimated,
    indicatorStyle,
    measure,
  }
}
