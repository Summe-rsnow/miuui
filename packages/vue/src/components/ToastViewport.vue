<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue"
import type { IconDefinition, IconName } from "@xcmm1543/miuui-icons"
import { regionClass, regionStyle, type MaterialName } from "@xcmm1543/miuui-core"
import type { ToastPosition, ToastStyleVariant, ToastViewportProps } from "../types"
import { useMounted } from "../composables/useMounted"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { mergeStyle, resolveMaterialValue } from "../composables/usePluginResolution"
import {
  isPrimaryToastViewport,
  registerToastViewport,
  unregisterToastViewport,
  useToast,
  type ToastItem,
  type ToastVariant,
} from "../composables/useToast"
import Icon from "./Icon.vue"

function isIconDefinition(icon: unknown): icon is IconDefinition {
  return Boolean(
    icon &&
    typeof icon === "object" &&
    "viewBox" in icon &&
    "content" in icon &&
    typeof (icon as { viewBox?: unknown }).viewBox === "string",
  )
}

function defaultIconName(variant: ToastVariant): IconName {
  return variant === "success" ? "checkCircle" : "infoCircle"
}

const props = withDefaults(defineProps<ToastViewportProps>(), {
  position: "bottom-right",
  styleVariant: "accent",
  radius: "default",
})

const { toasts, toastDefaults, dismiss } = useToast()
const theme = useMiuTheme()
const { t } = useMiuI18n()
const mounted = useMounted()
const viewportId = Symbol("miu-toast-viewport")
const isPrimary = computed(() => isPrimaryToastViewport(viewportId))

onMounted(() => {
  registerToastViewport(viewportId)
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

interface ResolvedToastEntry {
  item: ToastItem
  styleVariant: ToastStyleVariant
  radius: string
  materialName: MaterialName
  style: ReturnType<typeof mergeStyle>
  closable: boolean
  dismissOnClick: boolean
}

function resolveEntry(item: ToastItem): ResolvedToastEntry {
  const styleVariant =
    item.styleVariant ?? toastDefaults.value.styleVariant ?? props.styleVariant ?? "accent"
  const radius =
    styleVariant === "pill"
      ? "full"
      : (item.radius ?? toastDefaults.value.radius ?? props.radius ?? "default")
  const requestedMaterial = item.material ?? toastDefaults.value.material ?? props.material
  const mat = resolveMaterialValue(
    requestedMaterial,
    {
      theme: theme.theme.value,
      density: theme.density.value,
      radius: theme.radius.value,
      material: theme.material.value,
      motionTier: theme.motionTier.value,
    },
    "ToastViewport",
  )
  return {
    item,
    styleVariant,
    radius,
    materialName: mat.name,
    style: mergeStyle(regionStyle(props, "toast"), mat.tokens),
    closable: item.closable ?? styleVariant !== "pill",
    dismissOnClick: item.dismissOnClick ?? styleVariant === "pill",
  }
}

const groupedByPosition = computed(() => {
  const map = new Map<ToastPosition, ResolvedToastEntry[]>()
  for (const item of visibleToasts.value) {
    const pos = item.position ?? basePosition.value
    const bucket = map.get(pos)
    const entry = resolveEntry(item)
    if (bucket) bucket.push(entry)
    else map.set(pos, [entry])
  }
  if (map.size === 0) {
    map.set(basePosition.value, [])
  }
  return Array.from(map.entries())
})

function onToastClick(entry: ResolvedToastEntry): void {
  if (entry.dismissOnClick) {
    dismiss(entry.item.id)
  }
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
        v-for="entry in list"
        :key="entry.item.id"
        :class="regionClass(props, 'toast', 'miu-toast')"
        :style="entry.style"
        :data-variant="entry.item.variant"
        :data-style-variant="entry.styleVariant"
        :data-material="entry.materialName"
        :data-miu-radius="entry.radius"
        :data-clickable="entry.dismissOnClick || undefined"
        :role="entry.item.variant === 'error' ? 'alert' : 'status'"
        @click="onToastClick(entry)"
      >
        <slot name="toast" :toast="entry.item" :dismiss="() => dismiss(entry.item.id)">
          <span
            v-if="
              entry.item.icon !== false &&
              ($slots.icon || entry.item.icon || entry.item.variant !== 'default')
            "
            :class="regionClass(props, 'icon', 'miu-toast__icon')"
            :style="regionStyle(props, 'icon')"
            aria-hidden="true"
          >
            <slot name="icon" :toast="entry.item">
              <Icon
                v-if="typeof entry.item.icon === 'string' || isIconDefinition(entry.item.icon)"
                :name="entry.item.icon"
                size="md"
              />
              <component
                :is="entry.item.icon"
                v-else-if="entry.item.icon"
                class="miu-toast__custom-icon"
              />
              <Icon v-else :name="defaultIconName(entry.item.variant)" size="md" />
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
              <slot name="title" :toast="entry.item">{{ entry.item.title }}</slot>
            </p>
            <p
              v-if="entry.item.description || $slots.description"
              :class="regionClass(props, 'description', 'miu-toast__description')"
              :style="regionStyle(props, 'description')"
            >
              <slot name="description" :toast="entry.item">{{ entry.item.description }}</slot>
            </p>
            <div v-if="entry.item.action || $slots.actions" class="miu-toast__actions">
              <slot name="actions" :toast="entry.item">
                <button
                  v-if="entry.item.action"
                  type="button"
                  :class="regionClass(props, 'action', 'miu-toast__action')"
                  :style="regionStyle(props, 'action')"
                  @click.stop="onAction(entry.item)"
                >
                  {{ entry.item.action.label }}
                </button>
              </slot>
            </div>
          </div>

          <button
            v-if="entry.closable"
            type="button"
            :class="regionClass(props, 'close', 'miu-toast__close')"
            :style="regionStyle(props, 'close')"
            :aria-label="t('toast.dismiss')"
            @click.stop="dismiss(entry.item.id)"
          >
            <Icon name="close" size="sm" />
          </button>
        </slot>
      </div>
    </TransitionGroup>
  </Teleport>
</template>
