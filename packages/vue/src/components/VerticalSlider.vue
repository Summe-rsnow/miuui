<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { VerticalSliderProps } from "../types"
import { useFormFieldBinding } from "../composables/useFormField"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"

const props = withDefaults(defineProps<VerticalSliderProps>(), {
  modelValue: 0,
  mode: "discrete",
  steps: () => ["+2", "+1", "0", "-1", "-2"],
  min: -12,
  max: 12,
  step: 0.5,
  centerZero: false,
  height: 130,
  topLabel: "",
  bottomLabel: "",
  radius: "full",
  disabled: false,
  readonly: false,
  invalid: false,
})

const emit = defineEmits<{
  "update:modelValue": [value: number]
  change: [value: number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "VerticalSlider")
const field = useFormFieldBinding({
  id: () => props.id,
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  invalid: () => props.invalid,
})

const trackRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isInteractive = computed(() => !field.disabled.value && !field.readonly.value)
const isContinuous = computed(() => props.mode === "continuous")

const formattedHeight = computed(() => {
  if (typeof props.height === "number") return `${props.height}px`
  if (!props.height) return undefined
  const str = String(props.height).trim()
  return /^\d+$/.test(str) ? `${str}px` : str
})

const stepsCount = computed(() => props.steps.length || 1)

const currentStepLabel = computed(() => {
  const idx = props.modelValue
  if (idx >= 0 && idx < props.steps.length) {
    return props.steps[idx]
  }
  return ""
})

const thumbStyle = computed(() => {
  const count = stepsCount.value
  if (count <= 1) {
    return mergeStyle(regionStyle(props, "thumb"), {
      insetBlockStart: "calc(50% - var(--miu-space-3))",
    })
  }
  const clamped = Math.max(0, Math.min(count - 1, props.modelValue))
  const ratio = clamped / (count - 1)
  return mergeStyle(regionStyle(props, "thumb"), {
    insetBlockStart: `calc(${ratio} * (100% - var(--miu-space-6)))`,
  })
})

function stepDotStyle(index: number): Record<string, string> {
  const count = stepsCount.value
  if (count <= 1) {
    return { insetBlockStart: "calc(50% - var(--miu-border-width) * 2)" }
  }
  const ratio = index / (count - 1)
  return {
    insetBlockStart: `calc(${ratio} * (100% - var(--miu-space-6)) + var(--miu-space-2) + var(--miu-border-width) * 2)`,
  }
}

function roundToStep(val: number): number {
  const safeStep = props.step > 0 && Number.isFinite(props.step) ? props.step : 1
  const stepStr = String(safeStep)
  const dotIdx = stepStr.indexOf(".")
  const expMatch = stepStr.match(/e-(\d+)$/i)
  const decimals = Math.min(
    10,
    expMatch
      ? Number(expMatch[1]) + (dotIdx >= 0 ? stepStr.indexOf("e") - dotIdx - 1 : 0)
      : dotIdx >= 0
        ? stepStr.length - dotIdx - 1
        : 0,
  )
  const snapped = props.min + Math.round((val - props.min) / safeStep) * safeStep
  const clamped = Math.max(props.min, Math.min(props.max, snapped))
  return Number(clamped.toFixed(decimals))
}

function selectStep(index: number): void {
  if (!isInteractive.value) return
  const clamped = Math.max(0, Math.min(props.steps.length - 1, index))
  if (clamped !== props.modelValue) {
    emit("update:modelValue", clamped)
    emit("change", clamped)
  }
}

function onStepChange(delta: number): void {
  if (!isInteractive.value) return
  if (isContinuous.value) {
    const safeStep = props.step > 0 && Number.isFinite(props.step) ? props.step : 1
    const nextVal = roundToStep(props.modelValue - delta * safeStep)
    if (nextVal !== props.modelValue) {
      emit("update:modelValue", nextVal)
      emit("change", nextVal)
    }
  } else {
    selectStep(props.modelValue + delta)
  }
}

function onBoundary(toMax: boolean): void {
  if (!isInteractive.value) return
  const nextVal = isContinuous.value
    ? toMax
      ? props.max
      : props.min
    : toMax
      ? 0
      : Math.max(0, props.steps.length - 1)
  if (nextVal !== props.modelValue) {
    emit("update:modelValue", nextVal)
    emit("change", nextVal)
  }
}

function onWheel(e: WheelEvent): void {
  if (!isInteractive.value) return
  e.preventDefault()
  if (e.deltaY < 0) {
    onStepChange(-1)
  } else if (e.deltaY > 0) {
    onStepChange(1)
  }
}

const continuousPercent = computed(() => {
  const range = props.max - props.min
  if (range <= 0) return 0
  const clamped = Math.max(props.min, Math.min(props.max, props.modelValue))
  return ((clamped - props.min) / range) * 100
})

const zeroPercent = computed(() => {
  const range = props.max - props.min
  return range > 0 ? Math.max(0, Math.min(100, ((0 - props.min) / range) * 100)) : 50
})

const continuousThumbStyle = computed(() => {
  const pct = (100 - continuousPercent.value) / 100
  return mergeStyle(regionStyle(props, "thumb"), {
    insetBlockStart: `calc(${pct} * (100% - var(--miu-space-4)))`,
  })
})

const continuousFillStyle = computed(() => {
  if (props.centerZero) {
    const zeroPct = zeroPercent.value
    const currentPct = continuousPercent.value
    if (currentPct >= zeroPct) {
      return mergeStyle(regionStyle(props, "fill"), {
        insetBlockStart: `${100 - currentPct}%`,
        blockSize: `${currentPct - zeroPct}%`,
      })
    }
    return mergeStyle(regionStyle(props, "fill"), {
      insetBlockStart: `${100 - zeroPct}%`,
      blockSize: `${zeroPct - currentPct}%`,
    })
  }
  return mergeStyle(regionStyle(props, "fill"), {
    insetBlockEnd: "0%",
    blockSize: `${continuousPercent.value}%`,
  })
})

function calculatePositionFromY(clientY: number): void {
  const el = trackRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const offsetY = clientY - rect.top

  if (isContinuous.value) {
    const clampedY = Math.max(0, Math.min(rect.height, offsetY))
    const ratio = rect.height > 0 ? clampedY / rect.height : 0
    const valRatio = 1 - ratio
    const rawVal = props.min + valRatio * (props.max - props.min)
    const finalVal = roundToStep(rawVal)
    if (finalVal !== props.modelValue) {
      emit("update:modelValue", finalVal)
      emit("change", finalVal)
    }
  } else {
    const thumbSize = 24
    const trackTravel = rect.height - thumbSize
    if (trackTravel <= 0) return
    const clampedY = Math.max(0, Math.min(trackTravel, offsetY - thumbSize / 2))
    const ratio = clampedY / trackTravel
    const count = stepsCount.value
    if (count <= 1) return
    const closestIndex = Math.round(ratio * (count - 1))
    selectStep(closestIndex)
  }
}

function startDrag(e: MouseEvent): void {
  if (e.button !== 0 || !isInteractive.value) return
  e.preventDefault()
  isDragging.value = true
  calculatePositionFromY(e.clientY)
  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("mouseup", onMouseUp)
}

function onMouseMove(e: MouseEvent): void {
  if (!isDragging.value) return
  calculatePositionFromY(e.clientY)
}

function onMouseUp(): void {
  if (!isDragging.value) return
  isDragging.value = false
  window.removeEventListener("mousemove", onMouseMove)
  window.removeEventListener("mouseup", onMouseUp)
}

function startTouch(e: TouchEvent): void {
  if (!isInteractive.value || !e.touches[0]) return
  isDragging.value = true
  calculatePositionFromY(e.touches[0].clientY)
  window.addEventListener("touchmove", onTouchMove)
  window.addEventListener("touchend", onTouchEnd)
  window.addEventListener("touchcancel", onTouchEnd)
}

function onTouchMove(e: TouchEvent): void {
  if (!isDragging.value || !e.touches[0]) return
  calculatePositionFromY(e.touches[0].clientY)
}

function onTouchEnd(): void {
  if (!isDragging.value) return
  isDragging.value = false
  window.removeEventListener("touchmove", onTouchMove)
  window.removeEventListener("touchend", onTouchEnd)
  window.removeEventListener("touchcancel", onTouchEnd)
}

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("mouseup", onMouseUp)
    window.removeEventListener("touchmove", onTouchMove)
    window.removeEventListener("touchend", onTouchEnd)
    window.removeEventListener("touchcancel", onTouchEnd)
  }
})

