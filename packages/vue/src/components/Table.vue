<script setup lang="ts">
import { computed, provide, useSlots } from "vue"
import { regionClass, regionStyle } from "@xcmm1543/miuui-core"
import type { TableColumn, TableProps, TableRow } from "../types"
import { useMiuI18n } from "../composables/useMiu"
import Skeleton from "./Skeleton.vue"
import { mergeStyle, useResolvedMaterial } from "../composables/usePluginResolution"
import { MIU_SIZE_HINT_KEY } from "../composables/useSizeHint"

const props = withDefaults(defineProps<TableProps>(), {
  rowKey: "id",
  radius: "default",
  loading: false,
  striped: false,
  bordered: false,
  stickyHeader: false,
})

const slots = useSlots()
const { t } = useMiuI18n()
const { materialName, materialTokens } = useResolvedMaterial(() => props.material, "Table")
provide(
  MIU_SIZE_HINT_KEY,
  computed(() => (props.density === "compact" ? "sm" : undefined)),
)

const hasActions = computed(() => Boolean(slots["row-actions"]))
const columnCount = computed(() => Math.max(1, props.columns.length + (hasActions.value ? 1 : 0)))

function rowKey(row: TableRow, index: number): string | number {
  const value = row[props.rowKey]
  return typeof value === "string" || typeof value === "number" ? value : index
}

function cellValue(row: TableRow, column: TableColumn): unknown {
  return row[column.key]
}

function alignClass(column: TableColumn): string | undefined {
  return column.align ? `miu-table__cell--${column.align}` : undefined
}
</script>

<template>
  <div
    :class="
      regionClass(props, 'root', 'miu-table', {
        'miu-table--striped': striped,
        'miu-table--bordered': bordered,
        'miu-table--sticky': stickyHeader,
      })
    "
    :style="mergeStyle(regionStyle(props, 'root'), materialTokens)"
    :data-density="density"
    :data-miu-radius="radius"
    :data-material="materialName"
    :data-loading="loading || undefined"
    :aria-busy="loading || undefined"
  >
    <table
      :class="regionClass(props, 'table', 'miu-table__table')"
      :style="regionStyle(props, 'table')"
    >
      <caption v-if="loading" class="miu-sr-only">
        {{ t("table.loading") }}
      </caption>
      <thead
        v-if="columns.length > 0 || hasActions"
        :class="regionClass(props, 'header', 'miu-table__header')"
        :style="regionStyle(props, 'header')"
      >
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :style="{ width: column.width }"
            :class="['miu-table__th', alignClass(column)]"
          >
            <slot :name="`header-${column.key}`" :column="column">
              {{ column.label }}
            </slot>
          </th>
          <th v-if="hasActions" scope="col" class="miu-table__th miu-table__th--actions">
            <span class="miu-sr-only">{{ t("table.actions") }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="loading">
          <tr v-for="row in 3" :key="`skeleton-${row}`" class="miu-table__row">
            <td :colspan="columnCount" class="miu-table__cell">
              <Skeleton height="var(--miu-control-sm-height)" />
            </td>
          </tr>
        </template>
        <tr v-else-if="rows.length === 0" class="miu-table__row">
          <td
            :colspan="columnCount"
            :class="regionClass(props, 'empty', 'miu-table__cell', 'miu-table__empty')"
            :style="regionStyle(props, 'empty')"
          >
            <slot name="empty">{{ emptyText ?? t("table.empty") }}</slot>
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="(row, index) in rows"
            :key="rowKey(row, index)"
            :class="regionClass(props, 'row', 'miu-table__row')"
            :style="regionStyle(props, 'row')"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="[regionClass(props, 'cell', 'miu-table__cell'), alignClass(column)]"
              :style="regionStyle(props, 'cell')"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="cellValue(row, column)"
                :column="column"
                :index="index"
              >
                {{ cellValue(row, column) }}
              </slot>
            </td>
            <td
              v-if="hasActions"
              :class="regionClass(props, 'cell', 'miu-table__cell', 'miu-table__cell--actions')"
              :style="regionStyle(props, 'cell')"
            >
              <slot name="row-actions" :row="row" :index="index" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
