<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from "vue"
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
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { SelectProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useFormFieldBinding } from "../composables/useFormField"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"
import Spinner from "./Spinner.vue"

const props = withDefaults(defineProps<SelectProps>(), {
  options: () => [],
  radius: "default",
  disabled: false,
  readonly: false,
  invalid: false,
  clearable: false,
  loading: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string | number | undefined]
  change: [value: string | number | undefined]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const rootRef = ref<HTMLElement>()
const triggerRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
const isOpen = ref(false)
const theme = useMiuTheme()
const { t } = useMiuI18n()

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  iconSize: () => props.iconSize,
  componentName: "Select",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Select")
const field = useFormFieldBinding({
  id: () => props.id,
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  invalid: () => props.invalid,
})

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
)
const hasValue = computed(
  () =>
    selectedOption.value !== undefined ||
    (props.modelValue !== undefined && props.modelValue !== ""),
)
const canClear = computed(
  () =>
    props.clearable &&
    hasValue.value &&
    !field.disabled.value &&
    !field.readonly.value &&
    !props.loading,
)

function onOpenChange(next: boolean): void {
  if (next && (field.disabled.value || field.readonly.value || props.loading)) {
    isOpen.value = false
    return
  }
  isOpen.value = next
}

function onUpdate(value: unknown): void {
  if (field.disabled.value || field.readonly.value || props.loading) return
  if (typeof value === "string" || typeof value === "number") {
    emit("update:modelValue", value)
    emit("change", value)
  }
}

function clear(): void {
  if (field.disabled.value || field.readonly.value || props.loading) return
  isOpen.value = false
  emit("update:modelValue", undefined)
  emit("change", undefined)
  emit("clear")
  focus()
}

function onTriggerBlockedInteraction(event: Event): void {
  if (field.readonly.value || props.loading) {
    event.preventDefault()
    event.stopPropagation()
  }
}

const OPEN_BLOCKED_KEYS = new Set(["Enter", " ", "ArrowDown", "ArrowUp"])

function onTriggerKeydownCapture(event: KeyboardEvent): void {
  if ((field.readonly.value || props.loading) && OPEN_BLOCKED_KEYS.has(event.key)) {
    event.preventDefault()
    event.stopPropagation()
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

function resolveTriggerElement(): HTMLElement | null {
  const node = triggerRef.value
  if (!node) return null
  if (node instanceof HTMLElement) return node
  return node.$el instanceof HTMLElement ? node.$el : null
}

function focus(): void {
  resolveTriggerElement()?.focus()
}

function blur(): void {
  resolveTriggerElement()?.blur()
}

defineExpose({ focus, blur, triggerRef })
</script>

<template>
  <div
    ref="rootRef"
    :class="
      regionClass(props, 'root', 'miu-select', `miu-select--${resolvedSize.size}`, {
        'miu-select--disabled': field.disabled.value,
        'miu-select--readonly': field.readonly.value,
        'miu-select--invalid': field.invalid.value,
        'miu-select--loading': loading,
        'miu-select--has-clear': canClear,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="materialName"
    :data-invalid="field.invalid.value || undefined"
    :data-disabled="field.disabled.value || undefined"
    :data-readonly="field.readonly.value || undefined"
    :data-loading="loading || undefined"
  >
    <SelectRoot
      :open="isOpen"
      :model-value="modelValue"
      :name="name"
      :disabled="field.disabled.value"
      :required="field.required.value"
      @update:open="onOpenChange"
      @update:model-value="onUpdate"
    >
      <SelectTrigger
        ref="triggerRef"
        :id="field.id.value"
        :aria-label="ariaLabel"
        :aria-describedby="field.describedBy.value"
        :aria-invalid="field.invalid.value || undefined"
        :aria-required="field.required.value || undefined"
        :aria-readonly="field.readonly.value || undefined"
        :aria-busy="loading || undefined"
        :data-placeholder="!selectedOption ? '' : undefined"
        :data-readonly="field.readonly.value || undefined"
        :class="regionClass(props, 'trigger', 'miu-select__trigger')"
        :style="regionStyle(props, 'trigger')"
        @click.capture="onTriggerBlockedInteraction"
        @pointerdown.capture="onTriggerBlockedInteraction"
        @keydown.capture="onTriggerKeydownCapture"
        @focus="onFocus"
        @blur="onBlur"
      >
        <slot
          name="trigger"
          :selected-option="selectedOption"
          :placeholder="placeholder ?? t('select.placeholder')"
        >
          <SelectValue :placeholder="placeholder ?? t('select.placeholder')">
            {{ selectedOption?.label ?? placeholder ?? t("select.placeholder") }}
          </SelectValue>
        </slot>
        <span class="miu-select__indicators">
          <Spinner v-if="loading" :size="resolvedIconSize.size" />
          <SelectIcon v-else class="miu-select__chevron">
            <Icon name="chevron" />
          </SelectIcon>
        </span>
      </SelectTrigger>

      <SelectPortal :to="theme.portalTarget.value">
        <SelectContent
          position="popper"
          :side-offset="4"
          :class="regionClass(props, 'content', 'miu-select__content')"
          :style="mergeStyle(regionStyle(props, 'content'), materialTokens)"
          :data-material="materialName"
          :data-miu-radius="radius"
          :data-miu-size="resolvedSize.size"
          :data-miu-icon-size="resolvedIconSize.size"
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
              <slot name="item" :option="option" :selected="option.value === modelValue">
                <span class="miu-select__item-icon">
                  <Icon v-if="option.icon" :name="option.icon" size="sm" />
                </span>
                <SelectItemText>{{ option.label }}</SelectItemText>
                <SelectItemIndicator class="miu-select__indicator">
                  <Icon name="check" size="sm" />
                </SelectItemIndicator>
              </slot>
            </SelectItem>
            <div
              v-if="options.length === 0"
              :class="regionClass(props, 'empty', 'miu-select__empty')"
              :style="regionStyle(props, 'empty')"
            >
              <slot name="empty">{{ t("select.noOptions") }}</slot>
            </div>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
    <button
      v-if="canClear"
      type="button"
      :class="regionClass(props, 'clear', 'miu-select__clear')"
      :style="regionStyle(props, 'clear')"
      :aria-label="t('common.clear')"
      @click.stop="clear"
      @focus="onFocus"
      @blur="onBlur"
    >
      <Icon name="close" size="sm" />
    </button>
  </div>
</template>
