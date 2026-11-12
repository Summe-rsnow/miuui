<script setup lang="ts">
import { computed } from "vue"
import { ToggleGroupItem, ToggleGroupRoot } from "reka-ui"
import {
  CONTROL_SIZES,
  regionClass,
  regionStyle,
  resolveControlSize,
  resolveIconSize,
} from "@miuui/core"
import type { SegmentedControlProps } from "../types"
import Icon from "./Icon.vue"
import { useMiuSizeHint } from "../composables/useSizeHint"

const props = withDefaults(defineProps<SegmentedControlProps>(), {
  radius: "default",
  disabled: false,
})

const emit = defineEmits<{ "update:modelValue": [value: string] }>()

const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, CONTROL_SIZES))
const resolvedIconSize = computed(() => resolveIconSize(resolvedSize.value.size, props.iconSize))

function onUpdate(value: unknown): void {
  if (typeof value === "string") emit("update:modelValue", value)
}
</script>

<template>
  <ToggleGroupRoot
    type="single"
    :model-value="modelValue"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :class="regionClass(props, 'root', 'miu-segmented', `miu-segmented--${resolvedSize.size}`)"
    :style="regionStyle(props, 'root')"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="material"
    @update:model-value="onUpdate"
  >
    <ToggleGroupItem
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :disabled="option.disabled"
      :class="regionClass(props, 'item', 'miu-segmented__item')"
      :style="regionStyle(props, 'item')"
    >
      <Icon v-if="option.icon" :name="option.icon" />
      <span>{{ option.label }}</span>
    </ToggleGroupItem>
  </ToggleGroupRoot>
</template>
