<script setup lang="ts">
import { computed, ref, useAttrs } from "vue"
import {
  CONTROL_SIZES,
  regionClass,
  regionStyle,
  resolveControlSize,
  resolveIconSize,
} from "@miuui/core"
import type { ButtonProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import { useMiuSizeHint } from "../composables/useSizeHint"
import Icon from "./Icon.vue"
import Spinner from "./Spinner.vue"

const props = defineProps<ButtonProps>()

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const attrs = useAttrs()
const buttonRef = ref<HTMLButtonElement>()

const variant = computed(() => props.variant ?? "solid")
const sizeHint = useMiuSizeHint()
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const radius = computed(() => props.radius ?? "default")
const loading = computed(() => props.loading ?? false)
const disabled = computed(() => props.disabled ?? false)
const block = computed(() => props.block ?? false)
const iconOnly = computed(() => props.iconOnly ?? false)
const type = computed(() => props.type ?? "button")

const resolvedSize = computed(() => resolveControlSize(size.value, CONTROL_SIZES))
const resolvedIconSize = computed(() => resolveIconSize(resolvedSize.value.size, props.iconSize))
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Button")
const accessibleLabel = computed(() => {
  const external = attrs["aria-label"]
  return (
    props.ariaLabel ?? props["aria-label"] ?? (typeof external === "string" ? external : undefined)
  )
})

if (import.meta.env.DEV) {
  if (iconOnly.value && !accessibleLabel.value) {
    console.warn("[μui] Button: icon-only mode requires `aria-label` or `ariaLabel`.")
  }
  if (resolvedSize.value.fallback) {
    console.warn(
      `[μui] Button: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
    )
  }
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
    :aria-label="accessibleLabel"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <Spinner
      v-if="loading"
      :size="resolvedIconSize.size"
      class="miu-button__spinner"
      :class="regionClass(props, 'spinner')"
      :style="regionStyle(props, 'spinner')"
    />
    <span
      v-else-if="icon || $slots.icon"
      :class="regionClass(props, 'icon', 'miu-button__icon')"
      :style="regionStyle(props, 'icon')"
    >
      <slot name="icon">
        <Icon v-if="icon" :name="icon" />
      </slot>
    </span>
    <span
      v-if="!iconOnly && $slots.default"
      :class="regionClass(props, 'label', 'miu-button__label')"
      :style="regionStyle(props, 'label')"
    >
      <slot />
    </span>
  </button>
</template>
