<script setup lang="ts">
import { computed, ref, useAttrs, type ComponentPublicInstance } from "vue"
import { CheckboxIndicator, CheckboxRoot } from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { CheckboxProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useFormFieldBinding } from "../composables/useFormField"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<CheckboxProps>(), {
  radius: "sm",
  disabled: false,
  readonly: false,
  indeterminate: false,
  invalid: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  change: [value: boolean]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const attrs = useAttrs()
const boxRef = ref<ComponentPublicInstance | HTMLElement | null>(null)

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  supported: ["sm", "md", "lg"],
  defaultSize: "md",
  iconSize: () => props.iconSize,
  componentName: "Checkbox",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Checkbox")

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

const model = computed(() => (props.indeterminate ? "indeterminate" : props.modelValue))

function onUpdate(value: boolean | "indeterminate"): void {
  if (field.disabled.value || field.readonly.value) return
  const next = value === true
  emit("update:modelValue", next)
  emit("change", next)
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

function resolveBoxElement(): HTMLElement | null {
  const node = boxRef.value
  if (!node) return null
  if (node instanceof HTMLElement) return node
  return node.$el instanceof HTMLElement ? node.$el : null
}

function focus(): void {
  resolveBoxElement()?.focus()
}

function blur(): void {
  resolveBoxElement()?.blur()
}

defineExpose({ focus, blur, boxRef })
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-checkbox', `miu-checkbox--${resolvedSize.size}`, {
        'miu-checkbox--disabled': field.disabled.value,
        'miu-checkbox--readonly': field.readonly.value,
        'miu-checkbox--invalid': field.invalid.value,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="materialName"
    :data-disabled="field.disabled.value || undefined"
    :data-readonly="field.readonly.value || undefined"
    :data-invalid="field.invalid.value || undefined"
    @click.capture="onReadonlyClick"
  >
    <CheckboxRoot
      ref="boxRef"
      :id="field.id.value"
      :model-value="model"
      :name="name"
      :value="value"
      :disabled="field.disabled.value"
      :required="field.required.value"
      :aria-label="label ? undefined : accessibleLabel"
      :aria-describedby="field.describedBy.value"
      :aria-invalid="field.invalid.value || undefined"
      :aria-readonly="field.readonly.value || undefined"
      :data-readonly="field.readonly.value || undefined"
      :class="regionClass(props, 'box', 'miu-checkbox__box')"
      :style="regionStyle(props, 'box')"
      @update:model-value="onUpdate"
      @keydown.capture="onReadonlyKeydown"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    >
      <CheckboxIndicator class="miu-checkbox__indicator">
        <Icon name="check" />
      </CheckboxIndicator>
    </CheckboxRoot>
    <label
      v-if="label || $slots.default"
      :for="field.id.value"
      :class="regionClass(props, 'label', 'miu-checkbox__label')"
      :style="regionStyle(props, 'label')"
    >
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>
