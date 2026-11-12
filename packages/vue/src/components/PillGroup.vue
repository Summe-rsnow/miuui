<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle, resolveControlSize } from "@miuui/core"
import type { PillGroupOption, PillGroupProps } from "../types"
import { useMiuSizeHint } from "../composables/useSizeHint"
import Pill from "./Pill.vue"

const props = withDefaults(defineProps<PillGroupProps>(), {
  options: () => [],
  multiple: false,
  showAllOption: false,
  allLabel: "全部",
  allValue: "all",
  radius: "full",
  variant: "filter",
  disabled: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: string | number | Array<string | number>]
  change: [value: string | number | Array<string | number>]
  "limit-reached": [max: number]
}>()

const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, ["sm", "md", "lg"], "md"))

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] PillGroup: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}

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
  if (props.disabled) return
  const next = props.multiple ? [] : props.allValue
  emit("update:modelValue", next)
  emit("change", next)
}

function selectOption(option: PillGroupOption): void {
  if (props.disabled || option.disabled) return
  if (!props.multiple) {
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
</script>

<template>
  <div
    role="group"
    :aria-label="ariaLabel"
    :class="regionClass(props, 'root', 'miu-pill-group')"
    :style="regionStyle(props, 'root')"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-disabled="disabled || undefined"
  >
    <Pill
      v-if="showAllOption"
      :label="allLabel"
      :active="isAllActive"
      :size="resolvedSize.size as 'sm' | 'md' | 'lg'"
      :radius="radius"
      :material="material"
      :variant="variant"
      :disabled="disabled"
      :class-names="{ root: classNames?.item }"
      :styles="{ root: styles?.item }"
      @click="selectAll"
    />
    <Pill
      v-for="option in normalizedOptions"
      :key="String(option.value)"
      :label="option.label"
      :icon="option.icon"
      :count="option.count"
      :active="isActive(option.value)"
      :size="resolvedSize.size as 'sm' | 'md' | 'lg'"
      :radius="radius"
      :material="material"
      :variant="variant"
      :disabled="disabled || option.disabled"
      :class-names="{ root: classNames?.item }"
      :styles="{ root: styles?.item }"
      @click="selectOption(option)"
    />
  </div>
</template>
