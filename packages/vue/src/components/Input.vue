<script setup lang="ts">
import { computed, ref, useId } from "vue"
import {
  CONTROL_SIZES,
  regionClass,
  regionStyle,
  resolveControlSize,
  resolveIconSize,
} from "@miuui/core"
import type { InputProps } from "../types"
import { useMiuFormField } from "../composables/useFormField"
import { useMiuSizeHint } from "../composables/useSizeHint"

import { useMiuI18n } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<InputProps>(), {
  type: "text",
  radius: "default",
  disabled: false,
  readonly: false,
  invalid: false,
  clearable: false,
  showCount: false,
  autofocus: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  enter: [event: KeyboardEvent]
  clear: []
}>()

const autoId = useId()
const formField = useMiuFormField()
const { t } = useMiuI18n()

const inputRef = ref<HTMLInputElement>()

const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, CONTROL_SIZES))
const resolvedIconSize = computed(() => resolveIconSize(resolvedSize.value.size, props.iconSize))
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Input")

const inputId = computed(() => props.id ?? formField?.id.value ?? autoId)
const describedBy = computed(() => formField?.describedBy.value)
const invalid = computed(() => props.invalid || formField?.invalid.value || false)
const required = computed(() => formField?.required.value || false)
const disabled = computed(() => props.disabled || formField?.disabled.value || false)

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] Input: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}
const model = computed({
  get: () => props.modelValue ?? "",
  set: (value: string) => emit("update:modelValue", value),
})

function clear(): void {
  model.value = ""
  emit("clear")
  inputRef.value?.focus()
}

function focus(): void {
  inputRef.value?.focus()
}

defineExpose({ focus, inputRef })
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-input', `miu-input--${resolvedSize.size}`, {
        'miu-input--disabled': disabled,
        'miu-input--invalid': invalid,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="materialName"
    :data-invalid="invalid || undefined"
  >
    <span v-if="$slots.prefix" class="miu-input__prefix" :class="regionClass(props, 'prefix')">
      <slot name="prefix" />
    </span>
    <input
      ref="inputRef"
      v-model="model"
      :id="inputId"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :minlength="minlength"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :autofocus="autofocus"
      :aria-label="ariaLabel"
      :aria-describedby="describedBy"
      :aria-invalid="invalid || undefined"
      :aria-required="required || undefined"
      :class="regionClass(props, 'input', 'miu-input__control')"
      :style="regionStyle(props, 'input')"
      @keydown.enter="$emit('enter', $event)"
    />
    <span
      v-if="$slots.suffix || showCount || (clearable && model.length > 0 && !disabled && !readonly)"
      class="miu-input__suffix"
      :class="regionClass(props, 'suffix')"
      :style="regionStyle(props, 'suffix')"
    >
      <slot name="suffix" />
      <span v-if="showCount" class="miu-input__count">
        {{ maxlength ? `${model.length} / ${maxlength}` : model.length }}
      </span>
      <button
        v-if="clearable && model.length > 0 && !disabled && !readonly"
        type="button"
        class="miu-input__clear"
        :class="regionClass(props, 'clear')"
        :style="regionStyle(props, 'clear')"
        :aria-label="t('input.clear')"
        @click="clear"
      >
        <Icon name="close" size="sm" />
      </button>
    </span>
  </div>
</template>
