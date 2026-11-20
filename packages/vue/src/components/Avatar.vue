<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { AvatarProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { mergeStyle } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<AvatarProps>(), {
  radius: "full",
  shape: "circle",
  bordered: false,
  clickable: false,
  disabled: false,
})

const emit = defineEmits<{ click: [event: MouseEvent | KeyboardEvent] }>()

const failed = ref(false)
const { resolvedSize } = useControlSize({
  size: () => (typeof props.size === "number" ? "md" : props.size),
  componentName: "Avatar",
})
const isInteractive = computed(() => props.clickable && !props.disabled)
const resolvedRadius = computed(() => {
  if (props.shape === "circle") return "full"
  if (props.shape === "squircle") {
    if (props.radius !== "full") return props.radius
    if (typeof props.size === "number") return "lg"
    if (resolvedSize.value.size === "xs" || resolvedSize.value.size === "sm") return "sm"
    if (resolvedSize.value.size === "md" || resolvedSize.value.size === "lg") return "md"
    return "lg"
  }
  return props.radius === "full" ? "md" : props.radius
})
const rootStyle = computed(() => {
  const base = regionStyle(props, "root")
  if (typeof props.size !== "number") return base
  const dim = `${props.size}px`
  return mergeStyle(base, {
    inlineSize: dim,
    blockSize: dim,
  })
})
const fallbackIconSize = computed(() =>
  typeof props.size === "number" ? Math.round(props.size * 0.5) : undefined,
)
const fallbackText = computed(() => {
  if (props.fallback) return props.fallback
  return Array.from(props.alt)[0] ?? ""
})
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)

function onClick(event: MouseEvent): void {
  if (!isInteractive.value) {
    if (props.disabled) event.preventDefault()
    return
  }
  emit("click", event)
}

function onKeydown(event: KeyboardEvent): void {
  if (!isInteractive.value) return
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    emit("click", event)
  }
}
</script>

<template>
  <span
    :class="
      regionClass(
        props,
        'root',
        'miu-avatar',
        `miu-avatar--${resolvedSize.size}`,
        `miu-avatar--${shape}`,
        {
          'miu-avatar--bordered': bordered,
          'miu-avatar--clickable': clickable,
          'miu-avatar--disabled': disabled,
        },
      )
    "
    :style="rootStyle"
    :data-miu-size="typeof size === 'number' ? undefined : resolvedSize.size"
    :data-miu-radius="resolvedRadius"
    :data-shape="shape"
    :data-disabled="disabled || undefined"
    :role="clickable ? 'button' : 'img'"
    :tabindex="isInteractive ? 0 : undefined"
    :aria-disabled="clickable && disabled ? 'true' : undefined"
    :aria-label="alt"
    @click="onClick"
    @keydown="onKeydown"
  >
    <img
      v-if="src && !failed"
      :src="src"
      alt=""
      aria-hidden="true"
      :class="regionClass(props, 'image', 'miu-avatar__image')"
      :style="regionStyle(props, 'image')"
      @error="failed = true"
    />
    <span
      v-else
      :class="regionClass(props, 'fallback', 'miu-avatar__fallback')"
      :style="regionStyle(props, 'fallback')"
      aria-hidden="true"
    >
      <slot name="fallback">
        <Icon v-if="fallbackIcon" :name="fallbackIcon" :size="fallbackIconSize" />
        <template v-else>{{ fallbackText }}</template>
      </slot>
    </span>
  </span>
</template>
