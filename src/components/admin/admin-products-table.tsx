import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  LoaderCircle,
  MoreHorizontal,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react"
import * as TanStackTable from "@tanstack/react-table"
import { useLegacyTable } from "@tanstack/react-table/legacy"
import type {
  LegacyColumnDef,
  LegacyReactTable,
} from "@tanstack/react-table/legacy"
import { Link } from "@tanstack/react-router"
import { Button } from "#/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#/components/ui/collapsible"
import { Checkbox } from "#/components/ui/checkbox"
import { PermanentDeleteDialog } from "#/components/permanent-delete-dialog"
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
import { formatCop, productTitle } from "#/components/catalog/types"
import {
  hasReviewIssues,
  productReviewIssues,
} from "#/components/admin/product-review"
import type {
  AdminProduct,
  PageResponse,
  ProductStatus,
} from "#/services/admin"
import type { AdminProductsSearch } from "#/components/admin/admin-products-search"

export interface AdminProductsFilters {
  q: string
  needsReview: boolean
}

interface AdminProductsTableProps {
  data: PageResponse<AdminProduct> | undefined
  isPending: boolean
  isPlaceholderData: boolean
  filters: AdminProductsFilters
  onFiltersChange: (filters: AdminProductsFilters) => void
  sort: string | undefined
  onSortChange: (sort: string | undefined) => void
  page: number
  onPageChange: (page: number) => void
  onBulkStatus: (ids: string[], status: ProductStatus) => void
  isUpdatingStatus: boolean
  onDelete: (ids: string[]) => void
  isDeleting: boolean
  returnSearch: AdminProductsSearch
  filtersContent?: ReactNode
  statuses: ProductStatus[]
  onStatusesChange: (statuses: ProductStatus[]) => void
}

const COLUMN_LABELS: Record<string, string> = {
  sku: "SKU",
  name: "Producto",
  brand: "Marca",
  price: "Precio",
  stock: "Stock",
  status: "Estado",
}

const SORT_OPTIONS: Record<string, { label: string; value: string }[]> = {
  sku: [
    { label: "SKU ascendente", value: "sku,asc" },
    { label: "SKU descendente", value: "sku,desc" },
  ],
  name: [
    { label: "De la A a la Z", value: "name,asc" },
    { label: "De la Z a la A", value: "name,desc" },
  ],
  brand: [
    { label: "De la A a la Z", value: "brand,asc" },
    { label: "De la Z a la A", value: "brand,desc" },
  ],
  price: [
    { label: "Menor a mayor", value: "price,asc" },
    { label: "Mayor a menor", value: "price,desc" },
  ],
  stock: [
    { label: "Menor a mayor", value: "stock,asc" },
    { label: "Mayor a menor", value: "stock,desc" },
  ],
  status: [
    { label: "Ascendente", value: "status,asc" },
    { label: "Descendente", value: "status,desc" },
  ],
}

const statusLabels: Record<ProductStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  HIDDEN: "Oculto",
}

