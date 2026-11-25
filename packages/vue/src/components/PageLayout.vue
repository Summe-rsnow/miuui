<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { PageLayoutProps } from "../types"
import { mergeStyle } from "../composables/usePluginResolution"
import PageHeader from "./PageHeader.vue"

const props = withDefaults(defineProps<PageLayoutProps>(), {
  back: false,
  divider: false,
  contentAlign: "start",
  fitHeight: false,
  fill: false,
})

const emit = defineEmits<{ back: [event: MouseEvent] }>()

const PRESET_WIDTHS = new Set(["sm", "md", "lg", "xl"])
const contentStyle = computed(() => {
  const base = regionStyle(props, "content")
  if (!props.contentMaxWidth || PRESET_WIDTHS.has(props.contentMaxWidth)) {
    return base
  }
  return mergeStyle(base, { maxInlineSize: props.contentMaxWidth })
})
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-page-layout', {
        'miu-page-layout--fit-height': fitHeight,
        'miu-page-layout--fill': fill,
      })
    "
    :style="regionStyle(props, 'root')"
    :data-density="density"
  >
    <PageHeader
      :title="title"
      :description="description"
      :back="back"
      :divider="divider"
      :density="density"
      :icon-size="iconSize"
      :class-names="{ root: regionClass(props, 'header', 'miu-page-layout__header') }"
      :styles="{ root: regionStyle(props, 'header') }"
      @back="emit('back', $event)"
    >
      <template v-if="$slots.lead" #lead>
        <slot name="lead" />
      </template>
      <template v-if="$slots.title" #title>
        <slot name="title" />
      </template>
      <template v-if="$slots.description" #description>
        <slot name="description" />
      </template>
      <template v-if="$slots.actions" #actions>
        <slot name="actions" />
      </template>
      <template v-if="$slots.badge" #badge>
        <slot name="badge" />
      </template>
    </PageHeader>
    <div v-if="$slots['header-extra']" class="miu-page-layout__extra">
      <slot name="header-extra" />
    </div>
    <div
      :class="regionClass(props, 'content', 'miu-page-layout__content')"
      :style="contentStyle"
      :data-align="contentAlign"
      :data-width="
        contentMaxWidth && PRESET_WIDTHS.has(contentMaxWidth) ? contentMaxWidth : undefined
      "
    >
      <slot />
    </div>
  </div>
</template>
