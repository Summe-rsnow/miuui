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
  setIndicatorRef: (node: unknown) => void
  indicatorMetrics: Ref<IndicatorMetrics | null>
  indicatorAnimated: Ref<boolean>
  indicatorStyle: ComputedRef<StyleValue | undefined>
  measure: () => void
}

function unwrapElement(node: unknown): HTMLElement | null {
  if (!node) return null
  if (typeof HTMLElement !== "undefined" && node instanceof HTMLElement) return node
  const maybeComp = node as { $el?: unknown }
  return typeof HTMLElement !== "undefined" && maybeComp.$el instanceof HTMLElement
    ? maybeComp.$el
    : null
}

function getMotionMode(el: HTMLElement | null): "full" | "reduced" | "none" {
  if (typeof window === "undefined") return "none"
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return "none"
  if (el?.closest('[data-motion-tier="none"]')) return "none"
  if (el?.closest('[data-motion-tier="reduced"]')) return "reduced"
  return "full"
}

export function useSlidingIndicator(
  options: UseSlidingIndicatorOptions,
): UseSlidingIndicatorReturn {
  const itemElements = new Map<string, HTMLElement>()
  const indicatorElRef = ref<HTMLElement | null>(null)
  const indicatorMetrics = ref<IndicatorMetrics | null>(null)
  const indicatorAnimated = ref(false)
  const waapiAnimating = ref(false)
  let resizeObserver: ResizeObserver | null = null
  let mounted = false
  let containerElObserved: HTMLElement | null = null
  let lastKey: string | undefined
  let lastMetrics: IndicatorMetrics | null = null
  let activeAnimation: Animation | null = null
  let animEpoch = 0

  function setItemRef(key: string | number, node: unknown): void {
    const id = String(key)
    const el = unwrapElement(node)
    if (el) itemElements.set(id, el)
    else itemElements.delete(id)
  }

  function setIndicatorRef(node: unknown): void {
    indicatorElRef.value = unwrapElement(node)
  }

  function readLiveIndicatorBox(containerEl: HTMLElement | null): IndicatorMetrics | null {
    const indEl = indicatorElRef.value
    if (indEl && containerEl && lastMetrics) {
      const indRect = indEl.getBoundingClientRect()
      const contRect = containerEl.getBoundingClientRect()
      if (indRect.width > 0 && indRect.height > 0 && contRect.width > 0) {
        return {
          x: indRect.left - contRect.left - containerEl.clientLeft + containerEl.scrollLeft,
          y: indRect.top - contRect.top - containerEl.clientTop + containerEl.scrollTop,
          width: indRect.width,
          height: indRect.height,
        }
      }
    }
    return lastMetrics
  }

  function launchFlipGlide(fromBox: IndicatorMetrics, toBox: IndicatorMetrics): void {
    const indEl = indicatorElRef.value
    if (!indEl || typeof indEl.animate !== "function") return
    const motion = getMotionMode(indEl)
    if (motion === "none") return

    const dx = fromBox.x - toBox.x
    const dy = fromBox.y - toBox.y
    const sx = toBox.width > 0 ? fromBox.width / toBox.width : 1
    const sy = toBox.height > 0 ? fromBox.height / toBox.height : 1
    if (
      Math.abs(dx) < 0.5 &&
      Math.abs(dy) < 0.5 &&
      Math.abs(sx - 1) < 0.01 &&
      Math.abs(sy - 1) < 0.01
    ) {
      return
    }

    const epoch = ++animEpoch
    activeAnimation?.cancel()
    activeAnimation = null
    waapiAnimating.value = true

    const axis = options.axis?.() ?? "both"
    const fromTransform =
      axis === "both"
        ? `translate3d(${toBox.x + dx}px, ${toBox.y + dy}px, 0) scale(${sx}, ${sy})`
        : `translate3d(${toBox.x + dx}px, 0, 0) scale(${sx}, 1)`
    const toTransform =
      axis === "both"
        ? `translate3d(${toBox.x}px, ${toBox.y}px, 0) scale(1, 1)`
        : `translate3d(${toBox.x}px, 0, 0) scale(1, 1)`

    void nextTick().then(() => {
      if (epoch !== animEpoch) return
      const target = indicatorElRef.value
      if (!target || typeof target.animate !== "function") {
        waapiAnimating.value = false
        return
      }
      const anim = target.animate([{ transform: fromTransform }, { transform: toTransform }], {
        duration: motion === "reduced" ? 200 : 340,
        easing:
          motion === "reduced"
            ? "cubic-bezier(0.22, 1, 0.36, 1)"
            : "cubic-bezier(0.22, 1.24, 0.36, 1)",
      })
      activeAnimation = anim
      anim.onfinish = () => {
        if (activeAnimation === anim) {
          activeAnimation = null
          waapiAnimating.value = false
        }
      }
      anim.oncancel = () => {
        if (activeAnimation === anim) {
          activeAnimation = null
          waapiAnimating.value = false
        }
      }
    })
  }

  function measure(): void {
    if (options.enabled && !options.enabled()) {
      activeAnimation?.cancel()
      activeAnimation = null
      waapiAnimating.value = false
      indicatorMetrics.value = null
      indicatorAnimated.value = false
      lastKey = undefined
      lastMetrics = null
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
      activeAnimation?.cancel()
      activeAnimation = null
      waapiAnimating.value = false
      indicatorMetrics.value = null
      indicatorAnimated.value = false
      lastKey = undefined
      lastMetrics = null
      return
    }

    const next: IndicatorMetrics = {
      x: activeEl.offsetLeft,
      y: activeEl.offsetTop,
      width: activeEl.offsetWidth,
      height: activeEl.offsetHeight,
    }

    const sameKey = keyStr === lastKey
    const sameBox =
      lastMetrics !== null &&
      Math.abs(lastMetrics.x - next.x) < 0.5 &&
      Math.abs(lastMetrics.y - next.y) < 0.5 &&
      Math.abs(lastMetrics.width - next.width) < 0.5 &&
      Math.abs(lastMetrics.height - next.height) < 0.5

    if (sameKey && sameBox) {
      return
    }

    const fromBox = !sameKey && lastKey !== undefined ? readLiveIndicatorBox(containerEl) : null

    indicatorMetrics.value = next
    lastMetrics = next
    lastKey = keyStr

    if (fromBox) {
      launchFlipGlide(fromBox, next)
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
            transformOrigin: "top left",
          }
        : {
            width: `${m.width}px`,
            transform: `translate3d(${m.x}px, 0, 0)`,
            transformOrigin: "top left",
          }
    if (waapiAnimating.value) {
      geom.transition = "none"
    }
    return mergeStyle(base, geom)
  })

  function disconnectObserver(): void {
    resizeObserver?.disconnect()
    resizeObserver = null
    containerElObserved = null
  }

  function syncObserver(): void {
    if (!mounted) return
    const containerEl = unwrapElement(options.containerRef.value)
    if (containerEl === containerElObserved) return
    disconnectObserver()
    if (containerEl && typeof ResizeObserver !== "undefined") {
      containerElObserved = containerEl
      resizeObserver = new ResizeObserver(() => measure())
      resizeObserver.observe(containerEl)
    }
  }

  onMounted(async () => {
    mounted = true
    await nextTick()
    measure()
    syncObserver()
  })

  onBeforeUnmount(() => {
    mounted = false
    activeAnimation?.cancel()
    activeAnimation = null
    disconnectObserver()
  })

  watch(
    () => [unwrapElement(options.containerRef.value), ...options.watchSources()] as const,
    async () => {
      await nextTick()
      measure()
      syncObserver()
    },
    { flush: "post", deep: true },
  )

  return {
    setItemRef,
    setIndicatorRef,
    indicatorMetrics,
    indicatorAnimated,
    indicatorStyle,
    measure,
  }
}
