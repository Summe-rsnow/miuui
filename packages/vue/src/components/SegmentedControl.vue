<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance,
} from "vue"
import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui"
import {
  CONTROL_SIZES,
  regionClass,
  regionStyle,
  resolveControlSize,
  resolveIconSize,
} from "@xcmm1543/miuui-core"
import type { SegmentedControlProps } from "../types"
import Icon from "./Icon.vue"
import { useMiuSizeHint } from "../composables/useSizeHint"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<SegmentedControlProps>(), {
  radius: "default",
  disabled: false,
  iconOnly: false,
})

const emit = defineEmits<{ "update:modelValue": [value: string] }>()

const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, CONTROL_SIZES))
const resolvedIconSize = computed(() => resolveIconSize(resolvedSize.value.size, props.iconSize))
const { materialName, materialTokens } = useResolvedMaterial(
  () => props.material,
  "SegmentedControl",
)

const rootRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
const itemElements = new Map<string, HTMLElement>()
const indicatorMetrics = ref<{ x: number; y: number; width: number; height: number } | null>(null)
const indicatorAnimated = ref(false)
let resizeObserver: ResizeObserver | null = null

function unwrapElement(node: unknown): HTMLElement | null {
  if (!node) return null
  if (node instanceof HTMLElement) return node
  const maybeComp = node as { $el?: unknown }
  return maybeComp.$el instanceof HTMLElement ? maybeComp.$el : null
}

function setItemRef(value: string, node: unknown): void {
  const el = unwrapElement(node)
  if (el) itemElements.set(value, el)
  else itemElements.delete(value)
}

function measureIndicator(): void {
  const activeValue = props.modelValue
  if (!activeValue) {
    indicatorMetrics.value = null
    return
  }
  const activeEl = itemElements.get(activeValue)
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
  const base = regionStyle(props, "indicator")
  const m = indicatorMetrics.value
  if (!m) return base
  const geom = {
    width: `${m.width}px`,
    height: `${m.height}px`,
    transform: `translate3d(${m.x}px, ${m.y}px, 0)`,
  }
  return mergeStyle(base, geom)
})

onMounted(async () => {
  await nextTick()
  measureIndicator()
  const rootEl = unwrapElement(rootRef.value)
  if (rootEl && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => measureIndicator())
    resizeObserver.observe(rootEl)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => [props.modelValue, props.options, props.size, props.iconOnly] as const,
  async () => {
    await nextTick()
    measureIndicator()
  },
  { flush: "post", deep: true },
)

function onUpdate(value: unknown): void {
  if (typeof value === "string" && value.length > 0) {
    emit("update:modelValue", value)
  }
}
</script>

<template>
  <ToggleGroupRoot
    ref="rootRef"
    type="single"
    :model-value="modelValue"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :class="
      regionClass(props, 'root', 'miu-segmented', `miu-segmented--${resolvedSize.size}`, {
        'miu-segmented--has-indicator': Boolean(indicatorMetrics),
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-icon-only="iconOnly || undefined"
    :data-material="materialName"
    @update:model-value="onUpdate"
  >
    <span
      v-if="indicatorMetrics"
      aria-hidden="true"
      :class="
        regionClass(props, 'indicator', 'miu-segmented__indicator', {
          'miu-segmented__indicator--animated': indicatorAnimated,
        })
      "
      :style="indicatorStyle"
    />
    <ToggleGroupItem
      v-for="(option, index) in options"
      :key="option.value"
      :ref="(el) => setItemRef(option.value, el)"
      :value="option.value"
      :disabled="option.disabled"
      :title="option.title ?? (iconOnly ? option.label : undefined)"
      :aria-label="option.ariaLabel ?? (iconOnly ? option.label : undefined)"
      :class="regionClass(props, 'item', 'miu-segmented__item')"
      :style="regionStyle(props, 'item')"
    >
      <slot name="item" :option="option" :active="option.value === modelValue" :index="index">
        <Icon v-if="option.icon" :name="option.icon" />
        <span v-if="!iconOnly && option.label">{{ option.label }}</span>
      </slot>
    </ToggleGroupItem>
  </ToggleGroupRoot>
</template>
