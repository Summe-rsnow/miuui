<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { EmptyStateProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<EmptyStateProps>(), {
  iconSize: "xl",
  radius: "default",
})
const { t } = useMiuI18n()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "EmptyState")
const title = computed(() => props.title ?? t("emptyState.title"))
</script>

<template>
  <div
    :class="regionClass(props, 'root', 'miu-empty-state')"
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-icon-size="iconSize"
    :data-miu-radius="radius"
    :data-density="density"
    :data-material="materialName"
  >
    <div
      v-if="icon || $slots.icon"
      :class="regionClass(props, 'icon', 'miu-empty-state__icon')"
      :style="regionStyle(props, 'icon')"
    >
      <slot name="icon">
        <Icon v-if="icon" :name="icon" :size="iconSize" />
      </slot>
    </div>
    <p
      :class="regionClass(props, 'title', 'miu-empty-state__title')"
      :style="regionStyle(props, 'title')"
    >
      <slot name="title">{{ title }}</slot>
    </p>
    <p
      v-if="description || $slots.description"
      :class="regionClass(props, 'description', 'miu-empty-state__description')"
      :style="regionStyle(props, 'description')"
    >
      <slot name="description">{{ description }}</slot>
    </p>
    <div
      v-if="$slots.actions"
      :class="regionClass(props, 'actions', 'miu-empty-state__actions')"
      :style="regionStyle(props, 'actions')"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
