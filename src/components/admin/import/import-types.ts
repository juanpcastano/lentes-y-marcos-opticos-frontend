import type {
  ImportPlanProduct,
  ImportPlanRequest,
  ImportPlanVariant,
  InventoryPreview,
  InventoryPreviewRow,
} from "#/services/admin"

/**
 * Decisiones del wizard, modelo "solo mostrar / alertar / omitir": ya no se
 * renombra ni se reasigna nada. Cada mapa marca como omitidos los raws del
 * Excel (`true` = omitido). Marcas, categorías y productos entran incluidos;
 * lo que no se quiere se omite a mano.
 */
export type OmissionMap = Record<string, true>

export function isOmitted(map: OmissionMap, key: string): boolean {
  return Object.hasOwn(map, key)
}

export interface WizardVariant {
  rowKey: string
  sku: string
  excelName: string
  /** Precio del Excel (referencia; 0 = sin precio, se omite al importar). */
  excelPrice: number
  /** Color detectado en el Excel (referencia). */
  excelColor: string
  /** Precio a importar (igual al del Excel; sin edición). */
  basePrice: number
  status: InventoryPreviewRow["status"]
  sheet: string
  rowNumber: number
  existingProductId: string | null
  /** Nombre registrado hoy en tienda (para mostrarlo al actualizar). */
  existingName: string | null
  /** Categorías registradas hoy en tienda (null si el producto es nuevo). */
  existingCategories: string[] | null
  /** Detalle del backend (qué se actualizará en la variante). */
  detail: string | null
  /** Color a importar (igual al detectado; sin edición). */
  color: string
  needsColorReview: boolean
}

export interface WizardGroup {
  id: string
  /** Nombre a importar (igual al detectado; sin edición). */
  name: string
  /** Nombre detectado en el Excel (referencia). */
  excelName: string
  brandRaw: string
  categoryRaws: string[]
  productType: string | null
  variantKeys: string[]
}

export interface WizardState {
  groups: WizardGroup[]
  /** Completo por construcción: una entrada por cada fila válida. */
  variants: Record<string, WizardVariant>
}

export function defaultOmittedBrands(_preview: InventoryPreview): OmissionMap {
  // Las marcas entran incluidas por defecto; lo que no se quiere se omite.
  return {}
}

export function defaultOmittedCategories(
  _preview: InventoryPreview,
): OmissionMap {
  return {}
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
}

/** Agrupa las filas válidas por groupKey (sugerencia del backend). */
export function buildWizardState(rows: InventoryPreviewRow[]): WizardState {
  const variants: Record<string, WizardVariant> = {}
  const groupsByKey = new Map<string, WizardGroup>()
  for (const row of rows) {
    if (row.status === "ERROR") continue
    // Sin precio en el Excel (Cant=0 o no numérico): entra con precio 0 y se
    // omite al importar (aviso en el paso 1, no bloqueante).
    const price = row.basePrice ?? 0
    const key = row.groupKey ?? row.rowKey
    const detectedColor = row.color ?? "Único"
    // "Único" significa color no determinable: siempre pide revisión.
    const normalizedColor = detectedColor.trim().toLowerCase()
    const needsReview =
      row.needsColorReview ||
      normalizedColor === "único" ||
      normalizedColor === "unico"
    variants[row.rowKey] = {
      rowKey: row.rowKey,
      sku: row.sku,
      excelName: row.name ?? row.sku,
      excelPrice: price,
      excelColor: detectedColor,
      basePrice: price,
      status: row.status,
      sheet: row.sheet,
      rowNumber: row.rowNumber,
      existingProductId: row.existing?.productId ?? null,
      existingName: row.existing?.name ?? null,
      existingCategories: row.existing ? [...row.existing.categories] : null,
      detail: row.detail ?? null,
      color: detectedColor,
      needsColorReview: needsReview,
    }
    let group = groupsByKey.get(key)
    if (!group) {
      const detectedName = row.productName ?? row.name ?? row.sku
      group = {
        id: `g-${slugify(key) || slugify(row.rowKey)}`,
        name: detectedName,
        excelName: detectedName,
        brandRaw: row.brand ?? "",
        categoryRaws: [...row.categories],
        productType: row.productType,
        variantKeys: [],
      }
      groupsByKey.set(key, group)
    }
    group.variantKeys.push(row.rowKey)
    for (const category of row.categories) {
      if (!group.categoryRaws.includes(category))
        group.categoryRaws.push(category)
    }
  }
  return { groups: [...groupsByKey.values()], variants }
}