defineExpose({
  focus: () => trackRef.value?.focus(),
  blur: () => trackRef.value?.blur(),
  trackRef,
})
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-vertical-slider', {
        'miu-vertical-slider--disabled': field.disabled.value,
        'miu-vertical-slider--readonly': field.readonly.value,
        'miu-vertical-slider--invalid': field.invalid.value,
        'miu-vertical-slider--continuous': isContinuous,
        'miu-vertical-slider--compact': density === 'compact',
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-miu-radius="radius"
    :data-density="density"
    :data-material="materialName"
    :data-disabled="field.disabled.value || undefined"
    :data-readonly="field.readonly.value || undefined"
    :data-invalid="field.invalid.value || undefined"
  >
    <span
      v-if="topLabel"
      :class="regionClass(props, 'header', 'miu-vertical-slider__header-label')"
      :style="regionStyle(props, 'header')"
    >
      {{ topLabel }}
    </span>

    <div
      :id="field.id.value"
      ref="trackRef"
      :class="regionClass(props, 'track', 'miu-vertical-slider__track')"
      :style="
        mergeStyle(
          regionStyle(props, 'track'),
          formattedHeight ? { blockSize: formattedHeight } : undefined,
        )
      "
      :tabindex="field.disabled.value ? -1 : 0"
      role="slider"
      aria-orientation="vertical"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabel ? undefined : field.labelId?.value"
      :aria-describedby="field.describedBy?.value"
      :aria-valuemin="isContinuous ? min : 0"
      :aria-valuemax="isContinuous ? max : Math.max(0, steps.length - 1)"
      :aria-valuenow="modelValue"
      :aria-valuetext="!isContinuous ? String(currentStepLabel) : undefined"
      :aria-disabled="field.disabled.value || undefined"
      :aria-readonly="field.readonly.value || undefined"
      :aria-invalid="field.invalid.value || undefined"
      @mousedown="startDrag"
      @touchstart.passive="startTouch"
      @wheel="onWheel"
      @keydown.up.prevent="onStepChange(-1)"
      @keydown.down.prevent="onStepChange(1)"
      @keydown.right.prevent="onStepChange(-1)"
      @keydown.left.prevent="onStepChange(1)"
      @keydown.page-up.prevent="onStepChange(isContinuous ? -10 : -2)"
      @keydown.page-down.prevent="onStepChange(isContinuous ? 10 : 2)"
      @keydown.home.prevent="onBoundary(false)"
      @keydown.end.prevent="onBoundary(true)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    >
      <template v-if="!isContinuous">
        <div class="miu-vertical-slider__steps">
          <div
            v-for="(_, i) in steps"
            :key="i"
            class="miu-vertical-slider__step-dot"
            :class="{
              'miu-vertical-slider__step-dot--active': i === modelValue,
            }"
            :style="stepDotStyle(i)"
            @click.stop="selectStep(i)"
          />
        </div>

        <div
          :class="
            regionClass(props, 'thumb', 'miu-vertical-slider__thumb', {
              'miu-vertical-slider__thumb--dragging': isDragging,
            })
          "
          :style="thumbStyle"
        >
          <span class="miu-vertical-slider__thumb-text">{{ currentStepLabel }}</span>
        </div>
      </template>

      <template v-else>
        <div
          v-if="centerZero"
          class="miu-vertical-slider__center-marker"
          :style="{ insetBlockStart: `${100 - zeroPercent}%` }"
        />

        <div
          :class="regionClass(props, 'fill', 'miu-vertical-slider__continuous-fill')"
          :style="continuousFillStyle"
        />

        <div
          :class="
            regionClass(props, 'thumb', 'miu-vertical-slider__continuous-thumb', {
              'miu-vertical-slider__continuous-thumb--dragging': isDragging,
            })
          "
          :style="continuousThumbStyle"
        />
      </template>
    </div>

    <span
      v-if="bottomLabel"
      :class="regionClass(props, 'footer', 'miu-vertical-slider__footer-label')"
      :style="regionStyle(props, 'footer')"
    >
      {{ bottomLabel }}
    </span>
  </div>
</template>
