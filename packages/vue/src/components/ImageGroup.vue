<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ImageGroupProps, ImagePreviewItem, ImagePreviewOriginRect } from "../types"
import { captureOriginRect } from "../composables/useOriginRect"
import { useMiuI18n } from "../composables/useMiu"
import Image from "./Image.vue"
import ImagePreview from "./ImagePreview.vue"

const props = withDefaults(defineProps<ImageGroupProps>(), {
  images: () => [],
  maxDisplay: 9,
  radius: "md",
})

const emit = defineEmits<{ error: [index: number, event: Event] }>()

const { t } = useMiuI18n()
const previewOpen = ref(false)
const previewIndex = ref(0)
const previewOriginRect = ref<ImagePreviewOriginRect | null>(null)
const failedIndices = ref(new Set<number>())

watch(
  () => props.images,
  () => {
    failedIndices.value = new Set()
  },
)

const normalizedImages = computed<ImagePreviewItem[]>(() =>
  props.images
    .map((entry, idx) => {
      if (typeof entry === "string") {
        const src = entry.trim()
        return { src, thumb: src, alt: `${idx + 1}` }
      }
      const src = (entry.src ?? entry.thumb ?? "").trim()
      const thumb = (entry.thumb ?? src).trim()
      return {
        src,
        thumb: thumb || src,
        alt: entry.alt ?? `${idx + 1}`,
      }
    })
    .filter((item) => item.src.length > 0),
)

const displayList = computed(() => normalizedImages.value.slice(0, props.maxDisplay))
const remainingCount = computed(() => Math.max(0, normalizedImages.value.length - props.maxDisplay))
const layoutType = computed<"single" | "quad" | "grid-3">(() => {
  const count = displayList.value.length
  if (count <= 1) return "single"
  if (count === 2 || count === 4) return "quad"
  return "grid-3"
})

function openPreview(index: number, event?: MouseEvent): void {
  previewIndex.value = index
  previewOriginRect.value = captureOriginRect(event?.currentTarget)
  previewOpen.value = true
}

function onImageError(index: number, event: Event): void {
  const next = new Set(failedIndices.value)
  next.add(index)
  failedIndices.value = next
  emit("error", index, event)
}
</script>

<template>
  <div
    v-if="displayList.length > 0"
    :class="regionClass(props, 'root', 'miu-image-group', `miu-image-group--${layoutType}`)"
    :style="regionStyle(props, 'root')"
    :data-miu-radius="radius"
  >
    <button
      v-for="(item, idx) in displayList"
      :key="`${item.src}-${idx}`"
      type="button"
      :class="
        regionClass(props, 'item', 'miu-image-group__item', {
          'miu-image-group__item--error': failedIndices.has(idx),
        })
      "
      :style="regionStyle(props, 'item')"
      :data-error="failedIndices.has(idx) || undefined"
      :aria-label="item.alt"
      @click.stop="openPreview(idx, $event)"
    >
      <Image
        :src="item.thumb ?? item.src"
        :fallback-src="item.thumb && item.thumb !== item.src ? item.src : undefined"
        :alt="item.alt"
        fit="cover"
        width="100%"
        height="100%"
        :radius="radius"
        :class-names="{ root: 'miu-image-group__image', img: regionClass(props, 'img') }"
        :styles="{ img: regionStyle(props, 'img') }"
        @error="onImageError(idx, $event)"
      />
      <span
        v-if="idx === displayList.length - 1 && remainingCount > 0"
        :class="regionClass(props, 'more', 'miu-image-group__more')"
        :style="regionStyle(props, 'more')"
        :title="t('imagePreview.moreImages', { count: remainingCount })"
      >
        +{{ remainingCount }}
      </span>
    </button>

    <ImagePreview
      v-model:open="previewOpen"
      :images="normalizedImages"
      :initial-index="previewIndex"
      :origin-rect="previewOriginRect"
    >
      <template v-if="$slots.actions" #actions="slotProps">
        <slot name="actions" v-bind="slotProps" />
      </template>
    </ImagePreview>
  </div>
</template>
