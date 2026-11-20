<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { BadgeProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: "neutral",
  radius: "sm",
  dot: false,
  pulse: false,
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Badge")
const { resolvedSize } = useControlSize({
  size: () => props.size,
  supported: ["xs", "sm", "md", "lg"],
  defaultSize: "md",
  componentName: "Badge",
})
const resolvedIconSize = computed(
  () =>
    props.iconSize ??
    (resolvedSize.value.size === "xs" ? "xs" : resolvedSize.value.size === "lg" ? "md" : "sm"),
)
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
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-icon-size="resolvedIconSize"
    :data-miu-radius="radius"
    :data-material="materialName"
  >
    <span
      v-if="dot || pulse"
      :class="['miu-badge__dot', { 'miu-badge__dot--pulse': pulse }]"
      aria-hidden="true"
    />
    <span
      v-else-if="icon || $slots.icon"
      :class="regionClass(props, 'icon', 'miu-badge__icon')"
      :style="regionStyle(props, 'icon')"
    >
      <slot name="icon">
        <Icon v-if="icon" :name="icon" />
      </slot>
    </span>
    <span
      v-if="$slots.default"
      :class="regionClass(props, 'label', 'miu-badge__label')"
      :style="regionStyle(props, 'label')"
    >
      <slot />
    </span>
  </span>
</template>
