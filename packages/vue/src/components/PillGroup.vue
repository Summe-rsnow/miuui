<script setup lang="ts">
import { computed, ref } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { PillGroupOption, PillGroupProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useMiuI18n } from "../composables/useMiu"
import Pill from "./Pill.vue"

const props = withDefaults(defineProps<PillGroupProps>(), {
  options: () => [],
  multiple: false,
  showAllOption: false,
  allValue: "all",
  radius: "full",
  variant: "filter",
  clearable: false,
  disabled: false,
  readonly: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string | number | Array<string | number> | undefined]
  change: [value: string | number | Array<string | number> | undefined]
  clear: []
  "limit-reached": [max: number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const { t } = useMiuI18n()
const rootRef = ref<HTMLElement>()

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  supported: ["sm", "md", "lg"],
  defaultSize: "md",
  iconSize: () => props.iconSize,
  componentName: "PillGroup",
})

const allLabelText = computed(() => props.allLabel ?? t("pillGroup.all"))

const normalizedOptions = computed<PillGroupOption[]>(() =>
  props.options.map((entry) =>
    typeof entry === "object" ? entry : { value: entry, label: String(entry) },
  ),
)

const isAllActive = computed(() => {
  if (!props.showAllOption) return false
  if (Array.isArray(props.modelValue)) return props.modelValue.length === 0
  return props.modelValue === undefined || props.modelValue === props.allValue
})

function isActive(value: string | number): boolean {
  if (Array.isArray(props.modelValue)) return props.modelValue.includes(value)
  return props.modelValue === value
}

function selectAll(): void {
  if (props.disabled || props.readonly) return
  const next = props.multiple ? [] : props.allValue
  emit("update:modelValue", next)
  emit("change", next)
  if (props.multiple) emit("clear")
}

function selectOption(option: PillGroupOption): void {
  if (props.disabled || props.readonly || option.disabled) return
  if (!props.multiple) {
    if (props.clearable && props.modelValue === option.value) {
      emit("update:modelValue", undefined)
      emit("change", undefined)
      emit("clear")
      return
    }
    emit("update:modelValue", option.value)
    emit("change", option.value)
    return
  }

  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const index = current.indexOf(option.value)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    if (props.max !== undefined && current.length >= props.max) {
      emit("limit-reached", props.max)
      return
    }
    current.push(option.value)
  }
  emit("update:modelValue", current)
  emit("change", current)
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
  rootRef.value?.querySelector<HTMLElement>(".miu-pill__main:not(:disabled)")?.focus()
}

function blur(): void {
  const active = typeof document !== "undefined" ? document.activeElement : null
  if (active instanceof HTMLElement && rootRef.value?.contains(active)) {
    active.blur()
  }
}

defineExpose({ focus, blur, rootRef })
</script>

<template>
  <div
    ref="rootRef"
    role="group"
    :aria-label="ariaLabel"
    :aria-readonly="readonly || undefined"
    :class="
      regionClass(props, 'root', 'miu-pill-group', {
        'miu-pill-group--disabled': disabled,
        'miu-pill-group--readonly': readonly,
      })
    "
    :style="regionStyle(props, 'root')"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-disabled="disabled || undefined"
    :data-readonly="readonly || undefined"
  >
    <Pill
      v-if="showAllOption"
      :label="allLabelText"
      :active="isAllActive"
      :size="resolvedSize.size as 'sm' | 'md' | 'lg'"
      :icon-size="iconSize"
      :radius="radius"
      :material="material"
      :variant="variant"
      :disabled="disabled"
      :class-names="{ root: classNames?.item }"
      :styles="{ root: styles?.item }"
      @click="selectAll"
      @focus="onFocus"
      @blur="onBlur"
    />
    <Pill
      v-for="option in normalizedOptions"
      :key="String(option.value)"
      :label="option.label"
      :icon="option.icon"
      :count="option.count"
      :active="isActive(option.value)"
      :size="resolvedSize.size as 'sm' | 'md' | 'lg'"
      :icon-size="iconSize"
      :radius="radius"
      :material="material"
      :variant="variant"
      :disabled="disabled || option.disabled"
      :class-names="{ root: classNames?.item }"
      :styles="{ root: styles?.item }"
      @click="selectOption(option)"
      @focus="onFocus"
      @blur="onBlur"
    />
  </div>
</template>
