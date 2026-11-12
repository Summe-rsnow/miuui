import type {
  ComponentSemanticProps,
  ControlSize,
  Density,
  IconSize,
  MaterialName,
  Radius,
} from "@miuui/core"
import type { IconName } from "@miuui/icons"

export type ButtonVariant = "solid" | "secondary" | "outline" | "ghost" | "danger" | "glass"
export type ButtonSemanticRegion = "root" | "icon" | "label" | "spinner"

export interface ButtonBaseProps extends ComponentSemanticProps<ButtonSemanticRegion> {
  variant?: ButtonVariant
  size?: ControlSize
  radius?: Radius | "default"
  iconSize?: IconSize
  material?: MaterialName
  icon?: IconName
  loading?: boolean
  disabled?: boolean
  block?: boolean
  type?: "button" | "submit" | "reset"
}

export type ButtonProps =
  | (ButtonBaseProps & {
      iconOnly?: false
      ariaLabel?: string
      "aria-label"?: string
    })
  | (ButtonBaseProps & {
      iconOnly: true
      ariaLabel: string
      "aria-label"?: string
    })
  | (ButtonBaseProps & {
      iconOnly: true
      ariaLabel?: string
      "aria-label": string
    })

export interface IconButtonProps extends Omit<ButtonBaseProps, "icon"> {
  label: string
  icon?: IconName
}
export type InputSemanticRegion = "root" | "input" | "prefix" | "suffix" | "clear"

export interface InputProps extends ComponentSemanticProps<InputSemanticRegion> {
  modelValue?: string
  id?: string
  type?:
    | "text"
    | "password"
    | "email"
    | "search"
    | "tel"
    | "url"
    | "number"
    | "date"
    | "time"
    | "datetime-local"
    | "month"
    | "week"
    | "color"
  name?: string
  placeholder?: string
  size?: ControlSize
  radius?: Radius | "default"
  iconSize?: IconSize
  material?: MaterialName
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  clearable?: boolean
  maxlength?: number
  minlength?: number
  autocomplete?: string
  inputmode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search"
  autofocus?: boolean
  ariaLabel?: string
}

export interface TextareaProps extends ComponentSemanticProps<"root" | "textarea" | "footer"> {
  modelValue?: string
  id?: string
  name?: string
  placeholder?: string
  rows?: number
  size?: ControlSize
  radius?: Radius | "default"
  material?: MaterialName
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  maxlength?: number
  showCount?: boolean
  autoResize?: boolean
  autoResizeMaxHeight?: number
  autocomplete?: string
  ariaLabel?: string
}

export interface CheckboxProps extends ComponentSemanticProps<"root" | "box" | "label"> {
  modelValue?: boolean
  label?: string
  ariaLabel?: string
  id?: string
  name?: string
  value?: string
  size?: "sm" | "md" | "lg"
  radius?: Radius | "default"
  iconSize?: IconSize
  disabled?: boolean
  indeterminate?: boolean
  invalid?: boolean
}

export interface SwitchProps extends ComponentSemanticProps<"root" | "track" | "thumb" | "label"> {
  modelValue?: boolean
  label?: string
  ariaLabel?: string
  id?: string
  name?: string
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: IconName
}

export type SelectSemanticRegion = "root" | "trigger" | "content" | "item" | "empty"

export interface SelectProps extends ComponentSemanticProps<SelectSemanticRegion> {
  modelValue?: string
  options: SelectOption[]
  id?: string
  name?: string
  placeholder?: string
  size?: ControlSize
  radius?: Radius | "default"
  iconSize?: IconSize
  material?: MaterialName
  disabled?: boolean
  invalid?: boolean
  ariaLabel?: string
}
export interface FormFieldProps extends ComponentSemanticProps<
  "root" | "label" | "control" | "description" | "error" | "hint"
> {
  id?: string
  label?: string
  description?: string
  hint?: string
  error?: string
  density?: Density
  required?: boolean
  disabled?: boolean
  hideLabel?: boolean
}

export interface FormRowProps extends ComponentSemanticProps<
  "root" | "label" | "control" | "description" | "hint" | "icon"
> {
  label: string
  description?: string
  hint?: string
  icon?: IconName
  iconSize?: IconSize
  density?: Density
  dense?: boolean
  clickable?: boolean
  layout?: "row" | "column"
  labelFor?: string
}

export type DialogSize = "sm" | "md" | "lg" | "xl"
export type DialogSemanticRegion =
  | "overlay"
  | "content"
  | "header"
  | "title"
  | "description"
  | "body"
  | "footer"
  | "close"

export interface DialogProps extends ComponentSemanticProps<DialogSemanticRegion> {
  open?: boolean
  title?: string
  description?: string
  size?: DialogSize
  radius?: Radius | "default"
  material?: MaterialName
  closeLabel?: string
  ariaLabel?: string
}

