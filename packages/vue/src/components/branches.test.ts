import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import { afterEach, describe, expect, it } from "vitest"
import { useMiuI18n } from "../composables/useMiu"
import { useToast } from "../composables/useToast"
import AppBar from "./AppBar.vue"
import Breadcrumb from "./Breadcrumb.vue"
import ContextMenu from "./ContextMenu.vue"
import Drawer from "./Drawer.vue"
import EmptyState from "./EmptyState.vue"
import Icon from "./Icon.vue"
import NavMenu from "./NavMenu.vue"
import Pagination from "./Pagination.vue"
import SegmentedControl from "./SegmentedControl.vue"
import Table from "./Table.vue"
import TruncateText from "./TruncateText.vue"
import ThemeProvider from "./ThemeProvider.vue"
import ToastViewport from "./ToastViewport.vue"
import Tooltip from "./Tooltip.vue"

const mounted: VueWrapper[] = []

function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  document.body.innerHTML = ""
})

const navGroups = [
  {
    text: "Start",
    items: [
      { text: "Guide", link: "/guide", active: true, badge: "3" },
      { text: "Disabled", link: "/off", disabled: true },
      { text: "Nested", items: [{ text: "Child", link: "/child", active: true }] },
      { text: "Unsafe", link: "javascript:alert(1)" },
    ],
  },
]

describe("NavMenu branches", () => {
  it("renders groups, badges, nested links and the horizontal variant", async () => {
    const wrapper = track(
      mount(NavMenu, { props: { groups: navGroups, orientation: "horizontal" } }),
    )
    expect(wrapper.classes()).toContain("miu-nav-menu--horizontal")
    expect(wrapper.get(".miu-nav-menu__badge").text()).toBe("3")

    const links = wrapper.findAll("a.miu-nav-menu__link")
    // disabled items keep their href; the javascript: item loses it entirely
    expect(links.map((link) => link.attributes("href"))).toEqual(["/guide", "/off", "/child"])
    expect(links[2]?.classes()).toContain("miu-nav-menu__link--child")
    expect(wrapper.text()).toContain("Unsafe")

    await links[0]?.trigger("click")
    expect(wrapper.emitted("select")).toHaveLength(1)

    await links[2]?.trigger("click")
    expect(wrapper.emitted("select")).toHaveLength(2)
  })

  it("blocks selection for disabled items", async () => {
    const wrapper = track(mount(NavMenu, { props: { groups: navGroups } }))
    const disabled = wrapper
      .findAll("a.miu-nav-menu__link")
      .find((link) => link.attributes("data-disabled") !== undefined)
    expect(disabled).toBeDefined()
    await disabled?.trigger("click")
    expect(wrapper.emitted("select")).toBeUndefined()
  })
})

describe("Breadcrumb branches", () => {
  it("links all but the last item and drops unsafe schemes", () => {
    const wrapper = track(
      mount(Breadcrumb, {
        props: {
          items: [
            { text: "Home", link: "https://example.com" },
            { text: "Unsafe", link: "javascript:alert(1)" },
            { text: "Here" },
          ],
        },
      }),
    )
    const links = wrapper.findAll("a.miu-breadcrumb__link")
    expect(links).toHaveLength(1)
    expect(links[0]?.attributes("href")).toBe("https://example.com")
    expect(wrapper.findAll(".miu-breadcrumb__separator")).toHaveLength(2)
    expect(wrapper.get('[aria-current="page"]').text()).toBe("Here")
  })
})

describe("Pagination branches", () => {
  it("renders the previous spacer when only next exists", () => {
    const wrapper = track(mount(Pagination, { props: { next: { text: "Next", link: "/next" } } }))
    expect(wrapper.find(".miu-pagination__spacer").exists()).toBe(true)
    expect(wrapper.findAll("a.miu-pagination__link")).toHaveLength(1)
    expect(wrapper.get("a.miu-pagination__link").attributes("href")).toBe("/next")
  })

  it("emits select and blocks unsafe hrefs", async () => {
    const wrapper = track(
      mount(Pagination, {
        props: {
          previous: { text: "Prev", link: "/prev" },
          next: { text: "Unsafe", link: "javascript:alert(1)" },
        },
      }),
    )
    const links = wrapper.findAll("a.miu-pagination__link")
    await links[0]?.trigger("click")
    expect(wrapper.emitted("select")).toHaveLength(1)
    // the unsafe link is rendered without an href, so nothing is navigable
    expect(links[0]?.attributes("href")).toBe("/prev")
  })

  it("renders neither link when both targets are missing", () => {
    const wrapper = track(mount(Pagination))
    expect(wrapper.findAll("a.miu-pagination__link")).toHaveLength(0)
  })
})

