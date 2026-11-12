<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import type { ToastViewportProps } from "../types"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import {
  isPrimaryToastViewport,
  registerToastViewport,
  unregisterToastViewport,
  useToast,
} from "../composables/useToast"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<ToastViewportProps>(), {
  radius: "default",
})

const { toasts, dismiss } = useToast()
const theme = useMiuTheme()
const { t } = useMiuI18n()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "ToastViewport")
const mounted = ref(false)
const viewportId = Symbol("miu-toast-viewport")
const isPrimary = computed(() => isPrimaryToastViewport(viewportId))

onMounted(() => {
  registerToastViewport(viewportId)
  mounted.value = true
})

onBeforeUnmount(() => {
  unregisterToastViewport(viewportId)
})

const target = computed(() => theme.portalTarget.value ?? "body")
</script>

<template>
  <Teleport v-if="mounted && isPrimary" :to="target">
    <TransitionGroup
      name="miu-toast"
      tag="div"
      :class="regionClass(props, 'viewport', 'miu-toast-viewport')"
      :style="regionStyle(props, 'viewport')"
      aria-live="polite"
      aria-atomic="false"
    >
      <div
        v-for="item in toasts"
        :key="item.id"
        :class="regionClass(props, 'toast', 'miu-toast')"
        :style="mergeStyle(regionStyle(props, 'toast'), materialTokens)"
        :data-variant="item.variant"
        :data-material="materialName"
        :data-miu-radius="radius"
        :role="item.variant === 'error' ? 'alert' : 'status'"
      >
        <div class="miu-toast__body">
          <p class="miu-toast__title">{{ item.title }}</p>
          <p v-if="item.description" class="miu-toast__description">
            {{ item.description }}
          </p>
        </div>
        <button
          type="button"
          class="miu-toast__close"
          :aria-label="t('toast.dismiss')"
          @click="dismiss(item.id)"
        >
          <Icon name="close" size="sm" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>
