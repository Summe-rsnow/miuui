<script setup lang="ts">
import { computed } from "vue"
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
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { DialogProps } from "../types"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"
const props = withDefaults(defineProps<DialogProps>(), {
  open: undefined,
  size: "md",
  radius: "lg",
  hideHeader: false,
})

const emit = defineEmits<{ "update:open": [value: boolean] }>()

const theme = useMiuTheme()
const { t } = useMiuI18n()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Dialog")
const contentStyle = computed(() => {
  const custom = mergeStyle(regionStyle(props, "content"), materialTokens.value)
  if (!props.width) return custom
  return [custom, { width: props.width }]
})
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
        :style="contentStyle"
        :data-size="size"
        :data-miu-radius="radius"
        :data-material="materialName"
        :aria-label="ariaLabel"
      >
        <DialogTitle v-if="hideHeader" class="miu-sr-only">
          {{ title ?? ariaLabel ?? t("dialog.title") }}
        </DialogTitle>
        <header
          v-else
          :class="regionClass(props, 'header', 'miu-dialog__header')"
          :style="regionStyle(props, 'header')"
        >
          <div class="miu-dialog__header-row">
            <DialogTitle
              :class="regionClass(props, 'title', 'miu-dialog__title')"
              :style="regionStyle(props, 'title')"
            >
              <slot name="title">{{ title ?? t("dialog.title") }}</slot>
            </DialogTitle>
            <DialogClose
              :class="regionClass(props, 'close', 'miu-dialog__close')"
              :style="regionStyle(props, 'close')"
              :aria-label="closeLabel ?? t('dialog.close')"
            >
              <Icon name="close" size="sm" />
            </DialogClose>
          </div>
          <DialogDescription
            v-if="description || $slots.description"
            :class="regionClass(props, 'description', 'miu-dialog__description')"
            :style="regionStyle(props, 'description')"
          >
            <slot name="description">{{ description }}</slot>
          </DialogDescription>
        </header>
        <div
          v-if="$slots.default"
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