describe("EmptyState branches", () => {
  it("renders without icon and falls back to the localized title", () => {
    const wrapper = track(mount(EmptyState))
    expect(wrapper.find(".miu-empty-state__icon").exists()).toBe(false)
    expect(wrapper.get(".miu-empty-state__title").text().length).toBeGreaterThan(0)
  })

  it("renders description, icon slot and actions slot", () => {
    const wrapper = track(
      mount(EmptyState, {
        props: { description: "Nothing here", title: "Empty" },
        slots: {
          icon: "<i data-test='icon' />",
          actions: "<button type='button'>Create</button>",
        },
      }),
    )
    expect(wrapper.find("[data-test='icon']").exists()).toBe(true)
    expect(wrapper.get(".miu-empty-state__description").text()).toBe("Nothing here")
    expect(wrapper.get(".miu-empty-state__actions button").text()).toBe("Create")
  })
})

describe("Table branches", () => {
  const columns = [{ key: "name", label: "Name" }] as const

  it("renders skeleton rows while loading", () => {
    const wrapper = track(
      mount(Table, {
        props: { columns: [...columns], rows: [], loading: true },
      }),
    )
    expect(wrapper.findAll(".miu-skeleton")).toHaveLength(3)
    expect(wrapper.attributes("data-loading")).toBe("true")
  })

  it("renders the empty slot and the actions column", () => {
    const wrapper = track(
      mount(Table, {
        props: { columns: [...columns], rows: [], emptyText: "Nothing yet" },
        slots: { "row-actions": "<button type='button'>Edit</button>" },
      }),
    )
    expect(wrapper.get(".miu-table__empty").text()).toBe("Nothing yet")
    expect(wrapper.find(".miu-table__th--actions").exists()).toBe(true)
  })

  it("renders striped, bordered and sticky variants", () => {
    const wrapper = track(
      mount(Table, {
        props: {
          columns: [...columns],
          rows: [{ id: 1, name: "Ada" }],
          striped: true,
          bordered: true,
          stickyHeader: true,
        },
      }),
    )
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(["miu-table--striped", "miu-table--bordered", "miu-table--sticky"]),
    )
    expect(wrapper.findAll(".miu-table__row")).toHaveLength(1)
  })
})

describe("SegmentedControl branches", () => {
  it("marks disabled options and keeps the active one", () => {
    const wrapper = track(
      mount(SegmentedControl, {
        props: {
          modelValue: "a",
          ariaLabel: "Layout",
          options: [
            { value: "a", label: "A", icon: "check" },
            { value: "b", label: "B", disabled: true },
          ],
        },
      }),
    )
    const items = wrapper.findAll(".miu-segmented__item")
    expect(items).toHaveLength(2)
    expect(items[0]?.attributes("data-state")).toBe("on")
    expect(items[1]?.attributes("disabled")).toBeDefined()
  })
})

