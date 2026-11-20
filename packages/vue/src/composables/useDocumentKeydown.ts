import { onBeforeUnmount, watch } from "vue"

export function useDocumentKeydown(
  handler: (event: KeyboardEvent) => void,
  enabled: () => boolean = () => true,
): void {
  let attached = false

  const attach = () => {
    if (attached || typeof document === "undefined") return
    document.addEventListener("keydown", handler)
    attached = true
  }

  const detach = () => {
    if (!attached || typeof document === "undefined") return
    document.removeEventListener("keydown", handler)
    attached = false
  }

  watch(
    enabled,
    (active) => {
      if (active) attach()
      else detach()
    },
    { immediate: true },
  )

  onBeforeUnmount(detach)
}
