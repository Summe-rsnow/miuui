import { defineComponent, nextTick, ref } from "vue"
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import { registerMaterial, type MaterialPlugin } from "@xcmm1543/miuui-core"
import type { IconDefinition } from "@xcmm1543/miuui-icons"
import { afterEach, describe, expect, it, vi } from "vitest"
import CommandPalette from "./CommandPalette.vue"
import ConfirmDialog from "./ConfirmDialog.vue"
import ContextMenu from "./ContextMenu.vue"
import Dialog from "./Dialog.vue"
import Drawer from "./Drawer.vue"
import DropdownMenu from "./DropdownMenu.vue"
import HelpTooltip from "./HelpTooltip.vue"
import ImagePreview from "./ImagePreview.vue"
import LoadingOverlay from "./LoadingOverlay.vue"
import Popconfirm from "./Popconfirm.vue"
import Popover from "./Popover.vue"
import ThemeProvider from "./ThemeProvider.vue"
import ToastViewport from "./ToastViewport.vue"
import Tooltip from "./Tooltip.vue"
import { useConfirm } from "../composables/useConfirm"
import { useToast } from "../composables/useToast"

const mounted: VueWrapper[] = []

function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

const testMaterial: MaterialPlugin = {
  name: "test-acrylic",
  fallback: "solid",
  generateTokens: () => ({
    "--miu-material-surface": "var(--miu-color-bg-elevated)",
    "--miu-material-border": "var(--miu-color-border-strong)",
  }),
}
registerMaterial(testMaterial)

const customIcon: IconDefinition = {
  name: "customStar",
  viewBox: "0 0 24 24",
  content: '<path d="M12 2L15 9L22 9L16 14L18 21L12 17L6 21L8 14L2 9L9 9Z"/>',
}

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  document.body.innerHTML = ""
  document.body.style.overflow = ""
  document.body.style.pointerEvents = ""
})

