import { computed, inject, ref, type ComputedRef, type InjectionKey, type Ref } from "vue"
import {
  createMiuI18n,
  DEFAULT_FALLBACK_LOCALE,
  DEFAULT_LOCALE,
  type Density,
  type LocaleCode,
  type MaterialName,
  type MiuI18n,
  type MiuMessageParams,
  type MotionTier,
  type Radius,
} from "@xcmm1543/miuui-core"

export { MIU_ICONS_KEY, useMiuIcons, type IconOverride, type IconRegistry } from "./useMiuIcons"
export {
  MIU_IMAGE_RESOLVER_KEY,
  useMiuImageResolver,
  useResolvedImageSrc,
  type ImageResolver,
  type UseResolvedImageSrcOptions,
} from "./useMiuImage"

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
  respectReducedMotion: ComputedRef<boolean>
  i18n: MiuI18nContext
  portalTarget: Ref<HTMLElement | undefined>
}

export const MIU_THEME_KEY: InjectionKey<MiuThemeContext> = Symbol("miu-theme")

let fallbackLocaleRef: Ref<LocaleCode> | undefined
let fallbackLocaleFallbackRef: Ref<LocaleCode> | undefined
let fallbackPortalRef: Ref<HTMLElement | undefined> | undefined
let fallbackI18n: MiuI18n | undefined
let fallbackTheme: MiuThemeContext | undefined

function getFallbackI18n(): MiuI18n {
  const loc = (fallbackLocaleRef ??= ref(DEFAULT_LOCALE))
  if (!fallbackI18n) {
    fallbackI18n = createMiuI18n({ locale: loc.value })
  }
  return fallbackI18n
}

function getFallbackTheme(): MiuThemeContext {
  if (fallbackTheme) return fallbackTheme
  const loc = (fallbackLocaleRef ??= ref(DEFAULT_LOCALE))
  const fallbackLoc = (fallbackLocaleFallbackRef ??= ref(DEFAULT_FALLBACK_LOCALE))
  const portal = (fallbackPortalRef ??= ref<HTMLElement>())

  fallbackTheme = {
    theme: computed(() => "light"),
    density: computed(() => "default"),
    radius: computed(() => "md"),
    material: computed(() => "solid"),
    motionTier: computed(() => "full"),
    respectReducedMotion: computed(() => true),
    i18n: {
      locale: loc,
      fallbackLocale: fallbackLoc,
      availableLocales: [DEFAULT_LOCALE, DEFAULT_FALLBACK_LOCALE],
      t: (key, params) => {
        void loc.value
        return getFallbackI18n().t(key, params)
      },
      setLocale: (locale) => {
        loc.value = locale
        getFallbackI18n().setLocale(locale)
      },
      formatNumber: (value, options) => {
        void loc.value
        return getFallbackI18n().formatNumber(value, options)
      },
      formatDate: (value, options) => {
        void loc.value
        return getFallbackI18n().formatDate(value, options)
      },
    },
    portalTarget: portal,
  }
  return fallbackTheme
}

export function useMiuTheme(): MiuThemeContext {
  return inject(MIU_THEME_KEY, null) ?? getFallbackTheme()
}

export function useMiuI18n(): MiuI18nContext {
  return useMiuTheme().i18n
}
