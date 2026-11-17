import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import type { IconDefinition } from "@xcmm1543/miuui-icons"
import axe from "axe-core"
import { h } from "vue"
import { afterEach, describe, expect, it, vi } from "vitest"
import Avatar from "./Avatar.vue"
import Button from "./Button.vue"
import CategoryFilter from "./CategoryFilter.vue"
import FormRow from "./FormRow.vue"
import Icon from "./Icon.vue"
import { useToast } from "../composables/useToast"
import IconButton from "./IconButton.vue"
import ImageGroup from "./ImageGroup.vue"
import ImagePreview from "./ImagePreview.vue"
import MessageComposer from "./MessageComposer.vue"
import PageLayout from "./PageLayout.vue"
import SegmentedControl from "./SegmentedControl.vue"
import Tabs from "./Tabs.vue"
import ThemeProvider from "./ThemeProvider.vue"
import TruncateText from "./TruncateText.vue"
import { solidMaterial, glassMaterial } from "@xcmm1543/miuui-materials"
import { semanticTokens } from "@xcmm1543/miuui-tokens"

const mounted: VueWrapper[] = []
function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  document.body.innerHTML = ""
})

describe("v0.6.0 Muyu migration extensions & new primitives", () => {
  it("supports Button pill, IconButton active/shape, and Avatar squircle/clickable", async () => {
    const btn = track(mount(Button, { props: { pill: true }, slots: { default: "Play" } }))
    expect(btn.attributes("data-miu-radius")).toBe("full")

    const iconBtn = track(
      mount(IconButton, {
        props: { icon: "sparkles", active: true, shape: "squircle", title: "Effects" },
      }),
    )
    expect(iconBtn.attributes("aria-pressed")).toBe("true")
    expect(iconBtn.classes()).toContain("miu-icon-button--active")

    const onAvatarClick = vi.fn()
    const avatar = track(
      mount(Avatar, {
        props: {
          alt: "Muyu",
          shape: "squircle",
          bordered: true,
          clickable: true,
          fallbackIcon: "user",
          onClick: onAvatarClick,
        },
      }),
    )
    expect(avatar.classes()).toContain("miu-avatar--bordered")
    expect(avatar.classes()).toContain("miu-avatar--clickable")
    await avatar.trigger("click")
    expect(onAvatarClick).toHaveBeenCalledTimes(1)
  })

  it("supports SegmentedControl block/clearable/color/locked and Tabs loading", async () => {
    const onSegChange = vi.fn()
    const seg = track(
      mount(SegmentedControl, {
        props: {
          modelValue: "a",
          block: true,
          clearable: true,
          options: [
            { value: "a", label: "Alpha", color: "#9A49E0" },
            { value: "b", label: "Beta", locked: true },
          ],
          onChange: onSegChange,
        },
      }),
    )
    expect(seg.classes()).toContain("miu-segmented--block")
    expect(seg.find(".miu-segmented__dot").exists()).toBe(true)
    expect(seg.find(".miu-segmented__lock").exists()).toBe(true)

    const tabs = track(
      mount(Tabs, {
        props: {
          loading: true,
          items: [
            { value: "1", label: "One" },
            { value: "2", label: "Two" },
          ],
        },
      }),
    )
    expect(tabs.find(".miu-tabs__skeleton").exists()).toBe(true)
  })

  it("supports MessageComposer tools slot, cancel, and Enter-to-send", async () => {
    const onSend = vi.fn()
    const onCancel = vi.fn()
    const composer = track(
      mount(MessageComposer, {
        props: {
          modelValue: "Hello Muyu",
          compact: true,
          showCancel: true,
          onSend,
          onCancel,
        },
        slots: { tools: '<button type="button" class="tool-btn">Emoji</button>' },
      }),
    )
    expect(composer.find(".tool-btn").exists()).toBe(true)
    await composer.trigger("keydown", { key: "Enter" })
    expect(onSend).toHaveBeenCalledTimes(1)
    await composer.find(".miu-message-composer__actions button").trigger("click")
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("supports ImagePreview navigation and ImageGroup grid with +N overflow", async () => {
    const onOpenChange = vi.fn()
    track(
      mount(
        {
          components: { ThemeProvider, ImagePreview },
          template: `
            <ThemeProvider>
              <ImagePreview
                :open="true"
                :images="['https://example.com/1.png', 'https://example.com/2.png']"
                :initial-index="0"
                @update:open="onOpenChange"
              />
            </ThemeProvider>
          `,
          methods: { onOpenChange },
        },
        { attachTo: document.body },
      ),
    )
    await flushPromises()
    expect(document.querySelector(".miu-image-preview__counter")?.textContent).toContain("1/2")
    const nextBtn = document.querySelector(".miu-image-preview__nav--next") as HTMLElement
    nextBtn.click()
    await flushPromises()
    expect(document.querySelector(".miu-image-preview__counter")?.textContent).toContain("2/2")

    const group = track(
      mount({
        components: { ThemeProvider, ImageGroup },
        template: `
          <ThemeProvider>
            <ImageGroup
              :max-display="4"
              :images="[
                'https://example.com/a.jpg',
                'https://example.com/b.jpg',
                'https://example.com/c.jpg',
                'https://example.com/d.jpg',
                'https://example.com/e.jpg',
              ]"
            />
          </ThemeProvider>
        `,
      }),
    )
    expect(group.find(".miu-image-group__more").text()).toBe("+1")
  })

  it("supports CategoryFilter accordion subtags and PageLayout", async () => {
    const onChange = vi.fn()
    const filter = track(
      mount(CategoryFilter, {
        props: {
          modelValue: "default",
          groups: [
            {
              key: "genre",
              label: "曲风",
              subtags: [
                { key: "pop", label: "流行" },
                { key: "rock", label: "摇滚" },
              ],
            },
          ],
          onChange,
        },
      }),
    )
    const triggers = filter.findAll(".miu-tabs__trigger")
    await triggers[1]?.trigger("click")
    const pills = filter.findAll(".miu-pill__main")
    expect(pills).toHaveLength(2)
    await pills[0]?.trigger("click")
    expect(onChange).toHaveBeenCalledWith(
      "pop",
      expect.objectContaining({ subtag: { key: "pop", label: "流行" } }),
    )

    const layout = track(
      mount(PageLayout, {
        props: { title: "Library", contentMaxWidth: "lg", contentAlign: "center" },
        slots: { default: "<p>Content</p>" },
        attachTo: document.body,
      }),
    )
    expect(layout.find(".miu-page-layout__content").attributes("data-width")).toBe("lg")

    const results = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    })
    expect(
      results.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
    ).toEqual([])
  })

  it("renders extended icon names and numeric icon sizes", () => {
    const icon = track(mount(Icon, { props: { name: "libraryMusic", size: 22 } }))
    expect(icon.attributes("style")).toContain("width: 22px")
  })

  it("supports custom IconDefinition objects and numeric sizing on IconButton and Avatar", () => {
    const customIcon: IconDefinition = {
      name: "customDiamond",
      viewBox: "0 0 24 24",
      content: '<path d="M12 2L22 12L12 22L2 12Z"/>',
    }

    const seg = track(
      mount(SegmentedControl, {
        props: {
          modelValue: "a",
          options: [{ label: "Custom", value: "a", icon: customIcon }],
        },
      }),
    )
    expect(seg.find("svg path").attributes("d")).toBe("M12 2L22 12L12 22L2 12Z")

    const iconBtn = track(
      mount(IconButton, {
        props: { icon: customIcon, size: 30, iconSize: 16, ariaLabel: "Custom" },
      }),
    )
    expect(iconBtn.attributes("style")).toContain("inline-size: 30px")
    expect(iconBtn.find("svg").attributes("style")).toContain("width: 16px")

    const avatar = track(
      mount(Avatar, {
        props: { alt: "User", size: 42, fallbackIcon: customIcon },
      }),
    )
    expect(avatar.attributes("style")).toContain("inline-size: 42px")
    expect(avatar.find("svg path").attributes("d")).toBe("M12 2L22 12L12 22L2 12Z")
  })

  it("supports Tabs segmented variant and SegmentedControl pill prop", () => {
    const segTabs = track(
      mount(Tabs, {
        props: {
          modelValue: "songs",
          variant: "segmented",
          material: "glass",
          items: [
            { value: "songs", label: "歌曲" },
            { value: "comments", label: "评论" },
          ],
        },
      }),
    )
    expect(segTabs.get(".miu-tabs").attributes("data-variant")).toBe("segmented")
    expect(segTabs.get(".miu-tabs").attributes("data-material")).toBe("glass")

    const segSkeleton = track(
      mount(Tabs, {
        props: {
          variant: "segmented",
          loading: true,
          items: [
            { value: "songs", label: "歌曲" },
            { value: "comments", label: "评论" },
          ],
        },
      }),
    )
    expect(segSkeleton.find(".miu-tabs.miu-tabs__skeleton").attributes("data-variant")).toBe(
      "segmented",
    )
    expect(segSkeleton.findAll(".miu-tabs__list .miu-tabs__skeleton-item")).toHaveLength(2)

    const pillSeg = track(
      mount(SegmentedControl, {
        props: {
          modelValue: "a",
          pill: true,
          options: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
        },
      }),
    )
    expect(pillSeg.get(".miu-segmented").attributes("data-miu-radius")).toBe("full")
  })

  it("supports ThemeProvider icon overrides, FormRow card variant, and CategoryFilter actions slot", () => {
    const themed = track(
      mount(ThemeProvider, {
        props: {
          icons: {
            home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
          },
        },
        slots: {
          default: () => [
            h(Icon, { name: "home" }),
            h(FormRow, { variant: "card", label: "Setting", description: "Desc" }),
            h(
              CategoryFilter,
              { groups: [{ key: "g", label: "Group", subtags: [] }] },
              { actions: () => h("span", { class: "cat-extra" }, "Extra") },
            ),
          ],
        },
      }),
    )
    const homeSvg = themed.find("svg.miu-icon")
    expect(homeSvg.attributes("fill")).toBe("currentColor")
    expect(homeSvg.attributes("stroke")).toBe("none")
    expect(themed.find(".miu-form-row--card").exists()).toBe(true)
    expect(themed.find(".miu-category-filter__actions .cat-extra").text()).toBe("Extra")
  })

  it("supports Toast pill styleVariant, ThemeProvider icon overrides in Toast, and click-to-dismiss", async () => {
    const { toast, clear } = useToast()
    clear()
    track(
      mount(ThemeProvider, {
        props: {
          toastPosition: "top-center",
          toastStyleVariant: "pill",
          icons: {
            checkCircle:
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
          },
        },
        attachTo: document.body,
      }),
    )
    toast.success("已收藏到歌单")
    await flushPromises()
    const el = document.querySelector(".miu-toast") as HTMLElement | null
    expect(el?.getAttribute("data-style-variant")).toBe("pill")
    expect(el?.getAttribute("data-miu-radius")).toBe("full")
    expect(el?.querySelector(".miu-toast__close")).toBeNull()
    expect(el?.querySelector(".miu-toast__icon svg")?.getAttribute("fill")).toBe("currentColor")
    el?.click()
    await flushPromises()
    expect(document.querySelector(".miu-toast")).toBeNull()
    clear()
  })

  it("unifies --miu-glass-* tokens across tokens and materials", () => {
    const dark = semanticTokens("dark")
    expect(dark["--miu-glass-filter-regular"]).toContain("blur(")
    expect(dark["--miu-glass-hairline"]).toBeTruthy()
    const ctx = {
      theme: "dark",
      density: "comfortable",
      radius: "md",
      material: "glass",
      motionTier: "full",
    } as const
    const solidTokens = solidMaterial.generateTokens(ctx, "full")
    expect(solidTokens["--miu-glass-filter-regular"]).toBe("none")
    expect(solidTokens["--miu-glass-sheen"]).toBe("none")
    const glassTokens = glassMaterial.generateTokens(ctx, "full")
    expect(glassTokens["--miu-material-backdrop"]).toContain("blur(")
  })

  it("supports TruncateText expandMode popover with viewport clamping", async () => {
    vi.useFakeTimers()
    try {
      const w = track(
        mount(TruncateText, {
          props: {
            text: "Very long description for music playlist popover preview",
            lines: 2,
            expandMode: "popover",
          },
          attachTo: document.body,
        }),
      )
      expect(w.find(".miu-truncate__toggle").exists()).toBe(false)
      await w.trigger("mouseenter", { clientX: 120, clientY: 160 })
      vi.advanceTimersByTime(200)
      await flushPromises()
      const pop = document.querySelector(".miu-truncate__popover")
      expect(pop).not.toBeNull()
      expect(pop?.textContent).toContain("Very long description")
      await w.trigger("mouseleave")
      vi.advanceTimersByTime(300)
      await flushPromises()
      expect(document.querySelector(".miu-truncate__popover")).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})
