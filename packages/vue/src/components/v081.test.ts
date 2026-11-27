import { h } from "vue"
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import CategoryFilter from "./CategoryFilter.vue"
import ColorPicker from "./ColorPicker.vue"
import CommandPalette from "./CommandPalette.vue"
import EmptyState from "./EmptyState.vue"
import FormField from "./FormField.vue"
import HelpTooltip from "./HelpTooltip.vue"
import HeroHeader from "./HeroHeader.vue"
import MediaCard from "./MediaCard.vue"
import NumberInput from "./NumberInput.vue"
import PageLayout from "./PageLayout.vue"
import PopupPanel from "./PopupPanel.vue"
import ThemeProvider from "./ThemeProvider.vue"
import VerticalSlider from "./VerticalSlider.vue"

const mounted: VueWrapper[] = []

function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  document.body.innerHTML = ""
  vi.restoreAllMocks()
})

describe("v0.8.1 enhancements", () => {
  it("ThemeProvider applies zIndexOffset and per-layer zIndex overrides", () => {
    const provider = track(
      mount(ThemeProvider, {
        props: {
          zIndexOffset: 1000,
          zIndex: { modal: 500, toast: 900 },
        },
        slots: { default: "<span>Body</span>" },
      }),
    )

    const style = provider.attributes("style") ?? ""
    expect(style).toContain("--miu-z-sticky: 2020")
    expect(style).toContain("--miu-z-popover: 2060")
    expect(style).toContain("--miu-z-modal: 500")
    expect(style).toContain("--miu-z-toast: 900")
  })

  it("PageLayout and EmptyState support fill desktop framing classes", () => {
    const plainLayout = track(mount(PageLayout, { props: { title: "Library" } }))
    expect(plainLayout.classes()).not.toContain("miu-page-layout--fill")

    const filledLayout = track(
      mount(PageLayout, {
        props: { title: "Library", fill: true },
        slots: {
          default: () => h(EmptyState, { fill: true, title: "Nothing here" }),
        },
      }),
    )
    expect(filledLayout.classes()).toContain("miu-page-layout--fill")
    expect(filledLayout.find(".miu-empty-state--fill").exists()).toBe(true)

    const empty = track(mount(EmptyState, { props: { fill: true, title: "Empty" } }))
    expect(empty.classes()).toContain("miu-empty-state--fill")
  })

  it("PopupPanel enables clickable button footer only when footerClickable is true", async () => {
    const nonClickable = track(
      mount(PopupPanel, {
        slots: { default: "Content", footer: "<span>Action</span>" },
      }),
    )
    const divFooter = nonClickable.get(".miu-popup-panel__footer")
    expect(divFooter.element.tagName).toBe("DIV")
    expect(divFooter.classes()).not.toContain("miu-popup-panel__footer--clickable")
    await divFooter.trigger("click")
    expect(nonClickable.emitted("footerClick")).toBeUndefined()

    const clickable = track(
      mount(PopupPanel, {
        props: { footerClickable: true },
        slots: { default: "Content", footer: "<span>Clear all</span>" },
      }),
    )
    const btnFooter = clickable.get(".miu-popup-panel__footer")
    expect(btnFooter.element.tagName).toBe("BUTTON")
    expect(btnFooter.attributes("type")).toBe("button")
    expect(btnFooter.classes()).toContain("miu-popup-panel__footer--clickable")
    await btnFooter.trigger("click")
    expect(clickable.emitted("footerClick")?.length).toBe(1)
  })

  it("CategoryFilter renders #filters, skips empty collapse, and honors readonly", async () => {
    const groups = [
      { key: "all", label: "All", subtags: [] },
      { key: "mv", label: "MVs", subtags: [] },
    ]
    const filter = track(
      mount(CategoryFilter, {
        props: {
          groups,
          modelValue: "all",
          showDefault: false,
          classNames: { filters: "custom-filters" },
          styles: { filters: { opacity: "0.9" } },
        },
        slots: {
          filters: '<div class="region-pills">Region</div>',
        },
      }),
    )

    expect(filter.find(".miu-collapse").exists()).toBe(false)
    const filtersRegion = filter.get(".miu-category-filter__filters")
    expect(filtersRegion.classes()).toContain("custom-filters")
    expect(filtersRegion.attributes("style")).toContain("opacity: 0.9")
    expect(filtersRegion.find(".region-pills").exists()).toBe(true)

    const tabs = filter.findAll('[role="tab"]')
    await tabs[1]?.trigger("click")
    expect(filter.emitted("update:modelValue")?.[0]).toEqual(["mv"])
    expect(filter.emitted("change")?.[0]?.[0]).toBe("mv")

    await filter.setProps({ readonly: true })
    expect(filter.get(".miu-tabs").attributes("readonly")).toBeUndefined()
    expect(filter.get(".miu-tabs").attributes("aria-readonly")).toBe("true")
    const mvTab = tabs[1]
    const keyEvent = new KeyboardEvent("keydown", { key: "Enter", cancelable: true, bubbles: true })
    mvTab?.element.dispatchEvent(keyEvent)
    expect(keyEvent.defaultPrevented).toBe(true)
    await tabs[0]?.trigger("click")
    expect(filter.emitted("update:modelValue")?.length).toBe(1)

    const filterVm = filter.vm as unknown as { focus: () => void; blur: () => void }
    expect(typeof filterVm.focus).toBe("function")
    expect(typeof filterVm.blur).toBe("function")
  })

  it("verifies v1.0.0 audit fixes: IME guard, MediaCard aria-disabled, HeroHeader/NumberInput/ColorPicker i18n, HelpTooltip expose, VerticalSlider focus/blur", async () => {
    const onPaletteSelect = vi.fn()
    const palette = track(
      mount(CommandPalette, {
        props: {
          open: true,
          items: [{ title: "Button", link: "/button" }],
          onSelect: onPaletteSelect,
        },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    const content = document.body.querySelector(".miu-command-palette") as HTMLElement
    const composingEnter = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    })
    Object.defineProperty(composingEnter, "isComposing", { value: true })
    content.dispatchEvent(composingEnter)
    expect(onPaletteSelect).not.toHaveBeenCalled()
    expect(composingEnter.defaultPrevented).toBe(false)

    const normalEnter = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    })
    content.dispatchEvent(normalEnter)
    expect(onPaletteSelect).toHaveBeenCalledTimes(1)
    expect(normalEnter.defaultPrevented).toBe(true)
    palette.unmount()

    const disabledCard = track(
      mount(MediaCard, { props: { title: "Track", interactive: true, disabled: true } }),
    )
    expect(disabledCard.attributes("aria-disabled")).toBe("true")

    const localized = track(
      mount(
        {
          components: { ThemeProvider, FormField, HeroHeader, NumberInput, ColorPicker },
          template: `
            <ThemeProvider locale="en-US">
              <HeroHeader cover="https://example.com/c.jpg" previewable />
              <NumberInput :model-value="1" icon-size="lg" aria-label="Qty" />
              <FormField id="cp-field" label="Brand Color">
                <ColorPicker id="cp-field" model-value="#9A49E0" />
              </FormField>
            </ThemeProvider>
          `,
        },
        { attachTo: document.body },
      ),
    )
    expect(localized.get(".miu-hero__cover").attributes("aria-label")).toBe("Preview")
    const steppers = localized.findAll(".miu-number-input__stepper")
    expect(steppers[0]?.attributes("aria-label")).toBe("Decrement")
    expect(steppers[1]?.attributes("aria-label")).toBe("Increment")
    expect(steppers[0]?.get("svg").attributes("data-miu-icon-size")).toBe("lg")
    expect(localized.get("#cp-field").attributes("aria-labelledby")).toBeDefined()
    expect(localized.get("#cp-field").attributes("aria-label")).toBeUndefined()

    const help = track(mount(HelpTooltip, { props: { text: "Tip" }, attachTo: document.body }))
    const helpVm = help.vm as unknown as { focus: () => void; blur: () => void }
    helpVm.focus()
    expect(document.activeElement).toBe(help.get(".miu-help-tooltip__trigger").element)
    helpVm.blur()
    expect(document.activeElement).not.toBe(help.get(".miu-help-tooltip__trigger").element)

    const vs = track(mount(VerticalSlider, { props: { modelValue: 0, ariaLabel: "EQ" } }))
    await vs.get(".miu-vertical-slider__track").trigger("focus")
    await vs.get(".miu-vertical-slider__track").trigger("blur")
    expect(vs.emitted("focus")).toHaveLength(1)
    expect(vs.emitted("blur")).toHaveLength(1)
  })
})
