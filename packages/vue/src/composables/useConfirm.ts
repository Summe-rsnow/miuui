import { readonly, ref } from "vue"
import type { MaterialName, Radius } from "@miuui/core"
import type { DialogSize } from "@miuui/tokens"

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  size?: DialogSize
  radius?: Radius | "default"
  material?: MaterialName
}

export interface ActiveConfirm extends ConfirmOptions {
  id: number
}

const currentConfirm = ref<ActiveConfirm | null>(null)
let pendingResolve: ((accepted: boolean) => void) | null = null
let sequence = 0

export function resolveConfirm(accepted: boolean): void {
  const resolver = pendingResolve
  pendingResolve = null
  currentConfirm.value = null
  resolver?.(accepted)
}

export function confirm(options: ConfirmOptions): Promise<boolean> {
  if (pendingResolve) {
    resolveConfirm(false)
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
    confirm,
    resolveConfirm,
  }
}
