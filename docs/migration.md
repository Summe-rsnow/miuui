# μui 0.6.x → 0.7.0 迁移指南

本文档覆盖从 `@xcmm1543/miuui-*@0.6.x` 升级到 **`0.7.0`** 的全部破坏性 API 清理、行为调整、语义区域/类型收口，以及内部未公开导出清理。

> **破坏性清理说明**：在 `0.7.0` 中，全部 11 个历史冗余 Props、`ListItem` `#suffix` 插槽以及独立工具包 `@xcmm1543/miuui-codemod`（`packages/codemod`）已**直接移除**，不再保留运行时兼容垫片；全库收敛为 6 个发布包（`core`、`tokens`、`icons`、`materials`、`motions`、`vue`）。

---

## 1. 直接移除的旧版 Props、插槽与替换对照表

升级至 `0.7.0` 时，请按以下对照表直接替换为正交统一 API：

| 组件 | 已移除 API（0.7.0 移除） | 替换为（0.7.0 规范 API） | 说明 |
| --- | --- | --- | --- |
| `Icon` | `icon?: IconDefinition` | `name: IconProp` | `name` 为必填属性，同时支持内置图标名与 `IconDefinition` 对象 |
| `Button` | `pill?: boolean` | `radius="full"` | 来自 `ButtonBaseProps`；统一由 `radius` 控制圆角 |
| `IconButton` | `shape?: "circle" \| "squircle"` | `radius="full"` / `radius` | 同步从 `IconButtonProps` 的 `Omit` 中移除已删除的 `"pill"` |
| `Badge` | `pill?: boolean` | `radius="full"` | 统一由 `[data-miu-radius="full"]` 驱动胶囊圆角 |
| `SegmentedControl` | `pill?: boolean` | `radius="full"` | 统一滑块轨道与选项圆角维度 |
| `FormRow` | `dense?: boolean` | `density="compact"` | 统一密度维度并移除 `.miu-form-row--dense` 样式类 |
| `ListItem` | `dense?: boolean` | `density="compact"` | 也支持由父级 `<List density="compact">` 透传；移除 `.miu-list-item--dense` |
| `ListItem` | `#suffix` 插槽 | `#actions` 插槽 | 与 `PageHeader` / `CategoryFilter` 操作插槽对齐 |
| `MessageComposer` | `compact?: boolean` | `density="compact"` | 统一紧凑密度维度 |
| `HelpTooltip` | `size?: "xs" \| "sm" \| "md"` | `iconSize?: IconSize` | 图标触发器尺寸从控件 `size` 维度解耦 |
| `CategoryFilter` | `allowDeselect?: boolean` | `clearable?: boolean` | 统一可清除属性命名；清除时额外触发 `@clear` |
| `Image` | `cover?: boolean` | `fit="cover"` + 显式宽高 | 通过 `fit` 统一控制 `object-fit` |

### 前后对照示例（可直接复制替换）

```vue
<!-- 1. Icon：icon -> name -->
<!-- 迁移前 -->
<Icon :icon="MyCustomIcon" />
<!-- 迁移后 -->
<Icon :name="MyCustomIcon" />

<!-- 2. Button / Badge / SegmentedControl：pill -> radius="full" -->
<!-- 迁移前 -->
<Button pill>提交</Button>
<Badge pill variant="primary">New</Badge>
<SegmentedControl pill v-model="tab" :options="options" />
<!-- 迁移后 -->
<Button radius="full">提交</Button>
<Badge radius="full" variant="primary">New</Badge>
<SegmentedControl radius="full" v-model="tab" :options="options" />

<!-- 3. IconButton：shape -> radius -->
<!-- 迁移前 -->
<IconButton shape="circle" icon="close" aria-label="关闭" />
<IconButton shape="squircle" icon="settings" aria-label="设置" />
<!-- 迁移后 -->
<IconButton radius="full" icon="close" aria-label="关闭" />
<IconButton radius="lg" icon="settings" aria-label="设置" />

<!-- 4. FormRow / ListItem / MessageComposer：dense/compact -> density="compact" -->
<!-- 迁移前 -->
<FormRow dense label="名称"><Input v-model="name" /></FormRow>
<ListItem dense title="记录">
  <template #suffix><Button size="sm">操作</Button></template>
</ListItem>
<MessageComposer compact v-model="draft" />
<!-- 迁移后 -->
<FormRow density="compact" label="名称"><Input v-model="name" /></FormRow>
<ListItem density="compact" title="记录">
  <template #actions><Button size="sm">操作</Button></template>
</ListItem>
<MessageComposer density="compact" v-model="draft" />

<!-- 5. HelpTooltip / CategoryFilter / Image -->
<!-- 迁移前 -->
<HelpTooltip size="md" text="说明文案" />
<CategoryFilter :groups="groups" v-model="cat" :allow-deselect="false" />
<Image src="/cover.jpg" cover width="100%" height="180px" />
<!-- 迁移后 -->
<HelpTooltip icon-size="md" text="说明文案" />
<CategoryFilter :groups="groups" v-model="cat" :clearable="false" />
<Image src="/cover.jpg" fit="cover" width="100%" height="180px" />
```

