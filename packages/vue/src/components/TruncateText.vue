<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import type { TruncateTextProps } from "../types"

const props = withDefaults(defineProps<TruncateTextProps>(), {
  lines: 1,
  as: "span",
  expandable: false,
  expandLabel: "展开",
  collapseLabel: "收起",
})

const emit = defineEmits<{ toggle: [expanded: boolean] }>()

const expanded = ref(false)
const textRef = ref<HTMLElement>()
const hasContent = ref((props.text ?? "").trim().length > 0)
const isOverflowing = ref(hasContent.value)
let observer: ResizeObserver | undefined

const rootStyle = computed(() => {
  const custom = regionStyle(props, "root")
  const base = expanded.value ? {} : { "--miu-truncate-lines": String(props.lines) }
  if (typeof custom === "string") return [base, custom]
  return custom ? { ...base, ...custom } : base
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
    // In non-layout environments (e.g. jsdom), show toggle only when non-empty.
    isOverflowing.value = true
    return
  }
  if (!expanded.value) {
    isOverflowing.value =
      el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1
  }
}

const showToggle = computed(() => {
  if (!props.expandable || !hasContent.value) return false
  return expanded.value || isOverflowing.value
})

function toggle(): void {
  expanded.value = !expanded.value
  emit("toggle", expanded.value)
  if (!expanded.value) {
    void nextTick(measureOverflow)
  }
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
  () => [props.text, props.lines, props.expandable],
  () => {
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
    :class="
      regionClass(props, 'root', 'miu-truncate', {
        'miu-truncate--expanded': expanded,
      })
    "
    :style="rootStyle"
    :title="title ?? text"
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
  </component>
</template>
