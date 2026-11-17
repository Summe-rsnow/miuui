<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { TruncateTextProps } from "../types"
import { useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const VIEWPORT_PADDING = 16
const POPOVER_OFFSET = 8
const ESTIMATED_WIDTH = 480
const MIN_HEIGHT = 120
const MAX_HEIGHT = 400
const MIN_BELOW_SPACE = 160
const CURSOR_X_OFFSET = 20
const SHOW_DELAY_MS = 180
const HIDE_DELAY_MS = 280
const MOUSEUP_HIDE_DELAY_MS = 320

const props = withDefaults(defineProps<TruncateTextProps>(), {
  lines: 1,
  as: "span",
  title: undefined,
  expandable: false,
  expandMode: "inline",
  radius: "md",
  expandLabel: "展开",
  collapseLabel: "收起",
})

const emit = defineEmits<{ toggle: [expanded: boolean] }>()

const theme = useMiuTheme()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Popover")

const rootRef = ref<HTMLElement>()
const textRef = ref<HTMLElement>()
const popRef = ref<HTMLElement>()
const expanded = ref(false)
const showPopover = ref(false)
const placement = ref<"top" | "bottom">("bottom")
const popStyle = ref<Record<string, string>>({})
const hasContent = ref((props.text ?? "").trim().length > 0)
const isOverflowing = ref(hasContent.value)

let observer: ResizeObserver | undefined
let showTimer: ReturnType<typeof setTimeout> | undefined
let hideTimer: ReturnType<typeof setTimeout> | undefined
let anchorX = 0
let anchorY = 0
let isMouseDown = false

const rootStyle = computed(() => {
  const custom = regionStyle(props, "root")
  const base = expanded.value ? {} : { "--miu-truncate-lines": String(props.lines) }
  if (typeof custom === "string") return [base, custom]
  return custom ? { ...base, ...custom } : base
})

const resolvedTitle = computed(() => {
  if (props.title === false) return undefined
  if (props.expandMode === "popover")
    return typeof props.title === "string" ? props.title : undefined
  return props.title ?? props.text
})

function measureOverflow(): void {
  const el = textRef.value
  if (!el) {
    const raw = (props.text ?? "").trim()
    hasContent.value = raw.length > 0
    isOverflowing.value = hasContent.value
    return
  }
  const content = (el.textContent ?? props.text ?? "").trim()
  hasContent.value = content.length > 0
  if (!hasContent.value) {
    isOverflowing.value = false
    return
  }
  const hasLayout = el.clientHeight > 0 || el.clientWidth > 0
  if (!hasLayout) {
    // In non-layout environments (e.g. jsdom), show inline toggle when non-empty.
    isOverflowing.value = true
    return
  }
  if (!expanded.value) {
    isOverflowing.value =
      el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1
  }
}

const showToggle = computed(() => {
  if (props.expandMode !== "inline" || !props.expandable || !hasContent.value) return false
  return expanded.value || isOverflowing.value
})

function toggle(): void {
  expanded.value = !expanded.value
  emit("toggle", expanded.value)
  if (!expanded.value) {
    void nextTick(measureOverflow)
  }
}

function updatePopoverPosition(x: number, y: number): void {
  const vpW = typeof window !== "undefined" ? window.innerWidth : 1280
  const vpH = typeof window !== "undefined" ? window.innerHeight : 800
  const maxWidth = Math.min(ESTIMATED_WIDTH, vpW - VIEWPORT_PADDING * 2)

  let left = x - CURSOR_X_OFFSET
  if (left + maxWidth + VIEWPORT_PADDING > vpW) {
    left = vpW - maxWidth - VIEWPORT_PADDING
  }
  left = Math.max(VIEWPORT_PADDING, left)

  const spaceBelow = vpH - y - POPOVER_OFFSET - VIEWPORT_PADDING
  const spaceAbove = y - POPOVER_OFFSET - VIEWPORT_PADDING

  if (spaceBelow >= MIN_BELOW_SPACE || spaceBelow >= spaceAbove) {
    const maxHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, spaceBelow))
    placement.value = "bottom"
    popStyle.value = {
      left: `${Math.round(left)}px`,
      top: `${Math.round(y + POPOVER_OFFSET)}px`,
      bottom: "auto",
      maxWidth: `${Math.round(maxWidth)}px`,
      maxHeight: `${Math.round(maxHeight)}px`,
    }
  } else {
    const maxHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, spaceAbove))
    placement.value = "top"
    popStyle.value = {
      left: `${Math.round(left)}px`,
      top: "auto",
      bottom: `${Math.round(vpH - y + POPOVER_OFFSET)}px`,
      maxWidth: `${Math.round(maxWidth)}px`,
      maxHeight: `${Math.round(maxHeight)}px`,
    }
  }
}

