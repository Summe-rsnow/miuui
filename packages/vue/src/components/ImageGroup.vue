<script setup lang="ts">
import { computed, ref } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ImageGroupProps, ImagePreviewItem } from "../types"
import { useMiuI18n } from "../composables/useMiu"
import Image from "./Image.vue"
import ImagePreview from "./ImagePreview.vue"

const props = withDefaults(defineProps<ImageGroupProps>(), {
  images: () => [],
  maxDisplay: 9,
  radius: "md",
})

const { t } = useMiuI18n()
const previewOpen = ref(false)
const previewIndex = ref(0)

const normalizedImages = computed<ImagePreviewItem[]>(() =>
  props.images
    .map((entry, idx) => {
      if (typeof entry === "string") {
        return { src: entry, thumb: entry, alt: `${idx + 1}` }
      }
      const src = entry.src ?? entry.thumb ?? ""
      return {
        src,
        thumb: entry.thumb ?? src,
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

function openPreview(index: number): void {
  previewIndex.value = index
  previewOpen.value = true
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
      :class="regionClass(props, 'item', 'miu-image-group__item')"
      :style="regionStyle(props, 'item')"
      :aria-label="item.alt"
      @click.stop="openPreview(idx)"
    >
      <Image
        :src="item.thumb ?? item.src"
        :alt="item.alt"
        cover
        :radius="radius"
        :class-names="{ root: 'miu-image-group__image', img: regionClass(props, 'img') }"
        :styles="{ img: regionStyle(props, 'img') }"
      />
      <span
        v-if="idx === maxDisplay - 1 && remainingCount > 0"
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
    >
      <template v-if="$slots.actions" #actions="slotProps">
        <slot name="actions" v-bind="slotProps" />
      </template>
    </ImagePreview>
  </div>
</template>
