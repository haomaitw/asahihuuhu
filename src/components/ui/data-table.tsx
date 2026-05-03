'use client'
import * as React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from './checkbox'
import { SkeletonTable } from './skeleton'
import { EmptyState } from './empty-state'

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  loading?: boolean
  onRowClick?: (row: TData) => void
  enableRowSelection?: boolean
  onSelectionChange?: (rows: TData[]) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: { label: string; onClick: () => void }
}

export function DataTable<TData>({
  columns,
  data,
  loading,
  onRowClick,
  enableRowSelection,
  onSelectionChange,
  emptyTitle = '沒有資料',
  emptyDescription,
  emptyAction,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState({})

  const allColumns = React.useMemo<ColumnDef<TData>[]>(() => {
    if (!enableRowSelection) return columns
    return [
      {
        id: '__select__',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="全選"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="選擇"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        size: 44,
      },
      ...columns,
    ]
  }, [columns, enableRowSelection])

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection,
  })

  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(table.getSelectedRowModel().rows.map(r => r.original))
    }
  }, [rowSelection, table, onSelectionChange])

  if (loading) return <SkeletonTable />

  return (
    <div className="rounded-adm-xl border border-adm-border-subtle overflow-hidden bg-adm-bg-elevated">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="bg-adm-bg-base border-b border-adm-border-subtle">
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        className={cn(
                          'flex items-center gap-1 text-2xs uppercase tracking-wider font-medium text-adm-text-tertiary',
                          header.column.getCanSort() && 'cursor-pointer hover:text-adm-text-secondary transition-colors duration-150'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!header.column.getCanSort()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          header.column.getIsSorted() === 'asc' ? <ChevronUp className="h-3 w-3" /> :
                          header.column.getIsSorted() === 'desc' ? <ChevronDown className="h-3 w-3" /> :
                          <ChevronsUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
                </td>
              </tr>
            ) : table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  'border-b border-adm-border-subtle transition-colors duration-150',
                  'hover:bg-adm-brand-50/40',
                  row.getIsSelected() && 'bg-adm-brand-50 relative after:absolute after:inset-y-0 after:left-0 after:w-0.5 after:bg-adm-brand-500',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-adm-text-primary">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
