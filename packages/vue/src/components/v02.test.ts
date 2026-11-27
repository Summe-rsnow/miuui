import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import axe from "axe-core"
import { afterEach, describe, expect, it, vi } from "vitest"
import { registerMaterial, registerMotionTier, registry } from "@xcmm1543/miuui-core"
import { fullMotion, noneMotion, reducedMotion } from "@xcmm1543/miuui-motions"
import { hasIcon, loadIcon } from "@xcmm1543/miuui-icons/dynamic"
import { MiuBrandMark } from "@xcmm1543/miuui-icons/brand"
import { mergeStyle } from "../composables/usePluginResolution"
import { useToast } from "../composables/useToast"
import Button from "./Button.vue"
import Breadcrumb from "./Breadcrumb.vue"
import Dialog from "./Dialog.vue"
import FormField from "./FormField.vue"
import FormRow from "./FormRow.vue"
import Icon from "./Icon.vue"
import Input from "./Input.vue"
import PillGroup from "./PillGroup.vue"
import Slider from "./Slider.vue"
import Tabs from "./Tabs.vue"
import Textarea from "./Textarea.vue"
import Toc from "./Toc.vue"
import ThemeProvider from "./ThemeProvider.vue"
import TruncateText from "./TruncateText.vue"

const mounted: VueWrapper[] = []

function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  document.body.innerHTML = ""
})

describe("v0.2.0 MiuRegistry runtime integration & accentSeed", () => {
  it("applies semanticTokensForSeed when accentSeed is passed to ThemeProvider", () => {
    const wrapper = track(
      mount(ThemeProvider, {
        props: { theme: "dark", accentSeed: "#06B6D4" },
        slots: { default: "<button>Action</button>" },
      }),
    )
    const style = wrapper.attributes("style") ?? ""
    expect(style).toContain("--miu-color-primary:")
    expect(style).toContain("--miu-color-text-on-primary:")
    expect(style).not.toContain("#9A49E0")
  })

  it("warns in DEV and falls back to solid/full for unregistered material or motionTier", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const provider = track(
      mount(ThemeProvider, {
        props: {
          material: "unknown-mat",
          motionTier: "unknown-motion",
        },
      }),
    )
    expect(provider.attributes("data-material")).toBe("solid")
    expect(provider.attributes("data-motion-tier")).toBe("full")

    const btn = track(
      mount(Button, {
        props: { material: "missing-btn-mat" },
        slots: { default: "Test" },
      }),
    )
    expect(btn.attributes("data-material")).toBe("solid")
    expect(warn).toHaveBeenCalledTimes(3)
    warn.mockRestore()
  })

  it("applies tokens from custom registered material and motionTier plugins", () => {
    registerMaterial({
      name: "frosted-brand",
      fallback: "solid",
      generateTokens: () => ({ "--miu-material-surface": "rgb(18 15 22)" }),
    })
    registerMotionTier({
      name: "snappy",
      getTokenOverrides: () => ({ "--miu-motion-duration-fast": "60ms" }),
      getLoopAnimationPolicy: () => "play",
    })
    expect(registry.resolveMaterial("frosted-brand").plugin?.name).toBe("frosted-brand")

    const provider = track(
      mount(ThemeProvider, {
        props: { material: "frosted-brand", motionTier: "snappy" },
      }),
    )
    expect(provider.attributes("data-material")).toBe("frosted-brand")
    expect(provider.attributes("data-motion-tier")).toBe("snappy")
    expect(provider.attributes("style")).toContain("--miu-material-surface: rgb(18 15 22)")
    expect(provider.attributes("style")).toContain("--miu-motion-duration-fast: 60ms")
  })
})

