<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from "vue"
import {
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
} from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { NumberInputProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useFormFieldBinding } from "../composables/useFormField"
import { useMiuI18n } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<NumberInputProps>(), {
  radius: "default",
  step: 1,
  disabled: false,
  readonly: false,
  invalid: false,
  clearable: false,
  hideSteppers: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: number | undefined]
  change: [value: number | undefined]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const { t } = useMiuI18n()

const rootRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
const inputRef = ref<ComponentPublicInstance | HTMLElement | null>(null)

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  iconSize: () => props.iconSize,
  componentName: "NumberInput",
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "NumberInput")
const field = useFormFieldBinding({
  id: () => props.id,
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  invalid: () => props.invalid,
})

function unwrapElement(node: unknown): HTMLElement | null {
  if (!node) return null
  if (node instanceof HTMLElement) return node
  const maybeComp = node as { $el?: unknown }
  return maybeComp.$el instanceof HTMLElement ? maybeComp.$el : null
}

const canClear = computed(
  () =>
    props.clearable &&
    props.modelValue !== undefined &&
    !field.disabled.value &&
    !field.readonly.value,
)

function clear(): void {
  if (field.disabled.value || field.readonly.value) return
  emit("update:modelValue", undefined)
  emit("change", undefined)
  emit("clear")
  focus()
}

function onUpdate(value: number | undefined): void {
  if (field.disabled.value || field.readonly.value) return
  const next = Number.isNaN(value) ? undefined : value
  if (next === props.modelValue) return
  emit("update:modelValue", next)
  emit("change", next)
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
  unwrapElement(inputRef.value)?.focus()
}

function blur(): void {
  unwrapElement(inputRef.value)?.blur()
}

defineExpose({ focus, blur, inputRef })
</script>

<template>
  <NumberFieldRoot
    ref="rootRef"
    :id="field.id.value"
    :model-value="modelValue"
    :default-value="defaultValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="field.disabled.value"
    :readonly="field.readonly.value"
    :required="field.required.value"
    :name="name"
    :class="
      regionClass(props, 'root', 'miu-number-input', `miu-number-input--${resolvedSize.size}`, {
        'miu-number-input--disabled': field.disabled.value,
        'miu-number-input--readonly': field.readonly.value,
        'miu-number-input--invalid': field.invalid.value,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="materialName"
    :data-invalid="field.invalid.value || undefined"
    :data-disabled="field.disabled.value || undefined"
    :data-readonly="field.readonly.value || undefined"
    @update:model-value="onUpdate"
  >
    <NumberFieldDecrement
      v-if="!hideSteppers"
      :class="regionClass(props, 'decrement', 'miu-number-input__stepper')"
      :style="regionStyle(props, 'decrement')"
      :tabindex="field.readonly.value ? -1 : undefined"
      aria-label="-"
      @focus="onFocus"
      @blur="onBlur"
    >
      <Icon name="minus" :size="iconSize ?? 'xs'" />
    </NumberFieldDecrement>
    <NumberFieldInput
      ref="inputRef"
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      :aria-describedby="field.describedBy.value"
      :aria-invalid="field.invalid.value || undefined"
      :aria-required="field.required.value || undefined"
      :aria-readonly="field.readonly.value || undefined"
      :class="regionClass(props, 'input', 'miu-number-input__control')"
      :style="regionStyle(props, 'input')"
      @focus="onFocus"
      @blur="onBlur"
    />
    <button
      v-if="canClear"
      type="button"
      :class="regionClass(props, 'clear', 'miu-number-input__clear')"
      :style="regionStyle(props, 'clear')"
      :aria-label="t('input.clear')"
      @click="clear"
      @focus="onFocus"
      @blur="onBlur"
    >
      <Icon name="close" :size="resolvedIconSize.size" />
    </button>
    <NumberFieldIncrement
      v-if="!hideSteppers"
      :class="regionClass(props, 'increment', 'miu-number-input__stepper')"
      :style="regionStyle(props, 'increment')"
      :tabindex="field.readonly.value ? -1 : undefined"
      aria-label="+"
      @focus="onFocus"
      @blur="onBlur"
    >
      <Icon name="plus" :size="iconSize ?? 'xs'" />
    </NumberFieldIncrement>
  </NumberFieldRoot>
</template>
