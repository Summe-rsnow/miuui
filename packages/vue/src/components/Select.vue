<script setup lang="ts">
import { computed, useId } from "vue"
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "reka-ui"
import {
  CONTROL_SIZES,
  regionClass,
  regionStyle,
  resolveControlSize,
  resolveIconSize,
} from "@xcmm1543/miuui-core"
import type { SelectProps } from "../types"
import { useMiuFormField } from "../composables/useFormField"
import { useMiuSizeHint } from "../composables/useSizeHint"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<SelectProps>(), {
  options: () => [],
  radius: "default",
  disabled: false,
  invalid: false,
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Select")

const emit = defineEmits<{ "update:modelValue": [value: string | number] }>()

const autoId = useId()
const formField = useMiuFormField()
const theme = useMiuTheme()
const { t } = useMiuI18n()

const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, CONTROL_SIZES))
const resolvedIconSize = computed(() => resolveIconSize(resolvedSize.value.size, props.iconSize))
const selectId = computed(() => props.id ?? formField?.id.value ?? autoId)
const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
)
const describedBy = computed(() => formField?.describedBy.value)
const disabled = computed(() => props.disabled || formField?.disabled.value || false)
const required = computed(() => formField?.required.value || false)

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] Select: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}

function onUpdate(value: unknown): void {
  if (typeof value === "string" || typeof value === "number") {
    emit("update:modelValue", value)
  }
}
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-select', `miu-select--${resolvedSize.size}`, {
        'miu-select--disabled': disabled,
        'miu-select--invalid': invalid,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="materialName"
    :data-invalid="invalid || undefined"
    :data-disabled="disabled || undefined"
  >
    <SelectRoot
      :model-value="modelValue"
      :name="name"
      :disabled="disabled"
      @update:model-value="onUpdate"
    >
      <SelectTrigger
        :id="selectId"
        :aria-label="ariaLabel"
        :aria-describedby="describedBy"
        :aria-invalid="invalid || undefined"
        :aria-required="required || undefined"
        :class="regionClass(props, 'trigger', 'miu-select__trigger')"
        :style="regionStyle(props, 'trigger')"
      >
        <SelectValue :placeholder="placeholder ?? t('select.placeholder')">
          {{ selectedOption?.label ?? placeholder ?? t("select.placeholder") }}
        </SelectValue>
        <SelectIcon class="miu-select__chevron">
          <Icon name="chevron" />
        </SelectIcon>
      </SelectTrigger>

      <SelectPortal :to="theme.portalTarget.value">
        <SelectContent
          position="popper"
          :side-offset="4"
          :class="regionClass(props, 'content', 'miu-select__content')"
          :style="mergeStyle(regionStyle(props, 'content'), materialTokens)"
          :data-material="materialName"
          :data-miu-radius="radius"
        >
          <SelectViewport class="miu-select__viewport">
            <SelectItem
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              :disabled="option.disabled"
              :class="regionClass(props, 'item', 'miu-select__item')"
              :style="regionStyle(props, 'item')"
            >
              <span class="miu-select__item-icon">
                <Icon v-if="option.icon" :name="option.icon" size="sm" />
              </span>
              <SelectItemText>{{ option.label }}</SelectItemText>
              <SelectItemIndicator class="miu-select__indicator">
                <Icon name="check" size="sm" />
              </SelectItemIndicator>
            </SelectItem>
            <div
              v-if="options.length === 0"
              :class="regionClass(props, 'empty', 'miu-select__empty')"
              :style="regionStyle(props, 'empty')"
            >
              {{ t("select.noOptions") }}
            </div>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>