export function groupVariants(
  group: WizardGroup,
  variants: Record<string, WizardVariant>,
): WizardVariant[] {
  return group.variantKeys.map((key) => variants[key])
}

/** Variantes con precio utilizable (las sin precio se omiten al importar). */
export function pricedVariants(
  group: WizardGroup,
  variants: Record<string, WizardVariant>,
): WizardVariant[] {
  return groupVariants(group, variants).filter(
    (variant) => Number.isFinite(variant.basePrice) && variant.basePrice > 0,
  )
}

/** Variantes que entran al plan: con precio y no omitidas por variante. */
export function importableVariants(
  group: WizardGroup,
  variants: Record<string, WizardVariant>,
  omittedVariants: OmissionMap,
): WizardVariant[] {
  return pricedVariants(group, variants).filter(
    (variant) => !isOmitted(omittedVariants, variant.rowKey),
  )
}

/**
 * Cascada del switch por producto (el switch es visual: manda lo que pase
 * con las variantes). Apagar un producto omite sus variantes; encenderlo
 * las incluye a todas.
 */
export function toggleProductOmissions(
  omittedProducts: OmissionMap,
  omittedVariants: OmissionMap,
  group: WizardGroup,
  omit: boolean,
): { omittedProducts: OmissionMap; omittedVariants: OmissionMap } {
  const nextProducts = { ...omittedProducts }
  const nextVariants = { ...omittedVariants }
  if (omit) {
    nextProducts[group.id] = true
    for (const key of group.variantKeys) nextVariants[key] = true
  } else {
    delete nextProducts[group.id]
    for (const key of group.variantKeys) delete nextVariants[key]
  }
  return { omittedProducts: nextProducts, omittedVariants: nextVariants }
}

/**
 * Cascada del switch por variante. Incluir una variante enciende el
 * producto; omitir la última incluida lo apaga.
 */
export function toggleVariantOmission(
  omittedProducts: OmissionMap,
  omittedVariants: OmissionMap,
  group: WizardGroup,
  rowKey: string,
  omit: boolean,
): { omittedProducts: OmissionMap; omittedVariants: OmissionMap } {
  const nextVariants = { ...omittedVariants }
  if (omit) nextVariants[rowKey] = true
  else delete nextVariants[rowKey]
  const nextProducts = { ...omittedProducts }
  if (omit) {
    const anyIncluded = group.variantKeys.some(
      (key) => !Object.hasOwn(nextVariants, key),
    )
    if (!anyIncluded) nextProducts[group.id] = true
  } else {
    delete nextProducts[group.id]
  }
  return { omittedProducts: nextProducts, omittedVariants: nextVariants }
}

/**
 * Producto en tienda al que se enlaza el grupo: basta con que alguna
 * variante esté registrada (las nuevas se agregan a ese producto, no crean
 * otro). Null si ninguna variante está registrada o si apuntan a varios
 * productos distintos (eso frena en el paso 1).
 */
export function groupLinkedProductId(
  group: WizardGroup,
  variants: Record<string, WizardVariant>,
): string | null {
  const ids = new Set<string>()
  for (const variant of groupVariants(group, variants)) {
    if (!variant.existingProductId) continue
    ids.add(variant.existingProductId)
  }
  return ids.size === 1 ? [...ids][0] : null
}

/**
 * Nombre registrado en tienda del producto enlazado al grupo.
 */
