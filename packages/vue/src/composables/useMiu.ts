import { computed, inject, ref, type ComputedRef, type InjectionKey, type Ref } from "vue"
import {
  createMiuI18n,
  DEFAULT_FALLBACK_LOCALE,
  DEFAULT_LOCALE,
  type Density,
  type LocaleCode,
  type MaterialName,
  type MiuMessageParams,
  type MotionTier,
  type Radius,
} from "@miuui/core"

export interface MiuI18nContext {
  locale: Ref<LocaleCode>
  fallbackLocale: Ref<LocaleCode>
  availableLocales: readonly LocaleCode[]
  t: (key: string, params?: MiuMessageParams) => string
  setLocale: (locale: LocaleCode) => void
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatDate: (value: Date | number, options?: Intl.DateTimeFormatOptions) => string
}

export interface MiuThemeContext {
  theme: ComputedRef<"light" | "dark">
  density: ComputedRef<Density>
  radius: ComputedRef<Radius>
  material: ComputedRef<MaterialName>
  motionTier: ComputedRef<MotionTier>
  i18n: MiuI18nContext
  portalTarget: Ref<HTMLElement | undefined>
}

export const MIU_THEME_KEY: InjectionKey<MiuThemeContext> = Symbol("miu-theme")

const fallbackLocale = ref(DEFAULT_LOCALE)
const fallbackI18n = createMiuI18n({ locale: fallbackLocale.value })

const fallbackTheme: MiuThemeContext = {
  theme: computed(() => "light"),
  density: computed(() => "default"),
  radius: computed(() => "md"),
  material: computed(() => "solid"),
  motionTier: computed(() => "full"),
  i18n: {
    locale: fallbackLocale,
    fallbackLocale: ref(DEFAULT_FALLBACK_LOCALE),
    availableLocales: [DEFAULT_LOCALE, DEFAULT_FALLBACK_LOCALE],
    t: (key, params) => {
      void fallbackLocale.value
      return fallbackI18n.t(key, params)
    },
    setLocale: (locale) => {
      fallbackLocale.value = locale
      fallbackI18n.setLocale(locale)
    },
    formatNumber: (value, options) => {
      void fallbackLocale.value
      return fallbackI18n.formatNumber(value, options)
    },
    formatDate: (value, options) => {
      void fallbackLocale.value
      return fallbackI18n.formatDate(value, options)
    },
  },
  portalTarget: ref<HTMLElement>(),
}

export function useMiuTheme(): MiuThemeContext {
  return inject(MIU_THEME_KEY, fallbackTheme)
}

export function useMiuI18n(): MiuI18nContext {
  return useMiuTheme().i18n
}
