import { onBeforeUnmount, watch } from "vue"

let lockCount = 0
let previousOverflow: string | null = null

function acquireLock(): void {
  if (typeof document === "undefined") return
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
  }
  lockCount += 1
}

function releaseLock(): void {
  if (typeof document === "undefined" || lockCount === 0) return
  lockCount -= 1
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow ?? ""
    previousOverflow = null
  }
}

export function useScrollLock(active: () => boolean): void {
  let locked = false

  const sync = (next: boolean) => {
    if (next === locked) return
    locked = next
    if (next) acquireLock()
    else releaseLock()
  }

  watch(active, sync, { immediate: true })

  onBeforeUnmount(() => {
    if (locked) {
      locked = false
      releaseLock()
    }
  })
}
