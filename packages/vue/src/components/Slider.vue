<script setup lang="ts">
import { computed } from "vue"
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "reka-ui"
import { regionClass, regionStyle, resolveControlSize } from "@miuui/core"
import type { SliderProps } from "../types"
import { useMiuFormField } from "../composables/useFormField"
import { useMiuSizeHint } from "../composables/useSizeHint"

const props = withDefaults(defineProps<SliderProps>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  orientation: "horizontal",
  radius: "full",
  disabled: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: number]
  change: [value: number]
}>()

const formField = useMiuFormField()
const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, ["sm", "md", "lg"], "md"))

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] Slider: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}

const disabled = computed(() => props.disabled || formField?.disabled.value || false)
const valueArray = computed(() => [props.modelValue])

function onUpdate(values: number[] | undefined): void {
  const next = values?.[0]
  if (typeof next === "number") emit("update:modelValue", next)
}

function onCommit(values: number[]): void {
  const next = values[0]
  if (typeof next === "number") emit("change", next)
}
</script>

<template>
  <SliderRoot
    :model-value="valueArray"
    :min="min"
    :max="max"
    :step="step"
    :orientation="orientation"
    :disabled="disabled"
    :name="name"
    :aria-label="ariaLabel"
    :class="
      regionClass(
        props,
        'root',
        'miu-slider',
        `miu-slider--${resolvedSize.size}`,
        `miu-slider--${orientation}`,
        { 'miu-slider--disabled': disabled },
      )
    "
    :style="regionStyle(props, 'root')"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-orientation="orientation"
    :data-disabled="disabled || undefined"
    @update:model-value="onUpdate"
    @value-commit="onCommit"
  >
    <SliderTrack
      :class="regionClass(props, 'track', 'miu-slider__track')"
      :style="regionStyle(props, 'track')"
    >
      <SliderRange
        :class="regionClass(props, 'range', 'miu-slider__range')"
        :style="regionStyle(props, 'range')"
      />
    </SliderTrack>
    <SliderThumb
      :aria-label="ariaLabel"
      :class="regionClass(props, 'thumb', 'miu-slider__thumb')"
      :style="regionStyle(props, 'thumb')"
    />
  </SliderRoot>
</template>
