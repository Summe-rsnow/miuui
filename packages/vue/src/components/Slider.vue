<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from "vue"
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { SliderProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useFormFieldBinding } from "../composables/useFormField"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<SliderProps>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  orientation: "horizontal",
  radius: "full",
  disabled: false,
  readonly: false,
  invalid: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: number]
  change: [value: number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const rootRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
const trackRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
const thumbRef = ref<ComponentPublicInstance | HTMLElement | null>(null)

const { resolvedSize } = useControlSize({
  size: () => props.size,
  supported: ["sm", "md", "lg"],
  defaultSize: "md",
  componentName: "Slider",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Slider")

const field = useFormFieldBinding({
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  invalid: () => props.invalid,
})

const valueArray = computed(() => [props.modelValue])

function onUpdate(values: number[] | undefined): void {
  if (field.disabled.value || field.readonly.value) return
  const next = values?.[0]
  if (typeof next === "number") emit("update:modelValue", next)
}

function onCommit(values: number[]): void {
  if (field.disabled.value || field.readonly.value) return
  const next = values[0]
  if (typeof next === "number") emit("change", next)
}

const READONLY_BLOCKED_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
])

function onReadonlyPointerdown(event: PointerEvent): void {
  if (field.readonly.value) {
    event.preventDefault()
    event.stopPropagation()
    focus()
  }
}

function onReadonlyKeydown(event: KeyboardEvent): void {
  if (field.readonly.value && READONLY_BLOCKED_KEYS.has(event.key)) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function unwrapElement(node: unknown): HTMLElement | null {
  if (!node) return null
  if (node instanceof HTMLElement) return node
  const maybeComp = node as { $el?: unknown }
  const el = maybeComp.$el
  if (el instanceof HTMLElement) return el
  if (el instanceof Node) {
    let cur: Node | null = el.nextSibling
    while (cur && !(cur instanceof HTMLElement)) {
      cur = cur.nextSibling
    }
    return cur instanceof HTMLElement ? cur : null
  }
  return null
}

function resolveThumbElement(): HTMLElement | null {
  const direct = unwrapElement(thumbRef.value)
  if (direct?.getAttribute("role") === "slider") return direct
  const nestedFromDirect = direct?.querySelector<HTMLElement>('[role="slider"]')
  if (nestedFromDirect) return nestedFromDirect
  const fromRoot = unwrapElement(rootRef.value)?.querySelector<HTMLElement>('[role="slider"]')
  if (fromRoot) return fromRoot
  const trackEl = unwrapElement(trackRef.value)
  return trackEl?.parentElement?.querySelector<HTMLElement>('[role="slider"]') ?? null
}

function focus(): void {
  resolveThumbElement()?.focus()
}

function blur(): void {
  resolveThumbElement()?.blur()
}

defineExpose({ focus, blur, thumbRef })
</script>

<template>
  <SliderRoot
    ref="rootRef"
    :model-value="valueArray"
    :min="min"
    :max="max"
    :step="step"
    :orientation="orientation"
    :disabled="field.disabled.value"
    :name="name"
    :aria-label="ariaLabel"
    :class="
      regionClass(
        props,
        'root',
        'miu-slider',
        `miu-slider--${resolvedSize.size}`,
        `miu-slider--${orientation}`,
        {
          'miu-slider--disabled': field.disabled.value,
          'miu-slider--readonly': field.readonly.value,
          'miu-slider--invalid': field.invalid.value,
        },
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-material="materialName"
    :data-orientation="orientation"
    :data-disabled="field.disabled.value || undefined"
    :data-readonly="field.readonly.value || undefined"
    :data-invalid="field.invalid.value || undefined"
    @pointerdown.capture="onReadonlyPointerdown"
    @keydown.capture="onReadonlyKeydown"
    @update:model-value="onUpdate"
    @value-commit="onCommit"
  >
    <SliderTrack
      ref="trackRef"
      :class="regionClass(props, 'track', 'miu-slider__track')"
      :style="regionStyle(props, 'track')"
    >
      <SliderRange
        :class="regionClass(props, 'range', 'miu-slider__range')"
        :style="regionStyle(props, 'range')"
      />
    </SliderTrack>
    <SliderThumb
      ref="thumbRef"
      :id="field.id.value"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabel ? undefined : field.labelId?.value"
      :aria-describedby="field.describedBy.value"
      :aria-invalid="field.invalid.value || undefined"
      :aria-required="field.required.value || undefined"
      :aria-readonly="field.readonly.value || undefined"
      :class="regionClass(props, 'thumb', 'miu-slider__thumb')"
      :style="regionStyle(props, 'thumb')"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
  </SliderRoot>
</template>
