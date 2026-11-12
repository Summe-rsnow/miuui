<script setup lang="ts">
import { computed, useAttrs, useId } from "vue"
import { CheckboxIndicator, CheckboxRoot } from "reka-ui"
import { regionClass, regionStyle, resolveControlSize } from "@miuui/core"
import type { CheckboxProps } from "../types"
import { useMiuFormField } from "../composables/useFormField"
import { useMiuSizeHint } from "../composables/useSizeHint"

import Icon from "./Icon.vue"

const props = withDefaults(defineProps<CheckboxProps>(), {
  radius: "sm",
  disabled: false,
  indeterminate: false,
  invalid: false,
})

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>()

const attrs = useAttrs()
const autoId = useId()
const formField = useMiuFormField()

const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, ["sm", "md", "lg"], "md"))
const resolvedIconSize = computed(
  () => props.iconSize ?? (resolvedSize.value.size === "lg" ? "md" : "sm"),
)

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] Checkbox: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}

const accessibleLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  const native = attrs["aria-label"]
  return typeof native === "string" ? native : undefined
})

const inputId = computed(() => props.id ?? formField?.id.value ?? autoId)
const disabled = computed(() => props.disabled || formField?.disabled.value || false)
const invalid = computed(() => props.invalid || formField?.invalid.value || false)
const required = computed(() => formField?.required.value || false)
const describedBy = computed(() => formField?.describedBy.value)

const model = computed(() => (props.indeterminate ? "indeterminate" : props.modelValue))

function onUpdate(value: boolean | "indeterminate"): void {
  emit("update:modelValue", value === true)
}
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-checkbox', `miu-checkbox--${resolvedSize.size}`, {
        'miu-checkbox--disabled': disabled,
        'miu-checkbox--invalid': invalid,
      })
    "
    :style="regionStyle(props, 'root')"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize"
    :data-disabled="disabled || undefined"
    :data-invalid="invalid || undefined"
  >
    <CheckboxRoot
      :id="inputId"
      :model-value="model"
      :name="name"
      :value="value"
      :disabled="disabled"
      :required="required"
      :aria-label="label ? undefined : accessibleLabel"
      :aria-describedby="describedBy"
      :aria-invalid="invalid || undefined"
      :class="regionClass(props, 'box', 'miu-checkbox__box')"
      :style="regionStyle(props, 'box')"
      @update:model-value="onUpdate"
    >
      <CheckboxIndicator class="miu-checkbox__indicator">
        <Icon name="check" />
      </CheckboxIndicator>
    </CheckboxRoot>
    <label
      v-if="label || $slots.default"
      :for="inputId"
      :class="regionClass(props, 'label', 'miu-checkbox__label')"
      :style="regionStyle(props, 'label')"
    >
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>
