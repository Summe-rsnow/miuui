<script setup lang="ts">
import { computed, provide, useId, useSlots } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { FormFieldProps } from "../types"
import { MIU_FORM_FIELD_KEY } from "../composables/useFormField"
import { MIU_SIZE_HINT_KEY } from "../composables/useSizeHint"

const props = withDefaults(defineProps<FormFieldProps>(), {
  required: false,
  disabled: false,
  readonly: false,
  invalid: false,
  hideLabel: false,
})

const slots = useSlots()
const autoId = useId()
const fieldId = computed(() => props.id ?? autoId)
const labelId = computed(() => `${fieldId.value}-label`)
const descriptionId = computed(() => `${fieldId.value}-description`)
const hintId = computed(() => `${fieldId.value}-hint`)
const errorId = computed(() => `${fieldId.value}-error`)

const hasLabel = computed(() => Boolean(props.label || slots.label))
const hasDescription = computed(() => Boolean(props.description || slots.description))
const hasError = computed(() => Boolean(props.error || slots.error))
const hasHint = computed(() => Boolean(props.hint || slots.hint))

const invalid = computed(() => hasError.value || props.invalid)
const readonly = computed(() => props.readonly)
const exposedLabelId = computed(() => (hasLabel.value ? labelId.value : undefined))
const describedBy = computed(() => {
  const ids: string[] = []
  if (hasDescription.value) ids.push(descriptionId.value)
  if (hasError.value) ids.push(errorId.value)
  else if (hasHint.value) ids.push(hintId.value)
  return ids.length > 0 ? ids.join(" ") : undefined
})

provide(
  MIU_SIZE_HINT_KEY,
  computed(() => (props.density === "compact" ? "sm" : undefined)),
)
provide(MIU_FORM_FIELD_KEY, {
  id: fieldId,
  labelId: exposedLabelId,
  describedBy,
  invalid,
  required: computed(() => props.required),
  disabled: computed(() => props.disabled),
  readonly,
})
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-form-field', {
        'miu-form-field--invalid': invalid,
        'miu-form-field--disabled': disabled,
        'miu-form-field--readonly': readonly,
      })
    "
    :style="regionStyle(props, 'root')"
    :data-density="density"
    :data-invalid="invalid || undefined"
    :data-disabled="disabled || undefined"
    :data-readonly="readonly || undefined"
  >
    <label
      v-if="hasLabel"
      :id="labelId"
      :for="fieldId"
      :class="
        regionClass(props, 'label', 'miu-form-field__label', {
          'miu-sr-only': hideLabel,
        })
      "
      :style="regionStyle(props, 'label')"
    >
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="miu-form-field__required" aria-hidden="true">*</span>
    </label>
    <p
      v-if="hasDescription"
      :id="descriptionId"
      :class="regionClass(props, 'description', 'miu-form-field__description')"
      :style="regionStyle(props, 'description')"
    >
      <slot name="description">{{ description }}</slot>
    </p>
    <div
      :class="regionClass(props, 'control', 'miu-form-field__control')"
      :style="regionStyle(props, 'control')"
    >
      <slot />
    </div>
    <p
      v-if="hasError"
      :id="errorId"
      :class="regionClass(props, 'error', 'miu-form-field__error')"
      :style="regionStyle(props, 'error')"
      role="alert"
    >
      <slot name="error">{{ error }}</slot>
    </p>
    <p
      v-else-if="hasHint"
      :id="hintId"
      :class="regionClass(props, 'hint', 'miu-form-field__hint')"
      :style="regionStyle(props, 'hint')"
    >
      <slot name="hint">{{ hint }}</slot>
    </p>
  </div>
</template>
