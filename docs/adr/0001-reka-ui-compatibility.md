# ADR-0001: Reka UI 版本兼容与升级策略

- **状态**：Accepted（0.2.0 起生效；0.7.0 扩充至 18 个直接封装组件 / 64 个命名原语）
- **决策主体**：`@xcmm1543/miuui-vue`

## 背景

`@xcmm1543/miuui-vue` 是全仓库唯一声明 `reka-ui` 为 `peerDependencies` 的包。截至 `0.7.0`，18 个组件直接从 `reka-ui` 导入 **64 个去重后无头原语**（另 `ConfirmDialog` 复用了 `Dialog`、`HelpTooltip` 复用了 `Tooltip`）：

| 组件 | 使用的 Reka UI 原语 |
| --- | --- |
| `Checkbox` | `CheckboxRoot`, `CheckboxIndicator` |
| `Switch` | `SwitchRoot`, `SwitchThumb` |
| `Select` | `SelectRoot`, `SelectTrigger`, `SelectValue`, `SelectIcon`, `SelectPortal`, `SelectContent`, `SelectViewport`, `SelectItem`, `SelectItemText`, `SelectItemIndicator` |
| `Dialog`（含 `ConfirmDialog` 封装） | `DialogRoot`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogClose` |
| `Drawer` | `DialogRoot`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `DialogClose` |
| `CommandPalette` | `DialogRoot`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `DialogDescription` |
| `ImagePreview` | `DialogRoot`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle` |
| `Tabs` | `TabsRoot`, `TabsList`, `TabsTrigger`, `TabsContent` |
| `SegmentedControl` | `ToggleGroupRoot`, `ToggleGroupItem` |
| `Popover` | `PopoverRoot`, `PopoverTrigger`, `PopoverPortal`, `PopoverContent`, `PopoverArrow` |
| `Popconfirm` | `PopoverRoot`, `PopoverTrigger`, `PopoverPortal`, `PopoverContent`, `PopoverArrow` |
| `Tooltip`（含 `HelpTooltip` 封装） | `TooltipProvider`, `TooltipRoot`, `TooltipTrigger`, `TooltipPortal`, `TooltipContent`, `TooltipArrow` |
| `DropdownMenu` | `DropdownMenuRoot`, `DropdownMenuTrigger`, `DropdownMenuPortal`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator` |
| `ContextMenu` | `ContextMenuRoot`, `ContextMenuTrigger`, `ContextMenuPortal`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuSeparator` |
| `NumberInput` | `NumberFieldRoot`, `NumberFieldInput`, `NumberFieldIncrement`, `NumberFieldDecrement` |
| `Progress` | `ProgressRoot`, `ProgressIndicator` |
| `RadioGroup` | `RadioGroupRoot`, `RadioGroupItem`, `RadioGroupIndicator` |
| `Slider` | `SliderRoot`, `SliderTrack`, `SliderRange`, `SliderThumb` |

## 决策

1. **`peerDependencies` 锁死 2.x 区间**：`"@xcmm1543/miuui-vue"` 声明 `"reka-ui": ">=2.11.0 <3.0.0"`（兼容 `^2.11.0`，同时阻断尚未定稿的 `3.0.0-alpha.0` 破坏性主版本）。
2. **`vue` 下限锁定**：保持 `"vue": "^3.5.0"`（依赖 `useId()` 与响应式 `props` 析构语义）。
3. **契约矩阵门禁**：通过 `pnpm check:compat`（`scripts/check-reka-compat.mjs`）在每次构建与发布前静态核验：
   - 所有组件从 `"reka-ui"` 导入的具名原语（当前 64 个）100% 存在于当前安装的 `reka-ui` 运行时导出与类型声明中；
   - `packages/vue/package.json` 的 `peerDependencies.reka-ui` 满足已安装版本且排除 `>=3.0.0`；
   - `core` / `tokens` / `icons` / `materials` / `motions` 零 `reka-ui` 依赖；
   - 键盘导航与交互契约（`Tabs` 左右键、`Dialog`/`Drawer` `Escape` 焦点回收与遮罩行为、`Select` 选项高亮/清除、`CommandPalette` 列表键盘导航、`ImagePreview` 左右切图等）纳入自动化单元与视觉回归测试。

## 兼容矩阵

| 维度 | 基线要求 | 当前验证版本 | 状态 |
| --- | --- | --- | --- |
| `vue` | `^3.5.0` | `3.5.45` | 已验证 |
| `reka-ui` 最低目标 | `>=2.11.0` | `2.11.0` | 已验证 |
| `reka-ui` 上限 | `<3.0.0` | `>=3.0.0` 显式排除 | 已隔离 |
| Node.js | `>=20.19.0` / `>=22` | `26.12.1` | 已验证 |

## 升级流程

1. 升级 `reka-ui` Minor 前先运行 `pnpm check:compat && pnpm check && pnpm check:visual`。
2. 跨主版本（如未来迁移 `reka-ui@3.x`）必须单开 Minor/Major 评估全部 18 个直接封装组件的 `data-state`、`v-model` 属性名（`modelValue` vs `open`）与 `Portal` 参数变化，并同步更新本 ADR。
