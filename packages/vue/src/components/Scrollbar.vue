<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ScrollbarProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<ScrollbarProps>(), {
  container: null,
  topOffset: 0,
  bottomOffset: 0,
  autoHideDelay: 1200,
  minThumbSize: 36,
  radius: "full",
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Scrollbar")

const trackRef = ref<HTMLElement | null>(null)
const thumbRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const isHovered = ref(false)
const isDragging = ref(false)
const isScrolling = ref(false)

const thumbTop = ref(0)
const thumbHeight = ref(40)
const trackHeight = ref(0)

let hideTimer: ReturnType<typeof setTimeout> | null = null
let rafId: number | null = null
let dragStartY = 0
let dragStartScrollTop = 0
let bindGeneration = 0
let isUnmounted = false
let observedChild: Element | null = null
let previousBodyUserSelect: string | null = null
let resizeObserver: ResizeObserver | null = null
let contentObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null

const trackStyle = computed(() =>
  mergeStyle(regionStyle(props, "root"), {
    ...materialTokens.value,
    insetBlockStart: `${props.topOffset}px`,
    insetBlockEnd: `${props.bottomOffset}px`,
  }),
)

const thumbStyle = computed(() =>
  mergeStyle(regionStyle(props, "thumb"), {
    insetBlockStart: `${thumbTop.value}px`,
    blockSize: `${thumbHeight.value}px`,
  }),
)

function scheduleHide(): void {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  hideTimer = setTimeout(() => {
    isScrolling.value = false
    hideTimer = null
  }, props.autoHideDelay)
}

function updateMetrics(): void {
  const el = props.container
  const track = trackRef.value
  if (!el) {
    visible.value = false
    return
  }

  const { clientHeight, scrollHeight, scrollTop } = el
  const availableTrackHeight =
    track?.clientHeight || Math.max(0, clientHeight - props.topOffset - props.bottomOffset)
  trackHeight.value = availableTrackHeight

  if (scrollHeight <= clientHeight + 4 || availableTrackHeight <= props.minThumbSize) {
    visible.value = false
    return
  }

  visible.value = true
  const calculatedHeight = (clientHeight / scrollHeight) * availableTrackHeight
  const clampedHeight = Math.max(
    props.minThumbSize,
    Math.min(availableTrackHeight, calculatedHeight),
  )
  thumbHeight.value = clampedHeight

  const maxScroll = scrollHeight - clientHeight
  const maxTop = availableTrackHeight - clampedHeight
  if (maxScroll <= 0) {
    thumbTop.value = 0
  } else {
    thumbTop.value = Math.max(0, Math.min(maxTop, (scrollTop / maxScroll) * maxTop))
  }
}

function onScroll(): void {
  isScrolling.value = true
  updateMetrics()
  scheduleHide()
}

function onTrackMouseEnter(): void {
  isHovered.value = true
}

function onTrackMouseLeave(): void {
  isHovered.value = false
}

function endDrag(scheduleAutoHide: boolean): void {
  if (!isDragging.value) return
  isDragging.value = false
  if (typeof window !== "undefined") {
    window.removeEventListener("mousemove", onWindowMouseMove)
    window.removeEventListener("mouseup", onWindowMouseUp)
  }
  if (typeof document !== "undefined") {
    document.body.style.userSelect = previousBodyUserSelect ?? ""
  }
  previousBodyUserSelect = null
  if (scheduleAutoHide) {
    scheduleHide()
  }
}

function onThumbMouseDown(e: MouseEvent): void {
  if (e.button !== 0) return
  isDragging.value = true
  dragStartY = e.clientY
  dragStartScrollTop = props.container?.scrollTop ?? 0

  if (typeof window !== "undefined") {
    window.addEventListener("mousemove", onWindowMouseMove)
    window.addEventListener("mouseup", onWindowMouseUp)
  }
  if (typeof document !== "undefined") {
    previousBodyUserSelect = document.body.style.userSelect
    document.body.style.userSelect = "none"
  }
}

function onWindowMouseMove(e: MouseEvent): void {
  if (!isDragging.value || !props.container) return
  const deltaY = e.clientY - dragStartY
  const maxTop = trackHeight.value - thumbHeight.value
  if (maxTop <= 0) return

  const el = props.container
  const maxScroll = el.scrollHeight - el.clientHeight
  const scrollDelta = (deltaY / maxTop) * maxScroll
  el.scrollTop = Math.max(0, Math.min(maxScroll, dragStartScrollTop + scrollDelta))
}

function onWindowMouseUp(): void {
  endDrag(true)
}

function onTrackMouseDown(e: MouseEvent): void {
  if (e.button !== 0 || !props.container) return
  const trackRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const clickY = e.clientY - trackRect.top
  const maxTop = trackHeight.value - thumbHeight.value
  if (maxTop <= 0) return

  const targetTop = Math.max(0, Math.min(maxTop, clickY - thumbHeight.value / 2))
  const el = props.container
  const maxScroll = el.scrollHeight - el.clientHeight
  el.scrollTop = (targetTop / maxTop) * maxScroll
}

function scheduleUpdate(): void {
  if (typeof requestAnimationFrame === "undefined") {
    updateMetrics()
    return
  }
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    updateMetrics()
  })
}

