<script setup lang="ts">
import { computed, useSlots } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { LoadingOverlayProps } from "../types"
import { useMiuTheme } from "../composables/useMiu"
import { useMounted } from "../composables/useMounted"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import { useScrollLock } from "../composables/useScrollLock"
import Spinner from "./Spinner.vue"

const props = withDefaults(defineProps<LoadingOverlayProps>(), {
  fullscreen: true,
  size: "lg",
  radius: "default",
  lockScroll: true,
})

const slots = useSlots()
const mounted = useMounted()
const theme = useMiuTheme()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "LoadingOverlay")

useScrollLock(() => Boolean(props.fullscreen && props.loading && props.lockScroll))

const hasText = computed(() => Boolean(props.text || slots.default))
const rootClasses = computed(() =>
  regionClass(props, "root", "miu-loading-overlay", {
    "miu-loading-overlay--fullscreen": props.fullscreen,
  }),
)
</script>

<template>
  <Teleport
    v-if="!fullscreen || mounted"
    :to="theme.portalTarget.value ?? 'body'"
    :disabled="!fullscreen"
  >
    <Transition name="miu-fade">
      <div
        v-if="loading"
        :class="rootClasses"
        :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
        :data-material="materialName"
        :data-miu-radius="fullscreen ? undefined : radius"
        :role="hasText ? 'status' : undefined"
        :aria-live="hasText ? 'polite' : undefined"
      >
        <div
          :class="regionClass(props, 'card', 'miu-loading-overlay__content')"
          :style="regionStyle(props, 'card')"
        >
          <slot name="icon">
            <Spinner
              :size="size"
              :role="hasText ? 'none' : 'status'"
              :aria-hidden="hasText ? 'true' : undefined"
            />
          </slot>
          <p
            v-if="hasText"
            :class="regionClass(props, 'text', 'miu-loading-overlay__text')"
            :style="regionStyle(props, 'text')"
          >
            <slot>{{ text }}</slot>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
