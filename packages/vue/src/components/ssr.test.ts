import { createSSRApp, h } from "vue"
import { renderToString } from "vue/server-renderer"
import { afterEach, describe, expect, it, vi } from "vitest"
import Accordion from "./Accordion.vue"
import Alert from "./Alert.vue"
import AppBar from "./AppBar.vue"
import Avatar from "./Avatar.vue"
import Badge from "./Badge.vue"
import Breadcrumb from "./Breadcrumb.vue"
import Button from "./Button.vue"
import Card from "./Card.vue"
import Checkbox from "./Checkbox.vue"
import Code from "./Code.vue"
import Collapse from "./Collapse.vue"
import ColorPicker from "./ColorPicker.vue"
import Combobox from "./Combobox.vue"
import ConfirmDialog from "./ConfirmDialog.vue"
import CommandPalette from "./CommandPalette.vue"
import Dialog from "./Dialog.vue"
import Divider from "./Divider.vue"
import Drawer from "./Drawer.vue"
import EmptyState from "./EmptyState.vue"
import FormField from "./FormField.vue"
import FormRow from "./FormRow.vue"
import HelpTooltip from "./HelpTooltip.vue"
import HeroHeader from "./HeroHeader.vue"
import Icon from "./Icon.vue"
import IconButton from "./IconButton.vue"
import Image from "./Image.vue"
import Input from "./Input.vue"
import Kbd from "./Kbd.vue"
import List from "./List.vue"
import ListItem from "./ListItem.vue"
import LoadingOverlay from "./LoadingOverlay.vue"
import MediaCard from "./MediaCard.vue"
import MessageComposer from "./MessageComposer.vue"
import NavMenu from "./NavMenu.vue"
import PageHeader from "./PageHeader.vue"
import NumberInput from "./NumberInput.vue"
import Pagination from "./Pagination.vue"
import Pill from "./Pill.vue"
import Popconfirm from "./Popconfirm.vue"
import Popover from "./Popover.vue"
import PopupPanel from "./PopupPanel.vue"
import Progress from "./Progress.vue"
import RadioGroup from "./RadioGroup.vue"
import Scrollbar from "./Scrollbar.vue"
import SectionHeader from "./SectionHeader.vue"
import SegmentedControl from "./SegmentedControl.vue"
import Select from "./Select.vue"
import Skeleton from "./Skeleton.vue"
import Spinner from "./Spinner.vue"
import Steps from "./Steps.vue"
import Switch from "./Switch.vue"
import Table from "./Table.vue"
import Tabs from "./Tabs.vue"
import TagInput from "./TagInput.vue"
import Textarea from "./Textarea.vue"
import ThemeProvider from "./ThemeProvider.vue"
import Toc from "./Toc.vue"
import Tooltip from "./Tooltip.vue"
import TruncateText from "./TruncateText.vue"
import VerticalSlider from "./VerticalSlider.vue"

afterEach(() => {
  document.body.innerHTML = ""
})

