import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import axe from "axe-core"
import { afterEach, describe, expect, it } from "vitest"
import Accordion from "./Accordion.vue"
import Alert from "./Alert.vue"
import Avatar from "./Avatar.vue"
import Badge from "./Badge.vue"
import Breadcrumb from "./Breadcrumb.vue"
import Button from "./Button.vue"
import Card from "./Card.vue"
import Checkbox from "./Checkbox.vue"
import Code from "./Code.vue"
import Combobox from "./Combobox.vue"
import CommandPalette from "./CommandPalette.vue"
import ConfirmDialog from "./ConfirmDialog.vue"
import Dialog from "./Dialog.vue"
import Divider from "./Divider.vue"
import Drawer from "./Drawer.vue"
import DropdownMenu from "./DropdownMenu.vue"
import EmptyState from "./EmptyState.vue"
import FormField from "./FormField.vue"
import FormRow from "./FormRow.vue"
import HeroHeader from "./HeroHeader.vue"
import IconButton from "./IconButton.vue"
import Input from "./Input.vue"
import MediaCard from "./MediaCard.vue"
import MessageComposer from "./MessageComposer.vue"
import NavMenu from "./NavMenu.vue"
import PageHeader from "./PageHeader.vue"
import Pagination from "./Pagination.vue"
import Pill from "./Pill.vue"
import Popover from "./Popover.vue"
import PopupPanel from "./PopupPanel.vue"
import Progress from "./Progress.vue"
import SegmentedControl from "./SegmentedControl.vue"
import Select from "./Select.vue"
import Steps from "./Steps.vue"
import Switch from "./Switch.vue"
import Table from "./Table.vue"
import Tabs from "./Tabs.vue"
import TagInput from "./TagInput.vue"
import Textarea from "./Textarea.vue"
import Toc from "./Toc.vue"
import VerticalSlider from "./VerticalSlider.vue"

const mounted: VueWrapper[] = []

function track<T extends VueWrapper>(wrapper: T): T {
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  document.body.innerHTML = ""
})

async function expectNoSeriousViolations(label: string): Promise<void> {
  await flushPromises()
  const results = await axe.run(document.body, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
      "landmark-one-main": { enabled: false },
      "page-has-heading-one": { enabled: false },
    },
  })
  const violations = results.violations
    .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }))
  expect(violations, `${label}: ${JSON.stringify(violations, null, 2)}`).toEqual([])
}

