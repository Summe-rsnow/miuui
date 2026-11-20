import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import { registerMaterial } from "@xcmm1543/miuui-core"
import type { IconDefinition } from "@xcmm1543/miuui-icons"
import { useConfirm } from "../composables/useConfirm"
import Alert from "./Alert.vue"
import AppBar from "./AppBar.vue"
import Avatar from "./Avatar.vue"
import Badge from "./Badge.vue"
import Breadcrumb from "./Breadcrumb.vue"
import Button from "./Button.vue"
import Card from "./Card.vue"
import Code from "./Code.vue"
import Collapse from "./Collapse.vue"
import EmptyState from "./EmptyState.vue"
import Icon from "./Icon.vue"
import IconButton from "./IconButton.vue"
import Image from "./Image.vue"
import ImageGroup from "./ImageGroup.vue"
import Kbd from "./Kbd.vue"
import List from "./List.vue"
import ListItem from "./ListItem.vue"
import NavMenu from "./NavMenu.vue"
import PageHeader from "./PageHeader.vue"
import PageLayout from "./PageLayout.vue"
import Pagination from "./Pagination.vue"
import Progress from "./Progress.vue"
import SectionHeader from "./SectionHeader.vue"
import Skeleton from "./Skeleton.vue"
import Spinner from "./Spinner.vue"
import Table from "./Table.vue"
import ThemeProvider from "./ThemeProvider.vue"
import Toc from "./Toc.vue"
import TruncateText from "./TruncateText.vue"

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

const customIcon: IconDefinition = {
  name: "starCustom",
  viewBox: "0 0 24 24",
  content: '<path d="M12 2L15 9L22 9L17 14L19 21L12 17L5 21L7 14L2 9L9 9Z" />',
}

