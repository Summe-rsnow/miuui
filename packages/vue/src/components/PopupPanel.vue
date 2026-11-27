<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { PopupPanelProps } from "../types"
import { useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import IconButton from "./IconButton.vue"

const props = withDefaults(defineProps<PopupPanelProps>(), {
  showClose: false,
  noScroll: false,
  bare: false,
  bordered: true,
  footerClickable: false,
  radius: "default",
  shadow: "md",
})

const emit = defineEmits<{
  close: []
  footerClick: []
}>()

const { i18n } = useMiuTheme()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "PopupPanel")

const resolvedCloseLabel = computed(() => props.closeLabel ?? i18n.t("common.close"))
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-popup-panel', `miu-popup-panel--shadow-${shadow}`, {
        'miu-popup-panel--bare': bare,
        'miu-popup-panel--bordered': !bare && bordered,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), bare ? undefined : materialTokens)"
    :data-miu-radius="bare ? undefined : radius"
    :data-material="bare ? undefined : materialName"
  >
    <div
      v-if="$slots.header || title || showClose"
      :class="regionClass(props, 'header', 'miu-popup-panel__header')"
      :style="regionStyle(props, 'header')"
    >
      <slot name="header">
        <span
          v-if="title"
          :class="regionClass(props, 'title', 'miu-popup-panel__title')"
          :style="regionStyle(props, 'title')"
        >
          {{ title }}
        </span>
        <IconButton
          v-if="showClose"
          icon="close"
          size="xs"
          icon-size="xs"
          variant="glass"
          :aria-label="resolvedCloseLabel"
          :title="resolvedCloseLabel"
          :class-names="{ root: regionClass(props, 'close', 'miu-popup-panel__close') }"
          :styles="{ root: regionStyle(props, 'close') }"
          @click="emit('close')"
        />
      </slot>
    </div>

    <div
      :class="
        regionClass(props, 'body', 'miu-popup-panel__body', {
          'miu-popup-panel__body--no-scroll': noScroll,
        })
      "
      :style="regionStyle(props, 'body')"
    >
      <slot />
    </div>

    <template v-if="$slots.footer">
      <button
        v-if="footerClickable"
        type="button"
        :class="
          regionClass(
            props,
            'footer',
            'miu-popup-panel__footer',
            'miu-popup-panel__footer--clickable',
          )
        "
        :style="regionStyle(props, 'footer')"
        @click="emit('footerClick')"
      >
        <slot name="footer" />
      </button>
      <div
        v-else
        :class="regionClass(props, 'footer', 'miu-popup-panel__footer')"
        :style="regionStyle(props, 'footer')"
      >
        <slot name="footer" />
      </div>
    </template>
  </div>
</template>
