<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle, resolveControlSize } from "@xcmm1543/miuui-core"
import type { BadgeProps } from "../types"
import Icon from "./Icon.vue"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import { useMiuSizeHint } from "../composables/useSizeHint"
const props = withDefaults(defineProps<BadgeProps>(), {
  variant: "neutral",
  radius: "sm",
  pill: false,
  dot: false,
  pulse: false,
})

const sizeHint = useMiuSizeHint()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Badge")
const size = computed(() => props.size ?? sizeHint.value ?? "md")
const resolvedSize = computed(() => resolveControlSize(size.value, ["xs", "sm", "md", "lg"], "md"))
const resolvedIconSize = computed(
  () =>
    props.iconSize ??
    (resolvedSize.value.size === "xs" ? "xs" : resolvedSize.value.size === "lg" ? "md" : "sm"),
)

if (import.meta.env.DEV && resolvedSize.value.fallback) {
  console.warn(
    `[μui] Badge: unsupported size "${size.value}", fell back to "${resolvedSize.value.size}".`,
  )
}
</script>

<template>
  <span
    :class="
      regionClass(
        props,
        'root',
        'miu-badge',
        `miu-badge--${variant}`,
        `miu-badge--${resolvedSize.size}`,
        {
          'miu-badge--pill': pill,
        },
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-icon-size="resolvedIconSize"
    :data-miu-radius="pill ? 'full' : radius"
    :data-material="materialName"
  >
    <span
      v-if="dot || pulse"
      :class="['miu-badge__dot', { 'miu-badge__dot--pulse': pulse }]"
      aria-hidden="true"
    />
    <Icon
      v-else-if="icon"
      :name="icon"
      :class="regionClass(props, 'icon', 'miu-badge__icon')"
      :style="regionStyle(props, 'icon')"
    />
    <span
      v-if="$slots.default"
      :class="regionClass(props, 'label', 'miu-badge__label')"
      :style="regionStyle(props, 'label')"
    >
      <slot />
    </span>
  </span>
</template>
