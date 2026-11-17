<script setup lang="ts">
import { computed, useAttrs } from "vue"
import type { ControlSize } from "@xcmm1543/miuui-core"
import type { IconButtonProps } from "../types"
import Button from "./Button.vue"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<IconButtonProps>(), {
  variant: "ghost",
  shape: "circle",
  active: false,
  loading: false,
  disabled: false,
  block: false,
  type: "button",
})

defineEmits<{ click: [event: MouseEvent] }>()

const attrs = useAttrs()
const resolvedRadius = computed(() => {
  if (props.radius) return props.radius
  return props.shape === "circle" ? "full" : "default"
})
const semanticButtonSize = computed<ControlSize | undefined>(() =>
  typeof props.size === "number" ? undefined : props.size,
)
const customRootStyle = computed<string | Record<string, string> | undefined>(() => {
  if (typeof props.size !== "number") return props.styles?.root
  const dim = `${props.size}px`
  const base = props.styles?.root
  if (typeof base === "string") {
    return `${base};inline-size:${dim};block-size:${dim};min-inline-size:${dim};min-block-size:${dim};padding-inline:0`
  }
  return {
    ...base,
    inlineSize: dim,
    blockSize: dim,
    minInlineSize: dim,
    minBlockSize: dim,
    paddingInline: "0",
  }
})
const mergedStyles = computed(() => {
  if (typeof props.size !== "number") return props.styles
  return {
    ...props.styles,
    root: customRootStyle.value,
  }
})
const numericIconSize = computed(() =>
  typeof props.iconSize === "number" ? props.iconSize : undefined,
)
const resolvedAriaLabel = computed(() => {
  const external = attrs["aria-label"]
  return (
    props.label ??
    props.ariaLabel ??
    props["aria-label"] ??
    props.title ??
    (typeof external === "string" ? external : "")
  )
})
</script>

<template>
  <Button
    :variant="variant"
    :size="semanticButtonSize"
    :radius="resolvedRadius"
    :icon-size="iconSize"
    :material="material"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :type="type"
    :title="title ?? label"
    :aria-pressed="active || undefined"
    :data-active="active || undefined"
    :class-names="{
      ...classNames,
      root: ['miu-icon-button', active ? 'miu-icon-button--active' : '', classNames?.root ?? '']
        .filter(Boolean)
        .join(' '),
    }"
    :styles="mergedStyles"
    icon-only
    :aria-label="resolvedAriaLabel"
    @click="$emit('click', $event)"
  >
    <template #icon>
      <slot name="icon">
        <Icon v-if="icon" :name="icon" :size="numericIconSize" />
        <slot v-else />
      </slot>
    </template>
  </Button>
</template>