describe("v0.7.0 Display / Layout / Nav / Feedback unification", () => {
  it("Icon renders IconDefinition and built-in IconName via name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const custom = track(mount(Icon, { props: { name: customIcon, label: "Star" } }))
    expect(custom.find("path").attributes("d")).toContain("M12 2L15 9")
    expect(custom.attributes("role")).toBe("img")

    const clean = track(mount(Icon, { props: { name: "check" } }))
    expect(clean.find("path").exists()).toBe(true)
    expect(warn).not.toHaveBeenCalled()
  })

  it("Button supports radius='full', wires iconRight semantic region & #icon-right slot, and exposes focus/blur/buttonRef", () => {
    const btn = track(
      mount(Button, {
        props: {
          radius: "full",
          iconRight: "chevronRight",
          classNames: { icon: "btn-ic", label: "btn-lbl" },
          styles: { icon: { opacity: "0.8" } },
        },
        slots: { default: "Continue" },
        attachTo: document.body,
      }),
    )
    expect(btn.attributes("data-miu-radius")).toBe("full")
    const rightIcon = btn.get(".miu-button__icon--right")
    expect(rightIcon.classes()).toContain("btn-ic")
    expect(rightIcon.attributes("style")).toContain("opacity: 0.8")

    const exposed = btn.vm as unknown as {
      focus: () => void
      blur: () => void
      buttonRef: HTMLButtonElement | undefined
    }
    expect(exposed.buttonRef).toBe(btn.get("button").element)
    exposed.focus()
    expect(document.activeElement).toBe(exposed.buttonRef)
    exposed.blur()
    expect(document.activeElement).not.toBe(exposed.buttonRef)

    const slotted = track(
      mount(Button, {
        slots: { default: "Menu", "icon-right": '<span class="custom-right">R</span>' },
      }),
    )
    expect(slotted.find(".miu-button__icon--right .custom-right").text()).toBe("R")
  })

  it("IconButton aligns semantic regions, supports radius override, uses useControlSize, and exposes focus/blur", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const clean = track(
      mount(IconButton, {
        props: {
          icon: "settings",
          label: "Settings",
          classNames: { root: "ib-root", icon: "ib-icon" },
        },
        attachTo: document.body,
      }),
    )
    expect(warn).not.toHaveBeenCalled()
    expect(clean.attributes("data-miu-radius")).toBe("full")
    expect(clean.classes()).toContain("ib-root")
    expect(clean.get(".miu-button__icon").classes()).toContain("ib-icon")

    const exposed = clean.vm as unknown as {
      focus: () => void
      blur: () => void
    }
    exposed.focus()
    expect(document.activeElement).toBe(clean.get("button").element)
    exposed.blur()
    expect(document.activeElement).not.toBe(clean.get("button").element)

    const spinning = track(
      mount(IconButton, {
        props: {
          icon: "settings",
          label: "Busy",
          loading: true,
          classNames: { spinner: "ib-spin" },
        },
      }),
    )
    expect(spinning.get(".miu-spinner").classes()).toContain("ib-spin")

    const squircle = track(
      mount(IconButton, {
        props: { icon: "plus", label: "Add", radius: "default", size: "huge" as unknown as "md" },
      }),
    )
    expect(squircle.attributes("data-miu-radius")).toBe("default")
    expect(squircle.attributes("data-miu-size")).toBe("md")
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[μui] IconButton: unsupported size "huge"'),
    )
  })

  it("Badge supports IconProp, #icon slot, and radius='full'", () => {
    const badge = track(
      mount(Badge, {
        props: {
          icon: customIcon,
          radius: "full",
          classNames: { icon: "b-ic" },
          styles: { icon: { color: "red" } },
        },
        slots: { default: "VIP" },
      }),
    )
    expect(badge.attributes("data-miu-radius")).toBe("full")
    expect(badge.get(".miu-badge__icon").classes()).toContain("b-ic")
    expect(badge.get(".miu-badge__icon").attributes("style")).toContain("color: red")
    expect(badge.find("svg path").attributes("d")).toContain("M12 2L15 9")

    const slotBadge = track(
      mount(Badge, {
        props: { classNames: { icon: "slot-ic" } },
        slots: { icon: '<span class="custom-badge-ic">*</span>', default: "New" },
      }),
    )
    expect(slotBadge.get(".miu-badge__icon.slot-ic .custom-badge-ic").text()).toBe("*")
  })

  it("Avatar supports Space activation alongside Enter and blocks interactions when disabled", async () => {
    const onClick = vi.fn()
    const activeAvatar = track(
      mount(Avatar, {
        props: { alt: "Ada", clickable: true, onClick },
      }),
    )
    expect(activeAvatar.attributes("tabindex")).toBe("0")
    await activeAvatar.trigger("keydown", { key: " " })
    await activeAvatar.trigger("keydown", { key: "Enter" })
    expect(onClick).toHaveBeenCalledTimes(2)
    expect(onClick.mock.calls[0]?.[0]).toBeInstanceOf(KeyboardEvent)

    const disabledAvatar = track(
      mount(Avatar, {
        props: { alt: "Ada", clickable: true, disabled: true, onClick },
      }),
    )
    expect(disabledAvatar.attributes("tabindex")).toBeUndefined()
    expect(disabledAvatar.attributes("aria-disabled")).toBe("true")
    expect(disabledAvatar.attributes("data-disabled")).toBe("true")
    expect(disabledAvatar.classes()).toContain("miu-avatar--disabled")
    await disabledAvatar.trigger("click")
    await disabledAvatar.trigger("keydown", { key: " " })
    await disabledAvatar.trigger("keydown", { key: "Enter" })
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it("Image applies fit='cover' with explicit dimensions and delegates previewable lightbox to ImagePreview", async () => {
    const img = track(
      mount(
        {
          components: { ThemeProvider, Image },
          template: `
            <ThemeProvider locale="en-US">
              <Image src="https://example.com/pic.png" alt="Cover" fit="cover" width="100%" height="100%" previewable />
            </ThemeProvider>
          `,
        },
        { attachTo: document.body },
      ),
    )
    expect(img.get(".miu-image").attributes("style")).toContain("width: 100%")
    await img.get(".miu-image").trigger("click")
    await flushPromises()
    const dialog = document.querySelector(".miu-image-preview")
    expect(dialog).not.toBeNull()
    expect(dialog?.querySelector(".miu-image__lightbox-img")?.getAttribute("src")).toBe(
      "https://example.com/pic.png",
    )
    const closeBtn = dialog?.querySelector<HTMLButtonElement>('[aria-label="Close preview"]')
    expect(closeBtn).not.toBeNull()
    closeBtn?.click()
    await flushPromises()
    expect(document.querySelector(".miu-image-preview")).toBeNull()
  })

  it("ImageGroup handles broken images cleanly without warnings", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const onError = vi.fn()
    const group = track(
      mount(ImageGroup, {
        props: {
          images: [
            {
              thumb: "https://example.com/thumb-bad.png",
              src: "https://example.com/full.png",
              alt: "One",
            },
            "https://example.com/broken.png",
            "   ",
          ],
          onError,
        },
      }),
    )
    expect(warn).not.toHaveBeenCalled()
    expect(group.findAll(".miu-image-group__item")).toHaveLength(2)

    const imgs = group.findAll("img")
    await imgs[0]?.trigger("error")
    await flushPromises()
    expect(imgs[0]?.attributes("src")).toBe("https://example.com/full.png")
    expect(onError).not.toHaveBeenCalled()

    await imgs[1]?.trigger("error")
    await flushPromises()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(group.findAll(".miu-image-group__item")[1]?.attributes("data-error")).toBe("true")
    expect(group.findAll(".miu-image__fallback")).toHaveLength(1)
  })

  it("Card supports disabled interactive state and #title slot", async () => {
    const onClick = vi.fn()
    const card = track(
      mount(Card, {
        props: { interactive: true, disabled: true, onClick },
        slots: { title: '<span class="card-custom-title">Custom Card</span>', default: "Body" },
      }),
    )
    expect(card.get(".miu-card__title .card-custom-title").text()).toBe("Custom Card")
    expect(card.attributes("data-disabled")).toBe("true")
    expect(card.attributes("aria-disabled")).toBe("true")
    expect(card.classes()).toContain("miu-card--disabled")
    await card.trigger("click")
    expect(onClick).not.toHaveBeenCalled()
  })

  it("Table wires header/empty styles, guards empty columns colspan, and sets aria-busy + localized loading caption", () => {
    const emptyTable = track(
      mount(Table, {
        props: {
          columns: [],
          rows: [],
          classNames: { empty: "tbl-empty" },
          styles: { header: { backgroundColor: "rgb(1, 2, 3)" }, empty: { letterSpacing: "1px" } },
        },
      }),
    )
    expect(emptyTable.find("thead").exists()).toBe(false)
    const emptyCell = emptyTable.get(".miu-table__empty")
    expect(emptyCell.attributes("colspan")).toBe("1")
    expect(emptyCell.classes()).toContain("tbl-empty")
    expect(emptyCell.attributes("style")).toContain("letter-spacing: 1px")

    const loadingTable = track(
      mount({
        components: { ThemeProvider, Table },
        template: `
          <ThemeProvider locale="en-US">
            <Table
              :columns="[{ key: 'name', label: 'Name' }]"
              :rows="[]"
              loading
              :styles="{ header: { color: 'blue' } }"
            />
          </ThemeProvider>
        `,
      }),
    )
    const tableEl = loadingTable.get(".miu-table")
    expect(tableEl.attributes("aria-busy")).toBe("true")
    expect(loadingTable.get("thead").attributes("style")).toContain("color: blue")
    expect(loadingTable.get("caption.miu-sr-only").text()).toBe("Loading")
  })

  it("List provides density context to ListItem and ListItem handles #actions + KeyboardEvent click", async () => {
    const onItemClick = vi.fn()
    const wrapper = track(
      mount({
        components: { List, ListItem },
        template: `
          <List density="compact">
            <ListItem title="Inherited" clickable @click="onClick" />
            <ListItem title="Overridden" density="comfortable">
              <template #actions><span class="item-actions">S</span></template>
            </ListItem>
          </List>
        `,
        methods: { onClick: onItemClick },
      }),
    )
    const items = wrapper.findAll(".miu-list-item")
    expect(items[0]?.attributes("data-density")).toBe("compact")
    expect(items[1]?.attributes("data-density")).toBe("comfortable")
    expect(items[1]?.find(".miu-list-item__actions .item-actions").text()).toBe("S")

    await items[0]?.trigger("keydown", { key: "Enter" })
    expect(onItemClick).toHaveBeenCalledTimes(1)
    expect(onItemClick.mock.calls[0]?.[0]).toBeInstanceOf(KeyboardEvent)
  })

  it("Collapse sets inert when closed and clears it when opened", async () => {
    const collapse = track(
      mount(Collapse, {
        props: { open: false },
        slots: { default: '<button type="button">Inside</button>' },
      }),
    )
    expect(collapse.attributes("inert")).toBeDefined()
    expect(collapse.attributes("aria-hidden")).toBe("true")

    await collapse.setProps({ open: true })
    expect(collapse.attributes("inert")).toBeUndefined()
    expect(collapse.attributes("aria-hidden")).toBeUndefined()
  })

  it("AppBar binds data-miu-radius", () => {
    const bar = track(mount(AppBar, { props: { radius: "lg" }, slots: { default: "Nav" } }))
    expect(bar.attributes("data-miu-radius")).toBe("lg")
  })

  it("NavMenu skips empty groups, exposes aria-disabled + tabindex=-1 on disabled links, and keeps child parity", async () => {
    const emptyMenu = track(mount(NavMenu, { props: { groups: [{ text: "Empty", items: [] }] } }))
    expect(emptyMenu.find("nav").exists()).toBe(false)

    const menu = track(
      mount(NavMenu, {
        props: {
          classNames: { item: "nm-item", link: "nm-link", badge: "nm-badge" },
          styles: { link: { letterSpacing: "0.02em" } },
          groups: [
            { text: "Skipped", items: [] },
            {
              text: "Docs",
              items: [
                {
                  text: "Disabled Link",
                  link: "/off",
                  disabled: true,
                  items: [
                    { text: "Child Active", link: "/c1", active: true, badge: "new" },
                    { text: "Child Disabled", link: "/c2", disabled: true },
                    { text: "Child Text", disabled: true, badge: "beta" },
                  ],
                },
                { text: "Header Text", badge: "v2" },
              ],
            },
          ],
        },
      }),
    )
    expect(menu.findAll(".miu-nav-menu__group")).toHaveLength(1)
    expect(menu.text()).not.toContain("Skipped")

    const links = menu.findAll("a.miu-nav-menu__link")
    expect(links[0]?.attributes("aria-disabled")).toBe("true")
    expect(links[0]?.attributes("tabindex")).toBe("-1")
    expect(links[1]?.classes()).toContain("miu-nav-menu__link--child")
    expect(links[1]?.classes()).toContain("nm-link")
    expect(links[1]?.attributes("style")).toContain("letter-spacing: 0.02em")
    expect(links[1]?.find(".miu-nav-menu__badge.nm-badge").text()).toBe("new")
    expect(links[2]?.attributes("aria-disabled")).toBe("true")
    expect(links[2]?.attributes("tabindex")).toBe("-1")

    const spans = menu.findAll("span.miu-nav-menu__link")
    expect(spans).toHaveLength(2)
    expect(spans[0]?.attributes("aria-disabled")).toBe("true")
    expect(spans[0]?.find(".miu-nav-menu__badge").text()).toBe("beta")
    expect(spans[1]?.find(".miu-nav-menu__badge").text()).toBe("v2")

    await links[2]?.trigger("click")
    expect(menu.emitted("select")).toBeUndefined()
  })

  it("Breadcrumb and Toc render nothing when items are empty", () => {
    const bc = track(mount(Breadcrumb, { props: { items: [] } }))
    expect(bc.find("nav").exists()).toBe(false)

    const toc = track(mount(Toc, { props: { items: [] } }))
    expect(toc.find("nav").exists()).toBe(false)
  })

  it("Pagination wires materialTokens in links mode and locks all controls during loading or disabled", async () => {
    registerMaterial({
      name: "pg-custom",
      fallback: "solid",
      generateTokens: () => ({ "--miu-material-surface": "rgb(10 20 30)" }),
    })
    const onSelect = vi.fn()
    const linksPg = track(
      mount(Pagination, {
        props: {
          mode: "links",
          material: "pg-custom",
          disabled: true,
          previous: { text: "Prev", link: "/prev" },
          next: { text: "Next", link: "/next" },
          onSelect,
        },
      }),
    )
    expect(linksPg.attributes("style")).toContain("--miu-material-surface: rgb(10 20 30)")
    const prevLink = linksPg.get(".miu-pagination__link--previous")
    expect(prevLink.attributes("aria-disabled")).toBe("true")
    expect(prevLink.attributes("tabindex")).toBe("-1")
    await prevLink.trigger("click")
    expect(onSelect).not.toHaveBeenCalled()

    const onPage = vi.fn()
    const onSize = vi.fn()
    const numericPg = track(
      mount(Pagination, {
        props: {
          mode: "numeric",
          loading: true,
          page: 2,
          pageSize: 20,
          total: 100,
          iconSize: "lg",
          pageSizeOptions: [
            { label: "20", value: 20 },
            { label: "50", value: 50 },
          ],
          classNames: { icon: "pg-ic", link: "pg-link", label: "pg-lbl" },
          "onUpdate:page": onPage,
          "onUpdate:pageSize": onSize,
        },
      }),
    )
    expect(numericPg.attributes("aria-busy")).toBe("true")
    expect(numericPg.findAll("button").every((b) => b.attributes("disabled") !== undefined)).toBe(
      true,
    )
    expect(numericPg.get(".miu-select__trigger").attributes("disabled")).toBeDefined()
    expect(numericPg.get(".miu-number-input__control").attributes("disabled")).toBeDefined()
    expect(numericPg.find(".miu-button.pg-ic, .pg-ic").exists()).toBe(true)
    expect(numericPg.find(".pg-link").exists()).toBe(true)
    expect(numericPg.find(".pg-lbl").exists()).toBe(true)

    numericPg.findComponent({ name: "Select" }).vm.$emit("update:modelValue", 50)
    numericPg.findComponent({ name: "NumberInput" }).vm.$emit("update:modelValue", 4)
    await numericPg.findAll(".miu-pagination__page-btn")[0]?.trigger("click")
    expect(onPage).not.toHaveBeenCalled()
    expect(onSize).not.toHaveBeenCalled()
  })

  it("PageHeader, PageLayout, and SectionHeader forward slots, iconSize, and back events", async () => {
    const onDirectBack = vi.fn()
    const directHeader = track(
      mount(PageHeader, {
        props: {
          title:
            "SuperLongUnbrokenPageHeaderTitleThatMustWrapCleanlyWithoutPushingActionsOffScreen",
          back: true,
          onBack: onDirectBack,
        },
        slots: { actions: '<button type="button">Action</button>' },
      }),
    )
    expect(directHeader.find(".miu-page-header__lead .miu-page-header__text").exists()).toBe(true)
    expect(directHeader.get(".miu-page-header__actions button").text()).toBe("Action")
    await directHeader.get(".miu-page-header__back").trigger("click")
    expect(onDirectBack.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent)

    const onBack = vi.fn()
    const layout = track(
      mount(PageLayout, {
        props: { title: "Very Long Page Title", back: true, iconSize: "lg", onBack },
        slots: {
          lead: '<span class="hdr-lead">Lead</span>',
          title: '<span class="hdr-title">Slot Title</span>',
          description: '<span class="hdr-desc">Slot Desc</span>',
          actions: '<button type="button">Save</button>',
        },
      }),
    )
    expect(layout.get(".miu-page-header").attributes("data-miu-icon-size")).toBe("lg")
    expect(layout.get(".miu-page-header__lead .hdr-lead").text()).toBe("Lead")
    expect(layout.find(".miu-page-header__text").exists()).toBe(true)
    expect(layout.get(".miu-page-header__title .hdr-title").text()).toBe("Slot Title")
    expect(layout.get(".miu-page-header__description .hdr-desc").text()).toBe("Slot Desc")
    await layout.get(".miu-page-header__back").trigger("click")
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onBack.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent)

    const section = track(
      mount(SectionHeader, {
        props: { title: "Fallback" },
        slots: {
          title: '<span class="sec-title">Custom Section</span>',
          description: '<span class="sec-desc">Custom Desc</span>',
        },
      }),
    )
    expect(section.get(".miu-section-header__title .sec-title").text()).toBe("Custom Section")
    expect(section.get(".miu-section-header__description .sec-desc").text()).toBe("Custom Desc")
  })

  it("Alert, Code, Kbd, Progress, Skeleton, Spinner, and EmptyState bind attributes and slots", () => {
    const alert = track(
      mount(Alert, {
        props: { icon: customIcon, iconSize: "lg", title: "Notice" },
        slots: { default: "Info" },
      }),
    )
    expect(alert.attributes("data-miu-icon-size")).toBe("lg")
    expect(alert.get("svg.miu-icon").attributes("data-miu-icon-size")).toBe("lg")

    const code = track(mount(Code, { props: { size: "sm", value: "pnpm check" } }))
    expect(code.attributes("data-miu-size")).toBe("sm")

    const kbd = track(mount(Kbd, { props: { size: "md", keys: "Esc" } }))
    expect(kbd.attributes("data-miu-size")).toBe("md")

    const progress = track(
      mount(Progress, {
        props: { modelValue: 50, styles: { indicator: { opacity: "0.9" } } },
      }),
    )
    expect(progress.get(".miu-progress__indicator").attributes("style")).toContain("opacity: 0.9")

    const skeleton = track(
      mount(Skeleton, {
        props: { width: 80, radius: "lg", styles: { root: { opacity: "0.7" } } },
      }),
    )
    expect(skeleton.attributes("style")).toContain("width: 80px")
    expect(skeleton.attributes("style")).toContain("opacity: 0.7")

    const spinner = track(mount(Spinner, { props: { size: "lg", label: "Busy" } }))
    expect(spinner.attributes("data-miu-icon-size")).toBe("lg")
    expect(spinner.attributes("aria-label")).toBe("Busy")

    const empty = track(
      mount(EmptyState, {
        props: { icon: customIcon, iconSize: "lg", density: "compact" },
        slots: {
          title: '<span class="empty-t">Nothing</span>',
          description: '<span class="empty-d">Try again</span>',
          actions: '<button type="button">Reset</button>',
        },
      }),
    )
    expect(empty.attributes("data-miu-icon-size")).toBe("lg")
    expect(empty.attributes("data-density")).toBe("compact")
    expect(empty.get(".miu-empty-state__title .empty-t").text()).toBe("Nothing")
    expect(empty.get(".miu-empty-state__description .empty-d").text()).toBe("Try again")
    expect(empty.get(".miu-empty-state__actions button").text()).toBe("Reset")
  })

  it("TruncateText uses TruncateText material name, i18n labels, useMounted guard, and keyboard popover toggle/ESC", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const localized = track(
      mount({
        components: { ThemeProvider, TruncateText },
        template: `
          <ThemeProvider locale="en-US">
            <TruncateText text="Overflow text content" expandable />
          </ThemeProvider>
        `,
      }),
    )
    const toggleBtn = localized.get(".miu-truncate__toggle")
    expect(toggleBtn.text()).toBe("Expand")
    await toggleBtn.trigger("click")
    expect(toggleBtn.text()).toBe("Collapse")

    const kbTruncate = track(
      mount(TruncateText, {
        props: {
          text: "Keyboard popover content",
          expandMode: "popover",
          material: "missing-tt-mat",
        },
        attachTo: document.body,
      }),
    )
    expect(kbTruncate.attributes("tabindex")).toBe("0")
    await kbTruncate.trigger("keydown", { key: "Enter" })
    await flushPromises()
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[μui] TruncateText: unregistered material "missing-tt-mat"'),
    )
    const popover = document.querySelector(".miu-truncate__popover")
    expect(popover).not.toBeNull()
    expect(popover?.getAttribute("data-material")).toBe("solid")
    expect(kbTruncate.attributes("aria-describedby")).toBe(popover?.getAttribute("id"))

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    await flushPromises()
    expect(document.querySelector(".miu-truncate__popover")).toBeNull()

    await kbTruncate.trigger("keydown", { key: " " })
    await flushPromises()
    expect(document.querySelector(".miu-truncate__popover")).not.toBeNull()
    await kbTruncate.trigger("keydown", { key: " " })
    await flushPromises()
    expect(document.querySelector(".miu-truncate__popover")).toBeNull()
  })

  it("ThemeProvider binds useConfirm async loading onto ConfirmDialog and handles rejection safely", async () => {
    track(mount(ThemeProvider, { attachTo: document.body }))
    const { confirm } = useConfirm()

    let finishConfirm!: () => void
    const pendingPromise = confirm({
      title: "Delete record?",
      onConfirm: () =>
        new Promise<void>((resolve) => {
          finishConfirm = resolve
        }),
    })
    await flushPromises()

    const dialog = document.querySelector(".miu-dialog__content")
    expect(dialog).not.toBeNull()
    const footerBtns =
      dialog?.querySelectorAll<HTMLButtonElement>(".miu-dialog__footer button") ?? []
    footerBtns[1]?.click()
    await flushPromises()

    expect(footerBtns[0]?.disabled).toBe(true)
    expect(footerBtns[1]?.getAttribute("aria-busy")).toBe("true")
    dialog?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    await flushPromises()
    expect(document.querySelector(".miu-dialog__content")).not.toBeNull()

    finishConfirm()
    await flushPromises()
    expect(await pendingPromise).toBe(true)
    expect(document.querySelector(".miu-dialog__content")).toBeNull()

    const rejectPromise = confirm({
      title: "Retryable?",
      onConfirm: async () => {
        throw new Error("network down")
      },
    })
    await flushPromises()
    const retryBtns = document.querySelectorAll<HTMLButtonElement>(".miu-dialog__footer button")
    retryBtns[1]?.click()
    await flushPromises()
    expect(retryBtns[0]?.disabled).toBe(false)
    expect(retryBtns[1]?.getAttribute("aria-busy")).toBeNull()
    retryBtns[0]?.click()
    await flushPromises()
    expect(await rejectPromise).toBe(false)
  })

  it("Code, Kbd, Progress, EmptyState, NavMenu, and Skeleton wire material, custom materialTokens, and ThemeProvider inheritance", () => {
    registerMaterial({
      name: "wave6b-custom",
      fallback: "solid",
      generateTokens: () => ({ "--miu-material-surface": "rgb(11 22 33)" }),
    })

    const code = track(
      mount(Code, {
        props: {
          value: "pnpm test",
          material: "wave6b-custom",
          styles: { root: { opacity: "0.9" } },
        },
      }),
    )
    expect(code.attributes("data-material")).toBe("wave6b-custom")
    expect(code.attributes("style")).toContain("--miu-material-surface: rgb(11 22 33)")
    expect(code.attributes("style")).toContain("opacity: 0.9")

    const kbd = track(mount(Kbd, { props: { keys: "K", material: "wave6b-custom" } }))
    expect(kbd.attributes("data-material")).toBe("wave6b-custom")
    expect(kbd.attributes("style")).toContain("--miu-material-surface: rgb(11 22 33)")

    const progress = track(
      mount(Progress, { props: { modelValue: 40, material: "wave6b-custom" } }),
    )
    expect(progress.attributes("data-material")).toBe("wave6b-custom")
    expect(progress.attributes("style")).toContain("--miu-material-surface: rgb(11 22 33)")

    const empty = track(mount(EmptyState, { props: { material: "wave6b-custom" } }))
    expect(empty.attributes("data-material")).toBe("wave6b-custom")
    expect(empty.attributes("style")).toContain("--miu-material-surface: rgb(11 22 33)")

    const nav = track(
      mount(NavMenu, {
        props: {
          material: "wave6b-custom",
          groups: [{ text: "Nav", items: [{ text: "Home", link: "/" }] }],
        },
      }),
    )
    expect(nav.attributes("data-material")).toBe("wave6b-custom")
    expect(nav.attributes("style")).toContain("--miu-material-surface: rgb(11 22 33)")

    const navGlass = track(
      mount(NavMenu, {
        props: {
          material: "glass",
          groups: [{ text: "Nav", items: [{ text: "Home", link: "/" }] }],
        },
      }),
    )
    expect(navGlass.attributes("data-material")).toBe("glass")

    const skeleton = track(
      mount(Skeleton, {
        props: { width: 120, material: "wave6b-custom", styles: { root: { opacity: "0.8" } } },
      }),
    )
    expect(skeleton.attributes("data-material")).toBe("wave6b-custom")
    expect(skeleton.attributes("style")).toContain("--miu-material-surface: rgb(11 22 33)")
    expect(skeleton.attributes("style")).toContain("width: 120px")
    expect(skeleton.attributes("style")).toContain("opacity: 0.8")

    const nested = track(
      mount({
        components: { ThemeProvider, Code, Kbd, Progress, EmptyState, NavMenu, Skeleton },
        template: `
          <ThemeProvider material="solid">
            <ThemeProvider material="glass">
              <Code value="inherited" />
              <Kbd keys="Esc" />
              <Progress :model-value="60" />
              <EmptyState title="Empty" />
              <NavMenu :groups="[{ text: 'Docs', items: [{ text: 'Guide', link: '/guide' }] }]" />
              <Skeleton :width="64" />
              <Code value="override" material="solid" />
            </ThemeProvider>
          </ThemeProvider>
        `,
      }),
    )

    const providers = nested.findAll(".miu-theme-provider")
    expect(providers[0]?.attributes("data-material")).toBe("solid")
    expect(providers[1]?.attributes("data-material")).toBe("glass")

    const codes = nested.findAll(".miu-code")
    expect(codes[0]?.attributes("data-material")).toBeUndefined()
    expect(codes[1]?.attributes("data-material")).toBe("solid")
    expect(nested.get(".miu-kbd").attributes("data-material")).toBeUndefined()
    expect(nested.get(".miu-progress").attributes("data-material")).toBeUndefined()
    expect(nested.get(".miu-empty-state").attributes("data-material")).toBeUndefined()
    expect(nested.get(".miu-nav-menu").attributes("data-material")).toBeUndefined()
    expect(nested.get(".miu-skeleton").attributes("data-material")).toBeUndefined()
  })

  it("Breadcrumb, Toc, EmptyState, and Skeleton bind default and overridden data-miu-radius", () => {
    const bcDefault = track(mount(Breadcrumb, { props: { items: [{ text: "Home", link: "/" }] } }))
    expect(bcDefault.attributes("data-miu-radius")).toBe("sm")
    const bcLg = track(
      mount(Breadcrumb, { props: { items: [{ text: "Home", link: "/" }], radius: "lg" } }),
    )
    expect(bcLg.attributes("data-miu-radius")).toBe("lg")

    const tocDefault = track(mount(Toc, { props: { items: [{ id: "a", text: "A", level: 2 }] } }))
    expect(tocDefault.attributes("data-miu-radius")).toBe("sm")
    const tocFull = track(
      mount(Toc, { props: { items: [{ id: "a", text: "A", level: 2 }], radius: "full" } }),
    )
    expect(tocFull.attributes("data-miu-radius")).toBe("full")

    const emptyDefault = track(mount(EmptyState))
    expect(emptyDefault.attributes("data-miu-radius")).toBe("default")
    const emptyMd = track(mount(EmptyState, { props: { radius: "md" } }))
    expect(emptyMd.attributes("data-miu-radius")).toBe("md")

    const skDefault = track(mount(Skeleton))
    expect(skDefault.attributes("data-miu-radius")).toBe("default")
    expect(skDefault.attributes("style")).toContain(
      "--miu-skeleton-radius: var(--miu-radius-default)",
    )
    const skNone = track(mount(Skeleton, { props: { radius: "none" } }))
    expect(skNone.attributes("data-miu-radius")).toBe("none")
    expect(skNone.attributes("style")).toContain("--miu-skeleton-radius: var(--miu-radius-none)")
  })

  it("Collapse wires disabled class, data-disabled, aria-disabled, and inert", async () => {
    const collapse = track(
      mount(Collapse, {
        props: { open: true, disabled: false },
        slots: { default: '<button type="button">Action</button>' },
      }),
    )
    expect(collapse.classes()).not.toContain("miu-collapse--disabled")
    expect(collapse.attributes("data-disabled")).toBeUndefined()
    expect(collapse.attributes("aria-disabled")).toBeUndefined()
    expect(collapse.attributes("inert")).toBeUndefined()

    await collapse.setProps({ disabled: true })
    expect(collapse.classes()).toContain("miu-collapse--disabled")
    expect(collapse.attributes("data-disabled")).toBe("true")
    expect(collapse.attributes("aria-disabled")).toBe("true")
    expect(collapse.attributes("inert")).toBeDefined()
  })
})
