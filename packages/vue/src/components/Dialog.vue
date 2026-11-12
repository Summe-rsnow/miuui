<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "reka-ui"
import { regionClass, regionStyle } from "@miuui/core"
import type { DialogProps } from "../types"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<DialogProps>(), {
  open: false,
  size: "md",
  radius: "lg",
})

const emit = defineEmits<{ "update:open": [value: boolean] }>()

const theme = useMiuTheme()
const { t } = useMiuI18n()
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogTrigger v-if="$slots.trigger" as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal :to="theme.portalTarget.value">
      <DialogOverlay
        :class="regionClass(props, 'overlay', 'miu-dialog__overlay')"
        :style="regionStyle(props, 'overlay')"
      />
      <DialogContent
        :class="regionClass(props, 'content', 'miu-dialog__content')"
        :style="regionStyle(props, 'content')"
        :data-size="size"
        :data-miu-radius="radius"
        :data-material="material"
        :aria-label="ariaLabel"
      >
        <header
          :class="regionClass(props, 'header', 'miu-dialog__header')"
          :style="regionStyle(props, 'header')"
        >
          <DialogTitle
            :class="regionClass(props, 'title', 'miu-dialog__title')"
            :style="regionStyle(props, 'title')"
          >
            <slot name="title">{{ title ?? t("dialog.title") }}</slot>
          </DialogTitle>
          <DialogDescription
            v-if="description || $slots.description"
            :class="regionClass(props, 'description', 'miu-dialog__description')"
            :style="regionStyle(props, 'description')"
          >
            <slot name="description">{{ description }}</slot>
          </DialogDescription>
          <DialogClose
            :class="regionClass(props, 'close', 'miu-dialog__close')"
            :style="regionStyle(props, 'close')"
            :aria-label="closeLabel ?? t('dialog.close')"
          >
            <Icon name="close" size="sm" />
          </DialogClose>
        </header>
        <div
          :class="regionClass(props, 'body', 'miu-dialog__body')"
          :style="regionStyle(props, 'body')"
        >
          <slot />
        </div>
        <footer
          v-if="$slots.footer"
          :class="regionClass(props, 'footer', 'miu-dialog__footer')"
          :style="regionStyle(props, 'footer')"
        >
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