export function groupLinkedProductName(
  group: WizardGroup,
  variants: Record<string, WizardVariant>,
): string | null {
  const names = new Set<string>()
  for (const variant of groupVariants(group, variants)) {
    if (!variant.existingProductId || !variant.existingName) continue
    names.add(variant.existingName)
  }
  return names.size === 1 ? [...names][0] : null
}

/** Construye el plan JSON para POST /confirm-plan. Sin decisiones manuales:
 * lo registrado se reutiliza (MAP) y lo nuevo se crea con el nombre del
 * Excel (CREATE); lo omitido viaja como OMIT. Las variantes sin precio no
 * se envían. */
export function buildPlan(
  preview: InventoryPreview,
  omittedBrands: OmissionMap,
  omittedCategories: OmissionMap,
  omittedProducts: OmissionMap,
  omittedVariants: OmissionMap,
  state: WizardState,
): ImportPlanRequest {
  const products: ImportPlanProduct[] = []
  for (const group of state.groups) {
    if (isOmitted(omittedBrands, group.brandRaw)) continue
    if (isOmitted(omittedProducts, group.id)) continue
    if (group.variantKeys.length === 0) continue
    const categoryRaws = group.categoryRaws.filter(
      (raw) => !isOmitted(omittedCategories, raw),
    )
    const variants: ImportPlanVariant[] = importableVariants(
      group,
      state.variants,
      omittedVariants,
    ).map((variant) => ({
      sku: variant.sku,
      color: variant.color.trim(),
      price: variant.basePrice,
      mode: variant.existingProductId ? "REPLACE" : "CREATE",
    }))
    if (variants.length === 0) continue
    products.push({
      existingProductId: groupLinkedProductId(group, state.variants),
      name: group.name.trim(),
      brandRaw: group.brandRaw,
      categoryRaws,
      productType: group.productType,
      variants,
    })
  }
  return {
    brands: preview.brands.map((brand) => {
      if (isOmitted(omittedBrands, brand.rawName)) {
        return {
          rawName: brand.rawName,
          action: "OMIT" as const,
          brandId: null,
          finalName: null,
        }
      }
      return brand.suggestedBrandId
        ? {
            rawName: brand.rawName,
            action: "MAP" as const,
            brandId: brand.suggestedBrandId,
            finalName: null,
          }
        : {
            rawName: brand.rawName,
            action: "CREATE" as const,
            brandId: null,
            finalName: brand.rawName,
          }
    }),
    categories: preview.categories.map((category) => {
      if (isOmitted(omittedCategories, category.rawName)) {
        return {
          rawName: category.rawName,
          action: "OMIT" as const,
          categoryId: null,
          finalName: null,
        }
      }
      return category.suggestedCategoryId
        ? {
            rawName: category.rawName,
            action: "MAP" as const,
            categoryId: category.suggestedCategoryId,
            finalName: null,
          }
        : {
            rawName: category.rawName,
            action: "CREATE" as const,
            categoryId: null,
            finalName: category.rawName,
          }
    }),
    products,
  }
}

export interface PlanStats {
  brandsNew: number
  brandsExisting: number
  brandsOmitted: number
  categoriesNew: number
  categoriesExisting: number
  categoriesOmitted: number
  productsNew: number
  productsExisting: number
  productsOmitted: number
  variantsCreate: number
  variantsUpdate: number
  variantsOmitted: number
  variantsNoPrice: number
  errorRows: number
}

