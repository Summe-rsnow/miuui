<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { HeroHeaderProps, HeroSkeletonAction, ImagePreviewOriginRect } from "../types"
import { captureOriginRect } from "../composables/useOriginRect"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Image from "./Image.vue"
import ImagePreview from "./ImagePreview.vue"
import Skeleton from "./Skeleton.vue"
import TruncateText from "./TruncateText.vue"

const props = withDefaults(defineProps<HeroHeaderProps>(), {
  overlay: true,
  previewable: false,
  loading: false,
  coverShape: "square",
  radius: "lg",
  showTag: true,
  showDesc: true,
  actionCount: 2,
  descriptionLines: 3,
})

const emit = defineEmits<{
  coverClick: []
}>()

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "HeroHeader")

const showPreview = ref(false)
const coverRef = ref<HTMLElement | null>(null)
const previewOriginRect = ref<ImagePreviewOriginRect | null>(null)

const canPreview = computed(() => !props.loading && props.previewable && Boolean(props.cover))
const escapedCover = computed(() => (props.cover ? props.cover.replace(/["\\]/g, "\\$&") : ""))
const backdropStyle = computed(() =>
  mergeStyle(regionStyle(props, "backdrop"), {
    backgroundImage: !props.loading && escapedCover.value ? `url("${escapedCover.value}")` : "none",
  }),
)

watch(canPreview, (enabled) => {
  if (!enabled) {
    showPreview.value = false
  }
})

const resolvedSkeletonActions = computed<HeroSkeletonAction[]>(() => {
  if (props.skeletonActions) return props.skeletonActions
  if (props.actionCount <= 0) return []
  return Array.from({ length: props.actionCount }, (_, idx) =>
    idx === 0 ? "primary-xl" : "secondary-xl",
  )
})

function onCoverClick(): void {
  if (props.loading) return
  emit("coverClick")
  if (canPreview.value) {
    previewOriginRect.value = captureOriginRect(coverRef.value)
    showPreview.value = true
  }
}
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-hero', {
        'miu-hero--loading': loading,
        'miu-hero--has-bottom': Boolean($slots.bottom),
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-radius="radius"
    :data-material="materialName"
  >
    <div
      :class="regionClass(props, 'backdrop', 'miu-hero__bg')"
      :style="backdropStyle"
    />
    <div
      v-if="overlay"
      :class="regionClass(props, 'overlay', 'miu-hero__overlay')"
      :style="regionStyle(props, 'overlay')"
    />

    <div
      :class="regionClass(props, 'container', 'miu-hero__container')"
      :style="regionStyle(props, 'container')"
    >
      <div class="miu-hero__content">
        <div
          ref="coverRef"
          :class="
            regionClass(props, 'cover', 'miu-hero__cover', {
              'miu-hero__cover--circle': coverShape === 'circle',
              'miu-hero__cover--preview': canPreview,
              'miu-hero__cover--loading': loading,
            })
          "
          :style="regionStyle(props, 'cover')"
          :role="canPreview ? 'button' : undefined"
          :tabindex="canPreview ? 0 : undefined"
          :aria-label="canPreview ? title || 'Preview' : undefined"
          @click="onCoverClick"
          @keydown.enter.prevent="canPreview && onCoverClick()"
          @keydown.space.prevent="canPreview && onCoverClick()"
        >
          <Skeleton
            v-if="loading"
            :variant="coverShape === 'circle' ? 'circle' : 'rect'"
            class="miu-hero__shimmer-cover"
          />
          <slot v-else name="cover">
            <Image
              v-if="cover"
              :src="cover"
              :alt="title || ''"
              fit="cover"
              class="miu-hero__cover-img"
            />
          </slot>
        </div>

        <div
          :class="
            regionClass(props, 'info', 'miu-hero__info', {
              'miu-hero__info--loading': loading,
            })
          "
          :style="regionStyle(props, 'info')"
        >
          <template v-if="loading">
            <Skeleton v-if="showTag" class="miu-hero__shimmer-bar miu-hero__shimmer-bar--tag" />
            <Skeleton class="miu-hero__shimmer-bar miu-hero__shimmer-bar--title" />
            <template v-if="showDesc">
              <Skeleton class="miu-hero__shimmer-bar miu-hero__shimmer-bar--desc" />
              <Skeleton class="miu-hero__shimmer-bar miu-hero__shimmer-bar--desc-short" />
            </template>
            <Skeleton class="miu-hero__shimmer-bar miu-hero__shimmer-bar--meta" />
            <div
              v-if="$slots['actions-skeleton'] || resolvedSkeletonActions.length > 0"
              class="miu-hero__actions miu-hero__actions--loading"
            >
              <slot name="actions-skeleton">
                <Skeleton
                  v-for="(actionType, idx) in resolvedSkeletonActions"
                  :key="idx"
                  radius="full"
                  class="miu-hero__shimmer-btn"
                  :class="`miu-hero__shimmer-btn--${actionType}`"
                />
              </slot>
            </div>
          </template>

          <template v-else>
            <span
              v-if="tag"
              :class="regionClass(props, 'tag', 'miu-hero__tag')"
              :style="regionStyle(props, 'tag')"
            >
              {{ tag }}
            </span>
            <div
              v-if="$slots.title || title"
              :class="regionClass(props, 'title', 'miu-hero__title-wrap')"
              :style="regionStyle(props, 'title')"
            >
              <slot name="title">
                <h1 class="miu-hero__title">{{ title }}</h1>
              </slot>
            </div>
            <TruncateText
              v-if="description"
              :text="description"
              :lines="descriptionLines"
              expand-mode="popover"
              as="div"
              :class="regionClass(props, 'description', 'miu-hero__desc')"
              :style="regionStyle(props, 'description')"
            />
            <div
              v-if="$slots.meta"
              :class="regionClass(props, 'meta', 'miu-hero__meta')"
              :style="regionStyle(props, 'meta')"
            >
              <slot name="meta" />
            </div>
            <div
              v-if="$slots.actions"
              :class="regionClass(props, 'actions', 'miu-hero__actions')"
              :style="regionStyle(props, 'actions')"
            >
              <slot name="actions" />
            </div>
          </template>
        </div>
      </div>

      <div
        v-if="$slots.bottom"
        :class="regionClass(props, 'bottom', 'miu-hero__bottom')"
        :style="regionStyle(props, 'bottom')"
      >
        <slot name="bottom" />
      </div>
    </div>

    <ImagePreview
      v-if="canPreview"
      v-model:open="showPreview"
      :src="cover"
      :alt="title"
      :origin-rect="previewOriginRect"
    >
      <template v-if="$slots['preview-actions']" #actions="slotProps">
        <slot name="preview-actions" v-bind="slotProps" />
      </template>
    </ImagePreview>
  </div>
</template>
