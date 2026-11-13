<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import { STATUS_SEEDS, VIOLET_SEED } from "@miuui/tokens"
import type { ColorPickerPreset, ColorPickerProps } from "../types"
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
  size: "md",
  radius: "default",
  disabled: false,
})

const emit = defineEmits<{ "update:modelValue": [value: string] }>()

const { t } = useMiuI18n()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "ColorPicker")
const draft = ref(props.modelValue || VIOLET_SEED)

watch(
  () => props.modelValue,
  (next) => {
    if (next) draft.value = next
  },
)

const resolvedPresets = computed<ColorPickerPreset[]>(() => {
  const source = props.presets && props.presets.length > 0 ? props.presets : DEFAULT_PRESETS
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

function updateColor(next: string): void {
  if (props.disabled) return
  draft.value = next
  emit("update:modelValue", next)
}

function onNativeInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  updateColor(value)
}

function onHexInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  draft.value = value
  if (/^#[0-9a-fA-F]{6}$/.test(value.trim())) {
    emit("update:modelValue", value.trim())
  }
}

function isSelected(hex: string): boolean {
  return draft.value.trim().toLowerCase() === hex.trim().toLowerCase()
}
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-color-picker', `miu-color-picker--${size}`, {
        'miu-color-picker--disabled': disabled,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="size"
    :data-miu-radius="radius"
    :data-material="materialName"
    :data-disabled="disabled || undefined"
    role="group"
    :aria-label="ariaLabel ?? t('common.select')"
  >
    <div class="miu-color-picker__controls">
      <input
        type="color"
        :value="/^#[0-9a-fA-F]{6}$/.test(draft) ? draft : VIOLET_SEED"
        :disabled="disabled"
        :aria-label="ariaLabel ?? t('common.select')"
        :class="regionClass(props, 'swatch', 'miu-color-picker__swatch')"
        :style="regionStyle(props, 'swatch')"
        @input="onNativeInput"
      />
      <input
        type="text"
        :value="draft"
        :disabled="disabled"
        spellcheck="false"
        :aria-label="ariaLabel ?? 'Hex'"
        :class="regionClass(props, 'input', 'miu-color-picker__input')"
        :style="regionStyle(props, 'input')"
        @input="onHexInput"
      />
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
        :disabled="disabled"
        :aria-label="preset.label ?? preset.hex"
        :aria-pressed="isSelected(preset.hex)"
        :class="
          regionClass(props, 'preset', 'miu-color-picker__preset', {
            'miu-color-picker__preset--active': isSelected(preset.hex),
          })
        "
        :style="mergeStyle(regionStyle(props, 'preset'), { backgroundColor: preset.hex })"
        @click="updateColor(preset.hex)"
      >
        <Icon v-if="isSelected(preset.hex)" name="check" size="xs" />
      </button>
    </div>
  </div>
</template>