describe("v0.2.0 Slider and PillGroup primitives", () => {
  it("renders horizontal and vertical Slider and honors size hint", async () => {
    const wrapper = track(
      mount({
        components: { FormField, Slider },
        template: `
          <FormField density="compact" label="Volume">
            <Slider :model-value="40" orientation="vertical" aria-label="Volume" />
          </FormField>
        `,
        attachTo: document.body,
      }),
    )
    const slider = wrapper.get(".miu-slider")
    expect(slider.attributes("data-orientation")).toBe("vertical")
    expect(slider.attributes("data-miu-size")).toBe("sm")
    expect(slider.attributes("data-miu-radius")).toBe("full")

    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    })
    expect(
      results.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
    ).toEqual([])
  })

  it("supports single, multiple, showAllOption, and max limit in PillGroup", async () => {
    const single = track(
      mount(PillGroup, {
        props: {
          modelValue: "all",
          showAllOption: true,
          allLabel: "All",
          options: ["Rock", "Jazz", { value: "pop", label: "Pop", disabled: true }],
          ariaLabel: "Genre",
        },
      }),
    )
    const buttons = single.findAll(".miu-pill__main")
    expect(buttons[0]?.attributes("aria-pressed")).toBe("true")
    await buttons[1]?.trigger("click")
    expect(single.emitted("update:modelValue")?.[0]?.[0]).toBe("Rock")
    await buttons[3]?.trigger("click")
    expect(single.emitted("update:modelValue")).toHaveLength(1)

    const multi = track(
      mount(PillGroup, {
        props: {
          modelValue: ["a"],
          multiple: true,
          max: 1,
          options: ["a", "b"],
          ariaLabel: "Tags",
        },
      }),
    )
    await multi.findAll(".miu-pill__main")[1]?.trigger("click")
    expect(multi.emitted("limit-reached")?.[0]?.[0]).toBe(1)
    await multi.findAll(".miu-pill__main")[0]?.trigger("click")
    expect(multi.emitted("update:modelValue")?.[0]?.[0]).toEqual([])
  })
})

