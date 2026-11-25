import {
  computed,
  inject,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
  type Ref,
} from "vue"

export type ImageResolver = (url: string) => string | Promise<string>

export const MIU_IMAGE_RESOLVER_KEY: InjectionKey<ComputedRef<ImageResolver | undefined>> =
  Symbol("miu-image-resolver")

const emptyResolver = computed<ImageResolver | undefined>(() => undefined)

export function useMiuImageResolver(): ComputedRef<ImageResolver | undefined> {
  return inject(MIU_IMAGE_RESOLVER_KEY, emptyResolver)
}

export interface UseResolvedImageSrcOptions {
  enabled?: MaybeRefOrGetter<boolean>
}

export function useResolvedImageSrc(
  source: MaybeRefOrGetter<string | null | undefined>,
  options?: UseResolvedImageSrcOptions,
): {
  resolvedSrc: Ref<string | undefined>
  isResolving: Ref<boolean>
} {
  const resolver = useMiuImageResolver()
  const resolvedSrc = ref<string | undefined>(undefined)
  const isResolving = ref(false)
  let resolveEpoch = 0

  watch(
    [() => toValue(source), resolver, () => (options?.enabled ? toValue(options.enabled) : true)],
    async ([rawUrl, fn, enabled]) => {
      const epoch = ++resolveEpoch
      const url = typeof rawUrl === "string" ? rawUrl.trim() : ""
      if (!url) {
        resolvedSrc.value = undefined
        isResolving.value = false
        return
      }
      if (!fn) {
        resolvedSrc.value = url
        isResolving.value = false
        return
      }
      if (!enabled) {
        resolvedSrc.value = undefined
        isResolving.value = false
        return
      }

      isResolving.value = true
      try {
        const result = fn(url)
        if (typeof result === "string") {
          if (epoch !== resolveEpoch) return
          resolvedSrc.value = result || url
          isResolving.value = false
          return
        }
        const awaited = await result
        if (epoch !== resolveEpoch) return
        resolvedSrc.value = awaited || url
      } catch {
        if (epoch !== resolveEpoch) return
        resolvedSrc.value = url
      } finally {
        if (epoch === resolveEpoch) {
          isResolving.value = false
        }
      }
    },
    { immediate: true },
  )

  return { resolvedSrc, isResolving }
}