---

## 2. 0.7.0 行为与类型收口变更

升级前请重点检查以下行为差异（均已在 `0.7.0` 全量单测中锁定）：

### 2.1 确认浮层（`ConfirmDialog` / `Popconfirm` / `useConfirm`）加载锁定与 `@cancel` 语义

- **行为变化**：在 `loading=true` 异步提交阶段，点击遮罩层、外部区域、右上角关闭按钮或按下 `Escape` **不会**再关闭弹窗（不再静默丢失用户正在等待的提交）；通过外部/ESC/关闭按钮取消时，明确触发 `cancel` 事件。
- **全局确认框**：`ThemeProvider` 内置的 `useConfirm()` 已同步接入 `loading` 状态，当 `onConfirm` 返回 `Promise` 时自动进入 `loading=true` 并锁定关闭直到完成。

### 2.2 `MessageComposer` 异步加载时允许 Cancel

- **行为变化**：`loading=true` 时保持「取消 / 中止」按钮（当 `:show-cancel="true"`）处于可点击状态，触发 `@cancel` 以便用户中止流式生成，同时仍锁定发送提交与回车发送。

### 2.3 `Drawer`、`CommandPalette`、`IconButton` 与 `CategoryFilter` 的 `SemanticRegion` / Props 校准

- **`Drawer` & `CommandPalette`**：类型中移除了未绑定在模板上的 `"root"` 语义区域（因 Reka `DialogContent` 直接以 Portal 渲染主面板），请将 `classNames.root` / `styles.root` 改为 `classNames.content` / `styles.content`。
- **`IconButton`**：`IconButtonProps` 显式省略了无效继承字段 `iconRight`，语义区域类型收口为 `"root" | "icon" | "spinner"`。
- **`Input` / `Textarea` / `Select`**：`InputSemanticRegion` 补全 `"toggle"` 与 `"count"`；`TextareaSemanticRegion` 新增 `"count"` 与 `"clear"`；`SelectSemanticRegion` 新增 `"clear"`。
- **`Popconfirm`**：新增 `"arrow"` 区域以及 `disabled`、`modal`、`closeOnClickOutside`、`closeOnEsc`。
- **`Popover`**：补全 `disabled?: boolean`；禁用时不会打开浮层。
- **`CategoryFilter`**：`size` 默认不再覆盖外层尺寸提示，接入 `useControlSize()`（支持 `MIU_SIZE_HINT_KEY` 继承，回退 `"md"`），并导出 `"actions"` 语义区域。

### 2.4 `FormField`、`Collapse` 与空列表无障碍守卫

- **`FormField` & `useFormFieldBinding()`**：`MiuFormFieldContext` 新增 `labelId`，`describedBy` 自动组合 `descriptionId` 与 `errorId`；`Input`、`Textarea`、`Select`、`Checkbox`、`RadioGroup`、`Switch`、`NumberInput`、`Slider`、`ColorPicker`、`MessageComposer` 现统一继承 `id`、`describedBy`、`invalid`、`disabled`、`readonly`。
- **`Collapse`**：关闭态绑定 `inert` 与 `aria-hidden="true"`，键盘 `Tab` 不再落入收起容器中的隐藏交互元素。
- **空导航守卫**：`Breadcrumb` 与 `Toc` 在 `items.length === 0` 时、`NavMenu` 在所有分组均为空（`visibleGroups.length === 0`）时不渲染空 `<nav>` 节点，避免屏幕阅读器报出空地标。
- **i18n 与输入法组合保护**：`Input` 与 `MessageComposer` 在 `isComposing` 阶段抑制 `Enter` 触发；新增内置翻译键 `common.select`、`truncate.expand`、`truncate.collapse`、`pillGroup.all`。

### 2.5 移除未使用的内部包导出与独立包

- 以下内部符号未曾作为稳定公开 API 文档化，已在 `0.7.0` 清理（如宿主代码意外直接依赖，请按对应替换调整）：

| 包 | 移除内容 | 替代方案 |
| --- | --- | --- |
| `@xcmm1543/miuui-core` | `SemanticRegionMap`、`SizeContext` | 使用 `ComponentSemanticProps<Region>` 与 `ControlSize` |
| `@xcmm1543/miuui-tokens` | `withAlpha`、`CONTROL_HEIGHT_BY_DENSITY`、`shadowToCss` | 使用 CSS `color-mix()` / `--miu-height-*` / `shadowTokens` |
| `@xcmm1543/miuui-materials` | `tokensFor` | 使用 `solidMaterial` / `micaMaterial` / `glassMaterial` 与 `materialPlugins` |
| `@xcmm1543/miuui-codemod` | 整包移除 | 按第 1 节对照表直接升级至 0.7.0 规范 API |
