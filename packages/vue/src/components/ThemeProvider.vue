<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, watch } from "vue"
import {
  availableLocales as builtinLocales,
  createMiuI18n,
  DEFAULT_FALLBACK_LOCALE,
  DEFAULT_LOCALE,
  themeAttributes,
  type Density,
  type LocaleCode,
  type MaterialName,
  type MiuMessageTree,
  type MotionTier,
  type Radius,
  type ThemeMode,
} from "@miuui/core"
import type { ToastPosition, ToastStyleVariant } from "../types"
import { semanticTokensForSeed } from "@miuui/tokens"
import { MIU_THEME_KEY, type MiuThemeContext } from "../composables/useMiu"
import { resolveMaterialValue, resolveMotionValue } from "../composables/usePluginResolution"
import { useConfirm } from "../composables/useConfirm"
import ConfirmDialog from "./ConfirmDialog.vue"
import ToastViewport from "./ToastViewport.vue"

const props = withDefaults(
  defineProps<{
    theme?: ThemeMode
    density?: Density
    radius?: Radius
    material?: MaterialName
    motionTier?: MotionTier
    accentSeed?: string
    locale?: LocaleCode
    fallbackLocale?: LocaleCode
    messages?: Record<LocaleCode, MiuMessageTree>
    toastPosition?: ToastPosition
    toastMaterial?: MaterialName
    toastStyleVariant?: ToastStyleVariant
    toastMax?: number
    as?: string
  }>(),
  {
    theme: "light",
    density: "default",
    radius: "md",
    material: "solid",
    motionTier: "full",
    locale: DEFAULT_LOCALE,
    fallbackLocale: DEFAULT_FALLBACK_LOCALE,
    as: "div",
  },
)

const systemDark = ref(false)
let mediaQuery: MediaQueryList | undefined

function syncSystemTheme(event?: MediaQueryListEvent): void {
  systemDark.value = event ? event.matches : Boolean(mediaQuery?.matches)
}

onMounted(() => {
  if (props.theme !== "system" || typeof window === "undefined") return
  mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  syncSystemTheme()
  mediaQuery.addEventListener("change", syncSystemTheme)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener("change", syncSystemTheme)
})

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

const providerStyle = computed<Record<string, string> | undefined>(() => {
  const seedTokens = props.accentSeed
    ? semanticTokensForSeed(props.accentSeed, resolvedTheme.value)
    : undefined
  const matTokens = resolvedMaterial.value.tokens
  const motTokens = resolvedMotion.value.tokens
  if (!seedTokens && !matTokens && !motTokens) return undefined
  return { ...seedTokens, ...matTokens, ...motTokens }
})

const isRootProvider = inject(MIU_THEME_KEY, null) === null

const { currentConfirm, resolveConfirm } = useConfirm()
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
      @confirm="resolveConfirm(true)"
      @cancel="resolveConfirm(false)"
      @update:open="
        (open) => {
          if (!open) resolveConfirm(false)
        }
      "
    />
  </component>
</template>