describe("v0.2.0 Muyu prep enhancements & FormRow deprecation drill", () => {
  it("supports Input showCount, Dialog width, Tabs align, and TruncateText expandable", async () => {
    const input = track(
      mount(Input, { props: { modelValue: "hello", maxlength: 20, showCount: true } }),
    )
    expect(input.get(".miu-input__count").text()).toBe("5 / 20")

    const dialog = track(
      mount(
        {
          components: { Dialog, ThemeProvider },
          template: `<ThemeProvider><Dialog open width="520px" title="Custom">Body</Dialog></ThemeProvider>`,
        },
        { attachTo: document.body },
      ),
    )
    await flushPromises()
    expect(document.querySelector<HTMLElement>(".miu-dialog__content")?.style.width).toBe("520px")
    void dialog

    const tabs = track(
      mount(Tabs, {
        props: {
          modelValue: "a",
          align: "center",
          items: [{ value: "a", label: "One" }],
          ariaLabel: "Centered tabs",
        },
      }),
    )
    expect(tabs.attributes("data-align")).toBe("center")

    const truncate = track(
      mount(TruncateText, {
        props: { text: "Very long bio", lines: 2, expandable: true },
      }),
    )
    await truncate.get(".miu-truncate__toggle").trigger("click")
    expect(truncate.emitted("toggle")?.[0]?.[0]).toBe(true)
    expect(truncate.classes()).toContain("miu-truncate--expanded")
  })

  it("applies compact density on FormRow via density='compact'", () => {
    const row = track(mount(FormRow, { props: { label: "Compact", density: "compact" } }))
    expect(row.attributes("data-density")).toBe("compact")
  })

  it("loads icons via @xcmm1543/miuui-icons/dynamic, exposes @xcmm1543/miuui-icons/brand, and renders new media icons", async () => {
    expect(hasIcon("play")).toBe(true)
    expect(hasIcon("not-an-icon")).toBe(false)
    const loaded = await loadIcon("play")
    expect(loaded?.name).toBe("play")
    expect(MiuBrandMark.viewBox).toBe("0 0 48 48")

    const icon = track(mount(Icon, { props: { name: "heartFilled", ariaLabel: "Liked" } }))
    expect(icon.attributes("fill")).toBe("currentColor")
    expect(icon.attributes("stroke")).toBe("none")
  })

  it("covers Slider keyboard updates, PillGroup All/disabled/size-warning, and mergeStyle", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const slider = track(
      mount(Slider, {
        props: { modelValue: 20, step: 5, size: "huge" as unknown as "md", ariaLabel: "Gain" },
        attachTo: document.body,
      }),
    )
    expect(slider.attributes("data-miu-size")).toBe("md")
    const thumb = slider.get('[role="slider"]')
    await thumb.trigger("keydown", { key: "ArrowRight" })
    await flushPromises()
    expect(slider.emitted("update:modelValue")?.[0]?.[0]).toBe(25)
    expect(slider.emitted("change")?.[0]?.[0]).toBe(25)

    const group = track(
      mount(PillGroup, {
        props: {
          modelValue: ["a"],
          multiple: true,
          showAllOption: true,
          size: "huge" as unknown as "md",
          options: ["a", "b"],
          ariaLabel: "Multi",
        },
      }),
    )
    await group.findAll(".miu-pill__main")[0]?.trigger("click")
    expect(group.emitted("update:modelValue")?.[0]?.[0]).toEqual([])

    const disabledGroup = track(
      mount(PillGroup, {
        props: { modelValue: "a", showAllOption: true, disabled: true, options: ["a"] },
      }),
    )
    await disabledGroup.findAll(".miu-pill__main")[0]?.trigger("click")
    expect(disabledGroup.emitted("update:modelValue")).toBeUndefined()

    expect(mergeStyle("color: red", { "--a": "1" })).toEqual([{ "--a": "1" }, "color: red"])
    expect(mergeStyle({ color: "red" }, { "--a": "1" })).toEqual({ "--a": "1", color: "red" })
    expect(warn).toHaveBeenCalledTimes(2)
    warn.mockRestore()
  })

  it("enforces all three motion tiers (full, reduced, none) in plugins and ThemeProvider", () => {
    expect(fullMotion.getTokenOverrides()).toEqual({})
    expect(fullMotion.getLoopAnimationPolicy()).toBe("play")
    expect(reducedMotion.getLoopAnimationPolicy()).toBe("replace-static")
    expect(reducedMotion.getTokenOverrides()).toMatchObject({
      "--miu-motion-ease-spring": "var(--miu-motion-ease-out)",
      "--miu-motion-translate-sm": "0px",
      "--miu-motion-translate-md": "0px",
      "--miu-motion-scale-active": "1",
      "--miu-motion-scale-subtle": "1",
      "--miu-motion-scale-hover": "1",
      "--miu-motion-scale-enter": "1",
      "--miu-motion-scale-pop": "1",
      "--miu-motion-drawer-offset": "0%",
    })
    expect(noneMotion.getLoopAnimationPolicy()).toBe("pause")
    expect(noneMotion.getTokenOverrides()).toMatchObject({
      "--miu-motion-duration-fast": "0.01ms",
      "--miu-motion-duration-base": "0.01ms",
      "--miu-motion-duration-slow": "0.01ms",
      "--miu-motion-ease-spring": "var(--miu-motion-ease-out)",
      "--miu-motion-scale-enter": "1",
      "--miu-motion-scale-pop": "1",
      "--miu-motion-drawer-offset": "0%",
    })

    registerMotionTier(fullMotion)
    registerMotionTier(reducedMotion)
    registerMotionTier(noneMotion)
    const pFull = track(mount(ThemeProvider, { props: { motionTier: "full" } }))
    const pReduced = track(mount(ThemeProvider, { props: { motionTier: "reduced" } }))
    const pNone = track(mount(ThemeProvider, { props: { motionTier: "none" } }))
    expect(pFull.attributes("data-motion-tier")).toBe("full")
    expect(pReduced.attributes("data-motion-tier")).toBe("reduced")
    expect(pNone.attributes("data-motion-tier")).toBe("none")
    expect(pReduced.attributes("style")).toContain("--miu-motion-drawer-offset: 0%")
    expect(pNone.attributes("style")).toContain("--miu-motion-duration-fast: 0.01ms")
  })

  it("renders a single toast even with nested ThemeProviders", async () => {
    const { toast, clear } = useToast()
    clear()
    track(
      mount(
        {
          components: { ThemeProvider },
          template: `<ThemeProvider><ThemeProvider><div /></ThemeProvider></ThemeProvider>`,
        },
        { attachTo: document.body },
      ),
    )
    toast({ title: "Single toast", duration: 0 })
    await flushPromises()
    expect(document.querySelectorAll(".miu-toast-viewport")).toHaveLength(1)
    expect(document.querySelectorAll(".miu-toast")).toHaveLength(1)
    clear()
  })

  it("emits select on Toc and Breadcrumb link clicks", async () => {
    const toc = track(
      mount(Toc, {
        props: {
          items: [{ id: "overview", text: "Overview", level: 2 }],
          activeId: "overview",
        },
      }),
    )
    await toc.find(".miu-toc__link").trigger("click")
    expect(toc.emitted("select")?.[0]?.[0]).toEqual({
      id: "overview",
      text: "Overview",
      level: 2,
    })

    const breadcrumb = track(
      mount(Breadcrumb, {
        props: {
          items: [{ text: "Workspace", link: "/workspace" }, { text: "Projects" }],
        },
      }),
    )
    await breadcrumb.find("a.miu-breadcrumb__link").trigger("click")
    expect(breadcrumb.emitted("select")?.[0]?.[0]).toEqual({
      text: "Workspace",
      link: "/workspace",
    })
  })

  it("supports custom draggable resizer on Textarea and hides TruncateText toggle when empty or not overflowing", async () => {
    const ta = track(mount(Textarea, { props: { modelValue: "hello", rows: 3 } }))
    const textareaEl = ta.find("textarea").element as HTMLTextAreaElement
    vi.spyOn(textareaEl, "getBoundingClientRect").mockReturnValue({ height: 64 } as DOMRect)
    const resizer = ta.find(".miu-textarea__resizer")
    expect(resizer.exists()).toBe(true)
    resizer.element.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, clientY: 100 }))
    window.dispatchEvent(new MouseEvent("pointermove", { clientY: 160 }))
    expect(textareaEl.style.height).toBe("124px")
    window.dispatchEvent(new MouseEvent("pointermove", { clientY: 10 }))
    expect(textareaEl.style.height).toBe("48px")
    window.dispatchEvent(new MouseEvent("pointerup"))
    const autoTa = track(mount(Textarea, { props: { modelValue: "hi", autoResize: true } }))
    expect(autoTa.find(".miu-textarea__resizer").exists()).toBe(false)

    const emptyTruncate = track(
      mount(TruncateText, { props: { text: "   ", lines: 2, expandable: true } }),
    )
    await flushPromises()
    expect(emptyTruncate.find(".miu-truncate__toggle").exists()).toBe(false)

    const fitTruncate = track(
      mount(TruncateText, { props: { text: "Short", lines: 2, expandable: true } }),
    )
    const textSpan = fitTruncate.find(".miu-truncate__text").element as HTMLElement
    Object.defineProperty(textSpan, "clientHeight", { value: 40, configurable: true })
    Object.defineProperty(textSpan, "scrollHeight", { value: 40, configurable: true })
    Object.defineProperty(textSpan, "clientWidth", { value: 200, configurable: true })
    Object.defineProperty(textSpan, "scrollWidth", { value: 120, configurable: true })
    await fitTruncate.setProps({ lines: 3 })
    await flushPromises()
    expect(fitTruncate.find(".miu-truncate__toggle").exists()).toBe(false)

    Object.defineProperty(textSpan, "scrollHeight", { value: 96, configurable: true })
    await fitTruncate.setProps({ lines: 2 })
    await flushPromises()
    expect(fitTruncate.find(".miu-truncate__toggle").exists()).toBe(true)
  })
})
