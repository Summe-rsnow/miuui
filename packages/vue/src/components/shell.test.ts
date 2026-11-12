import { flushPromises, mount } from "@vue/test-utils"
import { defineComponent, nextTick } from "vue"
import { describe, expect, it } from "vitest"
import Alert from "./Alert.vue"
import AppBar from "./AppBar.vue"
import Breadcrumb from "./Breadcrumb.vue"
import CommandPalette from "./CommandPalette.vue"
import Drawer from "./Drawer.vue"
import EmptyState from "./EmptyState.vue"
import Kbd from "./Kbd.vue"
import NavMenu from "./NavMenu.vue"
import Pagination from "./Pagination.vue"
import ThemeProvider from "./ThemeProvider.vue"
import Toc from "./Toc.vue"
import { useMiuI18n, useMiuTheme } from "../composables/useMiu"

describe("NavMenu", () => {
  it("marks active links and emits select", async () => {
    const wrapper = mount(NavMenu, {
      props: {
        groups: [
          {
            text: "开始",
            items: [
              { text: "快速开始", link: "/guide/start", active: true },
              { text: "架构", link: "/guide/architecture" },
            ],
          },
        ],
      },
    })

    const active = wrapper.get("[aria-current='page']")
    expect(active.text()).toBe("快速开始")
    active.element.addEventListener("click", (event) => event.preventDefault(), { once: true })
    await active.trigger("click")
    expect(wrapper.emitted("select")?.[0]?.[0]).toMatchObject({ text: "快速开始" })
  })

  it("ignores disabled links", async () => {
    const wrapper = mount(NavMenu, {
      props: {
        groups: [{ items: [{ text: "Disabled", link: "/disabled", disabled: true }] }],
      },
    })
    await wrapper.get("a").trigger("click")
    expect(wrapper.emitted("select")).toBeUndefined()
  })
})

describe("documentation navigation components", () => {
  it("renders Toc active state", () => {
    const wrapper = mount(Toc, {
      props: {
        items: [
          { id: "install", text: "Install", level: 2 },
          { id: "usage", text: "Usage", level: 3 },
        ],
        activeId: "usage",
      },
    })
    expect(wrapper.findAll(".miu-toc__item")).toHaveLength(2)
    expect(wrapper.get("[aria-current='location']").text()).toBe("Usage")
  })

  it("renders the current breadcrumb as a page", () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        items: [{ text: "首页", link: "/" }, { text: "指南", link: "/guide" }, { text: "按钮" }],
      },
    })
    expect(wrapper.get("[aria-current='page']").text()).toBe("按钮")
    expect(wrapper.findAll(".miu-breadcrumb__separator")).toHaveLength(2)
  })

  it("emits pagination selection", async () => {
    const wrapper = mount(Pagination, {
      props: {
        previous: { text: "上一页", link: "/prev" },
        next: { text: "下一页", link: "/next" },
      },
    })
    const next = wrapper.get(".miu-pagination__link--next")
    next.element.addEventListener("click", (event) => event.preventDefault(), { once: true })
    await next.trigger("click")
    expect(wrapper.emitted("select")?.[0]?.[0]).toMatchObject({ link: "/next" })
  })

  it("renders Kbd and Alert content", () => {
    const kbd = mount(Kbd, { props: { keys: "Ctrl K" } })
    expect(kbd.text()).toBe("Ctrl K")

    const alert = mount(Alert, {
      props: { variant: "warning", title: "注意" },
      slots: { default: "检查配置" },
    })
    expect(alert.attributes("data-variant")).toBe("warning")
    expect(alert.text()).toContain("注意")
    expect(alert.text()).toContain("检查配置")
  })

  it("composes AppBar slots", () => {
    const wrapper = mount(AppBar, {
      props: { sticky: true, blurred: true },
      slots: { brand: "μui", default: "nav", actions: "actions" },
    })
    expect(wrapper.attributes("data-sticky")).toBe("true")
    expect(wrapper.text()).toContain("μui")
    expect(wrapper.text()).toContain("actions")
  })
})

