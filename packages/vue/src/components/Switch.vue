<script setup lang="ts">
import { computed, useAttrs, useId } from "vue"
import { SwitchRoot, SwitchThumb } from "reka-ui"
import { regionClass, regionStyle, resolveControlSize } from "@miuui/core"
import type { SwitchProps } from "../types"
import { useMiuFormField } from "../composables/useFormField"
import { useMiuSizeHint } from "../composables/useSizeHint"

import { useMiuI18n } from "../composables/useMiu"

const props = withDefaults(defineProps<SwitchProps>(), {
  disabled: false,
})

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>()

const attrs = useAttrs()
const autoId = useId()
const formField = useMiuFormField()
const { t } = useMiuI18n()

const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, ["sm", "md", "lg"], "md"))

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] Switch: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}

const accessibleLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  const native = attrs["aria-label"]
  return typeof native === "string" ? native : undefined
})

const switchId = computed(() => props.id ?? formField?.id.value ?? autoId)
const disabled = computed(() => props.disabled || formField?.disabled.value || false)
const describedBy = computed(() => formField?.describedBy.value)

function onUpdate(value: boolean): void {
  emit("update:modelValue", value)
}
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-switch', `miu-switch--${resolvedSize.size}`, {
        'miu-switch--disabled': disabled,
      })
    "
    :style="regionStyle(props, 'root')"
    :data-miu-size="resolvedSize.size"
    :data-disabled="disabled || undefined"
  >
    <SwitchRoot
      :id="switchId"
      :model-value="modelValue"
      :name="name"
      :disabled="disabled"
      :aria-label="label ? undefined : (accessibleLabel ?? t('common.toggle'))"
      :aria-describedby="describedBy"
      :class="regionClass(props, 'track', 'miu-switch__track')"
      :style="regionStyle(props, 'track')"
      @update:model-value="onUpdate"
    >
      <SwitchThumb
        :class="regionClass(props, 'thumb', 'miu-switch__thumb')"
        :style="regionStyle(props, 'thumb')"
      />
    </SwitchRoot>
    <label
      v-if="label || $slots.default"
      :for="switchId"
      :class="regionClass(props, 'label', 'miu-switch__label')"
      :style="regionStyle(props, 'label')"
    >
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>