export function computeStats(
  preview: InventoryPreview,
  omittedBrands: OmissionMap,
  omittedCategories: OmissionMap,
  omittedProducts: OmissionMap,
  omittedVariants: OmissionMap,
  state: WizardState,
): PlanStats {
  const stats: PlanStats = {
    brandsNew: 0,
    brandsExisting: 0,
    brandsOmitted: 0,
    categoriesNew: 0,
    categoriesExisting: 0,
    categoriesOmitted: 0,
    productsNew: 0,
    productsExisting: 0,
    productsOmitted: 0,
    variantsCreate: 0,
    variantsUpdate: 0,
    variantsOmitted: 0,
    variantsNoPrice: 0,
    errorRows: 0,
  }
  for (const brand of preview.brands) {
    if (isOmitted(omittedBrands, brand.rawName)) stats.brandsOmitted++
    else if (brand.suggestedBrandId) stats.brandsExisting++
    else stats.brandsNew++
  }
  for (const category of preview.categories) {
    if (isOmitted(omittedCategories, category.rawName))
      stats.categoriesOmitted++
    else if (category.suggestedCategoryId) stats.categoriesExisting++
    else stats.categoriesNew++
  }
  for (const group of state.groups) {
    if (
      isOmitted(omittedBrands, group.brandRaw) ||
      isOmitted(omittedProducts, group.id)
    ) {
      stats.productsOmitted++
      stats.variantsOmitted += group.variantKeys.length
      continue
    }
    const pricedAll = pricedVariants(group, state.variants)
    const priced = pricedAll.filter(
      (variant) => !isOmitted(omittedVariants, variant.rowKey),
    )
    const pricedKeys = new Set(pricedAll.map((variant) => variant.rowKey))
    stats.variantsOmitted += group.variantKeys.filter((key) =>
      isOmitted(omittedVariants, key),
    ).length
    stats.variantsNoPrice += group.variantKeys.filter(
      (key) => !isOmitted(omittedVariants, key) && !pricedKeys.has(key),
    ).length
    if (priced.length === 0) {
      stats.productsOmitted++
      continue
    }
    if (groupLinkedProductId(group, state.variants)) stats.productsExisting++
    else stats.productsNew++
    for (const variant of priced) {
      if (variant.existingProductId) stats.variantsUpdate++
      else stats.variantsCreate++
    }
  }
  stats.errorRows = preview.rows.filter((row) => row.status === "ERROR").length
  return stats
}

/**
 * Separa categorías registradas vs. nuevas a agregar (comparación laxa).
 * Devuelve null cuando no se conocen las de tienda (producto nuevo): ahí
 * todo lo del Excel es nuevo y se muestra sin etiquetas.
 */
export function splitStoreAddedCategories(
  store: string[] | null,
  incoming: string[],
): { store: string[]; added: string[] } | null {
  if (store === null) return null
  const known = new Set(store.map((name) => name.trim().toLowerCase()))
  return {
    store: [...store],
    added: incoming.filter((name) => !known.has(name.trim().toLowerCase())),
  }
}

/** Clave difusa como la del backend: mayúsculas alfanuméricas sin separadores. */
function fuzzyKey(value: string): string {
  return value
    .trim()
    .replaceAll(/\s+/g, " ")
    .toUpperCase()
    .replaceAll(/[^A-Z0-9]/g, "")
}

/** Normalización laxa para comparar nombres (minúsculas, espacios simples). */
function looseNorm(value: string): string {
  return value.trim().toLowerCase().replaceAll(/\s+/g, " ")
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let current = i
    let next = 0
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      next = Math.min(prev[j] + 1, current + 1, prev[j - 1] + cost)
      prev[j - 1] = current
      current = next
    }
    prev[b.length] = current
  }
  return prev[b.length]
}

/**
 * Posible coincidencia (no exacta) de un nombre nuevo contra los ya
 * registrados: una contiene a la otra, o difieren en ≤2 letras. Devuelve el
 * nombre registrado o null.
 */
export function findNearMiss(
  raw: string,
  existingNames: string[],
): string | null {
  const a = looseNorm(raw)
  if (!a) return null
  for (const name of existingNames) {
    const b = looseNorm(name)
    if (!b || b === a) continue
    if (b.length >= 4 && a.length >= 4 && (a.includes(b) || b.includes(a))) {
      return name
    }
    if (a.length >= 6 && b.length >= 6 && levenshtein(a, b) <= 2) {
      return name
    }
  }
  return null
}

