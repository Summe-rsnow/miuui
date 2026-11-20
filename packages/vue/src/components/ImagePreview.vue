<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ImagePreviewItem, ImagePreviewProps } from "../types"
import { useDocumentKeydown } from "../composables/useDocumentKeydown"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"
import IconButton from "./IconButton.vue"

const props = withDefaults(defineProps<ImagePreviewProps>(), {
  open: false,
  initialIndex: 0,
  closeOnOverlayClick: true,
  closeOnEsc: true,
  showClose: true,
})

const emit = defineEmits<{
  "update:open": [value: boolean]
  change: [index: number]
}>()

const theme = useMiuTheme()
const { t } = useMiuI18n()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "ImagePreview")

const currentIndex = ref(props.initialIndex)
const imageError = ref(false)

const normalizedList = computed<ImagePreviewItem[]>(() => {
  if (props.images && props.images.length > 0) {
    return props.images
      .map((entry, idx) => {
        if (typeof entry === "string") {
          return { src: entry, thumb: entry, alt: `${idx + 1}` }
        }
        return {
          src: entry.src,
          thumb: entry.thumb ?? entry.src,
          alt: entry.alt ?? `${idx + 1}`,
        }
      })
      .filter((entry) => Boolean(entry.src))
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
const navClassNames = computed(() => ({
  prev: { root: regionClass(props, "nav", "miu-image-preview__nav miu-image-preview__nav--prev") },
  next: { root: regionClass(props, "nav", "miu-image-preview__nav miu-image-preview__nav--next") },
}))
const navStyles = computed(() => ({ root: regionStyle(props, "nav") }))

function close(): void {
  emit("update:open", false)
}

function selectIndex(index: number): void {
  if (index >= 0 && index < normalizedList.value.length) {
    currentIndex.value = index
    imageError.value = false
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

function onEscapeKeyDown(event: KeyboardEvent): void {
  if (!props.closeOnEsc) event.preventDefault()
}

function onOutsideDismiss(event: Event): void {
  if (!props.closeOnOverlayClick) event.preventDefault()
}

function onBackdropClick(): void {
  if (props.closeOnOverlayClick) close()
}

useDocumentKeydown(onKeydown, () => Boolean(props.open))

watch(
  () => props.initialIndex,
  (val) => {
    currentIndex.value = val ?? 0
    imageError.value = false
  },
)

watch(
  () => currentItem.value?.src,
  () => {
    imageError.value = false
  },
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      currentIndex.value = props.initialIndex ?? 0
      imageError.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal :to="theme.portalTarget.value">
      <DialogOverlay
        :class="regionClass(props, 'overlay', 'miu-overlay-backdrop', 'miu-image-preview__overlay')"
        :style="regionStyle(props, 'overlay')"
      />
      <DialogContent
        :aria-describedby="undefined"
        :class="regionClass(props, 'content', 'miu-image-preview')"
        :data-material="materialName"
        :style="mergeStyle(regionStyle(props, 'content'), materialTokens)"
        :aria-label="currentItem?.alt || closeLabel || t('imagePreview.close')"
        @escape-key-down="onEscapeKeyDown"
        @pointer-down-outside="onOutsideDismiss"
        @interact-outside="onOutsideDismiss"
        @click.self="onBackdropClick"
      >
        <DialogTitle class="miu-sr-only">
          {{ currentItem?.alt || closeLabel || t("imagePreview.close") }}
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
              v-if="showClose"
              icon="close"
              variant="glass"
              size="md"
              :label="closeLabel ?? t('imagePreview.close')"
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
          :class-names="navClassNames.prev"
          :styles="navStyles"
          @click.stop="prevImage"
        />

        <div
          :class="regionClass(props, 'stage', 'miu-image-preview__stage')"
          :style="regionStyle(props, 'stage')"
          @click.self="onBackdropClick"
        >
          <img
            v-if="currentItem?.src && !imageError"
            :key="currentItem.src"
            :src="currentItem.src"
            :alt="currentItem.alt"
            :class="regionClass(props, 'img', 'miu-image-preview__img')"
            :style="regionStyle(props, 'img')"
            @error="imageError = true"
            @click.stop
          />
          <div v-else class="miu-image-preview__empty" role="status" @click.stop>
            <Icon name="infoCircle" size="xl" />
            <span>{{ t("emptyState.title") }}</span>
          </div>
        </div>

        <IconButton
          v-if="hasMultiple"
          icon="chevronRight"
          variant="glass"
          size="lg"
          :label="t('imagePreview.next')"
          :class-names="navClassNames.next"
          :styles="navStyles"
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
