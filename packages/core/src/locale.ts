export type LocaleCode = string

export type MiuMessageParams = Record<string, string | number | boolean | null | undefined>

export interface MiuPluralMessage {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

export type MiuMessage = string | MiuPluralMessage

export interface MiuMessageTree {
  [key: string]: MiuMessage | MiuMessageTree
}

export interface MiuI18nOptions {
  locale?: LocaleCode
  fallbackLocale?: LocaleCode
  messages?: Record<LocaleCode, MiuMessageTree>
}

export interface MiuI18n {
  readonly locale: LocaleCode
  readonly fallbackLocale: LocaleCode
  setLocale(locale: LocaleCode): void
  t(key: string, params?: MiuMessageParams): string
  has(key: string): boolean
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string
  formatDate(value: Date | number, options?: Intl.DateTimeFormatOptions): string
}

export const DEFAULT_LOCALE = "zh-CN"
export const DEFAULT_FALLBACK_LOCALE = "en-US"

export const zhCN: MiuMessageTree = {
  common: {
    loading: "加载中",
    close: "关闭",
    confirm: "确定",
    cancel: "取消",
    back: "返回",
    toggle: "切换",
    search: "搜索",
    clear: "清空",
    menu: "菜单",
  },
  dialog: {
    close: "关闭对话框",
    title: "对话框",
  },
  input: {
    clear: "清空",
  },
  select: {
    placeholder: "请选择",
    noOptions: "暂无选项",
  },
  toast: {
    dismiss: "关闭通知",
  },
  table: {
    empty: "暂无数据",
    loading: "加载中",
    selected: {
      one: "已选择 {count} 项",
      other: "已选择 {count} 项",
    },
  },
  emptyState: {
    title: "暂无内容",
  },
  messageComposer: {
    send: "发送",
  },
  pagination: {
    previous: "上一页",
    next: "下一页",
    label: "分页",
  },
  toc: {
    title: "本页",
  },
  breadcrumb: {
    label: "面包屑",
  },
  commandPalette: {
    title: "搜索文档",
    placeholder: "搜索组件、指南…",
    empty: "没有匹配结果",
    navigate: "选择",
    open: "打开",
    close: "关闭",
  },
}

export const enUS: MiuMessageTree = {
  common: {
    loading: "Loading",
    close: "Close",
    confirm: "Confirm",
    cancel: "Cancel",
    back: "Back",
    toggle: "Toggle",
    search: "Search",
    clear: "Clear",
    menu: "Menu",
  },
  dialog: {
    close: "Close dialog",
    title: "Dialog",
  },
  input: {
    clear: "Clear",
  },
  select: {
    placeholder: "Select an option",
    noOptions: "No options",
  },
  toast: {
    dismiss: "Dismiss notification",
  },
  table: {
    empty: "No data",
    loading: "Loading",
    selected: {
      one: "{count} item selected",
      other: "{count} items selected",
    },
  },
  emptyState: {
    title: "Nothing here yet",
  },
  messageComposer: {
    send: "Send",
  },
  pagination: {
    previous: "Previous page",
    next: "Next page",
    label: "Pagination",
  },
  toc: {
    title: "On this page",
  },
  breadcrumb: {
    label: "Breadcrumb",
  },
  commandPalette: {
    title: "Search docs",
    placeholder: "Search components, guides…",
    empty: "No results",
    navigate: "Navigate",
    open: "Open",
    close: "Close",
  },
}

export const BUILTIN_MESSAGES: Record<LocaleCode, MiuMessageTree> = {
  "zh-CN": zhCN,
  "en-US": enUS,
}

export const availableLocales: LocaleCode[] = Object.keys(BUILTIN_MESSAGES)

const PLURAL_KEYS = ["zero", "one", "two", "few", "many", "other"] as const

function isMessageTree(value: MiuMessage | MiuMessageTree): value is MiuMessageTree {
  if (typeof value !== "object" || value === null) return false
  return !PLURAL_KEYS.some((key) => typeof (value as MiuPluralMessage)[key] === "string")
}

function isPluralMessage(value: MiuMessage | MiuMessageTree): value is MiuPluralMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as MiuPluralMessage).other === "string"
  )
}

/** Deep-merge message trees; plural message objects replace atomically. */
export function mergeMessages(
  base: MiuMessageTree,
  overrides: MiuMessageTree = {},
): MiuMessageTree {
  const result: MiuMessageTree = { ...base }
  for (const [key, override] of Object.entries(overrides)) {
    const current = result[key]
    if (isMessageTree(override) && current && isMessageTree(current)) {
      result[key] = mergeMessages(current, override)
    } else {
      result[key] = override
    }
  }
  return result
}

function getMessage(tree: MiuMessageTree, key: string): MiuMessage | undefined {
  let current: MiuMessage | MiuMessageTree = tree
  for (const segment of key.split(".")) {
    if (!isMessageTree(current)) return undefined
    const next: MiuMessage | MiuMessageTree | undefined = (current as MiuMessageTree)[segment]
    if (next === undefined) return undefined
    current = next
  }
  return isPluralMessage(current) || typeof current === "string" ? current : undefined
}

function interpolate(template: string, params: MiuMessageParams): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name]
    return value === undefined || value === null ? `{${name}}` : String(value)
  })
}

function localeCandidates(locale: LocaleCode, fallbackLocale: LocaleCode): string[] {
  const candidates = [locale]
  const language = locale.split("-")[0]
  if (language && language !== locale) candidates.push(language)
  candidates.push(fallbackLocale)
  candidates.push(DEFAULT_FALLBACK_LOCALE, DEFAULT_LOCALE)
  return [...new Set(candidates)]
}

export function createMiuI18n(options: MiuI18nOptions = {}): MiuI18n {
  const registry = new Map<LocaleCode, MiuMessageTree>(
    Object.entries({ ...BUILTIN_MESSAGES, ...options.messages }),
  )
  let currentLocale = options.locale ?? DEFAULT_LOCALE
  let currentFallback = options.fallbackLocale ?? DEFAULT_FALLBACK_LOCALE

  function resolve(key: string): MiuMessage | undefined {
    for (const locale of localeCandidates(currentLocale, currentFallback)) {
      const tree = registry.get(locale)
      if (!tree) continue
      const message = getMessage(tree, key)
      if (message !== undefined) return message
    }
    return undefined
  }

  function t(key: string, params: MiuMessageParams = {}): string {
    const message = resolve(key)
    if (message === undefined) return key
    if (isPluralMessage(message)) {
      const count = Number(params.count ?? 0)
      const category = new Intl.PluralRules(currentLocale).select(count)
      const template = message[category as keyof MiuPluralMessage] ?? message.other
      return interpolate(template, params)
    }
    return interpolate(message, params)
  }

  return {
    get locale() {
      return currentLocale
    },
    get fallbackLocale() {
      return currentFallback
    },
    setLocale(locale: LocaleCode) {
      currentLocale = locale
    },
    t,
    has(key: string) {
      return resolve(key) !== undefined
    },
    formatNumber(value: number, formatOptions?: Intl.NumberFormatOptions) {
      return new Intl.NumberFormat(currentLocale, formatOptions).format(value)
    },
    formatDate(value: Date | number, formatOptions?: Intl.DateTimeFormatOptions) {
      return new Intl.DateTimeFormat(currentLocale, formatOptions).format(value)
    },
  }
}
