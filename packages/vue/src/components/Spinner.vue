<script setup lang="ts">
import { computed } from "vue"
import { regionClass, regionStyle } from "@miuui/core"
import type { SpinnerProps } from "../types"
import { useMiuI18n } from "../composables/useMiu"

const props = withDefaults(defineProps<SpinnerProps>(), {
  size: "md",
})

const { t } = useMiuI18n()
const accessibleLabel = computed(() => props.label ?? t("common.loading"))
</script>

<template>
  <span
    :class="regionClass(props, 'root', 'miu-spinner')"
    :style="regionStyle(props, 'root')"
    role="status"
    :aria-label="accessibleLabel"
    :data-miu-icon-size="size"
  />
</template>
