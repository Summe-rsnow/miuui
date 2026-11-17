<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue"
import { DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ImagePreviewItem, ImagePreviewProps } from "../types"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import IconButton from "./IconButton.vue"

const props = withDefaults(defineProps<ImagePreviewProps>(), {
  open: false,
  initialIndex: 0,
})

const emit = defineEmits<{
  "update:open": [value: boolean]
  change: [index: number]
}>()

const theme = useMiuTheme()
const { t } = useMiuI18n()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "ImagePreview")

const currentIndex = ref(props.initialIndex)

const normalizedList = computed<ImagePreviewItem[]>(() => {
  if (props.images && props.images.length > 0) {
    return props.images.map((entry, idx) => {
      if (typeof entry === "string") {
        return { src: entry, thumb: entry, alt: `${idx + 1}` }
      }
      return {
        src: entry.src,
        thumb: entry.thumb ?? entry.src,
        alt: entry.alt ?? `${idx + 1}`,
      }
    })
  }
  if (props.src) {
    return [{ src: props.src, thumb: props.src, alt: props.alt ?? "" }]
  }
  return []
})

const hasMultiple = computed(() => normalizedList.value.length > 1)
const currentItem = computed(
  () => normalizedList.value[currentIndex.value] ?? normalizedList.value[0],
)

function close(): void {
  emit("update:open", false)
}

function selectIndex(index: number): void {
  if (index >= 0 && index < normalizedList.value.length) {
    currentIndex.value = index
    emit("change", index)
  }
}

function prevImage(): void {
  if (!hasMultiple.value) return
  const next = currentIndex.value > 0 ? currentIndex.value - 1 : normalizedList.value.length - 1
  selectIndex(next)
}

function nextImage(): void {
  if (!hasMultiple.value) return
  const next = currentIndex.value < normalizedList.value.length - 1 ? currentIndex.value + 1 : 0
  selectIndex(next)
}

function onKeydown(event: KeyboardEvent): void {
  if (!props.open) return
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault()
    prevImage()
  } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault()
    nextImage()
  }
}

watch(
  () => props.initialIndex,
  (val) => {
    currentIndex.value = val ?? 0
  },
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      currentIndex.value = props.initialIndex ?? 0
      if (typeof document !== "undefined") {
        document.addEventListener("keydown", onKeydown)
      }
    } else if (typeof document !== "undefined") {
      document.removeEventListener("keydown", onKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof document !== "undefined") {
    document.removeEventListener("keydown", onKeydown)
  }
})
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal :to="theme.portalTarget.value">
      <DialogOverlay
        :class="regionClass(props, 'overlay', 'miu-image-preview__overlay')"
        :style="regionStyle(props, 'overlay')"
      />
      <DialogContent
        class="miu-image-preview"
        :data-material="materialName"
        :style="materialTokens"
        :aria-label="currentItem?.alt || t('imagePreview.close')"
        @click.self="close"
      >
        <DialogTitle class="miu-sr-only">
          {{ currentItem?.alt || t("imagePreview.close") }}
        </DialogTitle>

        <div
          :class="regionClass(props, 'topbar', 'miu-image-preview__topbar')"
          :style="regionStyle(props, 'topbar')"
        >
          <div
            v-if="hasMultiple"
            :class="regionClass(props, 'counter', 'miu-image-preview__counter')"
            :style="regionStyle(props, 'counter')"
          >
            <span>{{ currentIndex + 1 }}</span>
            <span class="miu-image-preview__counter-sep">/</span>
            <span>{{ normalizedList.length }}</span>
          </div>
          <span v-else />

          <div
            :class="regionClass(props, 'actions', 'miu-image-preview__actions')"
            :style="regionStyle(props, 'actions')"
          >
            <slot name="actions" :item="currentItem" :index="currentIndex" :close="close" />
            <IconButton
              icon="close"
              variant="glass"
              size="md"
              :label="t('imagePreview.close')"
              @click="close"
            />
          </div>
        </div>

        <IconButton
          v-if="hasMultiple"
          icon="chevronLeft"
          variant="glass"
          size="lg"
          :label="t('imagePreview.previous')"
          :class-names="{
            root: regionClass(props, 'nav', 'miu-image-preview__nav miu-image-preview__nav--prev'),
          }"
          :styles="{ root: regionStyle(props, 'nav') }"
          @click.stop="prevImage"
        />

        <div
          :class="regionClass(props, 'stage', 'miu-image-preview__stage')"
          :style="regionStyle(props, 'stage')"
          @click.self="close"
        >
          <img
            v-if="currentItem?.src"
            :key="currentItem.src"
            :src="currentItem.src"
            :alt="currentItem.alt"
            :class="regionClass(props, 'img', 'miu-image-preview__img')"
            :style="mergeStyle(regionStyle(props, 'img'), undefined)"
            @click.stop
          />
        </div>

        <IconButton
          v-if="hasMultiple"
          icon="chevronRight"
          variant="glass"
          size="lg"
          :label="t('imagePreview.next')"
          :class-names="{
            root: regionClass(props, 'nav', 'miu-image-preview__nav miu-image-preview__nav--next'),
          }"
          :styles="{ root: regionStyle(props, 'nav') }"
          @click.stop="nextImage"
        />

        <div
          v-if="hasMultiple"
          :class="regionClass(props, 'dock', 'miu-image-preview__dock')"
          :style="regionStyle(props, 'dock')"
          @click.stop
        >
          <button
            v-for="(item, idx) in normalizedList"
            :key="`${item.src}-${idx}`"
            type="button"
            class="miu-image-preview__thumb"
            :class="{ 'miu-image-preview__thumb--active': idx === currentIndex }"
            :aria-label="item.alt || `${idx + 1}`"
            :aria-pressed="idx === currentIndex"
            @click="selectIndex(idx)"
          >
            <img
              :src="item.thumb ?? item.src"
              :alt="item.alt"
              class="miu-image-preview__thumb-img"
            />
          </button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