describe("axe-core accessibility gate", () => {
  it("Button in md and xl sizes, disabled, loading, and IconButton", async () => {
    for (const size of ["md", "xl"] as const) {
      const wrapper = track(
        mount(Button, {
          props: { size },
          slots: { default: "Save" },
          attachTo: document.body,
        }),
      )
      await expectNoSeriousViolations(`Button ${size}`)
      wrapper.unmount()
      mounted.pop()
      document.body.innerHTML = ""
    }

    const states = track(
      mount({
        components: { Button, IconButton },
        template: `
          <div>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <IconButton label="Open settings" icon="settings" />
          </div>
        `,
        attachTo: document.body,
      }),
    )
    await expectNoSeriousViolations("Button states")
    states.unmount()
    mounted.pop()
    document.body.innerHTML = ""
  })

  it("Input, Textarea, and FormField across md/xl, disabled, readonly, and error states", async () => {
    for (const size of ["md", "xl"] as const) {
      const wrapper = track(
        mount({
          components: { FormField, Input, Textarea },
          data: () => ({ value: "hello", bio: "notes" }),
          template: `
            <div>
              <FormField id="email-err" label="Email" description="Used for sync" error="Invalid email" required>
                <Input id="email-err" v-model="value" type="email" :size="'${size}'" clearable />
              </FormField>
              <FormField id="email-dis" label="Disabled" disabled>
                <Input id="email-dis" model-value="locked" :size="'${size}'" disabled />
              </FormField>
              <FormField id="bio-ro" label="Bio">
                <Textarea id="bio-ro" v-model="bio" :size="'${size}'" readonly show-count :maxlength="80" />
              </FormField>
            </div>
          `,
          attachTo: document.body,
        }),
      )
      await expectNoSeriousViolations(`Input + Textarea + FormField ${size}`)
      wrapper.unmount()
      mounted.pop()
      document.body.innerHTML = ""
    }
  })

  it("Select trigger across md/xl, disabled, and error states", async () => {
    for (const size of ["md", "xl"] as const) {
      const wrapper = track(
        mount({
          components: { FormField, Select },
          data: () => ({
            value: "vue",
            options: [
              { value: "vue", label: "Vue" },
              { value: "nuxt", label: "Nuxt" },
            ],
          }),
          template: `
            <div>
              <FormField id="framework" label="Framework" required>
                <Select id="framework" v-model="value" :options="options" :size="'${size}'" />
              </FormField>
              <FormField id="framework-err" label="Runtime" error="Required">
                <Select id="framework-err" :options="options" :size="'${size}'" disabled />
              </FormField>
            </div>
          `,
          attachTo: document.body,
        }),
      )
      await expectNoSeriousViolations(`Select ${size}`)
      wrapper.unmount()
      mounted.pop()
      document.body.innerHTML = ""
    }
  })

  it("Checkbox, Switch, and FormRow across default, indeterminate, invalid, and disabled states", async () => {
    track(
      mount({
        components: { Checkbox, FormRow, Switch },
        data: () => ({ checked: true, enabled: true }),
        template: `
          <div>
            <Checkbox id="terms" v-model="checked" label="Accept terms" />
            <Checkbox id="indet" indeterminate invalid label="Select all" />
            <Checkbox id="dis-chk" disabled label="Disabled option" />
            <Switch id="notifications" v-model="enabled" label="Notifications" />
            <Switch id="dis-sw" disabled label="Disabled toggle" />
            <FormRow label="Shortcut" description="Row description" clickable />
          </div>
        `,
        attachTo: document.body,
      }),
    )
    await expectNoSeriousViolations("Checkbox + Switch + FormRow")
  })
  it("Tabs and SegmentedControl", async () => {
    track(
      mount({
        components: { SegmentedControl, Tabs },
        data: () => ({
          tab: "overview",
          view: "grid",
          tabs: [
            { value: "overview", label: "Overview" },
            { value: "tracks", label: "Tracks" },
          ],
          views: [
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
          ],
        }),
        template: `
          <div>
            <Tabs v-model="tab" :items="tabs" aria-label="Views">
              <template #panel="{ value }">{{ value }}</template>
            </Tabs>
            <SegmentedControl v-model="view" :options="views" aria-label="Layout" />
          </div>
        `,
        attachTo: document.body,
      }),
    )
    await expectNoSeriousViolations("Tabs + SegmentedControl")
  })

  it("Table with header and actions", async () => {
    track(
      mount(Table, {
        props: {
          columns: [
            { key: "name", label: "Name" },
            { key: "status", label: "Status", align: "end" },
          ],
          rows: [
            { id: 1, name: "Ada", status: "Ready" },
            { id: 2, name: "Lin", status: "Pending" },
          ],
          striped: true,
          bordered: true,
        },
        slots: {
          "row-actions": `<button type="button" aria-label="Edit Ada">Edit</button>`,
        },
        attachTo: document.body,
      }),
    )
    await expectNoSeriousViolations("Table")
  })

  it("Dialog open state", async () => {
    track(
      mount(Dialog, {
        props: { open: true, title: "Settings", description: "Update preferences" },
        slots: { default: "Dialog body" },
        attachTo: document.body,
      }),
    )
    await expectNoSeriousViolations("Dialog")
  })

  it("Drawer open state", async () => {
    track(
      mount(Drawer, {
        props: { open: true, title: "Navigation" },
        slots: { default: "Drawer body" },
        attachTo: document.body,
      }),
    )
    await expectNoSeriousViolations("Drawer")
  })

  it("CommandPalette open state", async () => {
    track(
      mount(CommandPalette, {
        props: {
          open: true,
          items: [
            { title: "Button", section: "Components", link: "/components/button" },
            { title: "Table", section: "Components", link: "/components/table" },
          ],
        },
        attachTo: document.body,
      }),
    )
    await expectNoSeriousViolations("CommandPalette")
  })

  it("Popover, DropdownMenu, ConfirmDialog, Alert, Display, and Navigation components", async () => {
    track(
      mount({
        components: {
          Accordion,
          Alert,
          Avatar,
          Badge,
          Breadcrumb,
          Code,
          Card,
          Combobox,
          ConfirmDialog,
          Divider,
          DropdownMenu,
          EmptyState,
          HeroHeader,
          IconButton,
          MediaCard,
          MessageComposer,
          NavMenu,
          PageHeader,
          Pagination,
          Pill,
          Popover,
          PopupPanel,
          Progress,
          Steps,
          TagInput,
          Toc,
          VerticalSlider,
        },
        data: () => ({
          msg: "Draft message",
          menuItems: [
            { label: "Edit", value: "edit", icon: "settings" },
            { label: "Delete", value: "delete", danger: true },
          ],
        }),
        template: `
          <div>
            <PageHeader title="Components" description="Specs" back />
            <Breadcrumb :items="[{ text: 'Home', link: '/' }, { text: 'Components' }]" />
            <NavMenu aria-label="Docs" :groups="[{ text: 'Start', items: [{ text: 'Button', link: '/button', active: true }] }]" />
            <Toc :items="[{ id: 'api', text: 'API', level: 2 }]" active-id="api" />
            <Alert title="Notice" variant="info" icon="bell">Body text</Alert>
            <Card><Avatar alt="Ada Lovelace" /><Badge variant="success" dot>Ready</Badge><Pill label="Active" active removable /><Code variant="primary">@xcmm1543/miuui-vue</Code></Card>
            <MediaCard title="Album" subtitle="Artist" interactive>
              <template #action><IconButton icon="play" aria-label="Play Album" /></template>
            </MediaCard>
            <HeroHeader title="Featured Playlist" tag="Playlist" description="Hero description" previewable />
            <PopupPanel title="Queue" show-close>
              <div>Queue body</div>
            </PopupPanel>
            <Divider label="Section" />
            <Accordion :items="[{ value: 'a', title: 'Item A', content: 'Body A' }]" />
            <Steps :model-value="1" :items="[{ title: 'Step 1' }, { title: 'Step 2' }]" aria-label="Setup" />
            <Combobox :options="[{ value: 'v', label: 'Vue' }]" aria-label="Framework" />
            <TagInput :model-value="['vue']" aria-label="Tags" />
            <VerticalSlider :model-value="0" mode="continuous" center-zero aria-label="EQ Band" />
            <Progress shape="circle" :model-value="60" show-value aria-label="Upload progress" />
            <MessageComposer v-model="msg" placeholder="Reply" />
            <Pagination :previous="{ text: 'Prev', link: '/prev' }" :next="{ text: 'Next', link: '/next' }" />
            <Popover open>
              <template #trigger><button type="button">Trigger</button></template>
              Popover content
            </Popover>
            <DropdownMenu open :items="menuItems">
              <template #trigger><button type="button">Menu</button></template>
            </DropdownMenu>
            <ConfirmDialog open title="Confirm change" description="Proceed?" />
          </div>
        `,
        attachTo: document.body,
      }),
    )
    await expectNoSeriousViolations("Display + Navigation + Overlays")
  })
})
