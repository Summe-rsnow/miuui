<script setup lang="ts">
import { computed, provide } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ListProps } from "../types"
import { provideListDensity } from "../composables/useListContext"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import { MIU_SIZE_HINT_KEY } from "../composables/useSizeHint"

const props = withDefaults(defineProps<ListProps>(), {
  gap: "xs",
  bordered: false,
  dividers: false,
  radius: "default",
})

provideListDensity(() => props.density)
provide(
  MIU_SIZE_HINT_KEY,
  computed(() => (props.density === "compact" ? "sm" : undefined)),
)

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "List")
</script>

<template>
  <div
    role="list"
    :class="
      regionClass(props, 'root', 'miu-list', `miu-list--gap-${gap}`, {
        'miu-list--bordered': bordered,
        'miu-list--dividers': dividers,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-radius="radius"
    :data-density="density"
    :data-material="materialName"
  >
    <slot />
  </div>
</template>
