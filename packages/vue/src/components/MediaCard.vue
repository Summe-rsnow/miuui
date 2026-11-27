<script setup lang="ts">
import { computed, useId } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { MediaCardProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Image from "./Image.vue"
import Skeleton from "./Skeleton.vue"

const props = withDefaults(defineProps<MediaCardProps>(), {
  layout: "vertical",
  aspect: "square",
  lines: 2,
  radius: "lg",
  interactive: false,
  disabled: false,
  loading: false,
  actionPlacement: "bottom-end",
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "MediaCard")

const titleId = useId()
const effectiveRadius = computed(() => (props.aspect === "circle" ? "full" : props.radius))

const titleStyle = computed(() =>
  mergeStyle(regionStyle(props, "title"), {
    "--miu-media-card-lines": String(Math.max(1, props.lines)),
  }),
)

const isInteractive = computed(() => props.interactive && !props.disabled && !props.loading)
</script>

<template>
  <article
    :class="
      regionClass(
        props,
        'root',
        'miu-media-card',
        `miu-media-card--${layout}`,
        `miu-media-card--aspect-${aspect}`,
        {
          'miu-media-card--interactive': interactive && !loading,
          'miu-media-card--disabled': disabled,
          'miu-media-card--loading': loading,
        },
      )
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-layout="layout"
    :data-aspect="aspect"
    :data-miu-radius="radius"
    :data-density="density"
    :data-material="materialName"
    :data-disabled="disabled || undefined"
    :data-loading="loading || undefined"
    :aria-disabled="(interactive && (disabled || loading)) || undefined"
  >
    <button
      v-if="isInteractive"
      type="button"
      class="miu-media-card__trigger"
      :aria-label="ariaLabel ?? (title || undefined)"
      :aria-labelledby="!ariaLabel && !title && $slots.title ? titleId : undefined"
      @click="emit('click', $event)"
    />

    <div v-if="$slots.leading" class="miu-media-card__leading">
      <slot name="leading" />
    </div>

    <div
      :class="regionClass(props, 'media', 'miu-media-card__media')"
      :style="regionStyle(props, 'media')"
    >
      <Skeleton
        v-if="loading"
        :variant="aspect === 'circle' ? 'circle' : 'rect'"
        :radius="effectiveRadius"
        class="miu-media-card__skeleton-cover"
      />
      <template v-else>
        <div
          :class="regionClass(props, 'cover', 'miu-media-card__cover')"
          :style="regionStyle(props, 'cover')"
        >
          <slot name="cover">
            <Image
              v-if="cover"
              :src="cover"
              :alt="alt ?? title ?? ''"
              fit="cover"
              class="miu-media-card__img"
            />
          </slot>
        </div>

        <div
          v-if="$slots['top-start']"
          class="miu-media-card__corner miu-media-card__corner--top-start"
        >
          <slot name="top-start" />
        </div>
        <div
          v-if="$slots['top-end']"
          class="miu-media-card__corner miu-media-card__corner--top-end"
        >
          <slot name="top-end" />
        </div>
        <div
          v-if="$slots['bottom-start']"
          class="miu-media-card__corner miu-media-card__corner--bottom-start"
        >
          <slot name="bottom-start" />
        </div>
        <div
          v-if="$slots['bottom-end']"
          class="miu-media-card__corner miu-media-card__corner--bottom-end"
        >
          <slot name="bottom-end" />
        </div>
        <div
          v-if="$slots.action"
          :class="
            regionClass(
              props,
              'action',
              'miu-media-card__action',
              `miu-media-card__action--${actionPlacement}`,
            )
          "
          :style="regionStyle(props, 'action')"
        >
          <slot name="action" />
        </div>
      </template>
    </div>

    <div
      :class="regionClass(props, 'body', 'miu-media-card__body')"
      :style="regionStyle(props, 'body')"
    >
      <template v-if="loading">
        <Skeleton variant="text" class="miu-media-card__skeleton-title" />
        <Skeleton variant="text" class="miu-media-card__skeleton-subtitle" />
      </template>
      <template v-else>
        <div
          v-if="$slots.title || title"
          :id="titleId"
          :class="regionClass(props, 'title', 'miu-media-card__title')"
          :style="titleStyle"
        >
          <slot name="title">{{ title }}</slot>
        </div>
        <div
          v-if="$slots.subtitle || subtitle"
          :class="regionClass(props, 'subtitle', 'miu-media-card__subtitle')"
          :style="regionStyle(props, 'subtitle')"
        >
          <slot name="subtitle">{{ subtitle }}</slot>
        </div>
        <div
          v-if="$slots.meta"
          :class="regionClass(props, 'meta', 'miu-media-card__meta')"
          :style="regionStyle(props, 'meta')"
        >
          <slot name="meta" />
        </div>
        <slot />
      </template>
    </div>

    <div v-if="$slots.trailing && !loading" class="miu-media-card__trailing">
      <slot name="trailing" />
    </div>
  </article>
</template>
