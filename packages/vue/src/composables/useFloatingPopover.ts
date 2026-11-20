import { onBeforeUnmount, onMounted, ref, type Ref } from "vue"

export interface UseFloatingPopoverOptions {
  enabled: () => boolean
  canOpen?: () => boolean
  rootRef: Ref<HTMLElement | undefined>
  popRef: Ref<HTMLElement | undefined>
  contentSelector?: string
  viewportPadding?: number
  offset?: number
  estimatedWidth?: number
  minHeight?: number
  maxHeight?: number
  minBelowSpace?: number
  cursorXOffset?: number
  showDelayMs?: number
  hideDelayMs?: number
  mouseupHideDelayMs?: number
}

export interface UseFloatingPopoverReturn {
  visible: Ref<boolean>
  placement: Ref<"top" | "bottom">
  popStyle: Ref<Record<string, string>>
  updatePosition: (x: number, y: number) => void
  onMouseEnter: (event: MouseEvent) => void
  onMouseMove: (event: MouseEvent) => void
  onMouseLeave: () => void
  onPopoverMouseEnter: () => void
  onPopoverMouseDown: () => void
  onPopoverMouseLeave: () => void
  onWheel: (event: WheelEvent) => void
  close: () => void
}

export function useFloatingPopover(options: UseFloatingPopoverOptions): UseFloatingPopoverReturn {
  const viewportPadding = options.viewportPadding ?? 16
  const offset = options.offset ?? 8
  const estimatedWidth = options.estimatedWidth ?? 480
  const minHeight = options.minHeight ?? 120
  const maxHeightLimit = options.maxHeight ?? 400
  const minBelowSpace = options.minBelowSpace ?? 160
  const cursorXOffset = options.cursorXOffset ?? 20
  const showDelayMs = options.showDelayMs ?? 180
  const hideDelayMs = options.hideDelayMs ?? 280
  const mouseupHideDelayMs = options.mouseupHideDelayMs ?? 320
  const contentSelector = options.contentSelector ?? ".miu-truncate__popover-content"

  const visible = ref(false)
  const placement = ref<"top" | "bottom">("bottom")
  const popStyle = ref<Record<string, string>>({})

  let showTimer: ReturnType<typeof setTimeout> | undefined
  let hideTimer: ReturnType<typeof setTimeout> | undefined
  let anchorX = 0
  let anchorY = 0
  let isMouseDown = false

  function updatePosition(x: number, y: number): void {
    const vpW = typeof window !== "undefined" ? window.innerWidth : 1280
    const vpH = typeof window !== "undefined" ? window.innerHeight : 800
    const maxWidth = Math.min(estimatedWidth, vpW - viewportPadding * 2)

    let left = x - cursorXOffset
    if (left + maxWidth + viewportPadding > vpW) {
      left = vpW - maxWidth - viewportPadding
    }
    left = Math.max(viewportPadding, left)

    const spaceBelow = vpH - y - offset - viewportPadding
    const spaceAbove = y - offset - viewportPadding

    if (spaceBelow >= minBelowSpace || spaceBelow >= spaceAbove) {
      const maxHeight = Math.min(maxHeightLimit, Math.max(minHeight, spaceBelow))
      placement.value = "bottom"
      popStyle.value = {
        left: `${Math.round(left)}px`,
        top: `${Math.round(y + offset)}px`,
        bottom: "auto",
        maxWidth: `${Math.round(maxWidth)}px`,
        maxHeight: `${Math.round(maxHeight)}px`,
      }
    } else {
      const maxHeight = Math.min(maxHeightLimit, Math.max(minHeight, spaceAbove))
      placement.value = "top"
      popStyle.value = {
        left: `${Math.round(left)}px`,
        top: "auto",
        bottom: `${Math.round(vpH - y + offset)}px`,
        maxWidth: `${Math.round(maxWidth)}px`,
        maxHeight: `${Math.round(maxHeight)}px`,
      }
    }
  }

  function close(): void {
    clearTimeout(showTimer)
    clearTimeout(hideTimer)
    visible.value = false
  }

  function onMouseEnter(event: MouseEvent): void {
    if (!options.enabled() || (options.canOpen && !options.canOpen())) return
    clearTimeout(hideTimer)
    anchorX = event.clientX
    anchorY = event.clientY
    if (visible.value) return
    clearTimeout(showTimer)
    showTimer = setTimeout(() => {
      updatePosition(anchorX, anchorY)
      visible.value = true
    }, showDelayMs)
  }

  function onMouseMove(event: MouseEvent): void {
    if (!options.enabled() || (options.canOpen && !options.canOpen()) || visible.value) return
    anchorX = event.clientX
    anchorY = event.clientY
  }

  function onMouseLeave(): void {
    if (!options.enabled()) return
    clearTimeout(showTimer)
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      if (!isMouseDown) visible.value = false
    }, hideDelayMs)
  }

  function onPopoverMouseEnter(): void {
    clearTimeout(hideTimer)
  }

  function onPopoverMouseDown(): void {
    isMouseDown = true
    clearTimeout(hideTimer)
  }

  function onPopoverMouseLeave(): void {
    clearTimeout(hideTimer)
    if (isMouseDown) return
    hideTimer = setTimeout(() => {
      visible.value = false
    }, hideDelayMs)
  }

  function onWindowMouseUp(): void {
    if (!isMouseDown) return
    isMouseDown = false
    hideTimer = setTimeout(() => {
      visible.value = false
    }, mouseupHideDelayMs)
  }

  function onWindowScroll(event: Event): void {
    if (!visible.value) return
    const target = event.target as Node | null
    if (
      options.popRef.value &&
      target &&
      (options.popRef.value === target || options.popRef.value.contains(target))
    ) {
      return
    }
    if (
      options.rootRef.value &&
      target &&
      (options.rootRef.value === target || options.rootRef.value.contains(target))
    ) {
      return
    }
    close()
  }

  function onWheel(event: WheelEvent): void {
    if (!options.enabled() || !visible.value || !options.popRef.value) return
    const contentEl = options.popRef.value.querySelector(contentSelector) as HTMLElement | null
    if (!contentEl) return
    const maxScroll = contentEl.scrollHeight - contentEl.clientHeight
    if (maxScroll <= 0) return
    const canScrollDown = event.deltaY > 0 && contentEl.scrollTop < maxScroll - 1
    const canScrollUp = event.deltaY < 0 && contentEl.scrollTop > 1
    if (canScrollDown || canScrollUp) {
      contentEl.scrollTop += event.deltaY
      event.preventDefault()
      event.stopPropagation()
    }
  }

  onMounted(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", onWindowScroll, true)
      window.addEventListener("mouseup", onWindowMouseUp)
    }
  })

  onBeforeUnmount(() => {
    clearTimeout(showTimer)
    clearTimeout(hideTimer)
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", onWindowScroll, true)
      window.removeEventListener("mouseup", onWindowMouseUp)
    }
  })

  return {
    visible,
    placement,
    popStyle,
    updatePosition,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onPopoverMouseEnter,
    onPopoverMouseDown,
    onPopoverMouseLeave,
    onWheel,
    close,
  }
}
