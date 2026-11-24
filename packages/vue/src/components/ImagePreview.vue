<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance,
} from "vue"
import { DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ImagePreviewItem, ImagePreviewProps } from "../types"
import { useDocumentKeydown } from "../composables/useDocumentKeydown"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { scaleBorderRadius } from "../composables/useOriginRect"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"
import IconButton from "./IconButton.vue"

const props = withDefaults(defineProps<ImagePreviewProps>(), {
  open: false,
  initialIndex: 0,
  originRect: null,
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
const renderedOpen = ref(Boolean(props.open))
const isClosing = ref(false)
const waitingForDecode = ref(false)

const overlayRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
const contentRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
const topbarRef = ref<HTMLElement | null>(null)
const dockRef = ref<HTMLElement | null>(null)
const stageImgRef = ref<HTMLImageElement | null>(null)

let transitionEpoch = 0
let abortPendingDecode: (() => void) | null = null
let hasAnimatedInitialOpen = false
let activeAnimations: Animation[] = []
const waapiControlled = ref(false)

function unwrapElement(node: unknown): HTMLElement | null {
  if (!node) return null
  if (typeof HTMLElement !== "undefined" && node instanceof HTMLElement) return node
  const maybeComp = node as { $el?: unknown }
  return typeof HTMLElement !== "undefined" && maybeComp.$el instanceof HTMLElement
    ? maybeComp.$el
    : null
}

function canUseWaapi(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof HTMLElement !== "undefined" &&
    typeof HTMLElement.prototype.animate === "function"
  )
}

function getMotionMode(el: HTMLElement | null): "full" | "reduced" | "none" {
  if (typeof window === "undefined") return "none"
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return "none"
  if (el?.closest('[data-motion-tier="none"]')) return "none"
  if (el?.closest('[data-motion-tier="reduced"]')) return "reduced"
  return "full"
}

function cancelActiveAnimations(): void {
  if (abortPendingDecode) {
    const abort = abortPendingDecode
    abortPendingDecode = null
    abort()
  }
  for (const anim of activeAnimations) {
    try {
      anim.cancel()
    } catch {
      /* ignore cancelled animation errors */
    }
  }
  activeAnimations = []
}

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

function computeFlipDelta(
  imgEl: HTMLImageElement,
  allowOrigin: boolean,
): { dx: number; dy: number; scale: number; hasOrigin: boolean } {
  const origin = allowOrigin ? props.originRect : null
  const target = imgEl.getBoundingClientRect()
  if (
    !origin ||
    origin.width <= 0 ||
    origin.height <= 0 ||
    target.width <= 0 ||
    target.height <= 0
  ) {
    return { dx: 0, dy: 14, scale: 0.58, hasOrigin: false }
  }
  const originCx = origin.left + origin.width / 2
  const originCy = origin.top + origin.height / 2
  const targetCx = target.left + target.width / 2
  const targetCy = target.top + target.height / 2
  const rawScale = Math.min(origin.width / target.width, origin.height / target.height)
  return {
    dx: originCx - targetCx,
    dy: originCy - targetCy,
    scale: Math.max(0.06, Math.min(rawScale, 2)),
    hasOrigin: true,
  }
}

async function waitForImageReady(imgEl: HTMLImageElement, epoch: number): Promise<void> {
  if (imgEl.complete && imgEl.naturalWidth > 0) return
  await new Promise<void>((resolve) => {
    let settled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const cleanup = () => {
      imgEl.removeEventListener("load", done)
      imgEl.removeEventListener("error", done)
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
      }
      if (abortPendingDecode === abort) {
        abortPendingDecode = null
      }
    }
    const done = () => {
      if (settled) return
      settled = true
      cleanup()
      resolve()
    }
    const abort = () => {
      if (settled) return
      settled = true
      cleanup()
      resolve()
    }
    abortPendingDecode = abort
    imgEl.addEventListener("load", done, { once: true })
    imgEl.addEventListener("error", done, { once: true })
    timer = setTimeout(() => {
      if (epoch === transitionEpoch) done()
      else abort()
    }, 280)
  })
}

