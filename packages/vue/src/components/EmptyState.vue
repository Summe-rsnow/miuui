<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import type { EmptyStateProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<EmptyStateProps>(), {
  iconSize: "xl",
})
const { t } = useMiuI18n()
const title = computed(() => props.title ?? t("emptyState.title"))
</script>

<template>
  <div
    :class="regionClass(props, 'root', 'miu-empty-state')"
    :style="regionStyle(props, 'root')"
    :data-miu-icon-size="iconSize"
    :data-density="density"
  >
    <div
      v-if="icon"
      :class="regionClass(props, 'icon', 'miu-empty-state__icon')"
      :style="regionStyle(props, 'icon')"
    >
      <Icon :name="icon" />
    </div>
    <slot name="icon" />
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
