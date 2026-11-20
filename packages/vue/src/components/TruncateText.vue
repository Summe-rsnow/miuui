<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { TruncateTextProps } from "../types"
import { useDocumentKeydown } from "../composables/useDocumentKeydown"
import { useFloatingPopover } from "../composables/useFloatingPopover"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { useMounted } from "../composables/useMounted"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<TruncateTextProps>(), {
  lines: 1,
  as: "span",
  title: undefined,
  expandable: false,
  expandMode: "inline",
  radius: "md",
})

const emit = defineEmits<{ toggle: [expanded: boolean] }>()

const theme = useMiuTheme()
const { t } = useMiuI18n()
const mounted = useMounted()
const popoverId = useId()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "TruncateText")

const rootRef = ref<HTMLElement>()
const textRef = ref<HTMLElement>()
const popRef = ref<HTMLElement>()
const expanded = ref(false)
const hasContent = ref((props.text ?? "").trim().length > 0)
const isOverflowing = ref(hasContent.value)

let observer: ResizeObserver | undefined

const {
  visible: showPopover,
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
  close: closePopover,
} = useFloatingPopover({
  enabled: () => props.expandMode === "popover",
  canOpen: () => isOverflowing.value,
  rootRef,
  popRef,
})

useDocumentKeydown(
  (event) => {
    if (event.key === "Escape") {
      closePopover()
    }
  },
  () => props.expandMode === "popover" && showPopover.value,
)

const resolvedExpandLabel = computed(() => props.expandLabel ?? t("truncate.expand"))
const resolvedCollapseLabel = computed(() => props.collapseLabel ?? t("truncate.collapse"))

const rootStyle = computed(() =>
  mergeStyle(
    regionStyle(props, "root"),
    expanded.value ? undefined : { "--miu-truncate-lines": String(props.lines) },
  ),
)

const resolvedTitle = computed(() => {
  if (props.title === false) return undefined
  if (props.expandMode === "popover") {
    return typeof props.title === "string" ? props.title : undefined
  }
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

function onKeyTogglePopover(): void {
  if (props.expandMode !== "popover" || !isOverflowing.value) return
  if (showPopover.value) {
    closePopover()
    return
  }
  const rect = rootRef.value?.getBoundingClientRect()
  const hasRect = Boolean(rect && (rect.width > 0 || rect.height > 0))
  const anchorX = hasRect && rect ? rect.left + 20 : 16
  const anchorY = hasRect && rect ? rect.bottom : 16
  updatePosition(anchorX, anchorY)
  showPopover.value = true
}

function onFocusOut(event: FocusEvent): void {
  if (props.expandMode !== "popover" || !showPopover.value) return
  const next = event.relatedTarget as Node | null
  if (
    next &&
    ((rootRef.value && rootRef.value.contains(next)) ||
      (popRef.value && popRef.value.contains(next)))
  ) {
    return
  }
  closePopover()
}

onMounted(() => {
  measureOverflow()
  if (typeof ResizeObserver !== "undefined" && textRef.value) {
    observer = new ResizeObserver(() => measureOverflow())
    observer.observe(textRef.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

watch(
  () => [props.text, props.lines, props.expandable, props.expandMode],
  () => {
    if (props.expandMode !== "popover") {
      closePopover()
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
    :tabindex="expandMode === 'popover' && isOverflowing ? 0 : undefined"
    :aria-describedby="expandMode === 'popover' && showPopover ? popoverId : undefined"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @wheel="onWheel"
    @keydown.enter="onKeyTogglePopover"
    @keydown.space.prevent="onKeyTogglePopover"
    @keydown.escape="closePopover"
    @focusout="onFocusOut"
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
      {{ expanded ? resolvedCollapseLabel : resolvedExpandLabel }}
    </button>
    <Teleport v-if="mounted && expandMode === 'popover'" :to="theme.portalTarget.value ?? 'body'">
      <Transition name="miu-truncate-popover">
        <div
          v-if="showPopover"
          :id="popoverId"
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
