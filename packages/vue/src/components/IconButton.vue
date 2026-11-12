<script setup lang="ts">
import type { IconButtonProps } from "../types"
import Button from "./Button.vue"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<IconButtonProps>(), {
  variant: "ghost",
  radius: "default",
  loading: false,
  disabled: false,
  block: false,
  type: "button",
})

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <Button
    :variant="variant"
    :size="size"
    :radius="radius"
    :icon-size="iconSize"
    :material="material"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :type="type"
    :class-names="classNames"
    :styles="styles"
    icon-only
    :aria-label="props.label"
    @click="$emit('click', $event)"
  >
    <template #icon>
      <slot name="icon">
        <Icon v-if="icon" :name="icon" />
      </slot>
    </template>
  </Button>
</template>
