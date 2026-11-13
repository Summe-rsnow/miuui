<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import type { LoadingOverlayProps } from "../types"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Spinner from "./Spinner.vue"

const props = withDefaults(defineProps<LoadingOverlayProps>(), {
  fullscreen: true,
  size: "lg",
})

const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "LoadingOverlay")
const rootClasses = computed(() =>
  regionClass(props, "root", "miu-loading-overlay", {
    "miu-loading-overlay--fullscreen": props.fullscreen,
  }),
)
</script>

<template>
  <Teleport v-if="fullscreen && mounted" to="body">
    <Transition name="miu-fade">
      <div
        v-if="loading"
        :class="rootClasses"
        :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
        :data-material="materialName"
        role="status"
        aria-live="polite"
      >
        <div
          :class="regionClass(props, 'card', 'miu-loading-overlay__content')"
          :style="regionStyle(props, 'card')"
        >
          <slot name="icon">
            <Spinner :size="size" />
          </slot>
          <p
            v-if="text || $slots.default"
            :class="regionClass(props, 'text', 'miu-loading-overlay__text')"
            :style="regionStyle(props, 'text')"
          >
            <slot>{{ text }}</slot>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
  <Transition v-else-if="!fullscreen" name="miu-fade">
    <div
      v-if="loading"
      :class="rootClasses"
      :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
      :data-material="materialName"
      role="status"
      aria-live="polite"
    >
      <div
        :class="regionClass(props, 'card', 'miu-loading-overlay__content')"
        :style="regionStyle(props, 'card')"
      >
        <slot name="icon">
          <Spinner :size="size" />
        </slot>
        <p
          v-if="text || $slots.default"
          :class="regionClass(props, 'text', 'miu-loading-overlay__text')"
          :style="regionStyle(props, 'text')"
        >
          <slot>{{ text }}</slot>
        </p>
      </div>
    </div>
  </Transition>
</template>
