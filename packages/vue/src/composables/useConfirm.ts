import { computed, readonly, ref } from "vue"
import type { MaterialName, Radius } from "@xcmm1543/miuui-core"
import type { DialogSize } from "@xcmm1543/miuui-tokens"

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  size?: DialogSize
  radius?: Radius | "default"
  material?: MaterialName
  onConfirm?: () => void | Promise<void>
}

export interface ActiveConfirm extends ConfirmOptions {
  id: number
}

export interface ConfirmState {
  current: ActiveConfirm | null
  loading: boolean
}

const currentConfirm = ref<ActiveConfirm | null>(null)
const confirmLoading = ref(false)
const confirmState = computed<ConfirmState>(() => ({
  current: currentConfirm.value,
  loading: confirmLoading.value,
}))
let pendingResolve: ((accepted: boolean) => void) | null = null
let sequence = 0

export function resolveConfirm(accepted: boolean): void | Promise<void> {
  if (!accepted) {
    if (confirmLoading.value) return
    const resolver = pendingResolve
    pendingResolve = null
    currentConfirm.value = null
    resolver?.(false)
    return
  }

  if (confirmLoading.value) return
  const handler = currentConfirm.value?.onConfirm
  if (!handler) {
    const resolver = pendingResolve
    pendingResolve = null
    currentConfirm.value = null
    resolver?.(true)
    return
  }

  confirmLoading.value = true
  return Promise.resolve()
    .then(() => handler())
    .then(() => {
      const resolver = pendingResolve
      pendingResolve = null
      currentConfirm.value = null
      resolver?.(true)
    })
    .finally(() => {
      confirmLoading.value = false
    })
}

export function confirm(options: ConfirmOptions): Promise<boolean> {
  if (pendingResolve) {
    const prev = pendingResolve
    pendingResolve = null
    confirmLoading.value = false
    currentConfirm.value = null
    prev(false)
  }
  const id = ++sequence
  currentConfirm.value = { id, ...options }
  return new Promise<boolean>((resolve) => {
    pendingResolve = resolve
  })
}

export function useConfirm() {
  return {
    currentConfirm: readonly(currentConfirm),
    loading: readonly(confirmLoading),
    confirmState: readonly(confirmState),
    confirm,
    resolveConfirm,
  }
}