/** Color no determinado por el backend: se importa como «Único». */
export function isUnresolvedColor(color: string | null): boolean {
  if (!color) return true
  const norm = color
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
  return norm === "" || norm === "unico"
}

/** Marcador VARIOS: una referencia, varios colores (no se divide). */
export function isVariosColor(color: string | null): boolean {
  return (color ?? "").trim().toLowerCase() === "varios"
}

/** Color combinado con «/» (p. ej. CAFE/NEGRO). */
export function isCombinedColor(color: string | null): boolean {
  return (color ?? "").includes("/")
}

/**
 * Bloqueos que solo se resuelven corrigiendo el Excel (paso 1). Reglas:
 * - Los SKU nuevos se entienden como nuevos (variantes y productos).
 * - Los SKU que ya están en tienda deben coincidir sí o sí en marca y
 *   nombre de producto con el Excel.
 * - Sin SKU duplicados (ni con datos distintos ni idénticos), sin filas
 *   sin precio, sin duplicar color dentro de un mismo producto+marca,
 *   sin un producto en dos marcas.
 */
export function validatePreviewBlocking(rows: InventoryPreviewRow[]): string[] {
  const issues: string[] = []
  const usable = rows.filter((row) => row.status !== "ERROR")
  const detectedName = (row: InventoryPreviewRow): string =>
    (row.productName ?? row.name ?? row.sku).trim()
  const brandOf = (row: InventoryPreviewRow): string =>
    (row.brand ?? "").trim() || "Sin marca"
  const where = (row: InventoryPreviewRow): string =>
    `${row.sku} (${row.sheet} fila ${row.rowNumber})`

  // Mismo producto en dos marcas (caso borde A100 / excel 03).
  const byName = new Map<
    string,
    {
      display: string
      brands: Map<string, { label: string; rows: InventoryPreviewRow[] }>
    }
  >()
  for (const row of usable) {
    const name = detectedName(row)
    const fuzzy = fuzzyKey(name)
    if (!fuzzy) continue
    let entry = byName.get(fuzzy)
    if (!entry) {
      entry = { display: name, brands: new Map() }
      byName.set(fuzzy, entry)
    }
    const brandKey = fuzzyKey(row.brand ?? "")
    let bucket = entry.brands.get(brandKey)
    if (!bucket) {
      bucket = { label: brandOf(row), rows: [] }
      entry.brands.set(brandKey, bucket)
    }
    bucket.rows.push(row)
  }
  for (const entry of byName.values()) {
    if (entry.brands.size < 2) continue
    const buckets = [...entry.brands.values()]
    const first = buckets[0].rows[0]
    const second = buckets[1].rows[0]
    issues.push(
      `«${entry.display}» está en las marcas ${buckets[0].label} y ${buckets[1].label} a la vez (${where(second)}): un mismo producto no puede importarse con dos marcas. Corrige el Excel (${where(first)} y ${where(second)}) y vuelve a subirlo.`,
    )
  }

  // Mismo SKU con datos distintos entre filas/sedes: el backend fusiona y
  // gana la primera ocurrencia por orden de archivo. El wizard ni siquiera
  // muestra la otra ocurrencia completa: no hay con qué decidir.
  for (const row of usable) {
    if (row.detail && row.detail.includes("con datos distintos")) {
      const tail = row.detail.split(". Se aplican")[0]
      issues.push(
        `El SKU ${row.sku} aparece varias veces con datos distintos (${tail}). Corrige el Excel y vuelve a subirlo.`,
      )
    }
  }

  // SKU existentes que no coinciden en marca o nombre con la tienda.
  for (const row of usable) {
    const existing = row.existing
    if (!existing || !existing.productId) continue
    const excelBrand = (row.brand ?? "").trim()
    const storeBrand = (existing.brand ?? "").trim()
    if (
      excelBrand &&
      storeBrand &&
      fuzzyKey(excelBrand) !== fuzzyKey(storeBrand)
    ) {
      issues.push(
        `${where(row)}: la marca del Excel («${excelBrand}») no coincide con la registrada («${storeBrand}») para «${detectedName(row)}». Corrige el Excel (o la tienda) y vuelve a subirlo.`,
      )
    }
    const excelName = detectedName(row)
    const storeName = existing.name.trim()
    if (excelName && storeName && fuzzyKey(excelName) !== fuzzyKey(storeName)) {
      issues.push(
        `${where(row)}: el nombre («${excelName}», marca ${brandOf(row)}) no coincide con el registrado («${storeName}»). Corrige el Excel (o la tienda) y vuelve a subirlo.`,
      )
    }
  }

  // SKUs distintos con el mismo producto, marca y color: dos variantes
  // físicas no pueden compartir color dentro de un producto. (El color no
  // detectado «Único» no cuenta: no es un nombre de color.)
  const byColor = new Map<
    string,
    {
      display: string
      brand: string
      color: string
      rows: InventoryPreviewRow[]
    }
  >()
  for (const row of usable) {
    if (isUnresolvedColor(row.color)) continue
    const key = `${fuzzyKey(row.brand ?? "")}|${fuzzyKey(detectedName(row))}|${fuzzyKey(row.color ?? "")}`
    let entry = byColor.get(key)
    if (!entry) {
      entry = {
        display: detectedName(row),
        brand: brandOf(row),
        color: (row.color ?? "").trim(),
        rows: [],
      }
      byColor.set(key, entry)
    }
    entry.rows.push(row)
  }
  for (const entry of byColor.values()) {
    const skus = [...new Set(entry.rows.map((row) => row.sku))]
    if (skus.length < 2) continue
    const locs = entry.rows.map(where).join(" y ")
    issues.push(
      `«${entry.display}» (marca ${entry.brand}) tiene el color «${entry.color}» en ${skus.length} SKUs distintos (${locs}): dos variantes no pueden compartir color. Corrige el Excel y vuelve a subirlo.`,
    )
  }

  // Un mismo grupo del Excel (marca+nombre) apuntando a varios productos
  // distintos en tienda: la tienda trae el nombre duplicado y no hay a cuál
  // actualizar.
  const byGroup = new Map<
    string,
    {
      display: string
      brand: string
      products: Map<string, { storeName: string; rows: InventoryPreviewRow[] }>
    }
  >()
  for (const row of usable) {
    const existing = row.existing
    if (!existing || !existing.productId) continue
    const key = `${fuzzyKey(row.brand ?? "")}|${fuzzyKey(detectedName(row))}`
    let entry = byGroup.get(key)
    if (!entry) {
      entry = {
        display: detectedName(row),
        brand: brandOf(row),
        products: new Map(),
      }
      byGroup.set(key, entry)
    }
    let bucket = entry.products.get(existing.productId)
    if (!bucket) {
      bucket = { storeName: existing.name.trim() || "?", rows: [] }
      entry.products.set(existing.productId, bucket)
    }
    bucket.rows.push(row)
  }
  for (const entry of byGroup.values()) {
    if (entry.products.size < 2) continue
    const locs = [...entry.products.values()]
      .map((bucket) => where(bucket.rows[0]))
      .join(" y ")
    issues.push(
      `«${entry.display}» (marca ${entry.brand}) apunta a ${entry.products.size} productos distintos en tienda (${locs}): no hay a cuál actualizar. Corrige el Excel (o la tienda) y vuelve a subirlo.`,
    )
  }

  // Sin precio en el Excel (Cant=0 o no numérico): el wizard no edita
  // precios, así que no hay cómo importarlo.
  for (const row of usable) {
    if (row.basePrice != null) continue
    issues.push(
      `${where(row)}: «${detectedName(row)}» (marca ${brandOf(row)}) no trae precio en el Excel. Corrige el Excel y vuelve a subirlo.`,
    )
  }

  // Repetido idéntico entre sedes: el mismo SKU dos veces es un error del
  // archivo aunque los datos coincidan (se importa una sola vez y la copia
  // sobra).
  for (const row of usable) {
    if (row.detail && row.detail.includes("se importa una vez")) {
      issues.push(
        `${where(row)}: el SKU ${row.sku} está repetido en el archivo (${row.detail.charAt(0).toLowerCase()}${row.detail.slice(1)}). Corrige el Excel y vuelve a subirlo.`,
      )
    }
  }

  return issues.slice(0, 10)
}

