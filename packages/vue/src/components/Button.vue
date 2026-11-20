<script setup lang="ts">
import { computed, ref, useAttrs } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ButtonProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"
import Spinner from "./Spinner.vue"

const props = defineProps<ButtonProps>()

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const attrs = useAttrs()
const buttonRef = ref<HTMLButtonElement>()

const variant = computed(() => props.variant ?? "solid")
const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  iconSize: () => props.iconSize,
  componentName: "Button",
})
const radius = computed(() => props.radius ?? "default")
const loading = computed(() => props.loading ?? false)
const disabled = computed(() => props.disabled ?? false)
const block = computed(() => props.block ?? false)
const iconOnly = computed(() => props.iconOnly ?? false)
const type = computed(() => props.type ?? "button")

const forwardedIconSize = computed(() =>
  typeof props.iconSize === "number" ? props.iconSize : undefined,
)
const spinnerSize = computed(() => resolvedIconSize.value.size)
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Button")
const accessibleLabel = computed(() => {
  const external = attrs["aria-label"]
  return (
    props.ariaLabel ?? props["aria-label"] ?? (typeof external === "string" ? external : undefined)
  )
})

if (import.meta.env.DEV && iconOnly.value && !accessibleLabel.value) {
  console.warn("[μui] Button: icon-only mode requires `aria-label` or `ariaLabel`.")
}

function onClick(event: MouseEvent): void {
  if (disabled.value || loading.value) {
    event.preventDefault()
    return
  }
  emit("click", event)
}

defineExpose({
  focus: () => buttonRef.value?.focus(),
  blur: () => buttonRef.value?.blur(),
  buttonRef,
})
</script>

<template>
  <button
    ref="buttonRef"
    :type="type"
    :class="
      regionClass(
        props,
        'root',
        'miu-button',
        `miu-button--${variant}`,
        `miu-button--${resolvedSize.size}`,
        {
          'miu-button--icon-only': iconOnly,
          'miu-button--block': block,
          'miu-button--loading': loading,
        },
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="materialName"
    :disabled="disabled || loading"
    :aria-label="accessibleLabel || undefined"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <Spinner
      v-if="loading"
      :size="spinnerSize"
      class="miu-button__spinner"
      :class="regionClass(props, 'spinner')"
      :style="regionStyle(props, 'spinner')"
    />
    <span
      v-else-if="icon || $slots.icon || (iconOnly && $slots.default)"
      :class="regionClass(props, 'icon', 'miu-button__icon')"
      :style="regionStyle(props, 'icon')"
    >
      <slot name="icon">
        <Icon v-if="icon" :name="icon" :size="forwardedIconSize" />
        <slot v-else-if="iconOnly" />
      </slot>
    </span>
    <span
      v-if="!iconOnly && $slots.default"
      :class="regionClass(props, 'label', 'miu-button__label')"
      :style="regionStyle(props, 'label')"
    >
      <slot />
    </span>
    <span
      v-if="!iconOnly && (iconRight || $slots['icon-right']) && !loading"
      :class="regionClass(props, 'icon', 'miu-button__icon', 'miu-button__icon--right')"
      :style="regionStyle(props, 'icon')"
    >
      <slot name="icon-right">
        <Icon v-if="iconRight" :name="iconRight" :size="forwardedIconSize" />
      </slot>
    </span>
  </button>
</template>
