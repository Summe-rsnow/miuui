import type { App, Component, Plugin } from "vue"
import Alert from "./components/Alert.vue"
import AppBar from "./components/AppBar.vue"
import Avatar from "./components/Avatar.vue"
import Badge from "./components/Badge.vue"
import Breadcrumb from "./components/Breadcrumb.vue"
import Button from "./components/Button.vue"
import Card from "./components/Card.vue"
import Checkbox from "./components/Checkbox.vue"
import Code from "./components/Code.vue"
import CommandPalette from "./components/CommandPalette.vue"
import ConfirmDialog from "./components/ConfirmDialog.vue"
import ContextMenu from "./components/ContextMenu.vue"
import Dialog from "./components/Dialog.vue"
import Drawer from "./components/Drawer.vue"
import DropdownMenu from "./components/DropdownMenu.vue"
import EmptyState from "./components/EmptyState.vue"
import FormField from "./components/FormField.vue"
import FormRow from "./components/FormRow.vue"
import Icon from "./components/Icon.vue"
import IconButton from "./components/IconButton.vue"
import Input from "./components/Input.vue"
import Kbd from "./components/Kbd.vue"
import MessageComposer from "./components/MessageComposer.vue"
import NavMenu from "./components/NavMenu.vue"
import PageHeader from "./components/PageHeader.vue"
import Pagination from "./components/Pagination.vue"
import Pill from "./components/Pill.vue"
import Popover from "./components/Popover.vue"
import SectionHeader from "./components/SectionHeader.vue"
import SegmentedControl from "./components/SegmentedControl.vue"
import Select from "./components/Select.vue"
import Skeleton from "./components/Skeleton.vue"
import Spinner from "./components/Spinner.vue"
import Switch from "./components/Switch.vue"
import Table from "./components/Table.vue"
import Tabs from "./components/Tabs.vue"
import Textarea from "./components/Textarea.vue"
import ThemeProvider from "./components/ThemeProvider.vue"
import ToastViewport from "./components/ToastViewport.vue"
import Toc from "./components/Toc.vue"
import Tooltip from "./components/Tooltip.vue"
import TruncateText from "./components/TruncateText.vue"

export const components: Record<string, Component> = {
  MiuAlert: Alert,
  MiuAppBar: AppBar,
  MiuAvatar: Avatar,
  MiuBadge: Badge,
  MiuBreadcrumb: Breadcrumb,
  MiuButton: Button,
  MiuCard: Card,
  MiuCheckbox: Checkbox,
  MiuCode: Code,
  MiuCommandPalette: CommandPalette,
  MiuConfirmDialog: ConfirmDialog,
  MiuContextMenu: ContextMenu,
  MiuDialog: Dialog,
  MiuDrawer: Drawer,
  MiuDropdownMenu: DropdownMenu,
  MiuEmptyState: EmptyState,
  MiuFormField: FormField,
  MiuFormRow: FormRow,
  MiuIcon: Icon,
  MiuIconButton: IconButton,
  MiuInput: Input,
  MiuKbd: Kbd,
  MiuMessageComposer: MessageComposer,
  MiuNavMenu: NavMenu,
  MiuPageHeader: PageHeader,
  MiuPagination: Pagination,
  MiuPill: Pill,
  MiuPopover: Popover,
  MiuSectionHeader: SectionHeader,
  MiuSegmentedControl: SegmentedControl,
  MiuSelect: Select,
  MiuSkeleton: Skeleton,
  MiuSpinner: Spinner,
  MiuSwitch: Switch,
  MiuTable: Table,
  MiuTabs: Tabs,
  MiuTextarea: Textarea,
  MiuThemeProvider: ThemeProvider,
  MiuToastViewport: ToastViewport,
  MiuToc: Toc,
  MiuTooltip: Tooltip,
  MiuTruncateText: TruncateText,
}

export const MiuUi: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
  },
}
