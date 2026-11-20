<script setup lang="ts">
import { computed, ref, useAttrs } from "vue"
import type { ControlSize } from "@xcmm1543/miuui-core"
import type { IconButtonProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import Button from "./Button.vue"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<IconButtonProps>(), {
  variant: "ghost",
  active: false,
  loading: false,
  disabled: false,
  block: false,
  type: "button",
})

defineEmits<{ click: [event: MouseEvent] }>()

const attrs = useAttrs()
const buttonCompRef = ref<InstanceType<typeof Button>>()

const { resolvedSize } = useControlSize({
  size: () => (typeof props.size === "number" ? "md" : props.size),
  componentName: "IconButton",
})

const resolvedRadius = computed(() => props.radius ?? "full")
const semanticButtonSize = computed<ControlSize | undefined>(() =>
  typeof props.size === "number" ? undefined : resolvedSize.value.size,
)
const customRootStyle = computed<string | Record<string, string> | undefined>(() => {
  if (typeof props.size !== "number") return props.styles?.root
  const dim = `${props.size}px`
  const base = props.styles?.root
  if (typeof base === "string") {
    return `${base};inline-size:${dim};block-size:${dim};min-inline-size:${dim};min-block-size:${dim};padding-inline:0`
  }
  return {
    inlineSize: dim,
    blockSize: dim,
    minInlineSize: dim,
    minBlockSize: dim,
    paddingInline: "0",
    ...base,
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

defineExpose({
  focus: () => buttonCompRef.value?.focus(),
  blur: () => buttonCompRef.value?.blur(),
  buttonRef: computed(() => buttonCompRef.value?.buttonRef),
})
</script>

<template>
  <Button
    ref="buttonCompRef"
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
