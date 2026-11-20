<script setup lang="ts">
import { computed } from "vue"
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { DrawerProps } from "../types"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<DrawerProps>(), {
  open: undefined,
  side: "start",
  radius: "none",
  modal: true,
  closeOnOverlayClick: true,
  closeOnEsc: true,
  showClose: true,
  lockScroll: true,
})

const emit = defineEmits<{ "update:open": [value: boolean] }>()
const theme = useMiuTheme()
const { t } = useMiuI18n()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Drawer")

const contentStyle = computed(() => {
  const custom = mergeStyle(regionStyle(props, "content"), materialTokens.value)
  if (!props.width) return custom
  const dimension =
    props.side === "top" || props.side === "bottom"
      ? { blockSize: props.width }
      : { inlineSize: props.width }
  return [custom, dimension]
})

function onEscapeKeyDown(event: KeyboardEvent): void {
  if (!props.closeOnEsc) event.preventDefault()
}

function onOutsideDismiss(event: Event): void {
  if (!props.closeOnOverlayClick) event.preventDefault()
}
</script>

<template>
  <DialogRoot
    v-slot="{ open: isOpen }"
    :open="open"
    :modal="modal"
    @update:open="emit('update:open', $event)"
  >
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal :to="theme.portalTarget.value">
      <DialogOverlay
        v-if="modal && lockScroll"
        :class="regionClass(props, 'overlay', 'miu-overlay-backdrop', 'miu-drawer__overlay')"
        :style="regionStyle(props, 'overlay')"
      />
      <div
        v-else-if="modal && isOpen"
        data-state="open"
        :class="regionClass(props, 'overlay', 'miu-overlay-backdrop', 'miu-drawer__overlay')"
        :style="regionStyle(props, 'overlay')"
      />
      <DialogContent
        :aria-describedby="undefined"
        :class="regionClass(props, 'content', 'miu-drawer__content')"
        :style="contentStyle"
        :data-side="side"
        :data-miu-radius="radius"
        :data-material="materialName"
        :aria-label="ariaLabel ?? title ?? t('common.menu')"
        @escape-key-down="onEscapeKeyDown"
        @pointer-down-outside="onOutsideDismiss"
        @interact-outside="onOutsideDismiss"
      >
        <header
          :class="regionClass(props, 'header', 'miu-drawer__header')"
          :style="regionStyle(props, 'header')"
        >
          <DialogTitle
            :class="regionClass(props, 'title', 'miu-drawer__title')"
            :style="regionStyle(props, 'title')"
          >
            <slot name="title">{{ title ?? t("common.menu") }}</slot>
          </DialogTitle>
          <DialogClose
            v-if="showClose"
            :class="regionClass(props, 'close', 'miu-drawer__close')"
            :style="regionStyle(props, 'close')"
            :aria-label="closeLabel ?? t('dialog.close')"
          >
            <Icon name="close" size="sm" />
          </DialogClose>
        </header>
        <div
          :class="regionClass(props, 'body', 'miu-drawer__body')"
          :style="regionStyle(props, 'body')"
        >
          <slot />
        </div>
        <footer
          v-if="$slots.footer"
          :class="regionClass(props, 'footer', 'miu-drawer__footer')"
          :style="regionStyle(props, 'footer')"
        >
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
