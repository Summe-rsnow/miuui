import type { App, Component, Plugin } from "vue"
import Accordion from "./components/Accordion.vue"
import Alert from "./components/Alert.vue"
import AppBar from "./components/AppBar.vue"
import Avatar from "./components/Avatar.vue"
import Badge from "./components/Badge.vue"
import Breadcrumb from "./components/Breadcrumb.vue"
import Button from "./components/Button.vue"
import Card from "./components/Card.vue"
import CategoryFilter from "./components/CategoryFilter.vue"
import Checkbox from "./components/Checkbox.vue"
import Code from "./components/Code.vue"
import Collapse from "./components/Collapse.vue"
import ColorPicker from "./components/ColorPicker.vue"
import Combobox from "./components/Combobox.vue"
import CommandPalette from "./components/CommandPalette.vue"
import ConfirmDialog from "./components/ConfirmDialog.vue"
import ContextMenu from "./components/ContextMenu.vue"
import Dialog from "./components/Dialog.vue"
import Divider from "./components/Divider.vue"
import Drawer from "./components/Drawer.vue"
import DropdownMenu from "./components/DropdownMenu.vue"
import EmptyState from "./components/EmptyState.vue"
import FormField from "./components/FormField.vue"
import FormRow from "./components/FormRow.vue"
import HelpTooltip from "./components/HelpTooltip.vue"
import HeroHeader from "./components/HeroHeader.vue"
import Icon from "./components/Icon.vue"
import IconButton from "./components/IconButton.vue"
import Image from "./components/Image.vue"
import ImageGroup from "./components/ImageGroup.vue"
import ImagePreview from "./components/ImagePreview.vue"
import Input from "./components/Input.vue"
import Kbd from "./components/Kbd.vue"
import List from "./components/List.vue"
import ListItem from "./components/ListItem.vue"
import LoadingOverlay from "./components/LoadingOverlay.vue"
import MediaCard from "./components/MediaCard.vue"
import MessageComposer from "./components/MessageComposer.vue"
import NavMenu from "./components/NavMenu.vue"
import NumberInput from "./components/NumberInput.vue"
import PageHeader from "./components/PageHeader.vue"
import PageLayout from "./components/PageLayout.vue"
import Pagination from "./components/Pagination.vue"
import Pill from "./components/Pill.vue"
import PillGroup from "./components/PillGroup.vue"
import Popconfirm from "./components/Popconfirm.vue"
import Popover from "./components/Popover.vue"
import PopupPanel from "./components/PopupPanel.vue"
import Progress from "./components/Progress.vue"
import RadioGroup from "./components/RadioGroup.vue"
import Scrollbar from "./components/Scrollbar.vue"
import SectionHeader from "./components/SectionHeader.vue"
import SegmentedControl from "./components/SegmentedControl.vue"
import Select from "./components/Select.vue"
import Skeleton from "./components/Skeleton.vue"
import Slider from "./components/Slider.vue"
import Spinner from "./components/Spinner.vue"
import Steps from "./components/Steps.vue"
import Switch from "./components/Switch.vue"
import Table from "./components/Table.vue"
import Tabs from "./components/Tabs.vue"
import TagInput from "./components/TagInput.vue"
import Textarea from "./components/Textarea.vue"
import ThemeProvider from "./components/ThemeProvider.vue"
import ToastViewport from "./components/ToastViewport.vue"
import Toc from "./components/Toc.vue"
import Tooltip from "./components/Tooltip.vue"
import TruncateText from "./components/TruncateText.vue"
import VerticalSlider from "./components/VerticalSlider.vue"

export const components: Record<string, Component> = {
  MiuAccordion: Accordion,
  MiuAlert: Alert,
  MiuAppBar: AppBar,
  MiuAvatar: Avatar,
  MiuBadge: Badge,
  MiuBreadcrumb: Breadcrumb,
  MiuButton: Button,
  MiuCard: Card,
  MiuCategoryFilter: CategoryFilter,
  MiuCheckbox: Checkbox,
  MiuCode: Code,
  MiuCollapse: Collapse,
  MiuColorPicker: ColorPicker,
  MiuCombobox: Combobox,
  MiuCommandPalette: CommandPalette,
  MiuConfirmDialog: ConfirmDialog,
  MiuContextMenu: ContextMenu,
  MiuDialog: Dialog,
  MiuDivider: Divider,
  MiuDrawer: Drawer,
  MiuDropdownMenu: DropdownMenu,
  MiuEmptyState: EmptyState,
  MiuFormField: FormField,
  MiuFormRow: FormRow,
  MiuHelpTooltip: HelpTooltip,
  MiuHeroHeader: HeroHeader,
  MiuIcon: Icon,
  MiuIconButton: IconButton,
  MiuImage: Image,
  MiuImageGroup: ImageGroup,
  MiuImagePreview: ImagePreview,
  MiuInput: Input,
  MiuKbd: Kbd,
  MiuList: List,
  MiuListItem: ListItem,
  MiuLoadingOverlay: LoadingOverlay,
  MiuMediaCard: MediaCard,
  MiuMessageComposer: MessageComposer,
  MiuNavMenu: NavMenu,
  MiuNumberInput: NumberInput,
  MiuPageHeader: PageHeader,
  MiuPageLayout: PageLayout,
  MiuPagination: Pagination,
  MiuPillGroup: PillGroup,
  MiuPill: Pill,
  MiuPopconfirm: Popconfirm,
  MiuPopover: Popover,
  MiuPopupPanel: PopupPanel,
  MiuProgress: Progress,
  MiuRadioGroup: RadioGroup,
  MiuScrollbar: Scrollbar,
  MiuSectionHeader: SectionHeader,
  MiuSegmentedControl: SegmentedControl,
  MiuSelect: Select,
  MiuSlider: Slider,
  MiuSkeleton: Skeleton,
  MiuSpinner: Spinner,
  MiuSteps: Steps,
  MiuSwitch: Switch,
  MiuTable: Table,
  MiuTabs: Tabs,
  MiuTagInput: TagInput,
  MiuTextarea: Textarea,
  MiuThemeProvider: ThemeProvider,
  MiuToastViewport: ToastViewport,
  MiuToc: Toc,
  MiuTooltip: Tooltip,
  MiuTruncateText: TruncateText,
  MiuVerticalSlider: VerticalSlider,
}

export const MiuUi: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
  },
}