function ReviewBadge({ product }: { product: AdminProduct }) {
  const issues = productReviewIssues(product)
  if (issues.length === 0) return null
  return (
    <span
      title={`Pendientes: ${issues.map((issue) => issue.text).join(", ")}.`}
      className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-amber-800 dark:bg-amber-950 dark:text-amber-300"
    >
      Revisar
    </span>
  )
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
  columnId,
  title,
  sort,
  onSortChange,
  canSort = true,
}: {
  columnId: string
  title: string
  sort: string | undefined
  onSortChange: (sort: string | undefined) => void
  canSort?: boolean
}) {
  const options = SORT_OPTIONS[columnId]
  if (!canSort || !options) return <span>{title}</span>

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
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() =>
              onSortChange(sort === option.value ? undefined : option.value)
            }
          >
            {option.label}
            {sort === option.value ? <Check className="ml-auto" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function StatusColumnHeader({
  statuses,
  onStatusesChange,
}: {
  statuses: ProductStatus[]
  onStatusesChange: (statuses: ProductStatus[]) => void
}) {
  const toggleStatus = (status: ProductStatus) => {
    if (statuses.includes(status)) {
      onStatusesChange(statuses.filter((s) => s !== status))
    } else {
      onStatusesChange([...statuses, status])
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="-ml-3" size="sm" variant="ghost">
          Estado
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Filtrar</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(["ACTIVE", "INACTIVE", "HIDDEN"] as ProductStatus[]).map((status) => (
          <DropdownMenuCheckboxItem
            key={status}
            checked={statuses.includes(status)}
            onCheckedChange={() => toggleStatus(status)}
          >
            {statusLabels[status]}
          </DropdownMenuCheckboxItem>
        ))}
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
  onPageChange,
  onBulkStatus,
  isUpdatingStatus,
  onDelete,
  isDeleting,
  returnSearch,
  filtersContent,
  statuses,
  onStatusesChange,
}: AdminProductsTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<
    LegacyReactTable<AdminProduct>["state"]["columnVisibility"]
  >({})
  const [rowSelection, setRowSelection] = useState<
    LegacyReactTable<AdminProduct>["state"]["rowSelection"]
  >({})
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null)

  useEffect(() => {
    setRowSelection((current) => (Object.keys(current).length ? {} : current))
  }, [filters.q, filters.needsReview, page, data?.content])

  const rows = useMemo(() => {
    const content = data?.content ?? []
    return filters.needsReview ? content.filter(hasReviewIssues) : content
  }, [data?.content, filters.needsReview])

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
            aria-label={`Seleccionar ${row.original.sku}`}
          />
        ),
      },
      {
        accessorKey: "sku",
        header: () => (
          <ColumnHeader
            columnId="sku"
            title="SKU"
            sort={sort}
            onSortChange={onSortChange}
          />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.sku}</span>
        ),
      },
      {
        accessorKey: "name",
        header: () => (
          <ColumnHeader
            columnId="name"
            title="Producto"
            sort={sort}
            onSortChange={onSortChange}
          />
        ),
        cell: ({ row }) => (
          <div>
            <div className="flex items-center gap-2">
              <Link
                className="font-medium hover:text-primary"
                to="/admin/products/$id"
                params={{ id: row.original.id }}
                search={returnSearch}
              >
                {productTitle(row.original)}
              </Link>
              <ReviewBadge product={row.original} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {row.original.categories.join(" · ") || "Sin categoría"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "brand",
        header: () => (
          <ColumnHeader
            columnId="brand"
            title="Marca"
            sort={sort}
            onSortChange={onSortChange}
          />
        ),
        cell: ({ row }) => row.original.brand ?? "—",
      },
      {
        accessorKey: "price",
        header: () => (
          <ColumnHeader
            columnId="price"
            title="Precio"
            sort={sort}
            onSortChange={onSortChange}
          />
        ),
        cell: ({ row }) => formatCop(row.original.price),
      },
      {
        accessorKey: "stock",
        header: () => (
          <ColumnHeader
            columnId="stock"
            title="Stock"
            sort={sort}
            onSortChange={onSortChange}
          />
        ),
        cell: ({ row }) => row.original.stock,
      },
      {
        accessorKey: "status",
        header: () => (
          <StatusColumnHeader
            statuses={statuses}
            onStatusesChange={onStatusesChange}
          />
        ),
        cell: ({ row }) => {
          const product = row.original
          const isOutOfStock = product.status === "ACTIVE" && product.stock <= 0
          const label = isOutOfStock ? "Agotado" : statusLabels[product.status]
          const colorClass = isOutOfStock
            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            : product.status === "ACTIVE"
              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
              : product.status === "INACTIVE"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
          return (
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${colorClass}`}
            >
              {label}
            </span>
          )
        },
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
                aria-label={`Acciones para ${row.original.sku}`}
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={isUpdatingStatus}
                onClick={() => onBulkStatus([row.original.id], "ACTIVE")}
              >
                <Eye className="mr-2 size-4" />
                Activar
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isUpdatingStatus}
                onClick={() => onBulkStatus([row.original.id], "INACTIVE")}
              >
                <EyeOff className="mr-2 size-4" />
                Desactivar
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isUpdatingStatus}
                onClick={() => onBulkStatus([row.original.id], "HIDDEN")}
              >
                <EyeOff className="mr-2 size-4" />
                Ocultar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={isDeleting}
                onClick={() => setPendingDelete([row.original.id])}
              >
                <Trash2 className="mr-2 size-4" />
                Eliminar producto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [
      onSortChange,
      returnSearch,
      sort,
      onBulkStatus,
      isUpdatingStatus,
      isDeleting,
    ],
  )

  const table = useLegacyTable({
    data: rows,
    columns,
    manualSorting: true,
    state: { columnVisibility, rowSelection },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id,
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0
  const pageSize = data?.size ?? 100
  const firstVisible = totalElements === 0 ? 0 : page * pageSize + 1
  const lastVisible = page * pageSize + (data?.content.length ?? 0)

  return (
    <div className="mt-6 rounded-4xl bg-card p-4 shadow-md ring-1 ring-foreground/5">
      <div className="flex flex-col gap-3 py-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por SKU, nombre o referencia..."
            value={filters.q}
            onChange={(event) =>
              onFiltersChange({ ...filters, q: event.target.value })
            }
            className="pr-9 pl-9"
            aria-label="Buscar productos"
          />
          {filters.q && (
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

        {selectedRows.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={isUpdatingStatus}
              onClick={() =>
                onBulkStatus(
                  selectedRows.map((row) => row.original.id),
                  "ACTIVE",
                )
              }
            >
              {isUpdatingStatus && <LoaderCircle className="animate-spin" />}
              Activar ({selectedRows.length})
            </Button>
            <Button
              variant="outline"
              disabled={isUpdatingStatus}
              onClick={() =>
                onBulkStatus(
                  selectedRows.map((row) => row.original.id),
                  "INACTIVE",
                )
              }
            >
              Desactivar ({selectedRows.length})
            </Button>
            <Button
              variant="outline"
              disabled={isUpdatingStatus}
              onClick={() =>
                onBulkStatus(
                  selectedRows.map((row) => row.original.id),
                  "HIDDEN",
                )
              }
            >
              Ocultar ({selectedRows.length})
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              disabled={isDeleting}
              onClick={() =>
                setPendingDelete(selectedRows.map((row) => row.original.id))
              }
            >
              <Trash2 />
              Eliminar ({selectedRows.length})
            </Button>
          </div>
        )}

        {filtersContent ? (
          <Collapsible className="contents">
            <CollapsibleTrigger asChild>
              <Button className="group" variant="outline">
                Filtros
                <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden order-last w-full basis-full data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
              <div className="pt-4 sm:rounded-2xl sm:border sm:bg-card sm:p-4 sm:shadow-lg">
                {filtersContent}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : null}

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
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay productos para este filtro.
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
              Mostrando {firstVisible}–{Math.min(lastVisible, totalElements)} de{" "}
              {totalElements} productos
              {filters.needsReview
                ? ` (${rows.length} con pendientes en esta página)`
                : ""}
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
      <DeleteProductsDialog
        ids={pendingDelete}
        rows={rows}
        isDeleting={isDeleting}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          onDelete(pendingDelete)
          setRowSelection({})
          setPendingDelete(null)
        }}
      />
    </div>
  )
}

function DeleteProductsDialog({
  ids,
  rows,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  ids: string[] | null
  rows: AdminProduct[]
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const names = (ids ?? [])
    .map((id) => rows.find((row) => row.id === id))
    .filter((product): product is AdminProduct => Boolean(product))
    .map((product) => productTitle(product))
  const count = ids?.length ?? 0

  return (
    <PermanentDeleteDialog
      open={ids !== null}
      onOpenChange={onOpenChange}
      isPending={isDeleting}
      confirmDisabled={!ids}
      onConfirm={onConfirm}
      title={
        count > 1
          ? `¿Eliminar ${count} productos?`
          : `¿Eliminar el producto “${names[0] ?? ""}”?`
      }
      description={`Los productos se eliminarán de la base de datos local. Sus imágenes seguirán disponibles en la galería. Si el SKU sigue en Softix, la sincronización no lo recreará; solo lo hará la importación.${names.length > 1 ? ` Productos: ${names.slice(0, 3).join(", ")}${names.length > 3 ? ` y ${names.length - 3} más` : ""}.` : ""}`}
    />
  )
}