async function runOpenAnimation(): Promise<void> {
  const epoch = ++transitionEpoch
  cancelActiveAnimations()
  hasAnimatedInitialOpen = false
  if (!waapiControlled.value) {
    waitingForDecode.value = false
    hasAnimatedInitialOpen = true
    return
  }

  waitingForDecode.value = true
  await nextTick()
  if (epoch !== transitionEpoch || !renderedOpen.value || isClosing.value) return

  const contentEl = unwrapElement(contentRef.value)
  const overlayEl = unwrapElement(overlayRef.value)
  const motion = getMotionMode(contentEl)
  if (motion === "none") {
    waitingForDecode.value = false
    hasAnimatedInitialOpen = true
    return
  }

  if (overlayEl) {
    activeAnimations.push(
      overlayEl.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: motion === "reduced" ? 160 : 250,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      }),
    )
  }
  for (const chrome of [topbarRef.value, dockRef.value]) {
    if (chrome) {
      activeAnimations.push(
        chrome.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 200,
          easing: "ease-out",
        }),
      )
    }
  }

  const imgEl = stageImgRef.value
  if (!imgEl) {
    waitingForDecode.value = false
    hasAnimatedInitialOpen = true
    return
  }

  await waitForImageReady(imgEl, epoch)
  if (epoch !== transitionEpoch || !renderedOpen.value || isClosing.value) return

  waitingForDecode.value = false
  await nextTick()
  if (epoch !== transitionEpoch || !renderedOpen.value || isClosing.value) return

  const freshImg = stageImgRef.value
  if (!freshImg || typeof freshImg.animate !== "function") {
    hasAnimatedInitialOpen = true
    return
  }

  if (motion === "reduced") {
    activeAnimations.push(
      freshImg.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 180,
        easing: "ease-out",
      }),
    )
    hasAnimatedInitialOpen = true
    return
  }

  const flip = computeFlipDelta(freshImg, true)
  const startTransform = `translate3d(${flip.dx}px, ${flip.dy}px, 0) scale(${flip.scale})`
  const endTransform = "translate3d(0, 0, 0) scale(1)"
  const enterRadius = flip.hasOrigin
    ? scaleBorderRadius(props.originRect?.borderRadius, flip.scale)
    : undefined
  const startFrame: Keyframe = {
    transform: startTransform,
    opacity: flip.hasOrigin ? 0.72 : 0,
    ...(enterRadius ? { borderRadius: enterRadius } : {}),
  }
  const endFrame: Keyframe = {
    transform: endTransform,
    opacity: 1,
    ...(enterRadius ? { borderRadius: "var(--miu-radius-lg)" } : {}),
  }

  activeAnimations.push(
    freshImg.animate([startFrame, endFrame], {
      duration: 340,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    }),
  )
  hasAnimatedInitialOpen = true
}

