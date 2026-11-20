<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import { STATUS_SEEDS, VIOLET_SEED } from "@xcmm1543/miuui-tokens"
import type { ColorPickerPreset, ColorPickerProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useFormFieldBinding } from "../composables/useFormField"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import { useMiuI18n } from "../composables/useMiu"
import Icon from "./Icon.vue"

const DEFAULT_PRESETS: ColorPickerPreset[] = [
  { key: "violet", label: "Violet", hex: VIOLET_SEED },
  { key: "blue", label: "Blue", hex: STATUS_SEEDS.info },
  { key: "green", label: "Green", hex: STATUS_SEEDS.success },
  { key: "amber", label: "Amber", hex: STATUS_SEEDS.warning },
  { key: "red", label: "Red", hex: STATUS_SEEDS.danger },
]

const props = withDefaults(defineProps<ColorPickerProps>(), {
  modelValue: VIOLET_SEED,
  radius: "default",
  disabled: false,
  readonly: false,
  invalid: false,
  clearable: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  change: [value: string]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const { t } = useMiuI18n()
const rootRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  supported: ["sm", "md", "lg"],
  defaultSize: "md",
  iconSize: () => props.iconSize,
  componentName: "ColorPicker",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "ColorPicker")
const field = useFormFieldBinding({
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  invalid: () => props.invalid,
})

const draft = ref(props.modelValue ?? "")

watch(
  () => props.modelValue,
  (next) => {
    draft.value = next ?? ""
  },
)

const resolvedPresets = computed<ColorPickerPreset[]>(() => {
  const source = props.presets !== undefined ? props.presets : DEFAULT_PRESETS
  return source.map((entry, idx) =>
    typeof entry === "string"
      ? { key: `${idx}-${entry}`, label: entry, hex: entry }
      : {
          key: entry.key ?? `${idx}-${entry.hex}`,
          label: entry.label ?? entry.hex,
          hex: entry.hex,
        },
  )
})

const canClear = computed(
  () => props.clearable && draft.value.length > 0 && !field.disabled.value && !field.readonly.value,
)

function clear(): void {
  if (field.disabled.value || field.readonly.value) return
  updateColor("")
  emit("clear")
  focus()
}

function updateColor(next: string): void {
  if (field.disabled.value || field.readonly.value) return
  draft.value = next
  emit("update:modelValue", next)
  emit("change", next)
}

function onNativeInput(event: Event): void {
  if (field.disabled.value || field.readonly.value) return
  const value = (event.target as HTMLInputElement).value
  updateColor(value)
}

function onHexInput(event: Event): void {
  if (field.disabled.value || field.readonly.value) return
  const value = (event.target as HTMLInputElement).value
  draft.value = value
  const trimmed = value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    emit("update:modelValue", trimmed)
    emit("change", trimmed)
  }
}

function isSelected(hex: string): boolean {
  return draft.value.trim().toLowerCase() === hex.trim().toLowerCase()
}

function onSwatchClick(event: MouseEvent): void {
  if (field.readonly.value) event.preventDefault()
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
      regionClass(props, 'root', 'miu-color-picker', `miu-color-picker--${resolvedSize.size}`, {
        'miu-color-picker--disabled': field.disabled.value,
        'miu-color-picker--readonly': field.readonly.value,
        'miu-color-picker--invalid': field.invalid.value,
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
    role="group"
    :aria-label="ariaLabel || field.labelId?.value ? (ariaLabel ?? undefined) : t('common.select')"
    :aria-labelledby="ariaLabel ? undefined : field.labelId?.value"
  >
    <div class="miu-color-picker__controls">
      <input
        type="color"
        :value="/^#[0-9a-fA-F]{6}$/.test(draft) ? draft : VIOLET_SEED"
        :disabled="field.disabled.value"
        :aria-label="ariaLabel ?? t('common.select')"
        :aria-readonly="field.readonly.value || undefined"
        :class="regionClass(props, 'swatch', 'miu-color-picker__swatch')"
        :style="regionStyle(props, 'swatch')"
        @click="onSwatchClick"
        @input="onNativeInput"
        @focus="onFocus"
        @blur="onBlur"
      />
      <input
        ref="inputRef"
        :id="field.id.value"
        type="text"
        :value="draft"
        :disabled="field.disabled.value"
        :readonly="field.readonly.value"
        spellcheck="false"
        :aria-label="ariaLabel ?? 'Hex'"
        :aria-describedby="field.describedBy.value"
        :aria-invalid="field.invalid.value || undefined"
        :aria-required="field.required.value || undefined"
        :aria-readonly="field.readonly.value || undefined"
        :class="regionClass(props, 'input', 'miu-color-picker__input')"
        :style="regionStyle(props, 'input')"
        @input="onHexInput"
        @focus="onFocus"
        @blur="onBlur"
      />
      <button
        v-if="canClear"
        type="button"
        :class="regionClass(props, 'clear', 'miu-color-picker__clear')"
        :style="regionStyle(props, 'clear')"
        :aria-label="t('input.clear')"
        @click="clear"
        @focus="onFocus"
        @blur="onBlur"
      >
        <Icon name="close" :size="resolvedIconSize.size" />
      </button>
    </div>
    <div
      v-if="resolvedPresets.length > 0"
      :class="regionClass(props, 'presets', 'miu-color-picker__presets')"
      :style="regionStyle(props, 'presets')"
    >
      <button
        v-for="preset in resolvedPresets"
        :key="preset.key"
        type="button"
        :disabled="field.disabled.value"
        :aria-disabled="field.readonly.value || undefined"
        :aria-label="preset.label ?? preset.hex"
        :aria-pressed="isSelected(preset.hex)"
        :class="
          regionClass(props, 'preset', 'miu-color-picker__preset', {
            'miu-color-picker__preset--active': isSelected(preset.hex),
          })
        "
        :style="mergeStyle(regionStyle(props, 'preset'), { backgroundColor: preset.hex })"
        @click="updateColor(preset.hex)"
        @focus="onFocus"
        @blur="onBlur"
      >
        <Icon v-if="isSelected(preset.hex)" name="check" :size="resolvedIconSize.size" />
      </button>
    </div>
  </div>
</template>
