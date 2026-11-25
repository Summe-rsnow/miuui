<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, watch } from "vue"
import {
  availableLocales as builtinLocales,
  createMiuI18n,
  DEFAULT_FALLBACK_LOCALE,
  DEFAULT_LOCALE,
  themeAttributes,
} from "@xcmm1543/miuui-core"
import type { ThemeProviderProps, ZIndexLayer } from "../types"
import { semanticTokensForSeed, Z_INDEX } from "@xcmm1543/miuui-tokens"
import { MIU_ICONS_KEY, MIU_THEME_KEY, type MiuThemeContext } from "../composables/useMiu"
import { resolveMaterialValue, resolveMotionValue } from "../composables/usePluginResolution"
import { useConfirm } from "../composables/useConfirm"
import ConfirmDialog from "./ConfirmDialog.vue"
import ToastViewport from "./ToastViewport.vue"

const props = withDefaults(defineProps<ThemeProviderProps>(), {
  theme: "light",
  density: "default",
  radius: "md",
  material: "solid",
  motionTier: "full",
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_FALLBACK_LOCALE,
  as: "div",
})

const systemDark = ref(false)
let mediaQuery: MediaQueryList | undefined

function syncSystemTheme(event?: MediaQueryListEvent): void {
  systemDark.value = event ? event.matches : Boolean(mediaQuery?.matches)
}

function attachMediaQuery(): void {
  if (typeof window === "undefined" || mediaQuery) return
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  syncSystemTheme()
  mediaQuery.addEventListener("change", syncSystemTheme)
}

function detachMediaQuery(): void {
  if (!mediaQuery) return
  mediaQuery.removeEventListener("change", syncSystemTheme)
  mediaQuery = undefined
}

onMounted(() => {
  if (props.theme === "system") attachMediaQuery()
})

watch(
  () => props.theme,
  (next) => {
    if (next === "system") attachMediaQuery()
    else detachMediaQuery()
  },
)

onBeforeUnmount(detachMediaQuery)

const resolvedTheme = computed<"light" | "dark">(() => {
  if (props.theme === "system") return systemDark.value ? "dark" : "light"
  return props.theme
})

const portalTarget = ref<HTMLElement>()
const locale = ref(props.locale)
const fallbackLocale = ref(props.fallbackLocale)
const messagesVersion = ref(0)
let i18n = createMiuI18n({
  locale: locale.value,
  fallbackLocale: fallbackLocale.value,
  messages: props.messages,
})

watch(
  () => [props.locale, props.fallbackLocale, props.messages] as const,
  () => {
    locale.value = props.locale
    fallbackLocale.value = props.fallbackLocale
    i18n = createMiuI18n({
      locale: locale.value,
      fallbackLocale: fallbackLocale.value,
      messages: props.messages,
    })
    messagesVersion.value += 1
  },
)

const availableLocales = computed(() => [
  ...new Set([...builtinLocales, ...Object.keys(props.messages ?? {})]),
])

const resolvedMotion = computed(() => resolveMotionValue(props.motionTier, "ThemeProvider"))
const resolvedMaterial = computed(() =>
  resolveMaterialValue(
    props.material,
    {
      theme: resolvedTheme.value,
      density: props.density,
      radius: props.radius,
      material: props.material,
      motionTier: resolvedMotion.value.name,
    },
    "ThemeProvider",
  ),
)

const Z_INDEX_ENTRIES: Array<[ZIndexLayer, string]> = [
  ["sticky", "--miu-z-sticky"],
  ["modalBackdrop", "--miu-z-modal-backdrop"],
  ["modal", "--miu-z-modal"],
  ["dropdown", "--miu-z-dropdown"],
  ["popover", "--miu-z-popover"],
  ["tooltip", "--miu-z-tooltip"],
  ["loading", "--miu-z-loading"],
  ["toast", "--miu-z-toast"],
]