describe("v0.7.0 overlay & floating components", () => {
  it("Dialog enforces closeOnOverlayClick, closeOnEsc, showClose, closeLabel, lockScroll, semantic regions, and zero description warnings", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    const dlg = track(
      mount(Dialog, {
        props: {
          open: true,
          title: "Preferences",
          closeOnOverlayClick: false,
          closeOnEsc: false,
          showClose: false,
          lockScroll: false,
          classNames: {
            overlay: "ov-cls",
            content: "ct-cls",
            header: "hd-cls",
            title: "tt-cls",
            body: "bd-cls",
            footer: "ft-cls",
          },
          styles: {
            overlay: { opacity: "0.9" },
            content: { minWidth: "var(--miu-dialog-width-sm)" },
          },
        },
        slots: {
          default: "Body text",
          footer: "<button type='button'>Save</button>",
        },
        attachTo: document.body,
      }),
    )
    await flushPromises()

    expect(document.body.style.overflow).not.toBe("hidden")
    expect(document.querySelector(".miu-dialog__overlay")?.classList.contains("ov-cls")).toBe(true)
    expect(
      document.querySelector(".miu-dialog__overlay")?.classList.contains("miu-overlay-backdrop"),
    ).toBe(true)
    expect(document.querySelector(".miu-dialog__content")?.classList.contains("ct-cls")).toBe(true)
    expect(document.querySelector(".miu-dialog__header")?.classList.contains("hd-cls")).toBe(true)
    expect(document.querySelector(".miu-dialog__title")?.classList.contains("tt-cls")).toBe(true)
    expect(document.querySelector(".miu-dialog__body")?.classList.contains("bd-cls")).toBe(true)
    expect(document.querySelector(".miu-dialog__footer")?.classList.contains("ft-cls")).toBe(true)
    expect(document.querySelector(".miu-dialog__close")).toBeNull()

    const content = document.querySelector<HTMLElement>(".miu-dialog__content")
    expect(content?.getAttribute("aria-describedby")).toBeNull()

    content?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    )
    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, cancelable: true }),
    )
    await flushPromises()
    expect(dlg.emitted("update:open")).toBeUndefined()

    const rekaWarnings = warn.mock.calls.filter((args) =>
      String(args[0]).includes("Missing `Description`"),
    )
    expect(rekaWarnings).toHaveLength(0)
    warn.mockRestore()

    const dlgLocked = track(
      mount(Dialog, {
        props: { open: true, title: "Locked", closeLabel: "Dismiss modal" },
        slots: { default: "Locked body" },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    expect(document.body.style.overflow).toBe("hidden")
    expect(document.querySelector(".miu-dialog__close")?.getAttribute("aria-label")).toBe(
      "Dismiss modal",
    )
    void dlgLocked
  })

  it("ConfirmDialog blocks closing while loading, emits cancel on dismiss when idle, and supports useConfirm async onConfirm", async () => {
    const confirmDlg = track(
      mount(ConfirmDialog, {
        props: {
          open: true,
          title: "Delete item?",
          loading: true,
          classNames: { cancel: "cancel-btn", confirm: "confirm-btn" },
        },
        attachTo: document.body,
      }),
    )
    await flushPromises()

    expect(document.querySelector(".miu-dialog__close")).toBeNull()
    const btns = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".miu-dialog__footer .miu-button"),
    )
    expect(btns[0]?.classList.contains("cancel-btn")).toBe(true)
    expect(btns[1]?.classList.contains("confirm-btn")).toBe(true)
    expect(btns[0]?.disabled).toBe(true)
    expect(btns[1]?.disabled).toBe(true)

    const content = document.querySelector<HTMLElement>(".miu-dialog__content")
    content?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    )
    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, cancelable: true }),
    )
    btns[0]?.click()
    btns[1]?.click()
    await flushPromises()
    expect(confirmDlg.emitted("cancel")).toBeUndefined()
    expect(confirmDlg.emitted("confirm")).toBeUndefined()
    expect(confirmDlg.emitted("update:open")).toBeUndefined()

    await confirmDlg.setProps({ loading: false })
    await flushPromises()
    content?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    )
    await flushPromises()
    expect(confirmDlg.emitted("cancel")).toHaveLength(1)
    expect(confirmDlg.emitted("update:open")?.[0]).toEqual([false])
    confirmDlg.unmount()

    track(mount(ThemeProvider, { attachTo: document.body }))
    const { confirm } = useConfirm()
    let finish!: () => void
    const pending = new Promise<void>((resolve) => {
      finish = resolve
    })
    const resultPromise = confirm({
      title: "Async action",
      onConfirm: () => pending,
    })
    await flushPromises()

    const confirmBtn = document.querySelectorAll<HTMLButtonElement>(
      ".miu-dialog__footer .miu-button",
    )[1]
    confirmBtn?.click()
    await flushPromises()

    const dlgContent = document.querySelector<HTMLElement>(".miu-dialog__content")
    expect(dlgContent).not.toBeNull()
    dlgContent?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    )
    await flushPromises()
    expect(document.querySelector(".miu-dialog__content")).not.toBeNull()

    finish()
    await flushPromises()
    expect(await resultPromise).toBe(true)
    expect(document.querySelector(".miu-dialog__content")).toBeNull()
  })

  it("Drawer maps width to blockSize on top/bottom, inlineSize on start/end, and respects close/lock props", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const drawer = track(
      mount(Drawer, {
        props: {
          open: true,
          side: "bottom",
          width: "var(--miu-dialog-width-sm)",
          showClose: false,
          closeOnEsc: false,
          closeOnOverlayClick: false,
          lockScroll: false,
        },
        slots: { default: "Bottom sheet" },
        attachTo: document.body,
      }),
    )
    await flushPromises()

    const content = document.querySelector<HTMLElement>(".miu-drawer__content")
    expect(content?.style.blockSize).toBe("var(--miu-dialog-width-sm)")
    expect(content?.style.inlineSize).toBe("")
    expect(content?.getAttribute("aria-describedby")).toBeNull()
    expect(document.querySelector(".miu-drawer__close")).toBeNull()
    expect(document.body.style.overflow).not.toBe("hidden")

    content?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    )
    await flushPromises()
    expect(drawer.emitted("update:open")).toBeUndefined()

    await drawer.setProps({ side: "end", showClose: true, closeLabel: "Close drawer" })
    await flushPromises()
    expect(content?.style.inlineSize).toBe("var(--miu-dialog-width-sm)")
    expect(document.querySelector(".miu-drawer__close")?.getAttribute("aria-label")).toBe(
      "Close drawer",
    )

    expect(
      warn.mock.calls.filter((args) => String(args[0]).includes("Missing `Description`")),
    ).toHaveLength(0)
    warn.mockRestore()
  })

  it("CommandPalette resolves material plugins, binds aria-activedescendant, handles duplicate links, and enforces close props", async () => {
    const cp = track(
      mount(CommandPalette, {
        props: {
          open: true,
          material: "test-acrylic",
          closeOnEsc: false,
          closeOnOverlayClick: false,
          emptyText: "Nothing found",
          items: [
            { title: "Home", link: "/same", icon: customIcon },
            { title: "Settings", link: "/same", icon: "settings" },
          ],
          classNames: { empty: "cp-empty", content: "cp-content" },
        },
        attachTo: document.body,
      }),
    )
    await flushPromises()

    const content = document.querySelector<HTMLElement>(".miu-command-palette")
    expect(content?.getAttribute("data-material")).toBe("test-acrylic")
    expect(content?.classList.contains("cp-content")).toBe(true)
    expect(content?.style.getPropertyValue("--miu-material-surface")).toBe(
      "var(--miu-color-bg-elevated)",
    )

    const listbox = document.querySelector<HTMLElement>('[role="listbox"]')
    const options = document.querySelectorAll('[role="option"]')
    expect(options).toHaveLength(2)
    expect(listbox?.getAttribute("aria-activedescendant")).toBe(options[0]?.id)

    content?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    await flushPromises()
    expect(listbox?.getAttribute("aria-activedescendant")).toBe(options[1]?.id)

    content?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    )
    await flushPromises()
    expect(cp.emitted("update:open")).toBeUndefined()

    const input = document.querySelector<HTMLInputElement>(".miu-command-palette__input input")
    if (input) {
      input.value = "nomatch"
      input.dispatchEvent(new Event("input"))
    }
    await flushPromises()
    const emptyEl = document.querySelector(".miu-command-palette__empty")
    expect(emptyEl?.textContent).toBe("Nothing found")
    expect(emptyEl?.classList.contains("cp-empty")).toBe(true)
    expect(listbox?.getAttribute("aria-activedescendant")).toBeNull()
  })

  it("ImagePreview wires content region, close props, and empty/error image fallbacks", async () => {
    const preview = track(
      mount(ImagePreview, {
        props: {
          open: true,
          images: ["https://example.com/1.png", "https://example.com/2.png"],
          closeOnEsc: false,
          closeOnOverlayClick: false,
          closeLabel: "Exit lightbox",
          classNames: { content: "img-pv-content", nav: "img-pv-nav" },
        },
        attachTo: document.body,
      }),
    )
    await flushPromises()

    const content = document.querySelector<HTMLElement>(".miu-image-preview")
    expect(content?.classList.contains("img-pv-content")).toBe(true)
    expect(content?.getAttribute("aria-describedby")).toBeNull()
    expect(document.querySelectorAll(".img-pv-nav")).toHaveLength(2)
    expect(document.querySelector('button[aria-label="Exit lightbox"]')).not.toBeNull()

    content?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    )
    document.querySelector<HTMLElement>(".miu-image-preview__stage")?.click()
    await flushPromises()
    expect(preview.emitted("update:open")).toBeUndefined()

    const img = document.querySelector<HTMLImageElement>(".miu-image-preview__img")
    img?.dispatchEvent(new Event("error"))
    await flushPromises()
    expect(document.querySelector(".miu-image-preview__empty")).not.toBeNull()

    await preview.setProps({ showClose: false, images: [] })
    await flushPromises()
    expect(document.querySelector('button[aria-label="Exit lightbox"]')).toBeNull()
    expect(document.querySelector(".miu-image-preview__empty")).not.toBeNull()
  })

  it("Popover respects disabled, closeOnClickOutside, and closeOnEsc", async () => {
    const disabledPop = track(
      mount(Popover, {
        props: { disabled: true },
        slots: { trigger: '<button id="pop-dis" type="button">Open</button>', default: "Body" },
        attachTo: document.body,
      }),
    )
    await disabledPop.get("#pop-dis").trigger("click")
    await flushPromises()
    expect(document.querySelector(".miu-popover")).toBeNull()

    const lockedPop = track(
      mount(Popover, {
        props: { open: true, closeOnEsc: false, closeOnClickOutside: false },
        slots: { trigger: '<button id="pop-lck" type="button">Open</button>', default: "Sticky" },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    const content = document.querySelector<HTMLElement>(".miu-popover")
    expect(content).not.toBeNull()
    content?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    )
    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, cancelable: true }),
    )
    await flushPromises()
    expect(lockedPop.emitted("update:open")).toBeUndefined()
  })

  it("Popconfirm avoids premature close when controlled or async loading, wires arrow region, and supports disabled", async () => {
    const loading = ref(false)
    const open = ref(true)
    const confirmSpy = vi.fn(() => {
      loading.value = true
    })

    const ControlledHost = defineComponent({
      components: { Popconfirm },
      setup() {
        return { loading, open, confirmSpy }
      },
      template: `
        <Popconfirm
          v-model:open="open"
          title="Delete?"
          :loading="loading"
          :class-names="{ arrow: 'pc-arrow' }"
          @confirm="confirmSpy"
        >
          <template #trigger><button type="button">Trigger</button></template>
        </Popconfirm>
      `,
    })

    const ctrl = track(mount(ControlledHost, { attachTo: document.body }))
    await flushPromises()
    expect(document.querySelector(".miu-popover__arrow")?.classList.contains("pc-arrow")).toBe(true)

    const confirmBtn = document.querySelectorAll<HTMLButtonElement>(
      ".miu-popconfirm__actions .miu-button",
    )[1]
    confirmBtn?.click()
    await flushPromises()
    expect(confirmSpy).toHaveBeenCalledTimes(1)
    expect(open.value).toBe(true)
    expect(document.querySelector(".miu-popconfirm")).not.toBeNull()

    const content = document.querySelector<HTMLElement>(".miu-popconfirm")
    content?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    )
    await flushPromises()
    expect(open.value).toBe(true)
    ctrl.unmount()
    await flushPromises()

    const uncontrolledLoading = ref(false)
    const UncontrolledAsync = defineComponent({
      components: { Popconfirm },
      setup() {
        return {
          loading: uncontrolledLoading,
          onConfirm: () => {
            uncontrolledLoading.value = true
          },
        }
      },
      template: `
        <Popconfirm title="Run async?" :loading="loading" @confirm="onConfirm">
          <template #trigger><button id="unc-trig" type="button">Run</button></template>
        </Popconfirm>
      `,
    })
    const unc = track(mount(UncontrolledAsync, { attachTo: document.body }))
    await unc.get("#unc-trig").trigger("click")
    await flushPromises()
    const uncConfirmBtn = document.querySelectorAll<HTMLButtonElement>(
      ".miu-popconfirm__actions .miu-button",
    )[1]
    uncConfirmBtn?.click()
    await nextTick()
    await flushPromises()
    expect(document.querySelector(".miu-popconfirm")).not.toBeNull()
    unc.unmount()
    await flushPromises()

    const dis = track(
      mount(Popconfirm, {
        props: { title: "Disabled", disabled: true },
        slots: { trigger: '<button id="pc-dis" type="button">Disabled</button>' },
        attachTo: document.body,
      }),
    )
    await dis.get("#pc-dis").trigger("click")
    await flushPromises()
    expect(document.querySelector(".miu-popconfirm")).toBeNull()
  })

  it("HelpTooltip supports open v-model, disabled, iconSize, and IconProp", async () => {
    const onUpdate = vi.fn()

    const help = track(
      mount(HelpTooltip, {
        props: {
          text: "Hint text",
          icon: customIcon,
          iconSize: "md",
          open: true,
          "onUpdate:open": onUpdate,
        },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    expect(document.querySelector(".miu-tooltip")?.textContent).toContain("Hint text")
    expect(help.get("svg").attributes("data-miu-icon-size")).toBe("md")
    expect(help.find("svg path").attributes("d")).toBe(customIcon.content.match(/d="([^"]+)"/)?.[1])

    await help.setProps({ disabled: true, iconSize: "xs" })
    await flushPromises()
    expect(help.get("button").attributes("disabled")).toBeDefined()
    expect(document.querySelector(".miu-tooltip")).toBeNull()

    const tip = track(
      mount(Tooltip, {
        props: { open: true, disabled: true },
        slots: { trigger: '<button type="button">T</button>', default: "Hidden" },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    expect(document.querySelector(".miu-tooltip")).toBeNull()
    void tip
  })

  it("DropdownMenu and ContextMenu adopt useResolvedMaterial, IconProp, disabled, open v-model, and close guards", async () => {
    const items = [
      { label: "Star", value: "star", icon: customIcon },
      { label: "", value: "sep", separator: true },
      { label: "", value: "sep", separator: true },
      { label: "Delete", value: "delete", danger: true },
    ]

    const ddDisabled = track(
      mount(DropdownMenu, {
        props: { items, disabled: true },
        slots: { trigger: '<button id="dd-dis" type="button">Menu</button>' },
        attachTo: document.body,
      }),
    )
    await ddDisabled.get("#dd-dis").trigger("click")
    await flushPromises()
    expect(document.querySelector(".miu-menu")).toBeNull()

    const dd = track(
      mount(DropdownMenu, {
        props: {
          items,
          open: true,
          material: "test-acrylic",
          closeOnEsc: false,
          closeOnClickOutside: false,
        },
        slots: { trigger: '<button type="button">Menu</button>' },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    const ddMenu = document.querySelector<HTMLElement>(".miu-menu")
    expect(ddMenu?.getAttribute("data-material")).toBe("test-acrylic")
    expect(ddMenu?.style.getPropertyValue("--miu-material-surface")).toBe(
      "var(--miu-color-bg-elevated)",
    )
    expect(document.querySelectorAll(".miu-menu__separator")).toHaveLength(2)
    ddMenu?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    )
    await flushPromises()
    expect(dd.emitted("update:open")).toBeUndefined()
    dd.unmount()

    const ctxOpen = ref(true)
    const ctx = track(
      mount(ContextMenu, {
        props: {
          items,
          open: ctxOpen.value,
          material: "test-acrylic",
          closeOnEsc: false,
          "onUpdate:open": (val: boolean) => {
            ctxOpen.value = val
          },
        },
        slots: { trigger: '<div id="ctx-trig">Zone</div>' },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    const ctxMenu = document.querySelector<HTMLElement>(".miu-context-menu")
    expect(ctxMenu?.getAttribute("data-material")).toBe("test-acrylic")
    ctxMenu?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    )
    await flushPromises()
    expect(ctxOpen.value).toBe(true)

    await ctx.setProps({ disabled: true, open: false })
    await ctx.get("#ctx-trig").trigger("contextmenu")
    await flushPromises()
    expect(document.querySelector(".miu-context-menu")).toBeNull()
  })

  it("LoadingOverlay handles scroll lock, avoids nested role=status, and applies inline radius & material", async () => {
    const noText = track(
      mount(LoadingOverlay, {
        props: { loading: true, fullscreen: true, material: "test-acrylic" },
        attachTo: document.body,
      }),
    )
    await flushPromises()
    expect(document.body.style.overflow).toBe("hidden")
    const overlay = document.querySelector<HTMLElement>(".miu-loading-overlay--fullscreen")
    expect(overlay?.getAttribute("data-material")).toBe("test-acrylic")
    expect(overlay?.getAttribute("role")).toBeNull()
    expect(overlay?.querySelectorAll('[role="status"]')).toHaveLength(1)

    await noText.setProps({ text: "Syncing", lockScroll: false })
    await flushPromises()
    expect(document.body.style.overflow).toBe("")
    expect(overlay?.getAttribute("role")).toBe("status")
    expect(overlay?.querySelectorAll('[role="status"]')).toHaveLength(0)

    const inline = track(
      mount(LoadingOverlay, {
        props: { loading: true, fullscreen: false, radius: "lg" },
      }),
    )
    expect(inline.get(".miu-loading-overlay").attributes("data-miu-radius")).toBe("lg")
  })

  it("ToastViewport mounts via useMounted and renders pill and solid variants cleanly", async () => {
    const { toast, clear } = useToast()
    clear()
    track(mount(ToastViewport, { props: { styleVariant: "solid" }, attachTo: document.body }))
    toast.info("Solid info", { material: "test-acrylic" })
    toast.success("Pill notice", { styleVariant: "pill" })
    await flushPromises()

    const toasts = Array.from(document.querySelectorAll<HTMLElement>(".miu-toast"))
    expect(toasts).toHaveLength(2)
    expect(toasts[0]?.getAttribute("data-material")).toBe("test-acrylic")
    expect(toasts[1]?.getAttribute("data-style-variant")).toBe("pill")
    toasts[1]?.click()
    await flushPromises()
    expect(document.querySelectorAll(".miu-toast")).toHaveLength(1)
    clear()
  })
})
