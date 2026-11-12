import type { MotionTierPlugin } from "@miuui/core"

export const fullMotion: MotionTierPlugin = {
  name: "full",
  getTokenOverrides: () => ({}),
  getLoopAnimationPolicy: () => "play",
}

export const reducedMotion: MotionTierPlugin = {
  name: "reduced",
  getTokenOverrides: () => ({
    "--miu-motion-ease-spring": "var(--miu-motion-ease-out)",
    "--miu-motion-translate-sm": "0px",
    "--miu-motion-translate-md": "0px",
    "--miu-motion-scale-active": "1",
    "--miu-motion-scale-subtle": "1",
    "--miu-motion-scale-hover": "1",
    "--miu-motion-scale-enter": "1",
    "--miu-motion-scale-pop": "1",
    "--miu-motion-drawer-offset": "0%",
  }),
  getLoopAnimationPolicy: () => "replace-static",
}

export const noneMotion: MotionTierPlugin = {
  name: "none",
  getTokenOverrides: () => ({
    "--miu-motion-duration-fast": "0.01ms",
    "--miu-motion-duration-base": "0.01ms",
    "--miu-motion-duration-slow": "0.01ms",
    "--miu-motion-ease-spring": "var(--miu-motion-ease-out)",
    "--miu-motion-translate-sm": "0px",
    "--miu-motion-translate-md": "0px",
    "--miu-motion-scale-active": "1",
    "--miu-motion-scale-subtle": "1",
    "--miu-motion-scale-hover": "1",
    "--miu-motion-scale-enter": "1",
    "--miu-motion-scale-pop": "1",
    "--miu-motion-drawer-offset": "0%",
    "--miu-motion-loop-duration": "0.01ms",
  }),
  getLoopAnimationPolicy: () => "pause",
}

export const motionPlugins = {
  full: fullMotion,
  reduced: reducedMotion,
  none: noneMotion,
} as const