/**
 * Avisos no bloqueantes del paso 1 (y de las tarjetas de producto): color
 * no detectado (se importa como «Único»), VARIOS, combinados con «/»,
 * sin categoría y errores auto-omitidos.
 */
export function validatePreviewWarnings(rows: InventoryPreviewRow[]): string[] {
  const warnings: string[] = []
  const usable = rows.filter((row) => row.status !== "ERROR")
  const detectedName = (row: InventoryPreviewRow): string =>
    (row.productName ?? row.name ?? row.sku).trim()
  const brandOf = (row: InventoryPreviewRow): string =>
    (row.brand ?? "").trim() || "Sin marca"
  const where = (row: InventoryPreviewRow): string =>
    `${row.sku} (${row.sheet} fila ${row.rowNumber})`

  const byKey = (
    select: (row: InventoryPreviewRow) => boolean,
  ): Map<
    string,
    { display: string; brand: string; rows: InventoryPreviewRow[] }
  > => {
    const groups = new Map<
      string,
      { display: string; brand: string; rows: InventoryPreviewRow[] }
    >()
    for (const row of usable) {
      if (!select(row)) continue
      const key = `${fuzzyKey(row.brand ?? "")}|${fuzzyKey(detectedName(row))}`
      let entry = groups.get(key)
      if (!entry) {
        entry = { display: detectedName(row), brand: brandOf(row), rows: [] }
        groups.set(key, entry)
      }
      entry.rows.push(row)
    }
    return groups
  }

  for (const entry of byKey((row) => isUnresolvedColor(row.color)).values()) {
    const locs = entry.rows.map(where).join(", ")
    const count =
      entry.rows.length === 1
        ? "una variante sin color"
        : `${entry.rows.length} variantes sin color`
    warnings.push(
      `COLOR SIN DETECTAR: «${entry.display}» (marca ${entry.brand}) trae ${count} (${locs}): se importará como «Único».`,
    )
  }
  for (const entry of byKey(
    (row) => !isUnresolvedColor(row.color) && isVariosColor(row.color),
  ).values()) {
    const locs = entry.rows.map(where).join(", ")
    warnings.push(
      `VARIOS: «${entry.display}» (marca ${entry.brand}) trae color VARIOS (${locs}): se importará tal cual como «Varios».`,
    )
  }
  for (const entry of byKey(
    (row) =>
      !isUnresolvedColor(row.color) &&
      !isVariosColor(row.color) &&
      isCombinedColor(row.color),
  ).values()) {
    const colors = [
      ...new Set(entry.rows.map((row) => (row.color ?? "").trim())),
    ].join(", ")
    const locs = entry.rows.map(where).join(", ")
    warnings.push(
      `COLOR COMBINADO: «${entry.display}» (marca ${entry.brand}) trae ${colors} (${locs}): se importará tal cual como «${colors}».`,
    )
  }
  for (const entry of byKey((row) => row.categories.length === 0).values()) {
    const locs = entry.rows.map(where).join(", ")
    warnings.push(
      `SIN CATEGORÍA: «${entry.display}» (marca ${entry.brand}) quedará sin categoría (${locs}).`,
    )
  }
  for (const row of rows) {
    if (row.status !== "ERROR") continue
    warnings.push(
      `ERROR: ${where(row)}: ${row.detail ?? "fila con error"} — se omitirá.`,
    )
  }

  return warnings.slice(0, 15)
}
