# μui 0.7.0 组件与基础设施设计规范（Design Rules）

- **状态**：Normative（`0.7.0` 正式基线；已通过全部 10 项 `pnpm check` 门禁与 18 个测试文件 / 195 项单测验证）
- **适用范围**：`@xcmm1543/miuui-tokens`、`@xcmm1543/miuui-core`、`@xcmm1543/miuui-materials`、`@xcmm1543/miuui-motions`、`@xcmm1543/miuui-icons`、`@xcmm1543/miuui-vue`

---

## 1. 通用 Props 契约与正交维度

所有 `@xcmm1543/miuui-vue` 组件必须严格遵守正交设计维度，禁止在不同组件中使用同义异名属性：

| Prop | 类型 | 默认值 / 继承规则 | 规范说明 |
| --- | --- | --- | --- |
| `size` | `ControlSize`（或受限子集如 `"sm" \| "md" \| "lg"`） | 不设硬编码默认（或通过 `useControlSize` 优先 `props.size ?? sizeHint ?? "md"`） | 必须使用 `useControlSize()` 解析并输出 `:data-miu-size="resolvedSize.size"` 与 DEV 回退警告；容器（`FormField`、`Table`、`List` 等）通过 `MIU_SIZE_HINT_KEY` 提供尺寸建议。 |
| `iconSize` | `IconSize`（`Button` / `IconButton` 支持 `IconSize \| number`） | 由 `resolveIconSize(size, props.iconSize)` 派生 | 禁止把 `size` 用于图标尺寸（`HelpTooltip.size` 已在 `0.7.0` 直接移除，统一用 `iconSize`）。根节点绑定 `:data-miu-icon-size`；`IconButton` 支持 `size?: ControlSize \| number`，其余尺寸仍由正交 token 驱动。 |
| `radius` | `Radius \| "default"` | `"default"`（或组件特定语义默认如 `"lg"`/`"full"`/`"sm"`） | 根节点（或浮层内容节点）绑定 `:data-miu-radius="radius"`，CSS 仅消费 `var(--miu-radius-current)`。禁止使用 `pill` 或 `shape` 替代 `radius="full"`（`IconButton.shape`、`ButtonBase.pill`、`Badge.pill`、`SegmentedControl.pill` 已在 `0.7.0` 直接移除）。 |
| `material` | `MaterialName` | `undefined`（继承 `ThemeProvider`） | 凡声明 `material` 的组件必须调用 `useResolvedMaterial(() => props.material, "<ComponentName>")`，同时绑定 `:data-material="materialName"` 与 `:style="mergeStyle(regionStyle(...), materialTokens)"`。 |
| `density` | `Density`（`"compact" \| "default" \| "comfortable"`） | `undefined`（继承 `ThemeProvider` / `List`） | 统一使用 `density` 绑定 `:data-density="density"`；禁止使用 `dense` 或 `compact` 布尔属性（`FormRow.dense`、`ListItem.dense`、`MessageComposer.compact` 已在 `0.7.0` 直接移除）。`List` 通过 `useListContext.ts`（`provideListDensity` / `useListDensity`，注入键 `MIU_LIST_DENSITY_KEY`）向子 `ListItem` 透传密度。 |
| `disabled` | `boolean` | `false`（表单控件合并 `formField?.disabled`） | 统一输出 `:disabled` / `:aria-disabled` / `:data-disabled="disabled \|\| undefined"`；浮层触发型组件（含 `Popover`、`Popconfirm`）须在 `disabled=true` 时阻断打开，保持可达性与对比度。 |
| `readonly` | `boolean` | `false`（表单控件合并 `formField?.readonly`） | 区分于 `disabled`：保持可聚焦与文本可选中，禁止修改值或展示清除/拖拽调整句柄，输出 `:readonly` / `:aria-readonly` / `:data-readonly`。 |
| `invalid` | `boolean` | `false`（表单控件合并 `formField?.invalid`） | 统一输出 `:aria-invalid="invalid \|\| undefined"` 与 `:data-invalid="invalid \|\| undefined"`，边框统一使用 `var(--miu-color-danger)`。 |
| `loading` | `boolean` | `false` | 异步期间设置 `:aria-busy="loading \|\| undefined"`，阻止重复提交并展示 `<Spinner>` 或骨架状态；确认类浮层（`ConfirmDialog`、`Popconfirm`、`ThemeProvider` 内置 `useConfirm()` 全局确认框）在 `loading=true` 时不得静默关闭。 |
| `clearable` | `boolean` | `false` | 替换各组件私有别名（`CategoryFilter.allowDeselect` 已在 `0.7.0` 直接移除）；`Textarea` 与 `Select` 均提供 `"clear"` 语义区域，清除时重置值、触发 `update:modelValue` + `change` + `clear` 并恢复焦点。 |
| `icon`（及选项图标） | `IconProp`（`IconName \| IconDefinition`） | — | 所有接收图标名的 Props 及选项接口（`SelectOption`、`MenuItem`、`BadgeProps`、`PillProps`、`CommandItem`、`AlertProps`、`HelpTooltipProps`、`CategoryGroupItem` 等）统一放宽为 `IconProp`；`Icon.icon` 已在 `0.7.0` 直接移除（`name: IconProp` 必填）。 |
| `ariaLabel` | `string` | `undefined` | 统一使用 `ariaLabel?: string`（`IconButton` 同时兼容 `label`、`ariaLabel` 与 `aria-label`）；透传到实际可交互 DOM 控件。 |

