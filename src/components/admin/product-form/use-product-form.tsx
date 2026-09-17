import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { ToastAction } from "#/components/ui/toast"
import { toast } from "#/hooks/use-toast"
import {
  attachExistingVariantImage,
  createAdminProduct,
  deleteAdminMedia,
  deleteAdminProduct,
  deleteVariantImage,
  listAdminGallery,
  reorderVariantImages,
  updateAdminProduct,
  uploadVariantImage,
} from "#/services/admin"
import type {
  AdminBrand,
  AdminCategory,
  AdminImage,
  AdminMediaAsset,
  AdminProduct,
  AdminProductInput,
} from "#/services/admin"
import type { AdminProductsSearch } from "#/components/admin/admin-products-search"
import {
  ADMIN_PRODUCTS_QUERY_KEY,
  createAdminBrandsQueryOptions,
  createAdminCategoriesQueryOptions,
} from "#/query-options/admin"
import type {
  DndSensors,
  ImageToDelete,
  PendingImage,
  ProductFormInput,
  UploadProgress,
  VariantFormInput,
} from "./types"
import { emptyInput } from "./types"

/**
 * Todo el estado y la lógica del formulario de producto.
 * Las secciones visuales (info, variantes, diálogos) solo consumen este
 * objeto: `AdminProductForm` lo crea y lo reparte por props.
 */
export interface ProductForm {
  product?: AdminProduct
  // --- datos base ---
  input: ProductFormInput
  brands: AdminBrand[]
  categories: AdminCategory[]
  // --- pendientes de subida (solo variantes guardadas) ---
  imageError: string
  pendingImages: PendingImage[]
  pendingVariantId: string | null
  uploadProgress: UploadProgress | null
  uploadPending: boolean
  uploadError: Error | null
  // --- adjuntar existente ---
  attachPending: boolean
  attachVariables: { variantId: string; imageUrl: string } | undefined
  attachError: Error | null
  // --- orden (dnd-kit) ---
  sensors: DndSensors
  imagesByVariant: Record<string, AdminImage[]>
  activeDragVariantId: string | null
  activeImage: AdminImage | undefined
  // --- borrado ---
  imageToDelete: ImageToDelete | null
  permanentDeleteOpen: boolean
  permanentAsset: AdminMediaAsset | null
  removeImagePending: boolean
  permanentRemovePending: boolean
  deleteProductOpen: boolean
  deleteProductPending: boolean
  variantToDelete: number | null
  // --- guardado ---
  validationError: string
  savePending: boolean
  saveError: Error | null
  stagedUpload: UploadProgress | null
  // --- acciones ---
  updateField: <TKey extends keyof ProductFormInput>(
    key: TKey,
    value: ProductFormInput[TKey],
  ) => void
  addVariant: () => void
  updateVariant: (index: number, value: Partial<VariantFormInput>) => void
  removeVariant: (index: number) => void
  handleImageDragStart: (variantId: string, event: DragStartEvent) => void
  handleImageDragCancel: () => void
  handleImageDragEnd: (variantId: string, event: DragEndEvent) => void
  handleImages: (variantId: string, files: File[]) => void
  uploadSelectedImages: () => void
  removePendingImage: (index: number) => void
  selectExistingImage: (variantId: string, imageUrl: string) => void
  saveProduct: () => void
  askDeleteImage: (variantId: string, image: AdminImage) => void
  closeImageChoice: () => void
  openPermanentDelete: () => void
  closePermanentDelete: (open: boolean) => void
  detachImage: () => void
  confirmPermanentDelete: () => void
  openDeleteProduct: () => void
  closeDeleteProduct: (open: boolean) => void
  confirmDeleteProduct: () => void
  askDeleteVariant: (index: number) => void
  closeDeleteVariant: () => void
  confirmDeleteVariant: () => void
  goBack: () => void
}

