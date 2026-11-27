<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ImagePreviewOriginRect, ImageProps } from "../types"
import { captureOriginRect } from "../composables/useOriginRect"
import { useMiuI18n } from "../composables/useMiu"
import { useMiuImageResolver, useResolvedImageSrc } from "../composables/useMiuImage"
import { mergeStyle } from "../composables/usePluginResolution"
import ImagePreview from "./ImagePreview.vue"

const props = withDefaults(defineProps<ImageProps>(), {
  alt: "",
  fit: "cover",
  radius: "default",
  previewable: false,
  pixelated: false,
  lazy: false,
})

const emit = defineEmits<{
  error: [event: Event]
  load: [event: Event]
}>()

const { t } = useMiuI18n()
const imageResolver = useMiuImageResolver()
const usedFallbackSrc = ref(false)
const loadFailed = ref(false)
const showPreview = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const previewOriginRect = ref<ImagePreviewOriginRect | null>(null)
const isVisible = ref(!props.lazy || typeof IntersectionObserver === "undefined")
let observer: IntersectionObserver | null = null

function disconnectObserver(): void {
  observer?.disconnect()
  observer = null
}

function setupObserver(): void {
  disconnectObserver()
  if (!props.lazy || !imageResolver.value || typeof IntersectionObserver === "undefined") {
    isVisible.value = true
    return
  }
  const el = rootRef.value
  if (!el) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        isVisible.value = true
        disconnectObserver()
      }
    },
    { rootMargin: "25%" },
  )
  observer.observe(el)
}

onMounted(setupObserver)
onBeforeUnmount(disconnectObserver)

watch(
  () => [props.lazy, imageResolver.value] as const,
  ([lazy, fn]) => {
    if (!lazy || !fn) {
      isVisible.value = true
      disconnectObserver()
    } else if (!isVisible.value) {
      setupObserver()
    }
  },
)

watch(
  () => [props.src, props.fallbackSrc] as const,
  () => {
    usedFallbackSrc.value = false
    loadFailed.value = false
  },
)

const rawActiveSrc = computed(() => {
  if (usedFallbackSrc.value) return props.fallbackSrc || null
  return props.src || props.fallbackSrc || null
})

const { resolvedSrc: activeSrc, isResolving } = useResolvedImageSrc(rawActiveSrc, {
  enabled: isVisible,
})

const previewSrc = computed(() => rawActiveSrc.value || activeSrc.value)

const rootStyle = computed(() => {
  const base = regionStyle(props, "root")
  const dims: Record<string, string> = {}
  if (props.width) dims.width = props.width
  if (props.height) dims.height = props.height
  return mergeStyle(base, Object.keys(dims).length > 0 ? dims : undefined)
})

const imgStyle = computed(() => mergeStyle(regionStyle(props, "img"), { objectFit: props.fit }))

const canPreview = computed(() =>
  Boolean(props.previewable && activeSrc.value && !loadFailed.value),
)

function onError(event: Event): void {
  if (!usedFallbackSrc.value && props.fallbackSrc && props.src && props.src !== props.fallbackSrc) {
    usedFallbackSrc.value = true
    return
  }
  loadFailed.value = true
  showPreview.value = false
  emit("error", event)
}

function onLoad(event: Event): void {
  emit("load", event)
}

function openPreview(): void {
  if (canPreview.value) {
    previewOriginRect.value = captureOriginRect(rootRef.value)
    showPreview.value = true
  }
}
</script>

<template>
  <div
    ref="rootRef"
    :class="
      regionClass(props, 'root', 'miu-image', {
        'miu-image--previewable': canPreview,
      })
    "
    :style="rootStyle"
    :data-miu-radius="radius"
    :role="canPreview ? 'button' : undefined"
    :tabindex="canPreview ? 0 : undefined"
    :aria-label="canPreview ? alt || t('image.preview') : undefined"
    @click="openPreview"
    @keydown.enter.prevent="openPreview"
    @keydown.space.prevent="openPreview"
  >
    <img
      v-if="activeSrc && !loadFailed"
      :src="activeSrc"
      :alt="alt"
      :loading="lazy ? 'lazy' : undefined"
      decoding="async"
      :referrerpolicy="referrerPolicy"
      :class="
        regionClass(props, 'img', 'miu-image__img', {
          'miu-image__img--pixelated': pixelated,
        })
      "
      :style="imgStyle"
      @error="onError"
      @load="onLoad"
    />
    <div
      v-else-if="!isResolving"
      :class="regionClass(props, 'fallback', 'miu-image__fallback')"
      :style="regionStyle(props, 'fallback')"
    >
      <slot name="fallback">
        <svg
          class="miu-image__placeholder-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="m21 15-4.5-4.5a1.5 1.5 0 0 0-2.1 0L7 18" />
        </svg>
      </slot>
    </div>
    <div
      v-else
      :class="regionClass(props, 'fallback', 'miu-image__fallback')"
      :style="regionStyle(props, 'fallback')"
      aria-hidden="true"
    />

    <ImagePreview
      v-if="previewable"
      :open="showPreview"
      :src="previewSrc"
      :alt="alt"
      :origin-rect="previewOriginRect"
      material="glass"
      :class-names="{
        img: pixelated
          ? 'miu-image__lightbox-img miu-image__img--pixelated'
          : 'miu-image__lightbox-img',
      }"
      @update:open="showPreview = $event"
    />
  </div>
</template>
