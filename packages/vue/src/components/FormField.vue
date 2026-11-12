<script setup lang="ts">
import { computed, provide, useId } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import type { FormFieldProps } from "../types"
import { MIU_FORM_FIELD_KEY } from "../composables/useFormField"
import { MIU_SIZE_HINT_KEY } from "../composables/useSizeHint"

const props = withDefaults(defineProps<FormFieldProps>(), {
  required: false,
  disabled: false,
  hideLabel: false,
})

const autoId = useId()
const fieldId = computed(() => props.id ?? autoId)
const descriptionId = computed(() => `${fieldId.value}-description`)
const hintId = computed(() => `${fieldId.value}-hint`)
const errorId = computed(() => `${fieldId.value}-error`)

const invalid = computed(() => Boolean(props.error))
const describedBy = computed(() => {
  if (props.error) return errorId.value
  if (props.description && props.hint) return `${descriptionId.value} ${hintId.value}`
  if (props.description) return descriptionId.value
  if (props.hint) return hintId.value
  return undefined
})

provide(
  MIU_SIZE_HINT_KEY,
  computed(() => (props.density === "compact" ? "sm" : undefined)),
)
provide(MIU_FORM_FIELD_KEY, {
  id: fieldId,
  describedBy,
  invalid,
  required: computed(() => props.required),
  disabled: computed(() => props.disabled),
})
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-form-field', {
        'miu-form-field--invalid': invalid,
        'miu-form-field--disabled': disabled,
      })
    "
    :style="regionStyle(props, 'root')"
    :data-density="density"
    :data-invalid="invalid || undefined"
    :data-disabled="disabled || undefined"
  >
    <label
      v-if="label"
      :for="fieldId"
      :class="
        regionClass(props, 'label', 'miu-form-field__label', {
          'miu-sr-only': hideLabel,
        })
      "
      :style="regionStyle(props, 'label')"
    >
      {{ label }}
      <span v-if="required" class="miu-form-field__required" aria-hidden="true">*</span>
    </label>
    <p
      v-if="description"
      :id="descriptionId"
      :class="regionClass(props, 'description', 'miu-form-field__description')"
      :style="regionStyle(props, 'description')"
    >
      {{ description }}
    </p>
    <div
      :class="regionClass(props, 'control', 'miu-form-field__control')"
      :style="regionStyle(props, 'control')"
    >
      <slot />
    </div>
    <p
      v-if="error"
      :id="errorId"
      :class="regionClass(props, 'error', 'miu-form-field__error')"
      :style="regionStyle(props, 'error')"
      role="alert"
    >
      {{ error }}
    </p>
    <p
      v-else-if="hint"
      :id="hintId"
      :class="regionClass(props, 'hint', 'miu-form-field__hint')"
      :style="regionStyle(props, 'hint')"
    >
      {{ hint }}
    </p>
  </div>
</template>