---

## 2. 事件、插槽与 `defineExpose` 规范

1. **受控绑定与事件**：
   - 表单与选择控件统一使用 `modelValue` / `update:modelValue`；浮层与展开类控件统一使用 `open` / `update:open`（不混用 `loading` 或 `modelValue` 作为开关状态）。
   - 值变更类表单控件统一同时触发 `update:modelValue` 与 `change`；可清除控件在清空时额外触发 `clear`。
   - 原生焦点事件封装组件（根元素为包装 `<div>` 时）通过内部控件显式转发 `focus` / `blur` 事件，或设置 `inheritAttrs: false` 绑定到核心控件。
   - 键盘 `Enter` 提交事件（如 `Input`、`MessageComposer`）**必须**检查 `!event.isComposing`，避免中文/日文输入法组词阶段误触发。
2. **插槽命名**：
   - 主体内容用 `#default`；触发器统一 `#trigger`；标签/标题/描述/页脚统一 `#label` / `#title` / `#description` / `#footer`；操作区统一 `#actions`（废弃 `#suffix` 等重复命名）；前置/后置装饰用 `#prefix` / `#suffix` 或 `#lead`。
3. **`defineExpose`**：
   - 所有可聚焦表单与按钮组件统一暴露 `{ focus, blur, <elementRef> }`（如 `Input`、`Textarea`、`Button` 等），便于表单校验失败聚焦与无障碍焦点管理。

---

## 3. 语义区域（`ComponentSemanticProps`）规范

- 57/59 个样式化组件 Props 必须从 `@xcmm1543/miuui-core` 继承 `ComponentSemanticProps<Region>`，并在 `packages/vue/src/types.ts` 中显式导出对应的 `*Props`（含不带子区域映射的 `IconProps`、`ThemeProviderProps`）与 `*SemanticRegion`。
- **严格 1:1 契约**：`types.ts` 中声明的每一个 `Region` 必须在对应 `.vue` 模板中同时绑定 `regionClass(props, region, ...)` 与 `regionStyle(props, region)`（若委托子组件如 `ConfirmDialog -> Dialog`、`HelpTooltip -> Tooltip`，须显式透传 `classNames`/`styles`）；模板中禁止出现未在 `types.ts` 中声明的孤立语义区域。
- `Drawer` 与 `CommandPalette` 因 Reka `DialogContent` 直接作为独立 Portal 根节点，显式省略 `"root"` 区域，以 `"content"` 作为主面板语义区域；`IconButtonSemanticRegion` 为 `"root" | "icon" | "spinner"`。
- 根容器材质/样式合并统一使用 `mergeStyle(regionStyle(props, 'root'), materialTokens)`（或 `StyleValue` 数组），禁止手写字符串/对象拼接。

---

## 4. 设计令牌、CSS 逻辑属性与交互状态

1. **零硬编码门禁（`scripts/check-hardcoded.mjs`）**：
   - `packages/vue/src/`、`packages/materials/src/`、`packages/motions/src/` 下所有 `.vue` 与 `.css` 文件（**包括注释**）严禁出现颜色字面量（`#hex`、`rgb()`、`hsl()`、`oklch()`）、`px` 数值、`ms`/`s` 时长、`z-index: <number>` 以及物理方向盒属性（`margin-top/bottom/left/right`、`padding-*`、`border-*`）。
   - 样式必须全部通过 `var(--miu-*)` 令牌与 CSS 逻辑属性（`margin-inline` / `padding-block` / `inset-inline-start` / `border-block-end`）表达。