export type ConfirmDialogSemanticRegion = DialogSemanticRegion | "cancel" | "confirm"

export interface ConfirmDialogProps extends ComponentSemanticProps<ConfirmDialogSemanticRegion> {
  open?: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  size?: DialogSize
  radius?: Radius | "default"
  material?: MaterialName
  danger?: boolean
  loading?: boolean
}
export interface MenuItem {
  label: string
  value: string
  icon?: IconName
  disabled?: boolean
  danger?: boolean
  separator?: boolean
}

export interface TabsItem {
  value: string
  label: string
  icon?: IconName
  disabled?: boolean
}

export type TabsVariant = "underline" | "pills"
export type TabsSemanticRegion = "root" | "list" | "trigger" | "panel"

export interface TabsProps extends ComponentSemanticProps<TabsSemanticRegion> {
  modelValue?: string
  items: TabsItem[]
  variant?: TabsVariant
  size?: ControlSize
  radius?: Radius | "default"
  iconSize?: IconSize
  ariaLabel?: string
}

export interface SegmentedOption {
  value: string
  label: string
  icon?: IconName
  disabled?: boolean
}

export type SegmentedControlSemanticRegion = "root" | "item"

export interface SegmentedControlProps extends ComponentSemanticProps<SegmentedControlSemanticRegion> {
  modelValue?: string
  options: SegmentedOption[]
  size?: ControlSize
  radius?: Radius | "default"
  iconSize?: IconSize
  material?: MaterialName
  disabled?: boolean
  ariaLabel?: string
}
export type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "info"
export type BadgeSize = "xs" | "sm" | "md" | "lg"

export interface BadgeProps extends ComponentSemanticProps<"root" | "icon" | "label"> {
  variant?: BadgeVariant
  size?: BadgeSize
  iconSize?: IconSize
  radius?: Radius | "default"
  material?: MaterialName
  pill?: boolean
  dot?: boolean
  icon?: IconName
}

export interface PillProps extends ComponentSemanticProps<
  "root" | "main" | "icon" | "label" | "count" | "remove"
> {
  label?: string
  active?: boolean
  count?: number | string
  icon?: IconName
  size?: "sm" | "md" | "lg"
  iconSize?: IconSize
  radius?: Radius | "default"
  material?: MaterialName
  variant?: "filter" | "tag" | "ghost"
  removable?: boolean
  disabled?: boolean
}

export interface AvatarProps extends ComponentSemanticProps<"root" | "image" | "fallback"> {
  src?: string
  alt: string
  fallback?: string
  size?: ControlSize
  radius?: Radius | "default"
  shape?: "circle" | "square"
}

export interface CardProps extends ComponentSemanticProps<"root" | "header" | "body" | "footer"> {
  material?: MaterialName
  radius?: Radius | "default"
  padding?: "none" | "sm" | "md" | "lg"
  density?: Density
  variant?: "surface" | "outline" | "ghost"
  interactive?: boolean
}

export interface SkeletonProps extends ComponentSemanticProps<"root" | "shimmer"> {
  variant?: "rect" | "text" | "circle"
  width?: string | number
  height?: string | number
  radius?: Radius
  animated?: boolean
}

export interface SpinnerProps extends ComponentSemanticProps<"root"> {
  size?: IconSize
  label?: string
}
export interface EmptyStateProps extends ComponentSemanticProps<
  "root" | "icon" | "title" | "description" | "actions"
> {
  icon?: IconName
  iconSize?: IconSize
  density?: Density
  title?: string
  description?: string
}

export interface TableColumn {
  key: string
  label: string
  width?: string
  align?: "start" | "center" | "end"
}

export type TableRow = Record<string, unknown>

export interface TableProps extends ComponentSemanticProps<
  "root" | "table" | "header" | "row" | "cell" | "empty"
> {
  columns: TableColumn[]
  rows: TableRow[]
  rowKey?: string
  density?: Density
  radius?: Radius | "default"
  material?: MaterialName
  loading?: boolean
  emptyText?: string
  striped?: boolean
  bordered?: boolean
  stickyHeader?: boolean
}
export interface SectionHeaderProps extends ComponentSemanticProps<
  "root" | "title" | "description" | "actions"
> {
  title: string
  density?: Density
  description?: string
}

export interface PageHeaderProps extends ComponentSemanticProps<
  "root" | "title" | "description" | "actions" | "back"
> {
  title: string
  description?: string
  back?: boolean
  density?: Density
  iconSize?: IconSize
  backLabel?: string
}

export interface MessageComposerProps extends ComponentSemanticProps<
  "root" | "input" | "actions" | "send"
> {
  modelValue?: string
  placeholder?: string
  size?: ControlSize
  radius?: Radius | "default"
  material?: MaterialName
  disabled?: boolean
  loading?: boolean
  maxlength?: number
  rows?: number
  sendLabel?: string
}

