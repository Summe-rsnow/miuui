import { h } from "vue"
import { mount, type VueWrapper } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import CategoryFilter from "./CategoryFilter.vue"
import EmptyState from "./EmptyState.vue"
import PageLayout from "./PageLayout.vue"
import PopupPanel from "./PopupPanel.vue"
import ThemeProvider from "./ThemeProvider.vue"

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
    const mvTab = tabs[1]
    const keyEvent = new KeyboardEvent("keydown", { key: "Enter", cancelable: true, bubbles: true })
    mvTab?.element.dispatchEvent(keyEvent)
    expect(keyEvent.defaultPrevented).toBe(true)
    await tabs[0]?.trigger("click")
    expect(filter.emitted("update:modelValue")?.length).toBe(1)
  })
})
