<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { CONTROL_SIZES, regionClass, regionStyle, resolveControlSize } from "@miuui/core"
import type { AvatarProps } from "../types"

const props = withDefaults(defineProps<AvatarProps>(), {
  size: "md",
  radius: "full",
  shape: "circle",
})

const failed = ref(false)
const resolvedSize = computed(() => resolveControlSize(props.size, CONTROL_SIZES))
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
      )
    "
    :style="regionStyle(props, 'root')"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-shape="shape"
    role="img"
    :aria-label="alt"
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
      <slot name="fallback">{{ fallbackText }}</slot>
    </span>
  </span>
</template>