async function runImageSwitchAnimation(): Promise<void> {
  if (!waapiControlled.value || !hasAnimatedInitialOpen || isClosing.value || !renderedOpen.value)
    return
  const epoch = transitionEpoch
  await nextTick()
  if (epoch !== transitionEpoch || isClosing.value || !renderedOpen.value) return
  const imgEl = stageImgRef.value
  const motion = getMotionMode(unwrapElement(contentRef.value))
  if (!imgEl || typeof imgEl.animate !== "function" || motion === "none") return

  activeAnimations.push(
    imgEl.animate(
      [
        {
          opacity: 0,
          transform: motion === "reduced" ? "none" : "scale(0.92)",
        },
        {
          opacity: 1,
          transform: "scale(1)",
        },
      ],
      {
        duration: 220,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    ),
  )
}

async function runCloseAnimation(): Promise<void> {
  const epoch = ++transitionEpoch
  cancelActiveAnimations()
  waitingForDecode.value = false

  const contentEl = unwrapElement(contentRef.value)
  const overlayEl = unwrapElement(overlayRef.value)
  const imgEl = stageImgRef.value
  const motion = getMotionMode(contentEl)

  if (!waapiControlled.value || motion === "none" || (!overlayEl && !imgEl)) {
    isClosing.value = false
    renderedOpen.value = false
    hasAnimatedInitialOpen = false
    return
  }

  isClosing.value = true
  const anims: Animation[] = []

  if (overlayEl) {
    anims.push(
      overlayEl.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 240,
        easing: "ease-out",
        fill: "forwards",
      }),
    )
  }

  for (const chrome of [topbarRef.value, dockRef.value]) {
    if (chrome) {
      anims.push(
        chrome.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 150,
          easing: "ease-out",
          fill: "forwards",
        }),
      )
    }
  }

  if (imgEl && typeof imgEl.animate === "function") {
    if (motion === "reduced") {
      anims.push(
        imgEl.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 180,
          easing: "ease-out",
          fill: "forwards",
        }),
      )
    } else {
      const canReturnToOrigin = !hasMultiple.value || currentIndex.value === (props.initialIndex ?? 0)
      const flip = computeFlipDelta(imgEl, canReturnToOrigin)
      const endTransform = `translate3d(${flip.dx}px, ${flip.dy}px, 0) scale(${flip.scale})`
      const closeRadius = flip.hasOrigin
        ? scaleBorderRadius(props.originRect?.borderRadius, flip.scale)
        : undefined
      anims.push(
        imgEl.animate(
          [
            { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
            { offset: 0.72, opacity: flip.hasOrigin ? 0.92 : 0.45 },
            {
              transform: endTransform,
              opacity: 0,
              ...(closeRadius ? { borderRadius: closeRadius } : {}),
            },
          ],
          {
            duration: 260,
            easing: "cubic-bezier(0.32, 0.08, 0.24, 1)",
            fill: "forwards",
          },
        ),
      )
    }
  }

  activeAnimations = anims
  await Promise.allSettled(anims.map((a) => a.finished))
  if (epoch !== transitionEpoch) return
  cancelActiveAnimations()
  isClosing.value = false
  renderedOpen.value = false
  hasAnimatedInitialOpen = false
}

function close(): void {
  if (isClosing.value) return
  emit("update:open", false)
}

function onDialogOpenChange(nextOpen: boolean): void {
  if (!nextOpen) {
    close()
    return
  }
  emit("update:open", true)
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
  if (!props.open || isClosing.value) return
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

useDocumentKeydown(onKeydown, () => Boolean(props.open && !isClosing.value))

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
    void runImageSwitchAnimation()
  },
)

watch(
  () => props.open,
  (isOpen, wasOpen) => {
    if (isOpen) {
      currentIndex.value = props.initialIndex ?? 0
      imageError.value = false
      isClosing.value = false
      renderedOpen.value = true
      if (wasOpen !== undefined) {
        void runOpenAnimation()
      }
    } else if (renderedOpen.value) {
      void runCloseAnimation()
    }
  },
)

onMounted(() => {
  waapiControlled.value = canUseWaapi()
  if (props.open) {
    renderedOpen.value = true
    void runOpenAnimation()
  }
})

onBeforeUnmount(() => {
  ++transitionEpoch
  cancelActiveAnimations()
})
</script>

<template>
  <DialogRoot :open="renderedOpen" @update:open="onDialogOpenChange">
    <DialogPortal :to="theme.portalTarget.value">
      <DialogOverlay
        ref="overlayRef"
        :data-motion-waapi="waapiControlled ? 'true' : undefined"
        :data-closing="isClosing ? 'true' : undefined"
        :class="regionClass(props, 'overlay', 'miu-overlay-backdrop', 'miu-image-preview__overlay')"
        :style="regionStyle(props, 'overlay')"
      />
      <DialogContent
        ref="contentRef"
        :aria-describedby="undefined"
        :data-motion-waapi="waapiControlled ? 'true' : undefined"
        :data-closing="isClosing ? 'true' : undefined"
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
          ref="topbarRef"
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
            :key="`${currentIndex}-${currentItem.src}`"
            ref="stageImgRef"
            :src="currentItem.src"
            :alt="currentItem.alt"
            :data-pending="waitingForDecode ? 'true' : undefined"
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
          ref="dockRef"
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