2. **样式模块化（`packages/vue/src/styles/*.css`）**：
   - `packages/vue/src/components.css` 作为 `@import "./styles/*.css";` 清单入口；构建脚本 `scripts/build-packages.mjs` 按顺序解析并内联打包为单文件 `dist/components.css`，外部包导入路径 `@xcmm1543/miuui-vue/style.css` 与 `@xcmm1543/miuui-vue/components.css` 保持不变。
   - 严禁在同一或不同文件中重复声明相同选择器；组件样式必须内聚在对应域样式文件中。
3. **统一交互状态**：
   - `:focus-visible`：所有可聚焦交互元素（含可点击 `Avatar`、可预览 `Image`、缩略图按钮、Toast 动作按钮等）统一使用 `var(--miu-focus-ring-width) solid var(--miu-color-focus-ring)` 与 `var(--miu-focus-ring-offset)`（输入容器采用 `:focus-within` 阴影环，禁止普通输入框同时使用裸 `:focus` 覆盖键盘策略）。
   - `[data-disabled]` / `:disabled`：统一使用 `opacity: var(--miu-opacity-disabled)` 与 `cursor: not-allowed`。
   - `[data-readonly]` / `:read-only`：提供明确的只读视觉态（如微弱背景/光标区分，不产生误导性 `:hover` 边框高亮或可点击反馈）。
   - `[data-invalid]` / `.miu-*--invalid`：统一使用 `var(--miu-color-danger)` 边框与危险语义高亮，且优先级/选择器的 `:hover` 不得覆盖校验错误红框。
4. **材质与动画层（`@layer` 契约）**：
   - CSS 层顺序固定为：`@layer miu-reset, miu-tokens, miu-base, miu-material, miu-motion, miu-override;`。
   - `packages/materials/src/style.css`：各材质仅声明自身 `--miu-material-*` 语义映射，不得污染全局 `--miu-glass-*` 基础令牌，确保 `<ThemeProvider material="solid">` 内的局部 `material="glass"`/`"mica"` 子组件正常生效；同时匹配同元素 `[data-motion-tier][data-material]` 与祖先后代选择器。
   - `packages/motions/src/style.css`：`reduced` / `none` 与 `@media (prefers-reduced-motion: reduce)` 必须覆盖全部含循环或入场动画的选择器。

---

## 5. `FormField` 上下文与校验、清除、聚焦策略

- `MIU_FORM_FIELD_KEY`（`MiuFormFieldContext`）提供 `{ id, labelId, describedBy, invalid, required, disabled, readonly }` 七个响应式计算属性（其中 `labelId` 由 `FormField` 为 `<label>` 生成，`describedBy` 自动组合 `descriptionId` 与 `errorId`）。
- 所有表单输入与选择控件（`Input`、`Textarea`、`Select`、`Checkbox`、`RadioGroup`、`Switch`、`NumberInput`、`Slider`、`ColorPicker`、`MessageComposer`）应通过 `useFormFieldBinding()` 消费完整上下文：
  - 优先采用 `props.id ?? formField?.id.value ?? autoId` 绑定标签与控件，并在分组控件（如 `RadioGroup`）上关联 `aria-labelledby`。
  - `aria-describedby` 关联提示/描述/错误文本；`invalid` 同时驱动 `aria-invalid` 与错误样式。
  - `disabled`、`readonly` 与 `invalid` 均由组件自身 prop 与 `formField` 状态取逻辑或（`options.x?.() || formField?.x.value || false`）。
- 清除按钮（`clearable`）点击后重置为空值、触发 `update:modelValue` + `change` + `clear`，并将焦点归还给核心输入控件。

---

## 6. 浮层（Overlay）与层级（`Z_INDEX`）规范

- **Portal 目标**：所有传送浮层默认挂载到 `theme.portalTarget.value ?? 'body'`；非 Reka `<Teleport>` 浮层（如 `ToastViewport`、`LoadingOverlay`）必须配合 `useMounted()` 守卫，确保 SSR 首屏水合无错配，且 `ToastViewport` 通过 `isPrimaryToastViewport` 避免多视图重复渲染同一列表。
- **层级秩序（`Z_INDEX`）**：
  - `sticky (1020)` < `modalBackdrop (1040)` < `modal (1050)` < `dropdown (1060)` = `popover (1060)` < `tooltip (1070)` < `loading (1075)` < `toast (1080)`。
  - 确保模态对话框（`Dialog` / `Drawer`）内部的 `Select`、`DropdownMenu`、`ContextMenu`、`Popover` 与 `Tooltip` 始终位于模态框上方，而全屏 `LoadingOverlay` 盖住模态框且不遮挡系统级 `Toast`。局部容器级 `LoadingOverlay` 使用局部层级，不抢占全局模态层级。
