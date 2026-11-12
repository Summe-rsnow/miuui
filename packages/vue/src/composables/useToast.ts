import { readonly, ref } from "vue"

export type ToastVariant = "default" | "success" | "error" | "warning" | "info"

export interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

export interface ToastItem extends ToastOptions {
  id: number
  variant: ToastVariant
  duration: number
}

const items = ref<ToastItem[]>([])
const activeViewports = ref<symbol[]>([])
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
  const item: ToastItem = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant ?? "default",
    duration: options.duration ?? 4000,
  }
  items.value = [...items.value, item]

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

export function useToast() {
  return {
    toasts: readonly(items),
    toast,
    dismiss,
    clear,
  }
}