describe("overlays", () => {
  it("renders Drawer content when open", async () => {
    const wrapper = mount(Drawer, {
      props: { open: true, title: "导航" },
      slots: { default: "menu" },
      attachTo: document.body,
    })
    await flushPromises()
    expect(document.body.textContent).toContain("导航")
    expect(document.body.textContent).toContain("menu")
    wrapper.unmount()
  })

  it("filters and selects CommandPalette items", async () => {
    const wrapper = mount(CommandPalette, {
      props: {
        open: true,
        items: [
          { title: "Button", section: "组件", link: "/components/button" },
          { title: "Dialog", section: "组件", link: "/components/dialog" },
        ],
      },
      attachTo: document.body,
    })
    await flushPromises()
    const input = document.body.querySelector<HTMLInputElement>(".miu-command-palette input")
    expect(input).not.toBeNull()
    if (input) {
      input.value = "dialog"
      input.dispatchEvent(new Event("input", { bubbles: true }))
    }
    await flushPromises()
    const items = document.body.querySelectorAll(".miu-command-palette__item")
    expect(items).toHaveLength(1)
    expect(items[0]?.textContent).toContain("Dialog")

    const content = document.body.querySelector<HTMLElement>(".miu-command-palette")
    content?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
    await flushPromises()
    expect(wrapper.emitted("select")?.[0]?.[0]).toMatchObject({ title: "Dialog" })
    wrapper.unmount()
  })
})

describe("ThemeProvider locale", () => {
  it("provides built-in English copy to descendants", () => {
    const wrapper = mount({
      components: { ThemeProvider, EmptyState },
      template: `<ThemeProvider locale="en-US"><EmptyState /></ThemeProvider>`,
    })
    expect(wrapper.text()).toContain("Nothing here yet")
  })

  it("exposes reactive locale, formats and available locales", async () => {
    const Probe = defineComponent({
      setup() {
        const i18n = useMiuI18n()
        return { i18n }
      },
      template: `<span>{{ i18n.locale.value }}</span>`,
    })
    const wrapper = mount(ThemeProvider, {
      props: { locale: "zh-CN" },
      slots: { default: Probe },
    })
    const probe = wrapper.findComponent(Probe)
    const i18n = probe.vm.i18n as ReturnType<typeof useMiuI18n>

    expect(i18n.availableLocales).toContain("en-US")
    i18n.setLocale("en-US")
    await nextTick()
    expect(wrapper.text()).toContain("en-US")
    expect(i18n.formatNumber(1234.5, { maximumFractionDigits: 0 })).toBe("1,235")
    expect(
      i18n.formatDate(new Date("2024-01-01T00:00:00Z"), {
        timeZone: "UTC",
        year: "numeric",
      }),
    ).toContain("2024")
  })

  it("uses the fallback context outside ThemeProvider", () => {
    const Probe = defineComponent({
      setup() {
        return { i18n: useMiuI18n(), theme: useMiuTheme() }
      },
      template: `<span>{{ theme.material.value }}</span>`,
    })
    const wrapper = mount(Probe)
    const vm = wrapper.vm as unknown as {
      i18n: ReturnType<typeof useMiuI18n>
      theme: ReturnType<typeof useMiuTheme>
    }

    expect(vm.theme.material.value).toBe("solid")
    expect(vm.theme.motionTier.value).toBe("full")
    vm.i18n.setLocale("en-US")
    expect(vm.i18n.t("common.close")).toBe("Close")
    expect(vm.i18n.formatNumber(1234.5, { maximumFractionDigits: 0 })).toBe("1,235")
    expect(
      vm.i18n.formatDate(new Date("2024-01-01T00:00:00Z"), {
        timeZone: "UTC",
        year: "numeric",
      }),
    ).toContain("2024")
    expect(vm.i18n.locale.value).toBe("en-US")
  })
})
