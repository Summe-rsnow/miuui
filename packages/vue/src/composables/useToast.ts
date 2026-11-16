import { markRaw, readonly, ref, type Component, type Ref } from "vue"
import type { MaterialName, Radius } from "@xcmm1543/miuui-core"
import type { IconName } from "@xcmm1543/miuui-icons"
import type { ToastPosition, ToastStyleVariant } from "../types"

export type ToastVariant = "default" | "success" | "error" | "warning" | "info"

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  styleVariant?: ToastStyleVariant
  material?: MaterialName
  position?: ToastPosition
  radius?: Radius | "default"
  icon?: IconName | Component | false
  closable?: boolean
  action?: ToastAction
  duration?: number
}

export interface ToastDefaults {
  position?: ToastPosition
  material?: MaterialName
  styleVariant?: ToastStyleVariant
  radius?: Radius | "default"
  duration?: number
  max?: number
  closable?: boolean
}

export interface ToastItem extends Omit<ToastOptions, "icon"> {
  id: number
  variant: ToastVariant
  duration: number
  closable: boolean
  icon?: IconName | Component | false
}

const items = ref<ToastItem[]>([])
const activeViewports = ref<symbol[]>([])
const defaults = ref<ToastDefaults>({})
const timers = new Map<number, ReturnType<typeof setTimeout>>()
let sequence = 0

export function registerToastViewport(id: symbol): void {
  if (!activeViewports.value.includes(id)) {
    activeViewports.value = [...activeViewports.value, id]
  }
}

export function unregisterToastViewport(id: symbol): void {
  activeViewports.value = activeViewports.value.filter((entry) => entry !== id)
}

export function isPrimaryToastViewport(id: symbol): boolean {
  return activeViewports.value[0] === id
}

export function setToastDefaults(next: ToastDefaults): void {
  defaults.value = { ...defaults.value, ...next }
}

export function resetToastDefaults(): void {
  defaults.value = {}
}

function dismiss(id: number): void {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
  items.value = items.value.filter((item) => item.id !== id)
}

function toast(options: ToastOptions): number {
  const id = ++sequence
  const resolvedIcon =
    options.icon && typeof options.icon === "object" ? markRaw(options.icon) : options.icon
  const item: ToastItem = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant ?? "default",
    styleVariant: options.styleVariant ?? defaults.value.styleVariant,
    material: options.material ?? defaults.value.material,
    position: options.position ?? defaults.value.position,
    radius: options.radius ?? defaults.value.radius,
    icon: resolvedIcon,
    closable: options.closable ?? defaults.value.closable ?? true,
    action: options.action,
    duration: options.duration ?? defaults.value.duration ?? 4000,
  }

  const max = defaults.value.max
  let nextItems = [...items.value, item]
  if (typeof max === "number" && max > 0 && nextItems.length > max) {
    const overflow = nextItems.slice(0, nextItems.length - max)
    for (const old of overflow) {
      const timer = timers.get(old.id)
      if (timer) {
        clearTimeout(timer)
        timers.delete(old.id)
      }
    }
    nextItems = nextItems.slice(nextItems.length - max)
  }
  items.value = nextItems

  if (typeof window !== "undefined" && item.duration > 0) {
    timers.set(
      id,
      setTimeout(() => dismiss(id), item.duration),
    )
  }
  return id
}

function clear(): void {
  for (const timer of timers.values()) clearTimeout(timer)
  timers.clear()
  items.value = []
}

export type ToastShorthandOptions = Omit<ToastOptions, "title" | "variant">

export interface ToastFn {
  (options: ToastOptions): number
  success: (title: string, options?: ToastShorthandOptions) => number
  error: (title: string, options?: ToastShorthandOptions) => number
  warning: (title: string, options?: ToastShorthandOptions) => number
  info: (title: string, options?: ToastShorthandOptions) => number
}

const toastApi: ToastFn = Object.assign(toast, {
  success: (title: string, options?: ToastShorthandOptions) =>
    toast({ ...options, title, variant: "success" }),
  error: (title: string, options?: ToastShorthandOptions) =>
    toast({ ...options, title, variant: "error" }),
  warning: (title: string, options?: ToastShorthandOptions) =>
    toast({ ...options, title, variant: "warning" }),
  info: (title: string, options?: ToastShorthandOptions) =>
    toast({ ...options, title, variant: "info" }),
})

export function useToast() {
  return {
    toasts: items as Readonly<Ref<readonly ToastItem[]>>,
    toastDefaults: readonly(defaults),
    setToastDefaults,
    resetToastDefaults,
    toast: toastApi,
    dismiss,
    clear,
  }
}
