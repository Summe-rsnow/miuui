<script setup lang="ts">
import { computed, ref } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { InputProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useFormFieldBinding } from "../composables/useFormField"
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
  passwordToggle: false,
  showCount: false,
  autofocus: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  change: [value: string]
  enter: [event: KeyboardEvent]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const { t } = useMiuI18n()
const rootRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const isComposing = ref(false)

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  iconSize: () => props.iconSize,
  componentName: "Input",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Input")
const field = useFormFieldBinding({
  id: () => props.id,
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  invalid: () => props.invalid,
})

function emitValue(value: string): void {
  emit("update:modelValue", value)
  emit("change", value)
}

const model = computed({
  get: () => props.modelValue ?? "",
  set: (value: string) => emitValue(value),
})

function clear(): void {
  if (field.disabled.value || field.readonly.value) return
  emitValue("")
  emit("clear")
  focus()
}

const passwordRevealed = ref(false)
const effectiveType = computed(() =>
  props.passwordToggle && props.type === "password" && passwordRevealed.value ? "text" : props.type,
)

function togglePassword(): void {
  passwordRevealed.value = !passwordRevealed.value
}

function onEnter(event: KeyboardEvent): void {
  if (!isComposing.value && !event.isComposing) {
    emit("enter", event)
  }
}

function onFocus(event: FocusEvent): void {
  const from = event.relatedTarget as Node | null
  if (from && rootRef.value?.contains(from)) return
  emit("focus", event)
}

function onBlur(event: FocusEvent): void {
  const to = event.relatedTarget as Node | null
  if (to && rootRef.value?.contains(to)) return
  emit("blur", event)
}

function focus(): void {
  inputRef.value?.focus()
}

function blur(): void {
  inputRef.value?.blur()
}

defineExpose({ focus, blur, inputRef })
</script>

<template>
  <div
    ref="rootRef"
    :class="
      regionClass(props, 'root', 'miu-input', `miu-input--${resolvedSize.size}`, {
        'miu-input--disabled': field.disabled.value,
        'miu-input--readonly': field.readonly.value,
        'miu-input--invalid': field.invalid.value,
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
  >
    <span
      v-if="$slots.prefix"
      :class="regionClass(props, 'prefix', 'miu-input__prefix')"
      :style="regionStyle(props, 'prefix')"
    >
      <slot name="prefix" />
    </span>
    <input
      ref="inputRef"
      v-model="model"
      :id="field.id.value"
      :type="effectiveType"
      :name="name"
      :placeholder="placeholder"
      :disabled="field.disabled.value"
      :readonly="field.readonly.value"
      :maxlength="maxlength"
      :minlength="minlength"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :autofocus="autofocus"
      :aria-label="ariaLabel"
      :aria-describedby="field.describedBy.value"
      :aria-invalid="field.invalid.value || undefined"
      :aria-required="field.required.value || undefined"
      :aria-readonly="field.readonly.value || undefined"
      :class="regionClass(props, 'input', 'miu-input__control')"
      :style="regionStyle(props, 'input')"
      @keydown.enter="onEnter"
      @compositionstart="isComposing = true"
      @compositionend="isComposing = false"
      @focus="onFocus"
      @blur="onBlur"
    />
    <span
      v-if="
        $slots.suffix ||
        showCount ||
        (passwordToggle && type === 'password' && !field.disabled.value) ||
        (clearable && model.length > 0 && !field.disabled.value && !field.readonly.value)
      "
      :class="regionClass(props, 'suffix', 'miu-input__suffix')"
      :style="regionStyle(props, 'suffix')"
    >
      <slot name="suffix" />
      <span
        v-if="showCount"
        :class="regionClass(props, 'count', 'miu-input__count')"
        :style="regionStyle(props, 'count')"
      >
        {{ maxlength ? `${model.length} / ${maxlength}` : model.length }}
      </span>
      <button
        v-if="passwordToggle && type === 'password' && !field.disabled.value"
        type="button"
        :class="regionClass(props, 'toggle', 'miu-input__toggle')"
        :style="regionStyle(props, 'toggle')"
        :aria-label="passwordRevealed ? t('input.hidePassword') : t('input.showPassword')"
        :aria-pressed="passwordRevealed"
        @click="togglePassword"
        @focus="onFocus"
        @blur="onBlur"
      >
        <Icon :name="passwordRevealed ? 'eyeOff' : 'eye'" size="sm" />
      </button>
      <button
        v-if="clearable && model.length > 0 && !field.disabled.value && !field.readonly.value"
        type="button"
        :class="regionClass(props, 'clear', 'miu-input__clear')"
        :style="regionStyle(props, 'clear')"
        :aria-label="t('input.clear')"
        @click="clear"
        @focus="onFocus"
        @blur="onBlur"
      >
        <Icon name="close" size="sm" />
      </button>
    </span>
  </div>
</template>
