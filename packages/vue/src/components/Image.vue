<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import type { ImageProps } from "../types"
import Dialog from "./Dialog.vue"

const props = withDefaults(defineProps<ImageProps>(), {
  alt: "",
  fit: "cover",
  radius: "default",
  previewable: false,
  lazy: false,
})

const emit = defineEmits<{
  error: [event: Event]
  load: [event: Event]
}>()

const loadFailed = ref(false)
const showPreview = ref(false)

watch(
  () => props.src,
  () => {
    loadFailed.value = false
  },
)

const rootStyle = computed(() => {
  const base = regionStyle(props, "root")
  const dims: Record<string, string> = {}
  if (props.width) dims.width = props.width
  if (props.height) dims.height = props.height
  return Object.keys(dims).length > 0 ? [base, dims] : base
})

const imgStyle = computed(() => [regionStyle(props, "img"), { objectFit: props.fit }])

const canPreview = computed(() => Boolean(props.previewable && props.src && !loadFailed.value))

function onError(event: Event): void {
  loadFailed.value = true
  emit("error", event)
}

function onLoad(event: Event): void {
  emit("load", event)
}

function openPreview(): void {
  if (canPreview.value) showPreview.value = true
}
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-image', {
        'miu-image--previewable': canPreview,
      })
    "
    :style="rootStyle"
    :data-miu-radius="radius"
    :role="canPreview ? 'button' : undefined"
    :tabindex="canPreview ? 0 : undefined"
    :aria-label="canPreview ? alt || 'Preview image' : undefined"
    @click="openPreview"
    @keydown.enter="openPreview"
    @keydown.space.prevent="openPreview"
  >
    <img
      v-if="src && !loadFailed"
      :src="src"
      :alt="alt"
      :loading="lazy ? 'lazy' : undefined"
      :referrerpolicy="referrerPolicy"
      :class="regionClass(props, 'img', 'miu-image__img')"
      :style="imgStyle"
      @error="onError"
      @load="onLoad"
    />
    <div
      v-else
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

    <Dialog
      v-if="previewable"
      :open="showPreview"
      hide-header
      width="auto"
      material="glass"
      :aria-label="alt || 'Preview'"
      :styles="{
        content: {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          backdropFilter: 'none',
          maxWidth: '90vw',
          padding: '0',
        },
        body: { padding: '0', overflow: 'visible' },
      }"
      @update:open="(v: boolean) => !v && (showPreview = false)"
    >
      <div class="miu-image__lightbox" @click="showPreview = false">
        <img v-if="src" :src="src" :alt="alt" class="miu-image__lightbox-img" />
      </div>
    </Dialog>
  </div>
</template>
