# ADR-0001: Reka UI 版本兼容与升级策略

- **状态**：Accepted（0.2.0）
- **决策主体**：`@miuui/vue`

## 背景

`@miuui/vue` 是全仓库唯一声明 `reka-ui` 为 `peerDependencies` 的包，12 个无障碍与浮层组件直接基于 Reka UI 无头原语构建：

| 组件 | 使用的 Reka UI 原语 |
| --- | --- |
| `Checkbox` | `CheckboxRoot`, `CheckboxIndicator` |
| `Switch` | `SwitchRoot`, `SwitchThumb` |
| `Select` | `SelectRoot`, `SelectTrigger`, `SelectValue`, `SelectIcon`, `SelectPortal`, `SelectContent`, `SelectViewport`, `SelectItem`, `SelectItemText`, `SelectItemIndicator` |
| `Dialog` / `ConfirmDialog` | `DialogRoot`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogClose` |
| `Drawer` / `CommandPalette` | `DialogRoot`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `DialogDescription` |
| `Tabs` | `TabsRoot`, `TabsList`, `TabsTrigger`, `TabsContent` |
| `SegmentedControl` | `ToggleGroupRoot`, `ToggleGroupItem` |
| `Popover` | `PopoverRoot`, `PopoverTrigger`, `PopoverPortal`, `PopoverContent`, `PopoverArrow` |
| `Tooltip` | `TooltipProvider`, `TooltipRoot`, `TooltipTrigger`, `TooltipPortal`, `TooltipContent`, `TooltipArrow` |
| `DropdownMenu` | `DropdownMenuRoot`, `DropdownMenuTrigger`, `DropdownMenuPortal`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator` |
| `ContextMenu` | `ContextMenuRoot`, `ContextMenuTrigger`, `ContextMenuPortal`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuSeparator` |

## 决策

1. **`peerDependencies` 锁死 2.x 区间**：`"@miuui/vue"` 声明 `"reka-ui": ">=2.11.0 <3.0.0"`（兼容 `^2.11.0`，同时阻断尚未定稿的 `3.0.0-alpha.0` 破坏性主版本）。
2. **`vue` 下限锁定**：保持 `"vue": "^3.5.0"`（依赖 `useId()` 与响应式 `props` 析构语义）。
3. **契约矩阵门禁**：新增 `pnpm check:compat`（`scripts/check-reka-compat.mjs`），在每次构建与发布前静态核验：
   - 所有组件从 `"reka-ui"` 导入的具名原语 100% 存在于当前安装的 `reka-ui` 运行时导出与类型声明中；
   - `packages/vue/package.json` 的 `peerDependencies.reka-ui` 满足已安装版本且排除 `>=3.0.0`；
   - `core` / `tokens` / `icons` / `materials` / `motions` 零 `reka-ui` 依赖；
   - 已确认的键盘导航（`Tabs` 左右键、`Dialog`/`Drawer` `Escape` 焦点回收、`Select` 选项高亮与选择、`CommandPalette` 列表键盘导航）全部由自动化测试覆盖。

## 兼容矩阵

| 维度 | 基线要求 | 当前验证版本 | 状态 |
| --- | --- | --- | --- |
| `vue` | `^3.5.0` | `3.5.45` | 已验证 |
| `reka-ui` 最低目标 | `>=2.11.0` | `2.11.0` | 已验证 |
| `reka-ui` 上限 | `<3.0.0` | `3.0.0-alpha.0`（明确排除） | 已隔离 |
| Node.js | `>=20.19.0` / `>=22` | `26.12.1` | 已验证 |

## 升级流程

1. 升级 `reka-ui` Minor 前先运行 `pnpm check:compat && pnpm check && pnpm check:visual`。
2. 跨主版本（如未来迁移 `reka-ui@3.x`）必须单开 Minor/Major 评估所有 12 个封装组件的 `data-state`、`v-model` 属性名（`modelValue` vs `open`）与 `Portal` 参数变化，并同步更新本 ADR。
