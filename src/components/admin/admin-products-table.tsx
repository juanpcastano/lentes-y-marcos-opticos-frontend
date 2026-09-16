import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  Check,
  ChevronDown,
  LoaderCircle,
  MoreHorizontal,
  Search,
  Settings2,
  X,
} from "lucide-react"
import * as TanStackTable from "@tanstack/react-table"
import { useLegacyTable } from "@tanstack/react-table/legacy"
import type {
  LegacyColumnDef,
  LegacyReactTable,
} from "@tanstack/react-table/legacy"
import { Link } from "@tanstack/react-router"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog"
import { Button } from "#/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#/components/ui/collapsible"
import { Checkbox } from "#/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import { Input } from "#/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "#/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table"
import type { AdminProduct, PageResponse } from "#/services/admin"
import type { AdminProductsSearch } from "#/components/admin/admin-products-search"

export interface AdminProductsFilters {
  q: string
  active: "true" | "false" | undefined
}

export interface AdminProductsSort {
  field: "name" | "brand" | "basePrice" | "isActive" | "createdAt" | "updatedAt"
  direction: "asc" | "desc"
}

interface AdminProductsTableProps {
  data: PageResponse<AdminProduct> | undefined
  isPending: boolean
  isPlaceholderData: boolean
  filters: AdminProductsFilters
  onFiltersChange: (filters: AdminProductsFilters) => void
  sort:
    | `${AdminProductsSort["field"]},${AdminProductsSort["direction"]}`
    | undefined
  onSortChange: (sort: AdminProductsSort | undefined) => void
  page: number
  isUpdating: boolean
  onPageChange: (page: number) => void
  onActivate: (ids: string[]) => void
  onDeactivate: (ids: string[]) => void
  onDelete: (ids: string[]) => void
  isDeleting: boolean
  returnSearch: AdminProductsSearch
  filtersContent: ReactNode
}

const COLUMN_LABELS: Record<string, string> = {
  name: "Producto",
  brand: "Marca",
  basePrice: "Precio",
  isActive: "Estado",
  createdAt: "Creación",
  updatedAt: "Última edición",
}

const SORT_OPTIONS: Record<string, { label: string; desc: boolean }[]> = {
  name: [
    { label: "De la A a la Z", desc: false },
    { label: "De la Z a la A", desc: true },
  ],
  brand: [
    { label: "De la A a la Z", desc: false },
    { label: "De la Z a la A", desc: true },
  ],
  basePrice: [
    { label: "De mayor a menor", desc: true },
    { label: "De menor a mayor", desc: false },
  ],
  isActive: [
    { label: "Activos primero", desc: true },
    { label: "Inactivos primero", desc: false },
  ],
  createdAt: [
    { label: "Más recientes primero", desc: true },
    { label: "Más antiguas primero", desc: false },
  ],
  updatedAt: [
    { label: "Más recientes primero", desc: true },
    { label: "Más antiguas primero", desc: false },
  ],
}

const DEFAULT_SORT_OPTIONS: { label: string; desc: boolean }[] = [
  { label: "Orden ascendente", desc: false },
  { label: "Orden descendente", desc: true },
]

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
  }).format(new Date(value))
}

function getPageItems(
  page: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index)
  }
  const items: (number | "ellipsis")[] = [0]
  const start = Math.max(1, page - 1)
  const end = Math.min(totalPages - 2, page + 1)
  if (start > 1) items.push("ellipsis")
  for (let index = start; index <= end; index += 1) items.push(index)
  if (end < totalPages - 2) items.push("ellipsis")
  items.push(totalPages - 1)
  return items
}

