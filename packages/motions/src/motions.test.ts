import { describe, expect, it } from "vitest"
import { fullMotion, motionPlugins, noneMotion, reducedMotion } from "./index"

describe("motion plugins", () => {
  it("exposes expected loop policies and overrides", () => {
    expect(motionPlugins).toEqual({
      full: fullMotion,
      reduced: reducedMotion,
      none: noneMotion,
    })
    expect(fullMotion.getLoopAnimationPolicy()).toBe("play")
    expect(fullMotion.getTokenOverrides()).toEqual({})
    expect(reducedMotion.getLoopAnimationPolicy()).toBe("replace-static")
    expect(reducedMotion.getTokenOverrides()["--miu-motion-translate-sm"]).toBe("0px")
    expect(noneMotion.getLoopAnimationPolicy()).toBe("pause")
    expect(noneMotion.getTokenOverrides()["--miu-motion-duration-fast"]).toBe("0.01ms")
  })
})