const providerStyle = computed<Record<string, string> | undefined>(() => {
  const seedTokens = props.accentSeed
    ? semanticTokensForSeed(props.accentSeed, resolvedTheme.value)
    : undefined
  const matTokens = resolvedMaterial.value.tokens
  const motTokens = resolvedMotion.value.tokens

  const offset =
    typeof props.zIndexOffset === "number" && Number.isFinite(props.zIndexOffset)
      ? props.zIndexOffset
      : 0
  let zTokens: Record<string, string> | undefined
  if (offset !== 0 || props.zIndex) {
    const entries: Record<string, string> = {}
    for (const [layer, cssVar] of Z_INDEX_ENTRIES) {
      const override = props.zIndex?.[layer]
      if (typeof override === "number" && Number.isFinite(override)) {
        entries[cssVar] = String(override)
      } else if (offset !== 0) {
        entries[cssVar] = String(Z_INDEX[layer] + offset)
      }
    }
    if (Object.keys(entries).length > 0) zTokens = entries
  }

  if (!seedTokens && !matTokens && !motTokens && !zTokens) return undefined
  return { ...seedTokens, ...matTokens, ...motTokens, ...zTokens }
})

const isRootProvider = inject(MIU_THEME_KEY, null) === null

const { currentConfirm, loading: confirmLoading, resolveConfirm } = useConfirm()

function handleConfirmAccept(): void {
  void Promise.resolve(resolveConfirm(true)).catch(() => undefined)
}

function handleConfirmCancel(): void {
  if (!confirmLoading.value) {
    resolveConfirm(false)
  }
}
const context: MiuThemeContext = {
  theme: resolvedTheme,
  density: computed(() => props.density),
  radius: computed(() => props.radius),
  material: computed(() => resolvedMaterial.value.name),
  motionTier: computed(() => resolvedMotion.value.name),
  i18n: {
    locale,
    fallbackLocale,
    availableLocales: availableLocales.value,
    t: (key, params) => {
      void messagesVersion.value
      void locale.value
      return i18n.t(key, params)
    },
    setLocale: (next) => {
      locale.value = next
      i18n.setLocale(next)
      messagesVersion.value += 1
    },
    formatNumber: (value, options) => {
      void locale.value
      return i18n.formatNumber(value, options)
    },
    formatDate: (value, options) => {
      void locale.value
      return i18n.formatDate(value, options)
    },
  },
  portalTarget,
}

provide(MIU_THEME_KEY, context)

const inheritedIcons = inject(MIU_ICONS_KEY, undefined)
provide(
  MIU_ICONS_KEY,
  computed(() => props.icons ?? inheritedIcons?.value),
)

const attrs = computed(() =>
  themeAttributes({
    theme: resolvedTheme.value,
    density: props.density,
    radius: props.radius,
    material: resolvedMaterial.value.name,
    motionTier: resolvedMotion.value.name,
  }),
)
</script>

<template>
  <component :is="as" class="miu-theme-provider" v-bind="attrs" :style="providerStyle">
    <slot />
    <div ref="portalTarget" class="miu-portal-root" />
    <ToastViewport
      v-if="isRootProvider"
      :position="toastPosition"
      :material="toastMaterial"
      :style-variant="toastStyleVariant"
      :max="toastMax"
    />
    <ConfirmDialog
      v-if="isRootProvider && currentConfirm"
      :open="Boolean(currentConfirm)"
      :title="currentConfirm.title"
      :description="currentConfirm.description"
      :confirm-label="currentConfirm.confirmLabel"
      :cancel-label="currentConfirm.cancelLabel"
      :danger="currentConfirm.danger"
      :size="currentConfirm.size"
      :radius="currentConfirm.radius"
      :material="currentConfirm.material"
      :loading="confirmLoading"
      @confirm="handleConfirmAccept"
      @cancel="handleConfirmCancel"
      @update:open="
        (open) => {
          if (!open && !confirmLoading) handleConfirmCancel()
        }
      "
    />
  </component>
</template>