- **关闭与焦点策略**：
  - 模态/确认浮层统一提供 `open` / `update:open`、`modal`、`closeOnOverlayClick`（或非模态 `closeOnClickOutside`）、`closeOnEsc`、`showClose`、`closeLabel`、`lockScroll`。
  - 确认类浮层（`ConfirmDialog`、`Popconfirm` 及 `ThemeProvider` 内置 `useConfirm()` 全局确认对话框）在 `loading=true` 异步提交阶段阻止外部点击、ESC 与关闭按钮静默退出；外部/ESC/关闭按钮取消统一触发 `cancel` 事件以区分确认与取消语义。
  - 全部浮层入退场统一绑定 `[data-state="open" | "closed"]` 与 `--miu-motion-*` 令牌。

---

## 7. 边界场景规范

- **空数据**：`Table` / `Select` / `CommandPalette` / `List` / `ImagePreview` 在空列表时渲染可访问的本地化空状态或安全占位，不出现 `colspan="0"`、空 `<nav>` 噪音或重复 `key` 碰撞。
- **长文本溢出**：标题与操作按钮并排容器（`PageHeader`、`ListItem`、`Card`）必须给文本容器设置 `flex: 1; min-inline-size: 0` 与 `overflow-wrap: anywhere` 或单行省略；多按钮操作列禁止被标题挤出视口。
- **异步加载**：`Button`、`ConfirmDialog`、`Popconfirm`、`Pagination`、`Table`、`MessageComposer` 在 `loading=true` 时需锁定重复触发、保留合理取消/中止路径（如 `MessageComposer` 的 Cancel 按钮），并保证 `Spinner` 在 `solid`/`danger` 背景上的对比度（使用 `currentColor`）。
- **无障碍与禁用**：禁用链接禁用点击同时必须绑定 `aria-disabled="true"` 与 `tabindex="-1"`；折叠/隐藏区域（`Collapse`）在关闭态必须配合 `inert`（或等效隐藏）防止键盘焦点落入不可见元素。

---

## 8. Tree-Shaking、API 清理策略与 CI 门禁

1. **Tree-Shaking 与包体积红线**：
   - `packages/vue/package.json` 保持 `"sideEffects": ["*.css"]` 与 `preserveModules: true`。
   - 共享 Composables 按职责拆分为独立单文件（`useControlSize.ts`、`useFormField.ts`、`useListContext.ts`、`useSlidingIndicator.ts`、`useMounted.ts`、`useScrollLock.ts`、`useDocumentKeydown.ts`、`useFloatingPopover.ts`、`useMiuIcons.ts` 等），禁止在基础控件（如 `Button`、`Icon`）的依赖链上引入 `reka-ui` 或在模块顶层静态实例化 `createMiuI18n()`（防止将完整词典打包进单组件产物）。
   - `scripts/check-bundle-size.mjs`：`Button` 单组件 gzip 体积必须严格 `<= 25 KB`（实测 9,709 B gzip / 32,637 B raw，且不含 `miu-table`、`miu-dialog`、`miu-command-palette`、`miu-select__trigger`），`PlusIcon` 单图标 gzip `<= 2 KB`（实测 135 B gzip / 127 B raw）。
2. **零冗余别名原则**：
   - `0.7.0` 已直接移除全部 11 个历史冗余 Props、`ListItem` `#suffix` 插槽及 `packages/codemod`，`packages/vue/src/types.ts` 中不保留同义异名属性或遗留兼容垫片。
   - 新增或演进组件 API 必须严格遵循第 1 节正交维度，拒绝引入重复别名 Props。
3. **CI 门禁清单**：
   - 提交与发布前必须通过根仓库 `pnpm check` 全部 10 项门禁：`tokens:build` -> `tokens:validate` -> `check:compat`（18 组件 / 64 原语）-> `lint` -> `lint:hardcoded` -> `format:check` -> `typecheck` -> `build` -> `check:size` -> `test`。
