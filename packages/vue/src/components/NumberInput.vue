<script setup lang="ts">
import { computed, useId } from "vue"
import {
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
} from "reka-ui"
import {
  CONTROL_SIZES,
  regionClass,
  regionStyle,
  resolveControlSize,
  resolveIconSize,
} from "@miuui/core"
import type { NumberInputProps } from "../types"
import { useMiuFormField } from "../composables/useFormField"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import { useMiuSizeHint } from "../composables/useSizeHint"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<NumberInputProps>(), {
  radius: "default",
  step: 1,
  disabled: false,
  readonly: false,
  invalid: false,
  hideSteppers: false,
})

const emit = defineEmits<{ "update:modelValue": [value: number | undefined] }>()

const autoId = useId()
const formField = useMiuFormField()
const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, CONTROL_SIZES))
const resolvedIconSize = computed(() => resolveIconSize(resolvedSize.value.size))

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] NumberInput: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "NumberInput")
const inputId = computed(() => props.id ?? formField?.id.value ?? autoId)
const describedBy = computed(() => formField?.describedBy.value)
const invalid = computed(() => props.invalid || formField?.invalid.value || false)
const required = computed(() => formField?.required.value || false)
const disabled = computed(() => props.disabled || formField?.disabled.value || false)

function onUpdate(value: number | undefined): void {
  emit("update:modelValue", Number.isNaN(value) ? undefined : value)
}
</script>

<template>
  <NumberFieldRoot
    :id="inputId"
    :model-value="modelValue"
    :default-value="defaultValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :name="name"
    :class="
      regionClass(props, 'root', 'miu-number-input', `miu-number-input--${resolvedSize.size}`, {
        'miu-number-input--disabled': disabled,
        'miu-number-input--invalid': invalid,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="materialName"
    :data-invalid="invalid || undefined"
    :data-disabled="disabled || undefined"
    @update:model-value="onUpdate"
  >
    <NumberFieldDecrement
      v-if="!hideSteppers"
      :class="regionClass(props, 'decrement', 'miu-number-input__stepper')"
      :style="regionStyle(props, 'decrement')"
      aria-label="-"
    >
      <Icon name="minus" size="xs" />
    </NumberFieldDecrement>
    <NumberFieldInput
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      :aria-describedby="describedBy"
      :aria-invalid="invalid || undefined"
      :class="regionClass(props, 'input', 'miu-number-input__control')"
      :style="regionStyle(props, 'input')"
    />
    <NumberFieldIncrement
      v-if="!hideSteppers"
      :class="regionClass(props, 'increment', 'miu-number-input__stepper')"
      :style="regionStyle(props, 'increment')"
      aria-label="+"
    >
      <Icon name="plus" size="xs" />
    </NumberFieldIncrement>
  </NumberFieldRoot>
</template>
