<script setup lang="ts">
import { computed, ref, watch, type ComponentPublicInstance } from "vue"
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from "reka-ui"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { ComboboxOption, ComboboxProps } from "../types"
import { useControlSize } from "../composables/useControlSize"
import { useFormFieldBinding } from "../composables/useFormField"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import Icon from "./Icon.vue"

const props = withDefaults(defineProps<ComboboxProps>(), {
  options: () => [],
  multiple: false,
  radius: "default",
  disabled: false,
  readonly: false,
  invalid: false,
  clearable: false,
  open: undefined,
})

const emit = defineEmits<{
  "update:modelValue": [value: string | number | Array<string | number> | undefined]
  change: [value: string | number | Array<string | number> | undefined]
  "update:open": [value: boolean]
  search: [query: string]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const rootRef = ref<HTMLElement>()
const inputRef = ref<ComponentPublicInstance | HTMLElement | null>(null)
const isComposing = ref(false)
const internalOpen = ref(false)
const internalValue = ref<string | number | Array<string | number> | undefined>(
  props.multiple ? [] : undefined,
)
const filterQuery = ref("")
const displayInputValue = ref("")

const theme = useMiuTheme()
const { t } = useMiuI18n()

const { resolvedSize, resolvedIconSize } = useControlSize({
  size: () => props.size,
  iconSize: () => props.iconSize,
  componentName: "Combobox",
})
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Combobox")
const field = useFormFieldBinding({
  id: () => props.id,
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  invalid: () => props.invalid,
})

const isOpen = computed(() => (props.open !== undefined ? props.open : internalOpen.value))
const currentValue = computed(() =>
  props.modelValue !== undefined ? props.modelValue : internalValue.value,
)

const rekaModelValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(currentValue.value) ? currentValue.value : []
  }
  return Array.isArray(currentValue.value) ? currentValue.value[0] : currentValue.value
})

const selectedOptions = computed<ComboboxOption[]>(() => {
  if (!props.multiple) return []
  const values = Array.isArray(currentValue.value) ? currentValue.value : []
  return values.map(
    (val) => props.options.find((opt) => opt.value === val) ?? { label: String(val), value: val },
  )
})

const hasValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(currentValue.value) && currentValue.value.length > 0
  }
  return currentValue.value !== undefined && currentValue.value !== ""
})

const canClear = computed(
  () => props.clearable && hasValue.value && !field.disabled.value && !field.readonly.value,
)

function defaultFilterFn(option: ComboboxOption, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return (
    option.label.toLowerCase().includes(normalized) ||
    String(option.value).toLowerCase().includes(normalized) ||
    (option.description?.toLowerCase().includes(normalized) ?? false)
  )
}

const filteredOptions = computed(() => {
  const q = filterQuery.value
  if (props.filterFn) {
    return props.options.filter((opt) => props.filterFn!(opt, q))
  }
  return q ? props.options.filter((opt) => defaultFilterFn(opt, q)) : props.options
})

interface OptionGroup {
  name?: string
  options: ComboboxOption[]
}

const groupedOptions = computed<OptionGroup[]>(() => {
  const groups: OptionGroup[] = []
  const byName = new Map<string, OptionGroup>()
  let ungrouped: OptionGroup | undefined

  for (const opt of filteredOptions.value) {
    if (opt.group) {
      let group = byName.get(opt.group)
      if (!group) {
        group = { name: opt.group, options: [] }
        byName.set(opt.group, group)
        groups.push(group)
      }
      group.options.push(opt)
    } else {
      if (!ungrouped) {
        ungrouped = { options: [] }
        groups.push(ungrouped)
      }
      ungrouped.options.push(opt)
    }
  }
  return groups
})

watch(
  () => props.open,
  (next) => {
    if (next === false) filterQuery.value = ""
  },
)

function resolveDisplayValue(val: unknown): string {
  if (props.multiple) return ""
  if (val === undefined || val === null || val === "") return ""
  const found = props.options.find((opt) => opt.value === val)
  return found ? found.label : String(val)
}

function onOpenChange(next: boolean): void {
  if (next && (field.disabled.value || field.readonly.value)) {
    if (props.open === undefined) internalOpen.value = false
    emit("update:open", false)
    return
  }
  if (props.open === undefined) internalOpen.value = next
  if (!next) filterQuery.value = ""
  emit("update:open", next)
}

function onUpdateModelValue(val: unknown): void {
  if (field.disabled.value || field.readonly.value) return
  const next = props.multiple
    ? Array.isArray(val)
      ? val.filter((v): v is string | number => typeof v === "string" || typeof v === "number")
      : []
    : typeof val === "string" || typeof val === "number"
      ? val
      : undefined
  if (props.modelValue === undefined) internalValue.value = next
  emit("update:modelValue", next)
  emit("change", next)
}

function removeTag(value: string | number): void {
  if (field.disabled.value || field.readonly.value || !props.multiple) return
  const current = Array.isArray(currentValue.value) ? currentValue.value : []
  const next = current.filter((v) => v !== value)
  if (props.modelValue === undefined) internalValue.value = next
  emit("update:modelValue", next)
  emit("change", next)
}