function rebindContentObserver(el: HTMLElement | null | undefined): void {
  const child = (el?.firstElementChild as HTMLElement | null) ?? null
  if (child === observedChild) return
  if (contentObserver) {
    contentObserver.disconnect()
    contentObserver = null
  }
  observedChild = child
  if (!el || !child || typeof ResizeObserver === "undefined") return
  contentObserver = new ResizeObserver(scheduleUpdate)
  contentObserver.observe(child)
}

function attachListeners(el?: HTMLElement | null): void {
  if (!el) return
  el.addEventListener("scroll", onScroll, { passive: true })

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(el)
  }

  rebindContentObserver(el)

  if (typeof MutationObserver !== "undefined") {
    mutationObserver = new MutationObserver(() => {
      rebindContentObserver(el)
      scheduleUpdate()
    })
    mutationObserver.observe(el, { childList: true, subtree: true })
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", scheduleUpdate, { passive: true })
  }
  updateMetrics()
}

function detachListeners(el?: HTMLElement | null): void {
  if (el) {
    el.removeEventListener("scroll", onScroll)
  }
  if (rafId !== null && typeof cancelAnimationFrame !== "undefined") {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (contentObserver) {
    contentObserver.disconnect()
    contentObserver = null
  }
  observedChild = null
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", scheduleUpdate)
  }
}

watch(
  () => props.container,
  (newEl, oldEl, onCleanup) => {
    endDrag(false)
    detachListeners(oldEl)
    const gen = ++bindGeneration
    nextTick(() => {
      if (isUnmounted || gen !== bindGeneration) return
      attachListeners(newEl)
    })
    onCleanup(() => {
      ++bindGeneration
      endDrag(false)
      detachListeners(newEl)
    })
  },
  { immediate: true },
)

watch(
  () => [props.topOffset, props.bottomOffset, props.minThumbSize],
  () => {
    updateMetrics()
  },
)

onMounted(() => {
  nextTick(() => {
    if (!isUnmounted) {
      updateMetrics()
    }
  })
})

onUnmounted(() => {
  isUnmounted = true
  ++bindGeneration
  endDrag(false)
  detachListeners(props.container)
})

defineExpose({
  update: updateMetrics,
})
</script>

<template>
  <div
    ref="trackRef"
    v-show="visible"
    aria-hidden="true"
    :class="
      regionClass(props, 'root', 'miu-scrollbar', {
        'miu-scrollbar--active': isHovered || isDragging || isScrolling,
        'miu-scrollbar--dragging': isDragging,
      })
    "
    :style="trackStyle"
    :data-miu-radius="radius"
    :data-material="materialName"
    :data-active="isHovered || isDragging || isScrolling || undefined"
    :data-dragging="isDragging || undefined"
    @mouseenter="onTrackMouseEnter"
    @mouseleave="onTrackMouseLeave"
    @mousedown="onTrackMouseDown"
  >
    <div
      ref="thumbRef"
      :class="regionClass(props, 'thumb', 'miu-scrollbar__thumb')"
      :style="thumbStyle"
      @mousedown.stop="onThumbMouseDown"
    />
  </div>
</template>