function onMouseEnter(e: MouseEvent): void {
  if (props.expandMode !== "popover" || !isOverflowing.value) return
  clearTimeout(hideTimer)
  anchorX = e.clientX
  anchorY = e.clientY
  if (showPopover.value) return
  clearTimeout(showTimer)
  showTimer = setTimeout(() => {
    updatePopoverPosition(anchorX, anchorY)
    showPopover.value = true
  }, SHOW_DELAY_MS)
}

function onMouseMove(e: MouseEvent): void {
  if (props.expandMode !== "popover" || !isOverflowing.value || showPopover.value) return
  anchorX = e.clientX
  anchorY = e.clientY
}

function onMouseLeave(): void {
  if (props.expandMode !== "popover") return
  clearTimeout(showTimer)
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (!isMouseDown) showPopover.value = false
  }, HIDE_DELAY_MS)
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
    showPopover.value = false
  }, HIDE_DELAY_MS)
}

function onWindowMouseUp(): void {
  if (!isMouseDown) return
  isMouseDown = false
  hideTimer = setTimeout(() => {
    showPopover.value = false
  }, MOUSEUP_HIDE_DELAY_MS)
}

function onWindowScroll(e: Event): void {
  if (!showPopover.value) return
  const target = e.target as Node | null
  if (popRef.value && target && (popRef.value === target || popRef.value.contains(target))) return
  if (rootRef.value && target && (rootRef.value === target || rootRef.value.contains(target)))
    return
  clearTimeout(showTimer)
  clearTimeout(hideTimer)
  showPopover.value = false
}

function onWheel(e: WheelEvent): void {
  if (props.expandMode !== "popover" || !showPopover.value || !popRef.value) return
  const contentEl = popRef.value.querySelector(
    ".miu-truncate__popover-content",
  ) as HTMLElement | null
  if (!contentEl) return
  const maxScroll = contentEl.scrollHeight - contentEl.clientHeight
  if (maxScroll <= 0) return
  const canScrollDown = e.deltaY > 0 && contentEl.scrollTop < maxScroll - 1
  const canScrollUp = e.deltaY < 0 && contentEl.scrollTop > 1
  if (canScrollDown || canScrollUp) {
    contentEl.scrollTop += e.deltaY
    e.preventDefault()
    e.stopPropagation()
  }
}

onMounted(() => {
  measureOverflow()
  if (typeof ResizeObserver !== "undefined" && textRef.value) {
    observer = new ResizeObserver(() => measureOverflow())
    observer.observe(textRef.value)
  }
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", onWindowScroll, true)
    window.addEventListener("mouseup", onWindowMouseUp)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(showTimer)
  clearTimeout(hideTimer)
  if (typeof window !== "undefined") {
    window.removeEventListener("scroll", onWindowScroll, true)
    window.removeEventListener("mouseup", onWindowMouseUp)
  }
})

watch(
  () => [props.text, props.lines, props.expandable, props.expandMode],
  () => {
    if (props.expandMode !== "popover") {
      showPopover.value = false
    }
    if (!textRef.value) {
      hasContent.value = (props.text ?? "").trim().length > 0
      isOverflowing.value = hasContent.value
      return
    }
    void nextTick(measureOverflow)
  },
)
</script>

<template>
  <component
    :is="as"
    ref="rootRef"
    :class="
      regionClass(props, 'root', 'miu-truncate', {
        'miu-truncate--expanded': expanded,
        'miu-truncate--popover': expandMode === 'popover',
      })
    "
    :style="rootStyle"
    :title="resolvedTitle"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @wheel="onWheel"
  >
    <span ref="textRef" class="miu-truncate__text">
      <slot>{{ text }}</slot>
    </span>
    <button
      v-if="showToggle"
      type="button"
      class="miu-truncate__toggle"
      :aria-expanded="expanded"
      @click="toggle"
    >
      {{ expanded ? collapseLabel : expandLabel }}
    </button>
    <Teleport v-if="expandMode === 'popover'" :to="theme.portalTarget.value ?? 'body'">
      <Transition name="miu-truncate-popover">
        <div
          v-if="showPopover"
          ref="popRef"
          class="miu-truncate__popover"
          :class="`miu-truncate__popover--${placement}`"
          :data-miu-radius="radius"
          :data-material="materialName"
          :style="mergeStyle(popStyle, materialTokens)"
          role="tooltip"
          @mouseenter="onPopoverMouseEnter"
          @mouseleave="onPopoverMouseLeave"
          @mousedown="onPopoverMouseDown"
        >
          <div class="miu-truncate__popover-body">
            <div class="miu-truncate__popover-content">
              <slot>{{ text }}</slot>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </component>
</template>
