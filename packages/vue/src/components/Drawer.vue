<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui"
import { regionClass, regionStyle } from "@miuui/core"
import type { DrawerProps } from "../types"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<DrawerProps>(), {
  open: false,
  side: "start",
  radius: "none",
})

const emit = defineEmits<{ "update:open": [value: boolean] }>()
const theme = useMiuTheme()
const { t } = useMiuI18n()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Drawer")
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal :to="theme.portalTarget.value">
      <DialogOverlay
        :class="regionClass(props, 'overlay', 'miu-drawer__overlay')"
        :style="regionStyle(props, 'overlay')"
      />
      <DialogContent
        :class="regionClass(props, 'content', 'miu-drawer__content')"
        :style="[
          mergeStyle(regionStyle(props, 'content'), materialTokens),
          width ? { width } : undefined,
        ]"
        :data-side="side"
        :data-miu-radius="radius"
        :data-material="materialName"
        :aria-label="ariaLabel ?? title ?? t('common.menu')"
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