function ColumnHeader({
  column,
  title,
}: {
  column: {
    id: string
    getCanSort: () => boolean
    getIsSorted: () => false | "asc" | "desc"
    toggleSorting: (desc?: boolean) => void
    getCanHide: () => boolean
    toggleVisibility: (value: boolean) => void
  }
  title: string
}) {
  const sorted = column.getIsSorted()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="-ml-3" size="sm" variant="ghost">
          {title}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {column.getCanSort() && (
          <>
            {(SORT_OPTIONS[column.id] ?? DEFAULT_SORT_OPTIONS).map((option) => (
              <DropdownMenuItem
                key={option.label}
                onClick={() => column.toggleSorting(option.desc)}
              >
                {option.label}
                {sorted === (option.desc ? "desc" : "asc") ? (
                  <Check className="ml-auto" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </>
        )}
        {column.getCanHide() && (
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            Ocultar columna
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AdminProductsTable({
  data,
  isPending,
  isPlaceholderData,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  page,
  isUpdating,
  onPageChange,
  onActivate,
  onDeactivate,
  onDelete,
  isDeleting,
  returnSearch,
  filtersContent,
}: AdminProductsTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<
    LegacyReactTable<AdminProduct>["state"]["columnVisibility"]
  >({})
  const [rowSelection, setRowSelection] = useState<
    LegacyReactTable<AdminProduct>["state"]["rowSelection"]
  >({})
  const [pendingChange, setPendingChange] = useState<{
    ids: string[]
    active: boolean
  } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null)

  function requestChange(ids: string[], active: boolean) {
    if (ids.length === 0 || isUpdating || isDeleting) return
    setPendingChange({ ids, active })
  }

  function requestDelete(ids: string[]) {
    if (ids.length === 0 || isUpdating || isDeleting) return
    setPendingDelete(ids)
  }

  const { q, active } = filters
  const sorting: LegacyReactTable<AdminProduct>["state"]["sorting"] = sort
    ? [
        {
          id: sort.split(",")[0],
          desc: sort.endsWith(",desc"),
        },
      ]
    : []

  useEffect(() => {
    setRowSelection((current) => (Object.keys(current).length ? {} : current))
  }, [q, active, page])

  const columns = useMemo<LegacyColumnDef<AdminProduct>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Seleccionar todos"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Seleccionar ${row.original.name}`}
          />
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <ColumnHeader column={column} title="Producto" />
        ),
        cell: ({ row }) => (
          <div>
            <Link
              className="font-medium hover:text-primary"
              to="/admin/products/$id"
              params={{ id: row.original.id }}
              search={returnSearch}
              title={row.original.name}
            >
              {row.original.name.length > 30
                ? `${row.original.name.slice(0, 30)}…`
                : row.original.name}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {row.original.categories.join(" · ") || "Sin categoría"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "brand",
        header: ({ column }) => <ColumnHeader column={column} title="Marca" />,
        cell: ({ row }) => row.original.brand ?? "Sin marca",
      },
      {
        accessorKey: "basePrice",
        header: ({ column }) => <ColumnHeader column={column} title="Precio" />,
        cell: ({ row }) => `$${row.original.basePrice.toLocaleString("es-CO")}`,
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => <ColumnHeader column={column} title="Estado" />,
        cell: ({ row }) => (
          <span
            className={
              row.original.isActive
                ? "rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                : "rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            }
          >
            {row.original.isActive ? "Activo" : "Inactivo"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <ColumnHeader column={column} title="Creación" />
        ),
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <ColumnHeader column={column} title="Última edición" />
        ),
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="size-8 p-0"
                variant="ghost"
                aria-label={`Acciones para ${row.original.name}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to="/admin/products/$id"
                  params={{ id: row.original.id }}
                  search={returnSearch}
                >
                  Editar producto
                </Link>
              </DropdownMenuItem>
              {row.original.isActive ? (
                <DropdownMenuItem
                  disabled={isUpdating || isDeleting}
                  onClick={() => requestChange([row.original.id], false)}
                >
                  {isUpdating && <LoaderCircle className="animate-spin" />}
                  Desactivar producto
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  disabled={isUpdating || isDeleting}
                  onClick={() => requestChange([row.original.id], true)}
                >
                  {isUpdating && <LoaderCircle className="animate-spin" />}
                  Activar producto
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={isUpdating || isDeleting}
                onClick={() => requestDelete([row.original.id])}
              >
                {isDeleting && <LoaderCircle className="animate-spin" />}
                Eliminar producto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [isUpdating, isDeleting, onActivate, onDeactivate],
  )

  const rows = data?.content ?? []
  const table = useLegacyTable({
    data: rows,
    columns,
    manualSorting: true,
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater
      const next = nextSorting[0]
      onSortChange({
        field: next.id as AdminProductsSort["field"],
        direction: next.desc ? "desc" : "asc",
      })
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id,
  })
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0
  const pageSize = data?.size ?? 20
  const firstVisible = totalElements === 0 ? 0 : page * pageSize + 1
  const lastVisible = page * pageSize + rows.length
  const hasActiveFilters = q.trim() !== "" || active !== undefined
  const pendingProductNames = (pendingChange?.ids ?? [])
    .map((id) => rows.find((row) => row.id === id)?.name)
    .filter((name): name is string => Boolean(name))
  const pendingCount = pendingChange?.ids.length ?? 0
  const pendingActionLabel = pendingChange?.active ? "Activar" : "Desactivar"
  const pendingDeleteNames = (pendingDelete ?? [])
    .map((id) => rows.find((row) => row.id === id)?.name)
    .filter((name): name is string => Boolean(name))
  const pendingDeleteCount = pendingDelete?.length ?? 0

  return (
    <div className="mt-6 rounded-4xl bg-card p-4 shadow-md ring-1 ring-foreground/5">
      <div className="flex flex-col gap-3 py-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={q}
            onChange={(event) =>
              onFiltersChange({ ...filters, q: event.target.value })
            }
            className="pr-9 pl-9"
            aria-label="Buscar productos"
          />
          {q && (
            <button
              type="button"
              onClick={() => onFiltersChange({ ...filters, q: "" })}
              className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Select
          value={active ?? "all"}
          onValueChange={(value) => {
            const nextActive =
              value === "true" || value === "false" ? value : undefined
            onFiltersChange({ ...filters, active: nextActive })
          }}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filtrar estado">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="true">Activos</SelectItem>
            <SelectItem value="false">Inactivos</SelectItem>
          </SelectContent>
        </Select>
        {selectedRows.length > 0 && (
          <div className="flex gap-2">
            <Button
              disabled={isUpdating || isDeleting}
              onClick={() =>
                requestChange(
                  selectedRows.map((row) => row.original.id),
                  true,
                )
              }
            >
              {isUpdating && <LoaderCircle className="animate-spin" />}
              {isUpdating ? "Activando..." : `Activar (${selectedRows.length})`}
            </Button>
            <Button
              variant="destructive"
              disabled={isUpdating || isDeleting}
              onClick={() =>
                requestChange(
                  selectedRows.map((row) => row.original.id),
                  false,
                )
              }
            >
              {isUpdating && <LoaderCircle className="animate-spin" />}
              {isUpdating
                ? "Desactivando..."
                : `Desactivar (${selectedRows.length})`}
            </Button>
            <Button
              variant="destructive"
              disabled={isUpdating || isDeleting}
              onClick={() =>
                requestDelete(selectedRows.map((row) => row.original.id))
              }
            >
              {isDeleting && <LoaderCircle className="animate-spin" />}
              {isDeleting
                ? "Eliminando..."
                : `Eliminar (${selectedRows.length})`}
            </Button>
          </div>
        )}
        <Collapsible className="contents">
          <CollapsibleTrigger asChild>
            <Button className="group" variant="outline">
              Filtros
              <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="order-last w-full basis-full pt-4 sm:rounded-2xl sm:border sm:bg-card sm:p-4 sm:shadow-lg">
            {filtersContent}
          </CollapsibleContent>
        </Collapsible>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="sm:ml-auto" variant="outline">
              <Settings2 /> Columnas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {COLUMN_LABELS[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div
        className="mt-3 overflow-hidden rounded-2xl border transition-opacity data-[placeholder=true]:opacity-60"
        data-placeholder={isPlaceholderData || undefined}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : TanStackTable.flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {TanStackTable.flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-muted-foreground">
                      No hay productos para este filtro.
                    </p>
                    {hasActiveFilters && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onFiltersChange({ q: "", active: undefined })
                        }
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          {data && (
            <p>
              Mostrando {firstVisible}–{lastVisible} de {totalElements}{" "}
              productos
            </p>
          )}
          {selectedRows.length > 0 && (
            <p>{selectedRows.length} seleccionados</p>
          )}
        </div>
        {totalPages > 1 && (
          <Pagination className="mx-0 w-full justify-center sm:w-auto sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  text="Anterior"
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    onPageChange(page - 1)
                  }}
                  aria-disabled={page === 0}
                  className={
                    page === 0 ? "pointer-events-none opacity-50" : undefined
                  }
                />
              </PaginationItem>
              {getPageItems(page, totalPages).map((item, index) =>
                item === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === page}
                      aria-label={`Ir a la página ${item + 1}`}
                      onClick={(event) => {
                        event.preventDefault()
                        onPageChange(item)
                      }}
                    >
                      {item + 1}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  text="Siguiente"
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    onPageChange(page + 1)
                  }}
                  aria-disabled={page >= totalPages - 1}
                  className={
                    page >= totalPages - 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      <AlertDialog
        open={pendingChange !== null}
        onOpenChange={(open) => !open && setPendingChange(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingCount > 1
                ? `¿${pendingActionLabel} ${pendingCount} productos?`
                : `¿${pendingActionLabel} el producto “${pendingProductNames[0] ?? ""}”?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChange?.active
                ? "Los productos volverán a estar visibles en la tienda."
                : "Los productos dejarán de estar visibles en la tienda y no se podrán comprar. Esta acción se puede revertir."}
              {pendingProductNames.length > 1 && (
                <>
                  {" "}
                  Productos: {pendingProductNames.slice(0, 3).join(", ")}
                  {pendingProductNames.length > 3 &&
                    ` y ${pendingProductNames.length - 3} más`}
                  .
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant={pendingChange?.active ? "default" : "destructive"}
              disabled={isUpdating || !pendingChange}
              onClick={() => {
                if (!pendingChange) return
                if (pendingChange.active) onActivate(pendingChange.ids)
                else onDeactivate(pendingChange.ids)
                setPendingChange(null)
              }}
            >
              {isUpdating
                ? "Aplicando..."
                : pendingChange?.active
                  ? "Activar"
                  : "Desactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDeleteCount > 1
                ? `¿Eliminar ${pendingDeleteCount} productos?`
                : `¿Eliminar el producto “${pendingDeleteNames[0] ?? ""}”?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Los productos se eliminarán permanentemente del catálogo junto con
              sus variantes. Sus imágenes quedarán disponibles en la galería.
              Esta acción no se puede deshacer.
              {pendingDeleteNames.length > 1 && (
                <>
                  {" "}
                  Productos: {pendingDeleteNames.slice(0, 3).join(", ")}
                  {pendingDeleteNames.length > 3 &&
                    ` y ${pendingDeleteNames.length - 3} más`}
                  .
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting || !pendingDelete}
              onClick={() => {
                if (!pendingDelete) return
                onDelete(pendingDelete)
                setRowSelection({})
                setPendingDelete(null)
              }}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
