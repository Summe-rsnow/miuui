<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { CONTROL_SIZES, regionClass, regionStyle, resolveControlSize } from "@xcmm1543/miuui-core"
import type { AvatarProps } from "../types"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<AvatarProps>(), {
  size: "md",
  radius: "full",
  shape: "circle",
  bordered: false,
  clickable: false,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const failed = ref(false)
const semanticSize = computed(() => (typeof props.size === "number" ? "md" : props.size))
const resolvedSize = computed(() => resolveControlSize(semanticSize.value, CONTROL_SIZES))
const resolvedRadius = computed(() => {
  if (props.shape === "circle") return "full"
  if (props.shape === "squircle") {
    if (props.radius !== "full") return props.radius
    if (typeof props.size === "number") return "lg"
    if (props.size === "xs" || props.size === "sm") return "sm"
    if (props.size === "md" || props.size === "lg") return "md"
    return "lg"
  }
  return props.radius === "full" ? "md" : props.radius
})
const rootStyle = computed(() => {
  const base = regionStyle(props, "root")
  if (typeof props.size !== "number") return base
  const dim = `${props.size}px`
  if (typeof base === "string") {
    return `${base};inline-size:${dim};block-size:${dim}`
  }
  return {
    ...base,
    inlineSize: dim,
    blockSize: dim,
  }
})
const fallbackIconSize = computed(() =>
  typeof props.size === "number" ? Math.round(props.size * 0.5) : undefined,
)
if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] Avatar: unsupported size "${props.size}", fell back to "${resolvedSize.value.size}".`,
  )
}
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
        },
      )
    "
    :style="rootStyle"
    :data-miu-size="typeof size === 'number' ? undefined : resolvedSize.size"
    :data-miu-radius="resolvedRadius"
    :data-shape="shape"
    :role="clickable ? 'button' : 'img'"
    :tabindex="clickable ? 0 : undefined"
    :aria-label="alt"
    @click="clickable && emit('click', $event)"
    @keydown.enter="clickable && ($event.currentTarget as HTMLElement | null)?.click()"
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
