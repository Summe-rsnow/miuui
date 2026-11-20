<script setup lang="ts">
import { computed, ref, useAttrs, type ComponentPublicInstance } from "vue"
import { SwitchRoot, SwitchThumb } from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { SwitchProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useFormFieldBinding } from "../composables/useFormField"
import { useMiuI18n } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<SwitchProps>(), {
  radius: "full",
  disabled: false,
  readonly: false,
  invalid: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  change: [value: boolean]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const attrs = useAttrs()
const { t } = useMiuI18n()
const switchRef = ref<ComponentPublicInstance | HTMLElement | null>(null)

const { resolvedSize } = useControlSize({
  size: () => props.size,
  supported: ["sm", "md", "lg"],
  defaultSize: "md",
  componentName: "Switch",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Switch")

const accessibleLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  const native = attrs["aria-label"]
  return typeof native === "string" ? native : undefined
})

const field = useFormFieldBinding({
  id: () => props.id,
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  invalid: () => props.invalid,
})

function onUpdate(value: boolean): void {
  if (field.disabled.value || field.readonly.value) return
  emit("update:modelValue", value)
  emit("change", value)
}

function onReadonlyClick(event: MouseEvent): void {
  if (field.readonly.value) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onReadonlyKeydown(event: KeyboardEvent): void {
  if (field.readonly.value && (event.key === " " || event.key === "Enter")) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function resolveSwitchElement(): HTMLElement | null {
  const node = switchRef.value
  if (!node) return null
  if (node instanceof HTMLElement) return node
  return node.$el instanceof HTMLElement ? node.$el : null
}

function focus(): void {
  resolveSwitchElement()?.focus()
}

function blur(): void {
  resolveSwitchElement()?.blur()
}

defineExpose({ focus, blur, switchRef })
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-switch', `miu-switch--${resolvedSize.size}`, {
        'miu-switch--disabled': field.disabled.value,
        'miu-switch--readonly': field.readonly.value,
        'miu-switch--invalid': field.invalid.value,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-material="materialName"
    :data-disabled="field.disabled.value || undefined"
    :data-readonly="field.readonly.value || undefined"
    :data-invalid="field.invalid.value || undefined"
    @click.capture="onReadonlyClick"
  >
    <SwitchRoot
      ref="switchRef"
      :id="field.id.value"
      :model-value="modelValue"
      :name="name"
      :disabled="field.disabled.value"
      :required="field.required.value"
      :aria-label="label ? undefined : (accessibleLabel ?? t('common.toggle'))"
      :aria-describedby="field.describedBy.value"
      :aria-invalid="field.invalid.value || undefined"
      :aria-readonly="field.readonly.value || undefined"
      :data-readonly="field.readonly.value || undefined"
      :class="regionClass(props, 'track', 'miu-switch__track')"
      :style="regionStyle(props, 'track')"
      @update:model-value="onUpdate"
      @keydown.capture="onReadonlyKeydown"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    >
      <SwitchThumb
        :class="regionClass(props, 'thumb', 'miu-switch__thumb')"
        :style="regionStyle(props, 'thumb')"
      />
    </SwitchRoot>
    <label
      v-if="label || $slots.default"
      :for="field.id.value"
      :class="regionClass(props, 'label', 'miu-switch__label')"
      :style="regionStyle(props, 'label')"
    >
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>
