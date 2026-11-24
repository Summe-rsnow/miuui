<script setup lang="ts">
import { computed, nextTick, ref, type ComponentPublicInstance } from "vue"
import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { SegmentedControlProps, SegmentedOption } from "../types"
import Icon from "./Icon.vue"
import { useControlSize } from "../composables/useControlSize"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import { useSlidingIndicator } from "../composables/useSlidingIndicator"

const props = withDefaults(defineProps<SegmentedControlProps>(), {
  radius: "default",
  disabled: false,
  readonly: false,
  iconOnly: false,
  block: false,
  clearable: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  change: [value: string]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  iconSize: () => props.iconSize,
  componentName: "SegmentedControl",
})
const { materialName, materialTokens } = useResolvedMaterial(
  () => props.material,
  "SegmentedControl",
)

const rootRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
const {
  setItemRef,
  setIndicatorRef,
  indicatorMetrics,
  indicatorAnimated,
  indicatorStyle,
  measure,
} = useSlidingIndicator({
    containerRef: rootRef,
    activeKey: () => props.modelValue,
    enabled: () => Boolean(props.modelValue),
    watchSources: () => [props.modelValue, props.options, props.size, props.iconOnly, props.block],
    baseStyle: () => regionStyle(props, "indicator"),
  })

function unwrapElement(node: unknown): HTMLElement | null {
  if (!node) return null
  if (node instanceof HTMLElement) return node
  const maybeComp = node as { $el?: unknown }
  return maybeComp.$el instanceof HTMLElement ? maybeComp.$el : null
}

function onUpdate(value: unknown): void {
  if (props.disabled || props.readonly) return
  if (typeof value === "string" && value.length > 0) {
    emit("update:modelValue", value)
    emit("change", value)
    void nextTick().then(() => measure())
  } else if (props.clearable) {
    emit("update:modelValue", "")
    emit("change", "")
    emit("clear")
    void nextTick().then(() => measure())
  }
}

function onItemClick(event: MouseEvent, option: SegmentedOption): void {
  if (props.disabled || option.disabled) return
  if (props.readonly) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  if (option.value === props.modelValue && !props.clearable) {
    event.preventDefault()
  }
}

function onReadonlyKeydown(event: KeyboardEvent): void {
  if (props.readonly && (event.key === " " || event.key === "Enter")) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onFocus(event: FocusEvent): void {
  const rootEl = unwrapElement(rootRef.value)
  const from = event.relatedTarget as Node | null
  if (from && rootEl?.contains(from)) return
  emit("focus", event)
}

function onBlur(event: FocusEvent): void {
  const rootEl = unwrapElement(rootRef.value)
  const to = event.relatedTarget as Node | null
  if (to && rootEl?.contains(to)) return
  emit("blur", event)
}

function focus(): void {
  const rootEl = unwrapElement(rootRef.value)
  if (!rootEl) return
  const target =
    rootEl.querySelector<HTMLElement>('.miu-segmented__item[data-state="on"]:not(:disabled)') ??
    rootEl.querySelector<HTMLElement>(".miu-segmented__item:not(:disabled)")
  target?.focus()
}

function blur(): void {
  const rootEl = unwrapElement(rootRef.value)
  if (!rootEl) return
  const active = typeof document !== "undefined" ? document.activeElement : null
  if (active instanceof HTMLElement && rootEl.contains(active)) {
    active.blur()
  }
}

defineExpose({ focus, blur, rootRef })
</script>

<template>
  <ToggleGroupRoot
    ref="rootRef"
    type="single"
    :model-value="modelValue"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    :aria-readonly="readonly || undefined"
    :class="
      regionClass(props, 'root', 'miu-segmented', `miu-segmented--${resolvedSize.size}`, {
        'miu-segmented--has-indicator': Boolean(indicatorMetrics),
        'miu-segmented--block': block,
        'miu-segmented--disabled': disabled,
        'miu-segmented--readonly': readonly,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-icon-only="iconOnly || undefined"
    :data-block="block || undefined"
    :data-material="materialName"
    :data-disabled="disabled || undefined"
    :data-readonly="readonly || undefined"
    @keydown.capture="onReadonlyKeydown"
    @update:model-value="onUpdate"
  >
    <span
      v-if="indicatorMetrics"
      :ref="setIndicatorRef"
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
      :disabled="disabled || option.disabled"
      :title="option.title ?? (iconOnly ? option.label : undefined)"
      :aria-label="option.ariaLabel ?? (iconOnly ? option.label : undefined)"
      :class="regionClass(props, 'item', 'miu-segmented__item')"
      :style="regionStyle(props, 'item')"
      @click="onItemClick($event, option)"
      @focus="onFocus"
      @blur="onBlur"
    >
      <slot name="item" :option="option" :active="option.value === modelValue" :index="index">
        <span
          v-if="option.color"
          class="miu-segmented__dot"
          :style="{ backgroundColor: option.color }"
          aria-hidden="true"
        />
        <Icon v-if="option.icon" :name="option.icon" />
        <span v-if="!iconOnly && option.label">{{ option.label }}</span>
        <Icon v-if="option.locked" name="lock" size="xs" class="miu-segmented__lock" />
      </slot>
    </ToggleGroupItem>
  </ToggleGroupRoot>
</template>