export function useProductForm(
  product?: AdminProduct,
  returnSearch?: AdminProductsSearch,
): ProductForm {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [input, setInput] = useState<ProductFormInput>(emptyInput)
  const [stagedUpload, setStagedUpload] = useState<UploadProgress | null>(null)
  const [imageError, setImageError] = useState("")
  // Imágenes elegidas para una variante guardada pero aún no subidas a
  // ella (se suben con "Subir imágenes"). Las filas nuevas usan preview
  // local (`localImages`): no tocan S3 hasta que se guarda el producto.
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [pendingVariantId, setPendingVariantId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  )
  const [activeDrag, setActiveDrag] = useState<{
    variantId: string
    imageId: string
    width?: number
  } | null>(null)
  const [imageToDelete, setImageToDelete] = useState<ImageToDelete | null>(null)
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false)
  const [deleteProductOpen, setDeleteProductOpen] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState<number | null>(null)
  const [orderedVariantImages, setOrderedVariantImages] = useState<
    Record<string, AdminImage[]>
  >({})
  const [validationError, setValidationError] = useState("")
  const { data: categories = [] } = useQuery(
    createAdminCategoriesQueryOptions(),
  )
  const { data: brands = [] } = useQuery(createAdminBrandsQueryOptions())
  const mediaGallery = useQuery({
    queryKey: ["admin", "media", "gallery"],
    queryFn: listAdminGallery,
    enabled: imageToDelete !== null,
  })
  const permanentAsset: AdminMediaAsset | null = imageToDelete
    ? (mediaGallery.data?.find(
        (asset) => asset.imageUrl === imageToDelete.image.imageUrl,
      ) ?? {
        key: storageKeyFromUrl(imageToDelete.image.imageUrl),
        imageUrl: imageToDelete.image.imageUrl,
        folder: "variants",
        references: [
          {
            type: "variant",
            id: product?.id ?? "",
            name: product?.name ?? "este producto",
          },
        ],
      })
    : null

  useEffect(() => {
    if (product) {
      const imagesByVariant: Record<string, AdminImage[]> = {}
      for (const variant of product.variants) {
        if (variant.id) {
          imagesByVariant[variant.id] = variant.images.map((image, index) => ({
            ...image,
            isPrimary: index === 0,
          }))
        }
      }
      setOrderedVariantImages(imagesByVariant)
      setInput({
        name: product.name,
        brandId: product.brandId,
        material: product.material ?? "",
        shape: product.shape ?? "",
        description: product.description ?? "",
        taxRate: product.taxRate,
        productType: product.productType,
        categories: product.categories,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          color: variant.color ?? "",
          sku: variant.sku ?? "",
          price: variant.price ?? 0,
          discountPercentage: variant.discountPercentage,
          isActive: variant.isActive,
          // Las imágenes de variantes guardadas se gestionan por endpoints
          // dedicados; las nuevas usan `localImages` (preview local).
          images: [],
          localImages: [],
        })),
      })
    }
  }, [product])

  function invalidateDetail() {
    return queryClient.invalidateQueries({
      queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, product?.id],
    })
  }

  const attachExisting = useMutation({
    mutationFn: ({
      variantId,
      imageUrl,
    }: {
      variantId: string
      imageUrl: string
    }) =>
      attachExistingVariantImage(
        variantId,
        imageUrl,
        (orderedVariantImages[variantId] ?? []).length === 0,
      ),
    onSuccess: invalidateDetail,
  })

  const save = useMutation({
    mutationFn: async () => {
      // Fase 1: crear/actualizar producto y variantes sin imágenes nuevas.
      // Las fotos de filas nuevas son preview local (`localImages`) y se
      // suben en fase 2, cuando las variantes ya tienen id.
      const payload: AdminProductInput = {
        ...input,
        variants: input.variants.map((variant) => ({
          id: variant.id,
          color: variant.color,
          sku: variant.sku,
          price: variant.price,
          discountPercentage: variant.discountPercentage,
          isActive: variant.isActive,
          images: [],
        })),
      }
      const saved = product
        ? await updateAdminProduct(product.id, payload)
        : await createAdminProduct(payload)

      if (product) {
        for (const variant of product.variants) {
          if (!variant.id) continue
          const ordered = orderedVariantImages[variant.id] ?? []
          const originalIds = variant.images.map((image) => image.id)
          const imageIds = ordered.map((image) => image.id)
          const changed =
            imageIds.length !== originalIds.length ||
            imageIds.some((imageId, index) => imageId !== originalIds[index])
          if (changed && imageIds.length > 0) {
            await reorderVariantImages(variant.id, imageIds)
          }
        }
      }

      // Fase 2: subir las previews locales en el orden mostrado (la primera
      // es la principal). Se emparejan por SKU (único por variante).
      const savedBySku = new Map(
        saved.variants.map((variant) => [
          (variant.sku ?? "").trim().toLowerCase(),
          variant,
        ]),
      )
      const pending = input.variants.flatMap((variant) =>
        variant.localImages.length > 0
          ? [{ variant, locals: variant.localImages }]
          : [],
      )
      const totalFiles = pending.reduce(
        (total, item) => total + item.locals.length,
        0,
      )
      if (totalFiles > 0) {
        let completed = 0
        setStagedUpload({
          completed: 0,
          total: totalFiles,
          percent: 0,
          fileName: "",
        })
        try {
          for (const { variant, locals } of pending) {
            const target = savedBySku.get(variant.sku.trim().toLowerCase())
            if (!target?.id) {
              throw new Error(
                `No se encontró la variante "${variant.color || variant.sku}" recién guardada`,
              )
            }
            for (const [index, local] of locals.entries()) {
              const primary = index === 0
              setStagedUpload({
                completed,
                total: totalFiles,
                percent: 0,
                fileName: local.file?.name ?? local.imageUrl ?? variant.color,
              })
              if (local.file) {
                await uploadVariantImage(target.id, local.file, primary)
              } else if (local.imageUrl) {
                await attachExistingVariantImage(
                  target.id,
                  local.imageUrl,
                  primary,
                )
              }
              completed += 1
              setStagedUpload({
                completed,
                total: totalFiles,
                percent: 100,
                fileName: local.file?.name ?? local.imageUrl ?? variant.color,
              })
            }
          }
        } catch (stagedError) {
          // El producto ya quedó guardado: no se pierde nada, se vuelve a la
          // edición (ahí las variantes ya tienen id y sus fotos se gestionan
          // por endpoints dedicados) para reintentar las que faltaron.
          return {
            saved,
            stagedError:
              stagedError instanceof Error
                ? stagedError.message
                : "No se pudieron subir todas las imágenes",
          }
        } finally {
          setStagedUpload(null)
        }
      }

      return { saved, stagedError: null as string | null }
    },
    onSuccess: async ({ saved, stagedError }) => {
      pendingImages.forEach(({ preview }) => URL.revokeObjectURL(preview))
      setPendingImages([])
      setPendingVariantId(null)
      for (const variant of input.variants) {
        for (const local of variant.localImages) {
          if (local.file) URL.revokeObjectURL(local.preview)
        }
      }
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEY,
      })
      if (stagedError) {
        toast({
          variant: "destructive",
          title: "Producto guardado, pero faltaron imágenes",
          description: `${stagedError}. Quedaste en la edición para reintentarlas.`,
        })
        navigate({
          to: "/admin/products/$id",
          params: { id: saved.id },
          search: returnSearch,
        })
        return
      }
      toast({
        variant: "success",
        title: product ? "Producto actualizado" : "Producto creado",
        description: product
          ? "Los cambios se guardaron correctamente."
          : "El producto se añadió al catálogo.",
        action: (
          <ToastAction
            altText="Ver producto"
            onClick={() =>
              navigate({
                to: "/admin/products/$id",
                params: { id: saved.id },
                search: returnSearch,
              })
            }
          >
            Ver producto
          </ToastAction>
        ),
      })
      navigate({
        to: "/admin/products",
        search: returnSearch,
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: product
          ? "No se pudo actualizar el producto"
          : "No se pudo crear el producto",
        description: error.message,
      })
    },
  })

  const upload = useMutation({
    mutationFn: async ({
      variantId,
      files,
    }: {
      variantId: string
      files: File[]
    }) => {
      const uploaded: Awaited<ReturnType<typeof uploadVariantImage>>[] = []
      const existingCount = (orderedVariantImages[variantId] ?? []).length
      setUploadProgress({
        completed: 0,
        total: files.length,
        percent: 0,
        fileName: files[0]?.name ?? "",
      })
      for (const [index, file] of files.entries()) {
        uploaded.push(
          await uploadVariantImage(
            variantId,
            file,
            existingCount === 0 && index === 0,
            (percent) =>
              setUploadProgress({
                completed: index,
                total: files.length,
                percent,
                fileName: file.name,
              }),
          ),
        )
        setUploadProgress({
          completed: index + 1,
          total: files.length,
          percent: 100,
          fileName: file.name,
        })
      }
      return uploaded
    },
    onSuccess: async () => {
      pendingImages.forEach(({ preview }) => URL.revokeObjectURL(preview))
      setPendingImages([])
      setPendingVariantId(null)
      setUploadProgress(null)
      await invalidateDetail()
    },
    onError: (error) => {
      setUploadProgress(null)
      toast({
        variant: "destructive",
        title: "No se pudieron subir las imágenes",
        description: error.message,
      })
    },
  })

  const removeImage = useMutation({
    mutationFn: ({
      variantId,
      imageId,
    }: {
      variantId: string
      imageId: string
    }) => deleteVariantImage(variantId, imageId),
    onSuccess: async () => {
      setImageToDelete(null)
      await invalidateDetail()
    },
  })

  const permanentlyRemoveImage = useMutation({
    mutationFn: (asset: NonNullable<typeof permanentAsset>) =>
      deleteAdminMedia(asset.key, true),
    onSuccess: async () => {
      setImageToDelete(null)
      setPermanentDeleteOpen(false)
      await Promise.all([
        invalidateDetail(),
        queryClient.invalidateQueries({
          queryKey: ["admin", "media", "gallery"],
        }),
      ])
    },
  })

  const deleteProduct = useMutation({
    mutationFn: () => deleteAdminProduct(product!.id),
    onSuccess: async () => {
      // Saca la query de detalle antes de invalidar: el producto ya no
      // existe y re-pedirlo daría 404 con reintentos (segundos de espera).
      queryClient.removeQueries({
        queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, product?.id],
      })
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEY,
      })
      toast({
        title: "Producto eliminado",
        description: "Se eliminó permanentemente del catálogo.",
      })
      navigate({ to: "/admin/products", search: returnSearch })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "No se pudo eliminar el producto",
        description: error.message,
      })
    },
  })

  function handleImageDragStart(variantId: string, { active }: DragStartEvent) {
    setActiveDrag({
      variantId,
      imageId: String(active.id),
      width: active.rect.current.initial?.width,
    })
  }

  function handleImageDragCancel() {
    setActiveDrag(null)
  }

  function clearActiveImageAfterDrop() {
    window.setTimeout(() => {
      setActiveDrag(null)
    }, 250)
  }

  function handleImageDragEnd(
    variantId: string,
    { active, over }: DragEndEvent,
  ) {
    const ordered = orderedVariantImages[variantId] ?? []
    if (!over || active.id === over.id) {
      clearActiveImageAfterDrop()
      return
    }
    const from = ordered.findIndex((image) => image.id === String(active.id))
    const to = ordered.findIndex((image) => image.id === String(over.id))
    if (from >= 0 && to >= 0) {
      let nextImages = [...ordered]
      const [moved] = nextImages.splice(from, 1)
      nextImages.splice(to, 0, moved)
      nextImages = nextImages.map((image, index) => ({
        ...image,
        isPrimary: index === 0,
      }))
      setOrderedVariantImages((current) => ({
        ...current,
        [variantId]: nextImages,
      }))
    }
    clearActiveImageAfterDrop()
  }

  const activeImage =
    activeDrag != null
      ? (orderedVariantImages[activeDrag.variantId] ?? []).find(
          (image) => image.id === activeDrag.imageId,
        )
      : undefined
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function updateField<TKey extends keyof ProductFormInput>(
    key: TKey,
    value: ProductFormInput[TKey],
  ) {
    setInput((current) => ({ ...current, [key]: value }))
  }

  function addVariant() {
    updateField("variants", [
      ...input.variants,
      {
        color: "",
        sku: "",
        price: 0,
        discountPercentage: null,
        isActive: true,
        images: [],
        localImages: [],
      },
    ])
  }

  function updateVariant(index: number, value: Partial<VariantFormInput>) {
    updateField(
      "variants",
      input.variants.map((variant, current) =>
        current === index ? { ...variant, ...value } : variant,
      ),
    )
  }

  function removeVariant(index: number) {
    const target = input.variants.at(index)
    target?.localImages.forEach((local) => {
      if (local.file) URL.revokeObjectURL(local.preview)
    })
    updateField(
      "variants",
      input.variants.filter((_, current) => current !== index),
    )
  }

  function askDeleteVariant(index: number) {
    if (index < 0 || index >= input.variants.length) return
    setVariantToDelete(index)
  }

  function closeDeleteVariant() {
    setVariantToDelete(null)
  }

  function confirmDeleteVariant() {
    if (variantToDelete == null) return
    removeVariant(variantToDelete)
    setVariantToDelete(null)
  }

  function handleImages(variantId: string, files: File[]) {
    if (files.length === 0) return
    const file = files.find(
      (candidate) =>
        !(["image/jpeg", "image/png", "image/webp"] as string[]).includes(
          candidate.type,
        ) || candidate.size > 10 * 1024 * 1024,
    )
    if (file) {
      setImageError(
        file.size > 10 * 1024 * 1024
          ? "Cada imagen no puede superar 10 MB."
          : "Usa imágenes JPG, PNG o WebP.",
      )
      return
    }
    pendingImages.forEach(({ preview }) => URL.revokeObjectURL(preview))
    setImageError("")
    setPendingVariantId(variantId)
    setPendingImages(
      files.map((selectedFile) => ({
        file: selectedFile,
        preview: URL.createObjectURL(selectedFile),
      })),
    )
  }

  function uploadSelectedImages() {
    if (pendingImages.length > 0 && pendingVariantId) {
      upload.mutate({
        variantId: pendingVariantId,
        files: pendingImages.map(({ file }) => file),
      })
    }
  }

  function removePendingImage(index: number) {
    if (upload.isPending) return
    setPendingImages((current) => {
      const target = current.at(index)
      if (target) URL.revokeObjectURL(target.preview)
      const next = current.filter((_, currentIndex) => currentIndex !== index)
      if (next.length === 0) setPendingVariantId(null)
      return next
    })
  }

  function selectExistingImage(variantId: string, imageUrl: string) {
    attachExisting.mutate({ variantId, imageUrl })
  }

  function saveProduct() {
    if (input.variants.length === 0) {
      setValidationError("El producto debe tener al menos una variante.")
      return
    }
    const invalidVariant = input.variants.some(
      (variant) =>
        !variant.color.trim() || !variant.sku.trim() || !(variant.price > 0),
    )
    if (invalidVariant) {
      setValidationError(
        "Completa el color, el SKU y un precio mayor a cero en cada variante.",
      )
      return
    }
    const invalidDiscount = input.variants.some(
      (variant) =>
        variant.discountPercentage != null &&
        (variant.discountPercentage < 0 || variant.discountPercentage > 100),
    )
    if (invalidDiscount) {
      setValidationError(
        "El descuento de cada variante debe estar entre 0 y 100.",
      )
      return
    }
    const colors = input.variants.map((variant) =>
      variant.color.trim().toLowerCase(),
    )
    if (new Set(colors).size !== colors.length) {
      setValidationError("No puede haber variantes con el mismo color.")
      return
    }
    setValidationError("")
    save.mutate()
  }

  return {
    product,
    input,
    brands,
    categories,
    imageError,
    pendingImages,
    pendingVariantId,
    uploadProgress,
    uploadPending: upload.isPending,
    uploadError: upload.error,
    attachPending: attachExisting.isPending,
    attachVariables: attachExisting.variables,
    attachError: attachExisting.error,
    sensors,
    imagesByVariant: orderedVariantImages,
    activeDragVariantId: activeDrag?.variantId ?? null,
    activeImage,
    imageToDelete,
    permanentDeleteOpen,
    permanentAsset,
    removeImagePending: removeImage.isPending,
    permanentRemovePending: permanentlyRemoveImage.isPending,
    deleteProductOpen,
    deleteProductPending: deleteProduct.isPending,
    variantToDelete,
    validationError,
    savePending: save.isPending,
    saveError: save.error,
    stagedUpload,
    updateField,
    addVariant,
    updateVariant,
    removeVariant,
    handleImageDragStart,
    handleImageDragCancel,
    handleImageDragEnd,
    handleImages,
    uploadSelectedImages,
    removePendingImage,
    selectExistingImage,
    saveProduct,
    askDeleteImage: (variantId: string, image: AdminImage) =>
      setImageToDelete({ variantId, image }),
    closeImageChoice: () => setImageToDelete(null),
    openPermanentDelete: () => setPermanentDeleteOpen(true),
    closePermanentDelete: (open: boolean) => {
      setPermanentDeleteOpen(open)
      if (!open) setImageToDelete(null)
    },
    detachImage: () => {
      if (imageToDelete)
        removeImage.mutate({
          variantId: imageToDelete.variantId,
          imageId: imageToDelete.image.id,
        })
    },
    confirmPermanentDelete: () => {
      if (permanentAsset) permanentlyRemoveImage.mutate(permanentAsset)
    },
    openDeleteProduct: () => setDeleteProductOpen(true),
    closeDeleteProduct: (open: boolean) => {
      if (!open) setDeleteProductOpen(false)
    },
    confirmDeleteProduct: () => deleteProduct.mutate(),
    askDeleteVariant,
    closeDeleteVariant,
    confirmDeleteVariant,
    goBack: () => navigate({ to: "/admin/products", search: returnSearch }),
  }
}

function storageKeyFromUrl(url: string) {
  try {
    return new URL(url).pathname.replace(/^\/+/, "")
  } catch {
    return url
  }
}