describe("SSR rendering and client hydration consistency", () => {
  it("renders all components to HTML via renderToString without DOM crashes", async () => {
    const app = createSSRApp({
      render: () =>
        h(
          ThemeProvider,
          {
            theme: "dark",
            density: "compact",
            radius: "lg",
            material: "mica",
            motionTier: "reduced",
          },
          () => [
            h(
              AppBar,
              { sticky: true, blurred: true },
              { brand: () => "μui", default: () => "Nav" },
            ),
            h(PageHeader, { title: "Title", description: "Desc", back: true }),
            h(SectionHeader, { title: "Section", description: "Section desc" }),
            h(Breadcrumb, { items: [{ text: "Home", link: "/" }, { text: "Button" }] }),
            h(NavMenu, {
              groups: [{ text: "Guide", items: [{ text: "Start", link: "/start", active: true }] }],
            }),
            h(Toc, { items: [{ id: "api", text: "API", level: 2 }], activeId: "api" }),
            h(Pagination, {
              previous: { text: "Prev", link: "/prev" },
              next: { text: "Next", link: "/next" },
            }),
            h(Button, { icon: "plus" }, () => "Create"),
            h(IconButton, { label: "Settings", icon: "settings" }),
            h(
              FormField,
              {
                id: "email",
                label: "Email",
                description: "Work",
                error: "Invalid",
                required: true,
              },
              () => h(Input, { id: "email", modelValue: "ada@example.com", clearable: true }),
            ),
            h(FormRow, { label: "Reduced", icon: "settings", labelFor: "sw" }, () =>
              h(Switch, { id: "sw", modelValue: true }),
            ),
            h(Textarea, { modelValue: "Note", showCount: true, maxlength: 100 }),
            h(Select, {
              modelValue: "vue",
              ariaLabel: "Framework",
              options: [{ value: "vue", label: "Vue" }],
            }),
            h(Checkbox, { modelValue: true, label: "Accept" }),
            h(Tabs, {
              modelValue: "one",
              items: [{ value: "one", label: "One" }],
              ariaLabel: "Tabs",
            }),
            h(SegmentedControl, {
              modelValue: "a",
              options: [{ value: "a", label: "A" }],
              ariaLabel: "Seg",
            }),
            h(Table, {
              columns: [{ key: "name", label: "Name" }],
              rows: [{ id: 1, name: "Ada" }],
            }),
            h(Card, { variant: "outline" }, () => "Card body"),
            h(Badge, { variant: "success", dot: true }, () => "Ready"),
            h(Pill, { label: "Filter", active: true, removable: true, count: 3 }),
            h(Avatar, { alt: "Ada Lovelace" }),
            h(Alert, { variant: "info", title: "Note", icon: "bell" }, () => "Body"),
            h(EmptyState, { icon: "search", title: "Empty" }),
            h(MessageComposer, { modelValue: "Hi" }),
            h(Skeleton, { width: 120, height: 24 }),
            h(Spinner, { iconSize: "md" }),
            h(Image, { src: "https://example.com/demo.png", alt: "Preview", previewable: true }),
            h(LoadingOverlay, { loading: false, text: "Working..." }),
            h(Icon, { name: "check" }),
            h(Kbd, { keys: "Ctrl K" }),
            h(Code, { variant: "primary" }, () => "@xcmm1543/miuui-vue"),
            h(Divider, { label: "Section" }),
            h(Accordion, { items: [{ value: "a", title: "A", content: "Body A" }] }),
            h(Steps, {
              modelValue: 1,
              items: [{ title: "One" }, { title: "Two" }],
              ariaLabel: "Steps",
            }),
            h(Combobox, { options: [{ value: "v", label: "Vue" }], ariaLabel: "Combo" }),
            h(TagInput, { modelValue: ["vue"], ariaLabel: "Tags" }),
            h(Collapse, { open: true }, () => "Expanded"),
            h(ColorPicker, { modelValue: "#9A49E0", ariaLabel: "Accent" }),
            h(List, { bordered: true }, () => [h(ListItem, { title: "Item", subtitle: "Sub" })]),
            h(HelpTooltip, { text: "Helpful info" }),
            h(TruncateText, { text: "Long text", lines: 2 }),
            h(Progress, { modelValue: 45, showValue: true, ariaLabel: "Progress" }),
            h(Progress, { shape: "circle", modelValue: 75, showValue: true, ariaLabel: "Ring" }),
            h(HeroHeader, { title: "Hero", tag: "Tag", description: "Hero desc" }),
            h(MediaCard, { title: "Card", subtitle: "Artist", interactive: true }),
            h(PopupPanel, { title: "Panel", showClose: true }, () => "Body"),
            h(Scrollbar, { container: null }),
            h(VerticalSlider, {
              modelValue: 0,
              mode: "continuous",
              centerZero: true,
              ariaLabel: "EQ",
            }),
            h(RadioGroup, {
              modelValue: "a",
              options: ["a", "b"],
              ariaLabel: "Radio group",
            }),
            h(NumberInput, { modelValue: 5, min: 1, max: 10, ariaLabel: "Count" }),
            h(
              Popconfirm,
              { open: false, title: "Confirm?" },
              { trigger: () => h("button", "Delete") },
            ),
            h(Dialog, { open: false, title: "Closed" }),
            h(ConfirmDialog, { open: false, title: "Closed" }),
            h(Drawer, { open: false, title: "Closed" }),
            h(CommandPalette, { open: false, items: [] }),
            h(
              Popover,
              { open: false },
              { trigger: () => h("button", "Trigger"), default: () => "Body" },
            ),
            h(
              Tooltip,
              { open: false },
              { trigger: () => h("button", "Hover"), default: () => "Tip" },
            ),
          ],
        ),
    })

    const html = await renderToString(app)
    expect(html).toContain('data-theme="dark"')
    expect(html).toContain('data-material="mica"')
    expect(html).toContain('data-motion-tier="reduced"')
    expect(html).toContain("Create")
    expect(html).toContain("Ada")
  })

  it("hydrates SSR output on the client with zero hydration mismatch warnings", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined)

    const createAppTree = () => ({
      render: () =>
        h(ThemeProvider, { theme: "light", density: "default", material: "solid" }, () => [
          h(AppBar, { sticky: true }, { brand: () => "μui", default: () => "Docs" }),
          h(FormField, { id: "hydrated-input", label: "Name", hint: "Required" }, () =>
            h(Input, { id: "hydrated-input", modelValue: "Ada" }),
          ),
          h(Button, { variant: "solid", icon: "plus" }, () => "Submit"),
          h(Switch, { id: "hydrated-switch", modelValue: false, label: "Dark" }),
          h(Checkbox, { id: "hydrated-check", modelValue: true, label: "Agree" }),
          h(Tabs, {
            modelValue: "overview",
            items: [
              { value: "overview", label: "Overview" },
              { value: "api", label: "API" },
            ],
            ariaLabel: "Sections",
          }),
          h(Table, {
            columns: [{ key: "name", label: "Component" }],
            rows: [{ id: "btn", name: "Button" }],
          }),
          h(MediaCard, { title: "Album", subtitle: "Artist", interactive: true }),
          h(Progress, { shape: "circle", modelValue: 40, showValue: true, ariaLabel: "Progress" }),
          h(Alert, { variant: "info", title: "Ready", icon: "check" }, () => "Hydrated"),
        ]),
    })

    const html = await renderToString(createSSRApp(createAppTree()))
    const container = document.createElement("div")
    container.innerHTML = html
    document.body.appendChild(container)

    const clientApp = createSSRApp(createAppTree())
    clientApp.mount(container)
    await Promise.resolve()

    const hydrationWarnings = warn.mock.calls
      .concat(error.mock.calls)
      .map((args) => args.map(String).join(" "))
      .filter((msg) => /hydrat|mismatch/i.test(msg))

    expect(hydrationWarnings).toEqual([])
    expect(container.querySelector(".miu-button")?.textContent).toContain("Submit")
    expect(container.querySelector(".miu-table")?.textContent).toContain("Button")

    clientApp.unmount()
    warn.mockRestore()
    error.mockRestore()
  })
})
