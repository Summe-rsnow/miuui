import type { MotionTierPlugin } from "@miuui/core"

export const fullMotion: MotionTierPlugin = {
  name: "full",
  getTokenOverrides: () => ({}),
  getLoopAnimationPolicy: () => "play",
}

export const reducedMotion: MotionTierPlugin = {
  name: "reduced",
  getTokenOverrides: () => ({
    "--miu-motion-translate-sm": "0px",
    "--miu-motion-translate-md": "0px",
    "--miu-motion-scale-active": "1",
  }),
  getLoopAnimationPolicy: () => "replace-static",
}

export const noneMotion: MotionTierPlugin = {
  name: "none",
  getTokenOverrides: () => ({
    "--miu-motion-duration-fast": "0.01ms",
    "--miu-motion-duration-base": "0.01ms",
    "--miu-motion-duration-slow": "0.01ms",
    "--miu-motion-translate-sm": "0px",
    "--miu-motion-translate-md": "0px",
    "--miu-motion-scale-active": "1",
    "--miu-motion-loop-duration": "0.01ms",
  }),
  getLoopAnimationPolicy: () => "pause",
}

export const motionPlugins = {
  full: fullMotion,
  reduced: reducedMotion,
  none: noneMotion,
} as const