function clear(): void {
  if (field.disabled.value || field.readonly.value) return
  const next = props.multiple ? [] : undefined
  if (props.modelValue === undefined) internalValue.value = next
  displayInputValue.value = ""
  filterQuery.value = ""
  emit("update:modelValue", next)
  emit("change", next)
  emit("clear")
  focus()
}

function onNativeInput(event: Event): void {
  if (field.readonly.value || field.disabled.value) return
  if (isComposing.value || (event as InputEvent).isComposing) return
  const value = (event.target as HTMLInputElement | null)?.value ?? ""
  filterQuery.value = value
  emit("search", value)
}

function onCompositionStart(): void {
  isComposing.value = true
}

function onCompositionEnd(event: CompositionEvent): void {
  isComposing.value = false
  if (field.readonly.value || field.disabled.value) return
  const value = (event.target as HTMLInputElement | null)?.value ?? ""
  filterQuery.value = value
  emit("search", value)
}

const READONLY_BLOCKED_KEYS = new Set(["Enter", "ArrowDown", "ArrowUp"])

function onInputKeydownCapture(event: KeyboardEvent): void {
  if ((isComposing.value || event.isComposing) && event.key === "Enter") {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  if (field.readonly.value && READONLY_BLOCKED_KEYS.has(event.key)) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onTriggerBlockedInteraction(event: Event): void {
  if (field.readonly.value) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onFocus(event: FocusEvent): void {
  const from = event.relatedTarget as Node | null
  if (from && rootRef.value?.contains(from)) return
  emit("focus", event)
}

function onBlur(event: FocusEvent): void {
  const to = event.relatedTarget as Node | null
  if (to && rootRef.value?.contains(to)) return
  emit("blur", event)
}

function resolveInputElement(): HTMLInputElement | null {
  const node = inputRef.value
  if (!node) return null
  if (node instanceof HTMLInputElement) return node
  if (node instanceof HTMLElement) return node.querySelector("input")
  const el = node.$el
  if (el instanceof HTMLInputElement) return el
  if (el instanceof HTMLElement) return el.querySelector("input")
  return null
}

function focus(): void {
  resolveInputElement()?.focus()
}

function blur(): void {
  resolveInputElement()?.blur()
}

defineExpose({ focus, blur, inputRef })
</script>

<template>
  <div
    ref="rootRef"
    :class="
      regionClass(props, 'root', 'miu-combobox', `miu-combobox--${resolvedSize.size}`, {
        'miu-combobox--multiple': multiple,
        'miu-combobox--disabled': field.disabled.value,
        'miu-combobox--readonly': field.readonly.value,
        'miu-combobox--invalid': field.invalid.value,
        'miu-combobox--has-clear': canClear,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-size="resolvedSize.size"
    :data-miu-radius="radius"
    :data-miu-icon-size="resolvedIconSize.size"
    :data-material="materialName"
    :data-multiple="multiple || undefined"
    :data-invalid="field.invalid.value || undefined"
    :data-disabled="field.disabled.value || undefined"
    :data-readonly="field.readonly.value || undefined"
  >
    <ComboboxRoot
      :open="isOpen"
      :model-value="rekaModelValue"
      :multiple="multiple"
      :name="name"
      :disabled="field.disabled.value"
      :required="field.required.value"
      :ignore-filter="true"
      @update:open="onOpenChange"
      @update:model-value="onUpdateModelValue"
    >
      <ComboboxAnchor
        :class="regionClass(props, 'control', 'miu-combobox__control')"
        :style="regionStyle(props, 'control')"
      >
        <div
          v-if="multiple && selectedOptions.length > 0"
          :class="regionClass(props, 'tags', 'miu-combobox__tags')"
          :style="regionStyle(props, 'tags')"
        >
          <span
            v-for="opt in selectedOptions"
            :key="opt.value"
            :class="regionClass(props, 'tag', 'miu-combobox__tag')"
            :style="regionStyle(props, 'tag')"
          >
            <slot name="tag" :option="opt" :remove="() => removeTag(opt.value)">
              <span class="miu-combobox__tag-label">{{ opt.label }}</span>
              <button
                type="button"
                class="miu-combobox__tag-remove"
                tabindex="-1"
                :aria-label="`${t('combobox.removeTag')} ${opt.label}`"
                :disabled="field.disabled.value || field.readonly.value || undefined"
                @pointerdown.prevent
                @mousedown.prevent
                @click.stop="removeTag(opt.value)"
              >
                <Icon name="close" size="xs" />
              </button>
            </slot>
          </span>
        </div>

        <ComboboxInput
          ref="inputRef"
          v-model="displayInputValue"
          :id="field.id.value"
          :display-value="resolveDisplayValue"
          :placeholder="
            multiple && selectedOptions.length > 0
              ? undefined
              : (placeholder ?? t('combobox.placeholder'))
          "
          :disabled="field.disabled.value"
          :readonly="field.readonly.value || undefined"
          :aria-label="ariaLabel"
          :aria-describedby="field.describedBy.value"
          :aria-invalid="field.invalid.value || undefined"
          :aria-required="field.required.value || undefined"
          :aria-readonly="field.readonly.value || undefined"
          :class="regionClass(props, 'input', 'miu-combobox__input')"
          :style="regionStyle(props, 'input')"
          @input="onNativeInput"
          @compositionstart="onCompositionStart"
          @compositionend="onCompositionEnd"
          @keydown.capture="onInputKeydownCapture"
          @click.capture="onTriggerBlockedInteraction"
          @focus="onFocus"
          @blur="onBlur"
        />

        <div class="miu-combobox__actions">
          <button
            v-if="canClear"
            type="button"
            :class="regionClass(props, 'clear', 'miu-combobox__clear')"
            :style="regionStyle(props, 'clear')"
            :aria-label="t('common.clear')"
            @pointerdown.prevent
            @mousedown.prevent
            @click.stop="clear"
            @focus="onFocus"
            @blur="onBlur"
          >
            <Icon name="close" size="sm" />
          </button>

          <ComboboxTrigger
            :disabled="field.disabled.value"
            :aria-label="t('common.select')"
            :data-readonly="field.readonly.value || undefined"
            :class="regionClass(props, 'trigger', 'miu-combobox__trigger')"
            :style="regionStyle(props, 'trigger')"
            @click.capture="onTriggerBlockedInteraction"
            @pointerdown.capture="onTriggerBlockedInteraction"
          >
            <Icon name="chevron" class="miu-combobox__chevron" />
          </ComboboxTrigger>
        </div>
      </ComboboxAnchor>

      <ComboboxPortal :to="theme.portalTarget.value">
        <ComboboxContent
          position="popper"
          :side-offset="4"
          :class="regionClass(props, 'content', 'miu-combobox__content')"
          :style="mergeStyle(regionStyle(props, 'content'), materialTokens)"
          :data-material="materialName"
          :data-miu-radius="radius"
          :data-miu-size="resolvedSize.size"
          :data-miu-icon-size="resolvedIconSize.size"
        >
          <ComboboxViewport
            :class="regionClass(props, 'viewport', 'miu-combobox__viewport')"
            :style="regionStyle(props, 'viewport')"
          >
            <template
              v-for="(group, groupIdx) in groupedOptions"
              :key="group.name ?? `ungrouped-${groupIdx}`"
            >
              <ComboboxGroup v-if="group.name" class="miu-combobox__group">
                <ComboboxLabel class="miu-combobox__group-label">{{ group.name }}</ComboboxLabel>
                <ComboboxItem
                  v-for="option in group.options"
                  :key="option.value"
                  v-slot="{ selected }"
                  :value="option.value"
                  :text-value="option.label"
                  :disabled="option.disabled"
                  :class="regionClass(props, 'item', 'miu-combobox__item')"
                  :style="regionStyle(props, 'item')"
                >
                  <slot name="option" :option="option" :selected="selected">
                    <span v-if="option.icon" class="miu-combobox__item-icon">
                      <Icon :name="option.icon" size="sm" />
                    </span>
                    <span class="miu-combobox__item-text">
                      <span class="miu-combobox__item-label">{{ option.label }}</span>
                      <span v-if="option.description" class="miu-combobox__item-description">
                        {{ option.description }}
                      </span>
                    </span>
                    <ComboboxItemIndicator
                      :class="regionClass(props, 'itemIndicator', 'miu-combobox__item-indicator')"
                      :style="regionStyle(props, 'itemIndicator')"
                    >
                      <Icon name="check" size="sm" />
                    </ComboboxItemIndicator>
                  </slot>
                </ComboboxItem>
              </ComboboxGroup>
              <template v-else>
                <ComboboxItem
                  v-for="option in group.options"
                  :key="option.value"
                  v-slot="{ selected }"
                  :value="option.value"
                  :text-value="option.label"
                  :disabled="option.disabled"
                  :class="regionClass(props, 'item', 'miu-combobox__item')"
                  :style="regionStyle(props, 'item')"
                >
                  <slot name="option" :option="option" :selected="selected">
                    <span v-if="option.icon" class="miu-combobox__item-icon">
                      <Icon :name="option.icon" size="sm" />
                    </span>
                    <span class="miu-combobox__item-text">
                      <span class="miu-combobox__item-label">{{ option.label }}</span>
                      <span v-if="option.description" class="miu-combobox__item-description">
                        {{ option.description }}
                      </span>
                    </span>
                    <ComboboxItemIndicator
                      :class="regionClass(props, 'itemIndicator', 'miu-combobox__item-indicator')"
                      :style="regionStyle(props, 'itemIndicator')"
                    >
                      <Icon name="check" size="sm" />
                    </ComboboxItemIndicator>
                  </slot>
                </ComboboxItem>
              </template>
            </template>

            <ComboboxEmpty
              :class="regionClass(props, 'empty', 'miu-combobox__empty')"
              :style="regionStyle(props, 'empty')"
            >
              <slot name="empty">{{ emptyText ?? t("combobox.empty") }}</slot>
            </ComboboxEmpty>
          </ComboboxViewport>
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>
  </div>
</template>
