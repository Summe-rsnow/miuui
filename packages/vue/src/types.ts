import type {
  ComponentSemanticProps,
  ControlSize,
  Density,
  IconSize,
  LocaleCode,
  MaterialName,
  MiuMessageTree,
  MotionTier,
  Radius,
  ThemeMode,
} from "@xcmm1543/miuui-core"
import type { IconDefinition, IconName } from "@xcmm1543/miuui-icons"
import type { IconRegistry } from "./composables/useMiuIcons"

/** 图标名称或自定义 SVG 图标定义对象。 */
export type IconProp = IconName | IconDefinition

/** 图标组件 Props。 */
export interface IconProps {
  /** 内置图标名称或自定义图标定义。 */
  name: IconProp
  /** 图标尺寸 token 或像素数值。 */
  size?: IconSize | number
  /** 无障碍标签；设置后渲染 `role="img"`。 */
  label?: string
  /** 旋转角度（度）。 */
  rotate?: 0 | 90 | 180 | 270
}

/** 主题提供者 Props。 */
export interface ThemeProviderProps {
  /** 主题模式：浅色、深色或跟随系统。 */
  theme?: ThemeMode
  /** 全局默认布局密度。 */
  density?: Density
  /** 全局默认圆角。 */
  radius?: Radius
  /** 全局默认材质。 */
  material?: MaterialName
  /** 全局默认动画等级。 */
  motionTier?: MotionTier
  /** 品牌主色十六进制种子，用于运行时生成 WCAG AA 调色板。 */
  accentSeed?: string
  /** 当前语言代码。 */
  locale?: LocaleCode
  /** 回退语言代码。 */
  fallbackLocale?: LocaleCode
  /** 自定义多语言消息覆盖树。 */
  messages?: Record<LocaleCode, MiuMessageTree>
  /** 全局 Toast 默认位置。 */
  toastPosition?: ToastPosition
  /** 全局 Toast 默认材质。 */
  toastMaterial?: MaterialName
  /** 全局 Toast 默认风格变体。 */
  toastStyleVariant?: ToastStyleVariant
  /** 同屏最大 Toast 展示数量。 */
  toastMax?: number
  /** 全局图标覆盖映射表。 */
  icons?: IconRegistry
  /** 根节点渲染的元素标签名。 */
  as?: string
}

/** 按钮视觉变体。 */
export type ButtonVariant =
  | "solid"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "glass"
  | "tonal"

/** 按钮语义区域。 */
export type ButtonSemanticRegion = "root" | "icon" | "label" | "spinner"

/** 按钮基础 Props。 */
export interface ButtonBaseProps extends ComponentSemanticProps<ButtonSemanticRegion> {
  /** 按钮视觉变体。 */
  variant?: ButtonVariant
  /** 控件尺寸。 */
  size?: ControlSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 图标尺寸 token 或像素数值。 */
  iconSize?: IconSize | number
  /** 表面材质覆盖。 */
  material?: MaterialName
  /** 左侧图标。 */
  icon?: IconProp
  /** 右侧图标。 */
  iconRight?: IconProp
  /** 加载中状态（阻止点击并显示 Spinner）。 */
  loading?: boolean
  /** 禁用状态。 */
  disabled?: boolean
  /** 是否占满父容器宽度。 */
  block?: boolean
  /** 原生按钮类型。 */
  type?: "button" | "submit" | "reset"
}

