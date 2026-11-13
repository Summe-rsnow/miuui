<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { regionClass, regionStyle, type MaterialName } from "@miuui/core"
import type { ToastPosition, ToastStyleVariant, ToastViewportProps } from "../types"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { mergeStyle, resolveMaterialValue } from "../composables/usePluginResolution"
import {
  isPrimaryToastViewport,
  registerToastViewport,
  unregisterToastViewport,
  useToast,
  type ToastItem,
} from "../composables/useToast"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<ToastViewportProps>(), {
  position: "bottom-right",
  styleVariant: "accent",
  radius: "default",
})

const { toasts, toastDefaults, dismiss } = useToast()
const theme = useMiuTheme()
const { t } = useMiuI18n()
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
const basePosition = computed<ToastPosition>(
  () => toastDefaults.value.position ?? props.position ?? "bottom-right",
)

const visibleToasts = computed(() => {
  const cap = toastDefaults.value.max ?? props.max
  const list = toasts.value
  if (typeof cap === "number" && cap > 0 && list.length > cap) {
    return list.slice(list.length - cap)
  }
  return list
})

const groupedByPosition = computed(() => {
  const map = new Map<ToastPosition, ToastItem[]>()
  for (const item of visibleToasts.value) {
    const pos = item.position ?? basePosition.value
    const bucket = map.get(pos)
    if (bucket) bucket.push(item)
    else map.set(pos, [item])
  }
  if (map.size === 0) {
    map.set(basePosition.value, [])
  }
  return Array.from(map.entries())
})

function resolveItemMaterial(item: ToastItem): {
  name: MaterialName
  tokens: Record<string, string> | undefined
} {
  const requested = item.material ?? toastDefaults.value.material ?? props.material
  const resolved = resolveMaterialValue(
    requested,
    {
      theme: theme.theme.value,
      density: theme.density.value,
      radius: theme.radius.value,
      material: theme.material.value,
      motionTier: theme.motionTier.value,
    },
    "ToastViewport",
  )
  return { name: resolved.name, tokens: resolved.tokens }
}

function resolveItemStyleVariant(item: ToastItem): ToastStyleVariant {
  return item.styleVariant ?? toastDefaults.value.styleVariant ?? props.styleVariant ?? "accent"
}

function resolveItemRadius(item: ToastItem): string {
  return item.radius ?? toastDefaults.value.radius ?? props.radius ?? "default"
}

function toastStyleFor(item: ToastItem) {
  const mat = resolveItemMaterial(item)
  return mergeStyle(regionStyle(props, "toast"), mat.tokens)
}

function onAction(item: ToastItem): void {
  item.action?.onClick()
}
</script>

<template>
  <Teleport v-if="mounted && isPrimary" :to="target">
    <TransitionGroup
      v-for="[pos, list] in groupedByPosition"
      :key="pos"
      name="miu-toast"
      tag="div"
      :class="regionClass(props, 'viewport', 'miu-toast-viewport')"
      :style="regionStyle(props, 'viewport')"
      :data-position="pos"
      aria-live="polite"
      aria-atomic="false"
    >
      <div
        v-for="item in list"
        :key="item.id"
        :class="regionClass(props, 'toast', 'miu-toast')"
        :style="toastStyleFor(item)"
        :data-variant="item.variant"
        :data-style-variant="resolveItemStyleVariant(item)"
        :data-material="resolveItemMaterial(item).name"
        :data-miu-radius="resolveItemRadius(item)"
        :role="item.variant === 'error' ? 'alert' : 'status'"
      >
        <slot name="toast" :toast="item" :dismiss="() => dismiss(item.id)">
          <span
            v-if="item.icon !== false && ($slots.icon || item.icon || item.variant !== 'default')"
            :class="regionClass(props, 'icon', 'miu-toast__icon')"
            :style="regionStyle(props, 'icon')"
            aria-hidden="true"
          >
            <slot name="icon" :toast="item">
              <Icon v-if="typeof item.icon === 'string'" :name="item.icon" size="md" />
              <component :is="item.icon" v-else-if="item.icon" class="miu-toast__custom-icon" />
              <svg
                v-else-if="item.variant === 'success'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="9.5" />
                <path d="M8.5 12.5 11 15l4.5-5" />
              </svg>
              <svg
                v-else-if="item.variant === 'error'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="9.5" />
                <path d="m15 9-6 6M9 9l6 6" />
              </svg>
              <svg
                v-else-if="item.variant === 'warning'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 3.5 21 19.5H3z" />
                <path d="M12 9.5v4.5M12 17h.01" />
              </svg>
              <svg
                v-else-if="item.variant === 'info'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="9.5" />
                <path d="M12 11.5v5M12 8h.01" />
              </svg>
            </slot>
          </span>

          <div
            :class="regionClass(props, 'body', 'miu-toast__body')"
            :style="regionStyle(props, 'body')"
          >
            <p
              :class="regionClass(props, 'title', 'miu-toast__title')"
              :style="regionStyle(props, 'title')"
            >
              <slot name="title" :toast="item">{{ item.title }}</slot>
            </p>
            <p
              v-if="item.description || $slots.description"
              :class="regionClass(props, 'description', 'miu-toast__description')"
              :style="regionStyle(props, 'description')"
            >
              <slot name="description" :toast="item">{{ item.description }}</slot>
            </p>
            <div v-if="item.action || $slots.actions" class="miu-toast__actions">
              <slot name="actions" :toast="item">
                <button
                  v-if="item.action"
                  type="button"
                  :class="regionClass(props, 'action', 'miu-toast__action')"
                  :style="regionStyle(props, 'action')"
                  @click="onAction(item)"
                >
                  {{ item.action.label }}
                </button>
              </slot>
            </div>
          </div>

          <button
            v-if="item.closable"
            type="button"
            :class="regionClass(props, 'close', 'miu-toast__close')"
            :style="regionStyle(props, 'close')"
            :aria-label="t('toast.dismiss')"
            @click="dismiss(item.id)"
          >
            <Icon name="close" size="sm" />
          </button>
        </slot>
      </div>
    </TransitionGroup>
  </Teleport>
</template>