export interface NavMenuItem {
  text: string
  link?: string
  active?: boolean
  disabled?: boolean
  badge?: string
  items?: NavMenuItem[]
}

export interface NavMenuGroup {
  text?: string
  items: NavMenuItem[]
}

export interface NavMenuProps extends ComponentSemanticProps<
  "root" | "group" | "groupTitle" | "item" | "link" | "badge"
> {
  groups: NavMenuGroup[]
  ariaLabel?: string
  radius?: Radius | "default"
  density?: Density
  orientation?: "vertical" | "horizontal"
}

export interface TocItem {
  id: string
  text: string
  level: number
}

export interface TocProps extends ComponentSemanticProps<
  "root" | "title" | "list" | "item" | "link"
> {
  items: TocItem[]
  activeId?: string
  title?: string
  density?: Density
  ariaLabel?: string
}

export interface BreadcrumbItem {
  text: string
  link?: string
}

export interface BreadcrumbProps extends ComponentSemanticProps<
  "root" | "list" | "item" | "link" | "separator"
> {
  items: BreadcrumbItem[]
  size?: "sm" | "md" | "lg"
  ariaLabel?: string
}

export interface PaginationLink {
  text: string
  link: string
}

export interface PaginationProps extends ComponentSemanticProps<
  "root" | "link" | "label" | "icon"
> {
  previous?: PaginationLink
  next?: PaginationLink
  radius?: Radius | "default"
  material?: MaterialName
  iconSize?: IconSize
  ariaLabel?: string
}

export interface AppBarProps extends ComponentSemanticProps<
  "root" | "brand" | "content" | "actions"
> {
  sticky?: boolean
  blurred?: boolean
  radius?: Radius | "default"
  density?: Density
  material?: MaterialName
}

export type DrawerSide = "start" | "end" | "top" | "bottom"

export interface DrawerProps extends ComponentSemanticProps<
  "root" | "overlay" | "content" | "header" | "title" | "body" | "footer" | "close"
> {
  open?: boolean
  side?: DrawerSide
  title?: string
  radius?: Radius | "default"
  material?: MaterialName
  closeLabel?: string
  ariaLabel?: string
  width?: string
}

export interface CommandItem {
  title: string
  description?: string
  section?: string
  link: string
  keywords?: string
  icon?: IconName
}

export interface CommandPaletteProps extends ComponentSemanticProps<
  "root" | "overlay" | "content" | "input" | "group" | "item" | "empty"
> {
  open?: boolean
  items: CommandItem[]
  radius?: Radius | "default"
  material?: MaterialName
  placeholder?: string
  emptyText?: string
}

export interface KbdProps extends ComponentSemanticProps<"root"> {
  keys?: string
  size?: "sm" | "md"
  radius?: Radius | "default"
}

export type CodeVariant = "neutral" | "primary"

export interface CodeProps extends ComponentSemanticProps<"root"> {
  value?: string
  variant?: CodeVariant
  size?: "sm" | "md"
  radius?: Radius | "default"
}
export interface AlertProps extends ComponentSemanticProps<"root" | "icon" | "title" | "content"> {
  variant?: "info" | "success" | "warning" | "danger"
  title?: string
  icon?: IconName
  radius?: Radius | "default"
  material?: MaterialName
  iconSize?: IconSize
}

export type MenuSemanticRegion = "content" | "item" | "separator"

export interface PopoverProps extends ComponentSemanticProps<"content" | "arrow"> {
  open?: boolean
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  arrow?: boolean
  modal?: boolean
  material?: MaterialName
  radius?: Radius | "default"
}

export interface TooltipProps extends ComponentSemanticProps<"content" | "arrow"> {
  side?: "top" | "right" | "bottom" | "left"
  align?: "center" | "start" | "end"
  sideOffset?: number
  delayDuration?: number
  open?: boolean
  radius?: Radius | "default"
  material?: MaterialName
}

export interface DropdownMenuProps extends ComponentSemanticProps<MenuSemanticRegion> {
  items: MenuItem[]
  open?: boolean
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  material?: MaterialName
  radius?: Radius | "default"
  iconSize?: IconSize
  density?: Density
}

export interface ContextMenuProps extends ComponentSemanticProps<MenuSemanticRegion> {
  items: MenuItem[]
  material?: MaterialName
  radius?: Radius | "default"
  iconSize?: IconSize
  density?: Density
}

export interface TruncateTextProps extends ComponentSemanticProps<"root"> {
  text?: string
  lines?: number
  as?: string
  title?: string
}

export interface ToastViewportProps extends ComponentSemanticProps<"viewport" | "toast"> {
  material?: MaterialName
  radius?: Radius | "default"
}