/** 按钮 Props（`iconOnly` 为 true 时要求提供无障碍名称）。 */
export type ButtonProps =
  | (ButtonBaseProps & {
      /** 仅图标模式。 */
      iconOnly?: false
      /** 无障碍标签。 */
      ariaLabel?: string
      /** 原生无障碍标签别名。 */
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

/** 图标按钮语义区域。 */
export type IconButtonSemanticRegion = "root" | "icon" | "spinner"

/** 图标按钮 Props。 */
export interface IconButtonProps
  extends
    Omit<ButtonBaseProps, "icon" | "size" | "iconRight" | "classNames" | "styles">,
    ComponentSemanticProps<IconButtonSemanticRegion> {
  /** 控件尺寸 token 或像素数值。 */
  size?: ControlSize | number
  /** 无障碍提示文案，同时回退为原生 `title`。 */
  label?: string
  /** 无障碍标签。 */
  ariaLabel?: string
  /** 原生无障碍标签别名。 */
  "aria-label"?: string
  /** 原生悬停提示文案。 */
  title?: string
  /** 按钮图标。 */
  icon?: IconProp
  /** 激活态样式开关（对应 `aria-pressed`）。 */
  active?: boolean
}

/** 单行输入框语义区域。 */
export type InputSemanticRegion =
  | "root"
  | "input"
  | "prefix"
  | "suffix"
  | "clear"
  | "toggle"
  | "count"

/** 单行输入框 Props。 */
export interface InputProps extends ComponentSemanticProps<InputSemanticRegion> {
  /** 绑定值。 */
  modelValue?: string
  /** 元素 ID。 */
  id?: string
  /** 原生输入类型。 */
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
  /** 表单字段名。 */
  name?: string
  /** 占位提示文案。 */
  placeholder?: string
  /** 控件尺寸。 */
  size?: ControlSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 表面材质。 */
  material?: MaterialName
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 校验错误态。 */
  invalid?: boolean
  /** 显示一键清空按钮。 */
  clearable?: boolean
  /** 密码显隐切换按钮。 */
  passwordToggle?: boolean
  /** 显示字数统计。 */
  showCount?: boolean
  /** 最大字符数。 */
  maxlength?: number
  /** 最小字符数。 */
  minlength?: number
  /** 原生 `autocomplete` 属性。 */
  autocomplete?: string
  /** 虚拟键盘输入模式。 */
  inputmode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search"
  /** 自动聚焦。 */
  autofocus?: boolean
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 多行文本框语义区域。 */
export type TextareaSemanticRegion = "root" | "textarea" | "footer" | "count" | "clear"

/** 多行文本框 Props。 */
export interface TextareaProps extends ComponentSemanticProps<TextareaSemanticRegion> {
  /** 绑定值。 */
  modelValue?: string
  /** 元素 ID。 */
  id?: string
  /** 表单字段名。 */
  name?: string
  /** 占位提示文案。 */
  placeholder?: string
  /** 初始显示行数。 */
  rows?: number
  /** 控件尺寸。 */
  size?: ControlSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 表面材质。 */
  material?: MaterialName
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 校验错误态。 */
  invalid?: boolean
  /** 显示一键清空按钮。 */
  clearable?: boolean
  /** 最大字符数。 */
  maxlength?: number
  /** 显示字数统计。 */
  showCount?: boolean
  /** 根据内容自动撑高。 */
  autoResize?: boolean
  /** 自动撑高最大高度（像素）。 */
  autoResizeMaxHeight?: number
  /** 原生 `autocomplete` 属性。 */
  autocomplete?: string
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 复选框 Props。 */
export interface CheckboxProps extends ComponentSemanticProps<"root" | "box" | "label"> {
  /** 选中状态。 */
  modelValue?: boolean
  /** 选项标签文案。 */
  label?: string
  /** 无障碍标签（无可见 label 时使用）。 */
  ariaLabel?: string
  /** 元素 ID。 */
  id?: string
  /** 表单字段名。 */
  name?: string
  /** 表单提交值。 */
  value?: string
  /** 控件尺寸。 */
  size?: "sm" | "md" | "lg"
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 勾选图标尺寸。 */
  iconSize?: IconSize
  /** 表面材质。 */
  material?: MaterialName
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 半选态。 */
  indeterminate?: boolean
  /** 校验错误态。 */
  invalid?: boolean
}

/** 开关 Props。 */
export interface SwitchProps extends ComponentSemanticProps<"root" | "track" | "thumb" | "label"> {
  /** 开关状态。 */
  modelValue?: boolean
  /** 开关旁标签文案。 */
  label?: string
  /** 无障碍标签。 */
  ariaLabel?: string
  /** 元素 ID。 */
  id?: string
  /** 表单字段名。 */
  name?: string
  /** 控件尺寸。 */
  size?: "sm" | "md" | "lg"
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 校验错误态。 */
  invalid?: boolean
}

/** 下拉选择选项。 */
export interface SelectOption {
  /** 选项唯一值。 */
  value: string | number
  /** 选项展示文案。 */
  label: string
  /** 禁用该选项。 */
  disabled?: boolean
  /** 选项前置图标。 */
  icon?: IconProp
}

/** 下拉选择器语义区域。 */
export type SelectSemanticRegion = "root" | "trigger" | "content" | "item" | "empty" | "clear"

/** 下拉选择器 Props。 */
export interface SelectProps extends ComponentSemanticProps<SelectSemanticRegion> {
  /** 当前选中值。 */
  modelValue?: string | number
  /** 选项列表。 */
  options: SelectOption[]
  /** 元素 ID。 */
  id?: string
  /** 表单字段名。 */
  name?: string
  /** 未选择时的占位提示。 */
  placeholder?: string
  /** 控件尺寸。 */
  size?: ControlSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 表面材质。 */
  material?: MaterialName
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 校验错误态。 */
  invalid?: boolean
  /** 允许清除当前选项。 */
  clearable?: boolean
  /** 加载中状态。 */
  loading?: boolean
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 表单域容器 Props。 */
export interface FormFieldProps extends ComponentSemanticProps<
  "root" | "label" | "control" | "description" | "error" | "hint"
> {
  /** 关联控件 ID。 */
  id?: string
  /** 字段标签。 */
  label?: string
  /** 字段说明文案。 */
  description?: string
  /** 辅助提示文案。 */
  hint?: string
  /** 校验错误提示文案（存在时标红并置 `invalid`）。 */
  error?: string
  /** 布局密度（`compact` 向子控件传递 `"sm"` 尺寸提示）。 */
  density?: Density
  /** 必填标记。 */
  required?: boolean
  /** 禁用所有子表单控件。 */
  disabled?: boolean
  /** 向子表单控件传递只读态。 */
  readonly?: boolean
  /** 显式错误态。 */
  invalid?: boolean
  /** 视觉隐藏标签但保留屏幕阅读器可访问性。 */
  hideLabel?: boolean
}

/** 表单行视觉变体。 */
export type FormRowVariant = "plain" | "card"

/** 表单行 Props。 */
export interface FormRowProps extends ComponentSemanticProps<
  "root" | "label" | "control" | "description" | "hint" | "icon"
> {
  /** 行标题。 */
  label?: string
  /** 说明文案。 */
  description?: string
  /** 补充提示文案。 */
  hint?: string
  /** 左侧图标。 */
  icon?: IconProp
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 行风格：`plain` 扁平或 `card` 卡片。 */
  variant?: FormRowVariant
  /** 卡片圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 行密度。 */
  density?: Density
  /** 整行可点击交互态。 */
  clickable?: boolean
  /** 禁用状态。 */
  disabled?: boolean
  /** 排列方向。 */
  layout?: "row" | "column"
  /** 关联表单控件 ID。 */
  labelFor?: string
}

/** 对话框预设宽度档位。 */
export type DialogSize = "sm" | "md" | "lg" | "xl"

/** 对话框语义区域。 */
export type DialogSemanticRegion =
  | "overlay"
  | "content"
  | "header"
  | "title"
  | "description"
  | "body"
  | "footer"
  | "close"

/** 对话框 Props。 */
export interface DialogProps extends ComponentSemanticProps<DialogSemanticRegion> {
  /** 受控打开状态。 */
  open?: boolean
  /** 标题文案。 */
  title?: string
  /** 副标题/描述文案。 */
  description?: string
  /** 宽度预设档位。 */
  size?: DialogSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 自定义固定宽度（CSS 长度字符串）。 */
  width?: string
  /** 关闭按钮无障碍标签。 */
  closeLabel?: string
  /** 对话框无障碍标签。 */
  ariaLabel?: string
  /** 隐藏头部（保留屏幕阅读器标题）。 */
  hideHeader?: boolean
  /** 模态交互模式（屏蔽外部交互）。 */
  modal?: boolean
  /** 点击遮罩层是否关闭。 */
  closeOnOverlayClick?: boolean
  /** 按下 ESC 键是否关闭。 */
  closeOnEsc?: boolean
  /** 是否显示右上角关闭按钮。 */
  showClose?: boolean
  /** 是否锁定页面滚动。 */
  lockScroll?: boolean
}

/** 确认对话框语义区域。 */
export type ConfirmDialogSemanticRegion = DialogSemanticRegion | "cancel" | "confirm"

/** 确认对话框 Props。 */
export interface ConfirmDialogProps extends ComponentSemanticProps<ConfirmDialogSemanticRegion> {
  /** 受控打开状态。 */
  open?: boolean
  /** 确认标题。 */
  title?: string
  /** 确认详情描述。 */
  description?: string
  /** 确认按钮文案。 */
  confirmLabel?: string
  /** 取消按钮文案。 */
  cancelLabel?: string
  /** 宽度预设档位。 */
  size?: DialogSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 危险操作样式。 */
  danger?: boolean
  /** 确认提交异步加载态（阻塞关闭并展示 loading）。 */
  loading?: boolean
  /** 点击遮罩层是否关闭。 */
  closeOnOverlayClick?: boolean
  /** 按下 ESC 键是否关闭。 */
  closeOnEsc?: boolean
  /** 是否显示关闭按钮。 */
  showClose?: boolean
  /** 关闭按钮无障碍标签。 */
  closeLabel?: string
}

/** 菜单项配置。 */
export interface MenuItem {
  /** 菜单项文案。 */
  label: string
  /** 菜单项标识值。 */
  value: string
  /** 前置图标。 */
  icon?: IconProp
  /** 禁用该菜单项。 */
  disabled?: boolean
  /** 危险高亮样式。 */
  danger?: boolean
  /** 渲染为分割线。 */
  separator?: boolean
}

/** 标签页项配置。 */
export interface TabsItem {
  /** 标签唯一值。 */
  value: string
  /** 标签文案。 */
  label: string
  /** 前置图标。 */
  icon?: IconProp
  /** 禁用该标签。 */
  disabled?: boolean
}

/** 标签页视觉变体。 */
export type TabsVariant = "underline" | "pills" | "segmented"

/** 标签页语义区域。 */
export type TabsSemanticRegion = "root" | "list" | "trigger" | "indicator" | "panel"

/** 标签页 Props。 */
export interface TabsProps extends ComponentSemanticProps<TabsSemanticRegion> {
  /** 当前激活标签值。 */
  modelValue?: string
  /** 标签项列表。 */
  items: TabsItem[]
  /** 视觉变体。 */
  variant?: TabsVariant
  /** 控件尺寸。 */
  size?: ControlSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 表面材质。 */
  material?: MaterialName
  /** 对齐方式。 */
  align?: "start" | "center" | "end"
  /** 加载骨架态。 */
  loading?: boolean
  /** 禁用全部标签交互。 */
  disabled?: boolean
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 分段控制器选项。 */
export interface SegmentedOption {
  /** 选项值。 */
  value: string
  /** 选项文案。 */
  label?: string
  /** 图标。 */
  icon?: IconProp
  /** 色点颜色值。 */
  color?: string
  /** 锁定标记图标（注意不自动等同禁用，需配合 `disabled`）。 */
  locked?: boolean
  /** 禁用该选项。 */
  disabled?: boolean
  /** 悬停提示文案。 */
  title?: string
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 分段控制器语义区域。 */
export type SegmentedControlSemanticRegion = "root" | "indicator" | "item"

/** 分段控制器 Props。 */
export interface SegmentedControlProps extends ComponentSemanticProps<SegmentedControlSemanticRegion> {
  /** 当前选中值。 */
  modelValue?: string
  /** 选项列表。 */
  options: readonly SegmentedOption[]
  /** 控件尺寸。 */
  size?: ControlSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 仅显示图标。 */
  iconOnly?: boolean
  /** 占满父容器宽度均分选项。 */
  block?: boolean
  /** 允许再次点击已选项取消选中。 */
  clearable?: boolean
  /** 表面材质。 */
  material?: MaterialName
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 徽标语义颜色变体。 */
export type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "info"

/** 徽标尺寸。 */
export type BadgeSize = "xs" | "sm" | "md" | "lg"

/** 徽标 Props。 */
export interface BadgeProps extends ComponentSemanticProps<"root" | "icon" | "label"> {
  /** 语义颜色变体。 */
  variant?: BadgeVariant
  /** 徽标尺寸。 */
  size?: BadgeSize
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 显示圆点指示器。 */
  dot?: boolean
  /** 脉冲动画圆点指示器。 */
  pulse?: boolean
  /** 前置图标。 */
  icon?: IconProp
}

/** 筛选胶囊 Props。 */
export interface PillProps extends ComponentSemanticProps<
  "root" | "main" | "icon" | "label" | "count" | "remove"
> {
  /** 标签文案。 */
  label?: string
  /** 选中激活态。 */
  active?: boolean
  /** 计数角标。 */
  count?: number | string
  /** 前置图标。 */
  icon?: IconProp
  /** 控件尺寸。 */
  size?: "sm" | "md" | "lg"
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 视觉变体。 */
  variant?: "filter" | "tag" | "ghost"
  /** 可移除按钮开关。 */
  removable?: boolean
  /** 禁用状态。 */
  disabled?: boolean
}

/** 胶囊组选项。 */
export interface PillGroupOption {
  /** 选项值。 */
  value: string | number
  /** 选项文案。 */
  label: string
  /** 前置图标。 */
  icon?: IconProp
  /** 计数角标。 */
  count?: number | string
  /** 禁用该项。 */
  disabled?: boolean
}

/** 胶囊组 Props。 */
export interface PillGroupProps extends ComponentSemanticProps<"root" | "item"> {
  /** 选中值（单选标量或多选数组）。 */
  modelValue?: string | number | Array<string | number>
  /** 选项列表（字符串或对象）。 */
  options: Array<string | PillGroupOption>
  /** 多选模式。 */
  multiple?: boolean
  /** 多选最大可选数量。 */
  max?: number
  /** 是否显示前置“全部”选项。 */
  showAllOption?: boolean
  /** “全部”选项文案。 */
  allLabel?: string
  /** “全部”选项代表值。 */
  allValue?: string | number
  /** 控件尺寸。 */
  size?: "sm" | "md" | "lg"
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 胶囊变体。 */
  variant?: "filter" | "tag" | "ghost"
  /** 允许取消选中或清空。 */
  clearable?: boolean
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 滑块 Props。 */
export interface SliderProps extends ComponentSemanticProps<"root" | "track" | "range" | "thumb"> {
  /** 当前数值。 */
  modelValue?: number
  /** 最小值。 */
  min?: number
  /** 最大值。 */
  max?: number
  /** 步进值。 */
  step?: number
  /** 方向。 */
  orientation?: "horizontal" | "vertical"
  /** 控件尺寸。 */
  size?: "sm" | "md" | "lg"
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 校验错误态。 */
  invalid?: boolean
  /** 表单字段名。 */
  name?: string
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 头像 Props。 */
export interface AvatarProps extends ComponentSemanticProps<"root" | "image" | "fallback"> {
  /** 图片地址。 */
  src?: string | null
  /** 替代文本（必填，同时作为无障碍名称及首字符回退）。 */
  alt: string
  /** 自定义回退字符。 */
  fallback?: string
  /** 回退图标。 */
  fallbackIcon?: IconProp
  /** 尺寸 token 或像素数值。 */
  size?: ControlSize | number
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 外形（圆形、方形、方圆）。 */
  shape?: "circle" | "square" | "squircle"
  /** 显示边框。 */
  bordered?: boolean
  /** 可点击交互态。 */
  clickable?: boolean
  /** 禁用交互。 */
  disabled?: boolean
}

/** 卡片 Props。 */
export interface CardProps extends ComponentSemanticProps<"root" | "header" | "body" | "footer"> {
  /** 卡片标题。 */
  title?: string
  /** 表面材质。 */
  material?: MaterialName
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 内边距预设。 */
  padding?: "none" | "sm" | "md" | "lg"
  /** 布局密度（优先于固定 `padding` 映射令牌）。 */
  density?: Density
  /** 卡片变体。 */
  variant?: "surface" | "outline" | "ghost"
  /** 悬停抬升交互态。 */
  interactive?: boolean
  /** 禁用交互态。 */
  disabled?: boolean
}

/** 骨架屏 Props。 */
export interface SkeletonProps extends ComponentSemanticProps<"root" | "shimmer"> {
  /** 形状变体。 */
  variant?: "rect" | "text" | "circle"
  /** 宽度（CSS 长度或数字像素）。 */
  width?: string | number
  /** 高度（CSS 长度或数字像素）。 */
  height?: string | number
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 启用微光扫过动画。 */
  animated?: boolean
}

/** 加载指示器 Props。 */
export interface SpinnerProps extends ComponentSemanticProps<"root"> {
  /** 指示器尺寸。 */
  size?: IconSize
  /** 无障碍标签（默认使用本地化 loading 文案）。 */
  label?: string
}

/** 空状态 Props。 */
export interface EmptyStateProps extends ComponentSemanticProps<
  "root" | "icon" | "title" | "description" | "actions"
> {
  /** 展示图标。 */
  icon?: IconProp
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 布局密度。 */
  density?: Density
  /** 标题文案。 */
  title?: string
  /** 描述文案。 */
  description?: string
}

/** 表格列定义。 */
export interface TableColumn {
  /** 列数据键名。 */
  key: string
  /** 列标题文案。 */
  label: string
  /** 列宽度（CSS 长度）。 */
  width?: string
  /** 单元格内容对齐。 */
  align?: "start" | "center" | "end"
}

/** 表格行数据结构。 */
export type TableRow = Record<string, unknown>

/** 表格 Props。 */
export interface TableProps extends ComponentSemanticProps<
  "root" | "table" | "header" | "row" | "cell" | "empty"
> {
  /** 列定义数组。 */
  columns: TableColumn[]
  /** 数据行数组。 */
  rows: TableRow[]
  /** 行主键字段名。 */
  rowKey?: string
  /** 表格密度（`compact` 时向内部控件传递 `"sm"` 尺寸提示）。 */
  density?: Density
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 加载中状态。 */
  loading?: boolean
  /** 空数据提示文案。 */
  emptyText?: string
  /** 斑马纹。 */
  striped?: boolean
  /** 单元格纵向分割线。 */
  bordered?: boolean
  /** 吸顶表头。 */
  stickyHeader?: boolean
}

/** 区块标题 Props。 */
export interface SectionHeaderProps extends ComponentSemanticProps<
  "root" | "title" | "description" | "actions"
> {
  /** 区块标题。 */
  title: string
  /** 布局密度。 */
  density?: Density
  /** 区块副标题描述。 */
  description?: string
}

/** 页面头部 Props。 */
export interface PageHeaderProps extends ComponentSemanticProps<
  "root" | "title" | "description" | "actions" | "back"
> {
  /** 页面标题。 */
  title: string
  /** 页面描述文案。 */
  description?: string
  /** 显示返回按钮。 */
  back?: boolean
  /** 显示底部分割线。 */
  divider?: boolean
  /** 布局密度。 */
  density?: Density
  /** 返回按钮图标尺寸。 */
  iconSize?: IconSize
  /** 返回按钮无障碍标签。 */
  backLabel?: string
}

/** 消息编辑器 Props。 */
export interface MessageComposerProps extends ComponentSemanticProps<
  "root" | "input" | "toolbar" | "tools" | "actions" | "send" | "cancel"
> {
  /** 绑定值。 */
  modelValue?: string
  /** 占位提示文案。 */
  placeholder?: string
  /** 控件尺寸。 */
  size?: ControlSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 表面材质。 */
  material?: MaterialName
  /** 布局密度。 */
  density?: Density
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 校验错误态。 */
  invalid?: boolean
  /** 显示一键清空按钮。 */
  clearable?: boolean
  /** 发送加载状态。 */
  loading?: boolean
  /** 显示字数统计。 */
  showCount?: boolean
  /** 显示取消按钮。 */
  showCancel?: boolean
  /** 取消按钮文案。 */
  cancelLabel?: string
  /** 最大字符数。 */
  maxlength?: number
  /** 初始显示行数。 */
  rows?: number
  /** 发送按钮文案。 */
  sendLabel?: string
}

/** 导航菜单项。 */
export interface NavMenuItem {
  /** 菜单文本。 */
  text: string
  /** 跳转链接（经 `safeHref` 过滤）。 */
  link?: string
  /** 当前激活态。 */
  active?: boolean
  /** 禁用状态。 */
  disabled?: boolean
  /** 徽标文本。 */
  badge?: string
  /** 嵌套子菜单项。 */
  items?: NavMenuItem[]
}

/** 导航菜单分组。 */
export interface NavMenuGroup {
  /** 分组标题。 */
  text?: string
  /** 分组菜单项。 */
  items: NavMenuItem[]
}

/** 导航菜单 Props。 */
export interface NavMenuProps extends ComponentSemanticProps<
  "root" | "group" | "groupTitle" | "item" | "link" | "badge"
> {
  /** 分组数据。 */
  groups: NavMenuGroup[]
  /** 无障碍标签。 */
  ariaLabel?: string
  /** 菜单项圆角。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 菜单密度。 */
  density?: Density
  /** 排列方向。 */
  orientation?: "vertical" | "horizontal"
}

/** 目录锚点项。 */
export interface TocItem {
  /** 目标锚点 ID。 */
  id: string
  /** 标题文本。 */
  text: string
  /** 标题层级（如 2 / 3）。 */
  level: number
}

/** 页面目录 Props。 */
export interface TocProps extends ComponentSemanticProps<
  "root" | "title" | "list" | "item" | "link"
> {
  /** 目录条目。 */
  items: TocItem[]
  /** 当前高亮锚点 ID。 */
  activeId?: string
  /** 目录标题。 */
  title?: string
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 布局密度。 */
  density?: Density
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 面包屑项。 */
export interface BreadcrumbItem {
  /** 节点文案。 */
  text: string
  /** 跳转链接（最后一项通常省略）。 */
  link?: string
}

/** 面包屑 Props。 */
export interface BreadcrumbProps extends ComponentSemanticProps<
  "root" | "list" | "item" | "link" | "separator"
> {
  /** 路径节点列表。 */
  items: BreadcrumbItem[]
  /** 字体尺寸。 */
  size?: "sm" | "md" | "lg"
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 链接分页目标。 */
export interface PaginationLink {
  /** 链接标题。 */
  text: string
  /** 链接地址。 */
  link: string
}

/** 分页模式。 */
export type PaginationMode = "links" | "numeric"

/** 每页条数选项。 */
export interface PaginationPageSizeOption {
  /** 展示标签。 */
  label: string
  /** 每页条数值。 */
  value: number
}

/** 分页器 Props。 */
export interface PaginationProps extends ComponentSemanticProps<
  "root" | "link" | "label" | "icon"
> {
  /** 分页模式：`links`（上/下篇导航）或 `numeric`（页码分页）。 */
  mode?: PaginationMode
  /** 上一页链接（`links` 模式）。 */
  previous?: PaginationLink
  /** 下一页链接（`links` 模式）。 */
  next?: PaginationLink
  /** 当前页码（从 1 开始）。 */
  page?: number
  /** 每页条数。 */
  pageSize?: number
  /** 总记录数（传入时自动启用 `numeric` 模式）。 */
  total?: number
  /** 每页条数选择器选项。 */
  pageSizeOptions?: PaginationPageSizeOption[]
  /** 显示每页条数选择器。 */
  showPageSize?: boolean
  /** 显示页码快速跳转输入。 */
  showQuickJumper?: boolean
  /** 游标分页是否存在下一页。 */
  hasNext?: boolean
  /** 加载中状态。 */
  loading?: boolean
  /** 禁用分页交互。 */
  disabled?: boolean
  /** 内部按钮与控件尺寸。 */
  size?: ControlSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 顶部应用栏 Props。 */
export interface AppBarProps extends ComponentSemanticProps<
  "root" | "brand" | "content" | "actions"
> {
  /** 吸顶定位。 */
  sticky?: boolean
  /** 启用背景模糊玻璃态。 */
  blurred?: boolean
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 布局密度。 */
  density?: Density
  /** 表面材质。 */
  material?: MaterialName
}

/** 抽屉弹出方向。 */
export type DrawerSide = "start" | "end" | "top" | "bottom"

/** 抽屉 Props。 */
export interface DrawerProps extends ComponentSemanticProps<
  "overlay" | "content" | "header" | "title" | "body" | "footer" | "close"
> {
  /** 受控打开状态。 */
  open?: boolean
  /** 滑出方向。 */
  side?: DrawerSide
  /** 标题文案。 */
  title?: string
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 关闭按钮无障碍标签。 */
  closeLabel?: string
  /** 抽屉无障碍标签。 */
  ariaLabel?: string
  /** 自定义抽屉宽度（水平方向有效）。 */
  width?: string
  /** 模态交互模式。 */
  modal?: boolean
  /** 点击遮罩层是否关闭。 */
  closeOnOverlayClick?: boolean
  /** 按下 ESC 键是否关闭。 */
  closeOnEsc?: boolean
  /** 是否显示关闭按钮。 */
  showClose?: boolean
  /** 是否锁定页面滚动。 */
  lockScroll?: boolean
}

/** 命令面板条目。 */
export interface CommandItem {
  /** 条目标题。 */
  title: string
  /** 补充描述。 */
  description?: string
  /** 分组名称。 */
  section?: string
  /** 跳转或唯一标识链接。 */
  link: string
  /** 搜索关键词。 */
  keywords?: string
  /** 条目图标。 */
  icon?: IconProp
}

/** 命令面板 Props。 */
export interface CommandPaletteProps extends ComponentSemanticProps<
  "overlay" | "content" | "input" | "group" | "item" | "empty"
> {
  /** 受控打开状态。 */
  open?: boolean
  /** 命令条目数组。 */
  items: CommandItem[]
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 搜索框占位文案。 */
  placeholder?: string
  /** 无匹配结果文案。 */
  emptyText?: string
  /** 点击遮罩层是否关闭。 */
  closeOnOverlayClick?: boolean
  /** 按下 ESC 键是否关闭。 */
  closeOnEsc?: boolean
}

/** 键盘按键提示 Props。 */
export interface KbdProps extends ComponentSemanticProps<"root"> {
  /** 按键文案。 */
  keys?: string
  /** 尺寸。 */
  size?: "sm" | "md"
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
}

/** 行内代码样式变体。 */
export type CodeVariant = "neutral" | "primary"

/** 行内代码 Props。 */
export interface CodeProps extends ComponentSemanticProps<"root"> {
  /** 代码文本值。 */
  value?: string
  /** 颜色变体。 */
  variant?: CodeVariant
  /** 尺寸。 */
  size?: "sm" | "md"
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
}

/** 提示横幅 Props。 */
export interface AlertProps extends ComponentSemanticProps<"root" | "icon" | "title" | "content"> {
  /** 语义变体。 */
  variant?: "info" | "success" | "warning" | "danger"
  /** 提示标题。 */
  title?: string
  /** 前置图标。 */
  icon?: IconProp
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 图标尺寸。 */
  iconSize?: IconSize
}

/** 菜单组件共享语义区域。 */
export type MenuSemanticRegion = "content" | "item" | "separator"

/** 弹出气泡 Props。 */
export interface PopoverProps extends ComponentSemanticProps<"content" | "arrow"> {
  /** 受控打开状态。 */
  open?: boolean
  /** 弹出方向。 */
  side?: "top" | "right" | "bottom" | "left"
  /** 对齐方式。 */
  align?: "start" | "center" | "end"
  /** 距触发器偏移（像素）。 */
  sideOffset?: number
  /** 显示指示箭头。 */
  arrow?: boolean
  /** 模态交互模式。 */
  modal?: boolean
  /** 禁用弹出触发。 */
  disabled?: boolean
  /** 表面材质。 */
  material?: MaterialName
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 点击外部是否关闭。 */
  closeOnClickOutside?: boolean
  /** 按下 ESC 键是否关闭。 */
  closeOnEsc?: boolean
}

/** 文字提示气泡 Props。 */
export interface TooltipProps extends ComponentSemanticProps<"content" | "arrow"> {
  /** 弹出方向。 */
  side?: "top" | "right" | "bottom" | "left"
  /** 对齐方式。 */
  align?: "center" | "start" | "end"
  /** 距触发器偏移（像素）。 */
  sideOffset?: number
  /** 悬停延迟显示毫秒数。 */
  delayDuration?: number
  /** 受控打开状态。 */
  open?: boolean
  /** 禁用提示气泡。 */
  disabled?: boolean
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 最大宽度（CSS 长度）。 */
  maxWidth?: string
  /** 最大高度（CSS 长度，超出内部滚动）。 */
  maxHeight?: string
}

/** 下拉菜单 Props。 */
export interface DropdownMenuProps extends ComponentSemanticProps<MenuSemanticRegion> {
  /** 菜单项列表。 */
  items: MenuItem[]
  /** 受控打开状态。 */
  open?: boolean
  /** 弹出方向。 */
  side?: "top" | "right" | "bottom" | "left"
  /** 对齐方式。 */
  align?: "start" | "center" | "end"
  /** 距触发器偏移（像素）。 */
  sideOffset?: number
  /** 表面材质。 */
  material?: MaterialName
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 菜单图标尺寸。 */
  iconSize?: IconSize
  /** 菜单密度。 */
  density?: Density
  /** 模态交互模式。 */
  modal?: boolean
  /** 禁用菜单触发。 */
  disabled?: boolean
  /** 点击外部是否关闭。 */
  closeOnClickOutside?: boolean
  /** 按下 ESC 键是否关闭。 */
  closeOnEsc?: boolean
}

/** 右键菜单 Props。 */
export interface ContextMenuProps extends ComponentSemanticProps<MenuSemanticRegion> {
  /** 菜单项列表。 */
  items: MenuItem[]
  /** 受控打开状态。 */
  open?: boolean
  /** 表面材质。 */
  material?: MaterialName
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 菜单图标尺寸。 */
  iconSize?: IconSize
  /** 菜单密度。 */
  density?: Density
  /** 模态交互模式。 */
  modal?: boolean
  /** 禁用右键触发。 */
  disabled?: boolean
  /** 点击外部是否关闭。 */
  closeOnClickOutside?: boolean
  /** 按下 ESC 键是否关闭。 */
  closeOnEsc?: boolean
}

/** 文本截断组件 Props。 */
export interface TruncateTextProps extends ComponentSemanticProps<"root"> {
  /** 展示文本（也可通过 `#default` 插槽传入）。 */
  text?: string
  /** 最大保留行数。 */
  lines?: number
  /** 根元素标签名。 */
  as?: string
  /** 原生 `title` 提示（传 `false` 禁用）。 */
  title?: string | false
  /** 行内展开收起开关。 */
  expandable?: boolean
  /** 展开模式：`inline` 或 `popover`。 */
  expandMode?: "inline" | "popover"
  /** 浮层模式表面材质。 */
  material?: MaterialName
  /** 浮层圆角尺寸。 */
  radius?: Radius | "default"
  /** 展开按钮文案。 */
  expandLabel?: string
  /** 收起按钮文案。 */
  collapseLabel?: string
}

/** Toast 停靠位置。 */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

/** Toast 视觉变体。 */
export type ToastStyleVariant = "accent" | "subtle" | "solid" | "outline" | "pill"

/** Toast 视口容器 Props。 */
export interface ToastViewportProps extends ComponentSemanticProps<
  "viewport" | "toast" | "icon" | "body" | "title" | "description" | "action" | "close"
> {
  /** 默认停靠位置。 */
  position?: ToastPosition
  /** 表面材质。 */
  material?: MaterialName
  /** 默认风格变体。 */
  styleVariant?: ToastStyleVariant
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 最大同时展示数量。 */
  max?: number
}

/** 进度条语义变体。 */
export type ProgressVariant = "primary" | "success" | "warning" | "danger"

/** 进度条 Props。 */
export interface ProgressProps extends ComponentSemanticProps<
  "root" | "track" | "indicator" | "label"
> {
  /** 当前进度值。 */
  modelValue?: number
  /** 最大值。 */
  max?: number
  /** 尺寸。 */
  size?: "sm" | "md" | "lg"
  /** 颜色变体。 */
  variant?: ProgressVariant
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 不确定循环动画模式。 */
  indeterminate?: boolean
  /** 显示百分比数字。 */
  showValue?: boolean
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 单选组选项。 */
export interface RadioGroupOption {
  /** 选项值。 */
  value: string | number
  /** 选项标签。 */
  label: string
  /** 补充描述。 */
  description?: string
  /** 禁用该选项。 */
  disabled?: boolean
}

/** 单选组 Props。 */
export interface RadioGroupProps extends ComponentSemanticProps<
  "root" | "item" | "indicator" | "label" | "description"
> {
  /** 当前选中值。 */
  modelValue?: string | number
  /** 选项列表。 */
  options: Array<string | RadioGroupOption>
  /** 排列方向。 */
  orientation?: "vertical" | "horizontal"
  /** 外观变体：`radio` 原生圆圈或 `button` 按钮分段。 */
  variant?: "radio" | "button"
  /** 控件尺寸。 */
  size?: "sm" | "md" | "lg"
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 按钮变体表面材质。 */
  material?: MaterialName
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 校验错误态。 */
  invalid?: boolean
  /** 表单字段名。 */
  name?: string
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 数字输入框 Props。 */
export interface NumberInputProps extends ComponentSemanticProps<
  "root" | "input" | "decrement" | "increment" | "clear"
> {
  /** 当前数值。 */
  modelValue?: number
  /** 非受控默认值。 */
  defaultValue?: number
  /** 最小值。 */
  min?: number
  /** 最大值。 */
  max?: number
  /** 步进值。 */
  step?: number
  /** 控件尺寸。 */
  size?: ControlSize
  /** 步进图标尺寸。 */
  iconSize?: IconSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 校验错误态。 */
  invalid?: boolean
  /** 显示一键清空按钮。 */
  clearable?: boolean
  /** 占位提示文案。 */
  placeholder?: string
  /** 隐藏加减步进按钮。 */
  hideSteppers?: boolean
  /** 元素 ID。 */
  id?: string
  /** 表单字段名。 */
  name?: string
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 气泡确认框 Props。 */
export interface PopconfirmProps extends ComponentSemanticProps<
  "content" | "body" | "actions" | "cancel" | "confirm" | "arrow"
> {
  /** 受控打开状态。 */
  open?: boolean
  /** 确认标题。 */
  title: string
  /** 确认详情描述。 */
  description?: string
  /** 确认按钮文案。 */
  confirmLabel?: string
  /** 取消按钮文案。 */
  cancelLabel?: string
  /** 危险操作样式。 */
  danger?: boolean
  /** 异步确认加载状态。 */
  loading?: boolean
  /** 禁用触发。 */
  disabled?: boolean
  /** 模态交互模式。 */
  modal?: boolean
  /** 弹出方向。 */
  side?: "top" | "right" | "bottom" | "left"
  /** 对齐方式。 */
  align?: "center" | "start" | "end"
  /** 距触发器偏移（像素）。 */
  sideOffset?: number
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 点击外部是否关闭。 */
  closeOnClickOutside?: boolean
  /** 按下 ESC 键是否关闭。 */
  closeOnEsc?: boolean
}

/** 图片组件 Props。 */
export interface ImageProps extends ComponentSemanticProps<"root" | "img" | "fallback"> {
  /** 图片源地址。 */
  src?: string | null
  /** 加载失败回退地址。 */
  fallbackSrc?: string | null
  /** 替代文本。 */
  alt?: string
  /** 宽度（CSS 长度）。 */
  width?: string
  /** 高度（CSS 长度）。 */
  height?: string
  /** `object-fit` 裁剪模式。 */
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 点击开启灯箱预览。 */
  previewable?: boolean
  /** 像素画锐利渲染模式。 */
  pixelated?: boolean
  /** 原生懒加载。 */
  lazy?: boolean
  /** 图片 Referrer 策略。 */
  referrerPolicy?: "no-referrer" | "origin" | "strict-origin-when-cross-origin" | "unsafe-url"
}

/** 图片预览列表项。 */
export interface ImagePreviewItem {
  /** 大图地址。 */
  src: string
  /** 缩略图地址。 */
  thumb?: string
  /** 图片描述。 */
  alt?: string
}

/** 图片全屏预览灯箱 Props。 */
export interface ImagePreviewProps extends ComponentSemanticProps<
  "overlay" | "content" | "topbar" | "counter" | "actions" | "stage" | "img" | "nav" | "dock"
> {
  /** 受控打开状态。 */
  open?: boolean
  /** 单图模式地址。 */
  src?: string | null
  /** 单图替代文本。 */
  alt?: string
  /** 多图画廊数组。 */
  images?: Array<string | ImagePreviewItem>
  /** 初始打开索引。 */
  initialIndex?: number
  /** 表面材质。 */
  material?: MaterialName
  /** 点击遮罩层是否关闭。 */
  closeOnOverlayClick?: boolean
  /** 按下 ESC 键是否关闭。 */
  closeOnEsc?: boolean
  /** 是否显示关闭按钮。 */
  showClose?: boolean
  /** 关闭按钮无障碍标签。 */
  closeLabel?: string
}

/** 图片组项。 */
export interface ImageGroupItem {
  /** 大图地址。 */
  src?: string
  /** 缩略图地址。 */
  thumb?: string
  /** 替代文本。 */
  alt?: string
}

/** 九宫格图片组 Props。 */
export interface ImageGroupProps extends ComponentSemanticProps<"root" | "item" | "img" | "more"> {
  /** 图片列表。 */
  images?: Array<string | ImageGroupItem>
  /** 最大直接展示张数（超出显示 `+N` 遮罩）。 */
  maxDisplay?: number
  /** 圆角尺寸。 */
  radius?: Radius | "default"
}

/** 分类过滤二级子标签。 */
export interface CategorySubtag {
  /** 子标签键名。 */
  key: string
  /** 展示文案。 */
  label: string
  /** 关联计数。 */
  count?: number | string
  [extra: string]: unknown
}

/** 分类过滤一级分组。 */
export interface CategoryGroupItem {
  /** 分组键名。 */
  key: string
  /** 分组文案。 */
  label: string
  /** 二级子标签数组。 */
  subtags: CategorySubtag[]
  [extra: string]: unknown
}

/** 二级分类过滤器 Props。 */
export interface CategoryFilterProps extends ComponentSemanticProps<
  "root" | "tabs" | "subtags" | "actions"
> {
  /** 一级分组数据。 */
  groups: CategoryGroupItem[]
  /** 当前选中键名。 */
  modelValue?: string
  /** “默认”项显示文案。 */
  defaultLabel?: string
  /** “默认”项键名。 */
  defaultKey?: string
  /** 是否展示“默认”一级页签。 */
  showDefault?: boolean
  /** 控件尺寸。 */
  size?: ControlSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 表面材质。 */
  material?: MaterialName
  /** 一级页签视觉变体。 */
  tabVariant?: TabsVariant
  /** 允许取消子标签选中并回退默认项。 */
  clearable?: boolean
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 页面布局外壳 Props。 */
export interface PageLayoutProps extends ComponentSemanticProps<"root" | "header" | "content"> {
  /** 页面标题。 */
  title: string
  /** 页面描述。 */
  description?: string
  /** 显示返回按钮。 */
  back?: boolean
  /** 头部底部分割线。 */
  divider?: boolean
  /** 布局密度。 */
  density?: Density
  /** 返回按钮图标尺寸。 */
  iconSize?: IconSize
  /** 内容区最大宽度预设或 CSS 长度。 */
  contentMaxWidth?: "sm" | "md" | "lg" | "xl" | string
  /** 内容区水平对齐。 */
  contentAlign?: "start" | "center"
  /** 撑满容器高度（适合内置滚动表格/编辑器）。 */
  fitHeight?: boolean
}

/** 加载遮罩 Props。 */
export interface LoadingOverlayProps extends ComponentSemanticProps<"root" | "card" | "text"> {
  /** 是否展示遮罩。 */
  loading: boolean
  /** 提示文案。 */
  text?: string
  /** 是否全屏固定定位（否则相对于父容器绝对定位）。 */
  fullscreen?: boolean
  /** 指示器尺寸。 */
  size?: IconSize
  /** 圆角尺寸（局部遮罩继承容器圆角）。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 全屏模式下是否锁定页面滚动。 */
  lockScroll?: boolean
}

/** 折叠过渡容器 Props。 */
export interface CollapseProps extends ComponentSemanticProps<"root" | "content"> {
  /** 展开状态。 */
  open: boolean
  /** 禁用状态。 */
  disabled?: boolean
}

/** 颜色选择器预设项。 */
export interface ColorPickerPreset {
  /** 预设唯一键。 */
  key?: string
  /** 预设名称标签。 */
  label?: string
  /** 十六进制色值。 */
  hex: string
}

/** 颜色选择器 Props。 */
export interface ColorPickerProps extends ComponentSemanticProps<
  "root" | "swatch" | "input" | "presets" | "preset" | "clear"
> {
  /** 当前十六进制色值。 */
  modelValue?: string
  /** 预设色板列表。 */
  presets?: Array<string | ColorPickerPreset>
  /** 控件尺寸。 */
  size?: "sm" | "md" | "lg"
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 禁用状态。 */
  disabled?: boolean
  /** 只读状态。 */
  readonly?: boolean
  /** 校验错误态。 */
  invalid?: boolean
  /** 显示一键清空按钮。 */
  clearable?: boolean
  /** 无障碍标签。 */
  ariaLabel?: string
}

/** 列表容器 Props。 */
export interface ListProps extends ComponentSemanticProps<"root"> {
  /** 列表项间距预设。 */
  gap?: "none" | "xs" | "sm" | "md"
  /** 显示外边框。 */
  bordered?: boolean
  /** 显示项间分割线。 */
  dividers?: boolean
  /** 表面材质。 */
  material?: MaterialName
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 列表密度。 */
  density?: Density
}

/** 列表项 Props。 */
export interface ListItemProps extends ComponentSemanticProps<
  "root" | "prefix" | "body" | "title" | "subtitle" | "badges" | "actions"
> {
  /** 主标题。 */
  title?: string
  /** 副标题。 */
  subtitle?: string
  /** 激活态。 */
  active?: boolean
  /** 可点击交互态。 */
  clickable?: boolean
  /** 禁用状态。 */
  disabled?: boolean
  /** 列表项密度。 */
  density?: Density
  /** 表面材质。 */
  material?: MaterialName
  /** 圆角尺寸。 */
  radius?: Radius | "default"
}

/** 帮助提示按钮 Props。 */
export interface HelpTooltipProps extends ComponentSemanticProps<"trigger" | "content" | "arrow"> {
  /** 提示正文内容。 */
  text: string
  /** 触发按钮图标。 */
  icon?: IconProp
  /** 图标尺寸。 */
  iconSize?: IconSize
  /** 受控打开状态。 */
  open?: boolean
  /** 禁用提示气泡。 */
  disabled?: boolean
  /** 弹出方向。 */
  side?: "top" | "right" | "bottom" | "left"
  /** 对齐方式。 */
  align?: "center" | "start" | "end"
  /** 距触发器偏移（像素）。 */
  sideOffset?: number
  /** 悬停延迟毫秒数。 */
  delayDuration?: number
  /** 圆角尺寸。 */
  radius?: Radius | "default"
  /** 表面材质。 */
  material?: MaterialName
  /** 最大宽度（CSS 长度）。 */
  maxWidth?: string
  /** 最大高度（CSS 长度）。 */
  maxHeight?: string
  /** 触发按钮无障碍标签。 */
  ariaLabel?: string
}