describe("overlay branches", () => {
  it("opens a context menu with separators, danger and disabled items", async () => {
    const wrapper = track(
      mount(ContextMenu, {
        props: {
          items: [
            { label: "Edit", value: "edit", icon: "settings" },
            { label: "", value: "sep", separator: true },
            { label: "Delete", value: "delete", danger: true, disabled: true },
          ],
        },
        slots: { trigger: '<button type="button" data-test="trigger">Open</button>' },
        attachTo: document.body,
      }),
    )
    await wrapper.get("[data-test='trigger']").trigger("contextmenu")
    await flushPromises()

    const items = document.querySelectorAll(".miu-menu__item")
    expect(items).toHaveLength(2)
    expect(document.querySelector(".miu-menu__separator")).not.toBeNull()
    expect(items[1]?.hasAttribute("data-danger")).toBe(true)
    expect(items[1]?.hasAttribute("data-disabled")).toBe(true)
  })

  it("renders tooltip content when open", async () => {
    track(
      mount(Tooltip, {
        props: { open: true, material: "solid", radius: "sm" },
        slots: { trigger: '<button type="button">Hover</button>', default: "Tip text" },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    expect(document.body.textContent).toContain("Tip text")
    const tip = document.querySelector(".miu-tooltip")
    expect(tip?.getAttribute("data-material")).toBe("solid")
    expect(tip?.getAttribute("data-miu-radius")).toBe("sm")
  })

  it("renders a drawer with its side and close affordance", async () => {
    track(
      mount(
        {
          components: { Drawer, ThemeProvider },
          template: `
            <ThemeProvider>
              <Drawer :open="true" side="end" title="Settings" radius="none">
                <p>Body</p>
              </Drawer>
            </ThemeProvider>
          `,
        },
        { attachTo: document.body },
      ),
    )
    await flushPromises()
    const content = document.querySelector(".miu-drawer__content")
    expect(content?.getAttribute("data-side")).toBe("end")
    expect(content?.getAttribute("data-miu-radius")).toBe("none")
    expect(document.querySelector(".miu-drawer__close")).not.toBeNull()
  })
})

describe("display branches", () => {
  it("rotates icons and tolerates unknown names", () => {
    const rotated = track(mount(Icon, { props: { name: "chevron", rotate: 90 } }))
    expect(rotated.classes()).toContain("miu-icon--rotated")
    expect(rotated.attributes("style")).toContain("--miu-icon-rotation")

    const unknown = track(mount(Icon, { props: { name: "nope" as unknown as "check" } }))
    expect(unknown.find("path, circle, rect").exists()).toBe(false)
  })

  it("applies app bar material and density attributes", () => {
    const wrapper = track(
      mount(AppBar, {
        props: { material: "glass", density: "compact", sticky: true, blurred: true },
        slots: { brand: "<strong>Brand</strong>", default: "Content" },
      }),
    )
    expect(wrapper.attributes("data-material")).toBe("glass")
    expect(wrapper.attributes("data-density")).toBe("compact")
    expect(wrapper.attributes("data-sticky")).toBe("true")
    expect(wrapper.attributes("data-blurred")).toBe("true")
  })
})

describe("ThemeProvider branches", () => {
  it("resolves the system theme through matchMedia and honours as", async () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia

    const wrapper = track(
      mount(ThemeProvider, {
        props: { theme: "system", as: "section" },
        slots: { default: "<span>child</span>" },
      }),
    )

    await flushPromises()
    expect(wrapper.element.tagName).toBe("SECTION")
    expect(wrapper.attributes("data-theme")).toBe("dark")
    expect(wrapper.find(".miu-portal-root").exists()).toBe(true)

    window.matchMedia = original
  })

  it("passes every orthogonal dimension through to the root attributes", () => {
    const wrapper = track(
      mount(ThemeProvider, {
        props: {
          theme: "light",
          density: "comfortable",
          radius: "full",
          material: "mica",
          motionTier: "reduced",
        },
        slots: { default: "<span>child</span>" },
      }),
    )
    expect(wrapper.attributes()).toMatchObject({
      "data-theme": "light",
      "data-density": "comfortable",
      "data-radius": "full",
      "data-material": "mica",
      "data-motion-tier": "reduced",
    })
  })
})

describe("remaining display branches", () => {
  it("merges a string style override into the truncate root", () => {
    const wrapper = track(
      mount(TruncateText, {
        props: { text: "Long copy", lines: 3, styles: { root: "color: red" } },
      }),
    )
    expect(wrapper.attributes("style")).toContain("--miu-truncate-lines: 3")
    expect(wrapper.attributes("style")).toContain("color: red")
    expect(wrapper.attributes("title")).toBe("Long copy")
  })

  it("falls back to the built-in i18n context without a provider", () => {
    let ctx: ReturnType<typeof useMiuI18n> | undefined
    track(
      mount({
        setup() {
          ctx = useMiuI18n()
          return () => null
        },
      }),
    )
    expect(ctx).toBeDefined()
    expect(typeof ctx?.t("common.confirm")).toBe("string")
    expect(ctx?.locale.value).toBe("zh-CN")
    expect(ctx?.formatNumber(1234)).toContain("1")
    expect(ctx?.formatDate(new Date(2026, 0, 2)).length).toBeGreaterThan(0)
    ctx?.setLocale("en-US")
    expect(ctx?.t("common.confirm").length).toBeGreaterThan(0)
    ctx?.setLocale("zh-CN")
  })

  it("navigates from the next pagination link too", async () => {
    const wrapper = track(
      mount(Pagination, {
        props: {
          previous: { text: "Prev", link: "/prev" },
          next: { text: "Next", link: "/next" },
        },
      }),
    )
    const links = wrapper.findAll("a.miu-pagination__link")
    await links[1]?.trigger("click")
    expect(wrapper.emitted("select")).toHaveLength(1)
  })

  it("renders a tooltip without an explicit radius or material", async () => {
    track(
      mount(Tooltip, {
        props: { open: true },
        slots: { trigger: '<button type="button">Hover</button>', default: "Plain tip" },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    const tip = document.querySelector(".miu-tooltip")
    expect(tip?.getAttribute("data-miu-radius")).toBe("sm")
  })
})

describe("ToastViewport branches", () => {
  it("renders status and alert toasts with material/radius and dismisses on click", async () => {
    const { toast, clear } = useToast()
    clear()
    track(
      mount(
        {
          components: { ThemeProvider, ToastViewport },
          template: `<ThemeProvider><ToastViewport material="glass" radius="lg" /></ThemeProvider>`,
        },
        { attachTo: document.body },
      ),
    )
    toast({ title: "Saved", variant: "success" })
    toast({ title: "Failed", description: "Network error", variant: "error", duration: 0 })
    await flushPromises()

    const items = document.querySelectorAll(".miu-toast")
    expect(items.length).toBeGreaterThanOrEqual(2)
    const err = Array.from(items).find((el) => el.getAttribute("data-variant") === "error")
    expect(err?.getAttribute("role")).toBe("alert")
    expect(err?.getAttribute("data-material")).toBe("glass")
    expect(err?.getAttribute("data-miu-radius")).toBe("lg")

    ;(err?.querySelector(".miu-toast__close") as HTMLElement | null)?.click()
    await flushPromises()
    clear()
  })
})
