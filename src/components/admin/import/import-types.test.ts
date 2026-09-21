import { describe, expect, it } from "vitest"
import {
  buildPlan,
  buildWizardState,
  computeStats,
  defaultOmittedBrands,
  defaultOmittedCategories,
  findNearMiss,
  groupLinkedProductId,
  isCombinedColor,
  isUnresolvedColor,
  isVariosColor,
  pricedVariants,
  splitStoreAddedCategories,
  toggleProductOmissions,
  toggleVariantOmission,
  validatePreviewBlocking,
  validatePreviewWarnings,
} from "#/components/admin/import/import-types"
import type { InventoryPreview } from "#/services/admin"

type PreviewRows = InventoryPreview["rows"]

const preview = {
  rows: [
    {
      rowKey: "SKU:M114",
      sheet: "SEDE 1",
      rowNumber: 2,
      sku: "M114",
      name: "KAYROS K2118 CAFE/NEGRO",
      brand: "KAYROS",
      categories: ["Hombre"],
      productType: "marco_optico",
      basePrice: 100000,
      status: "SIN_CAMBIOS",
      detail: null,
      existing: {
        name: "KAYROS K2118",
        basePrice: 100000,
        brand: "KAYROS",
        categories: ["Hombre"],
        productType: "marco_optico",
        productId: "prod-114",
      },
      suggestedAction: "NONE",
      productName: "KAYROS K2118",
      color: "CAFE/NEGRO",
      needsColorReview: true,
      groupKey: "B:KAYROS|P:KAYROSK2118",
    },
    {
      rowKey: "SKU:M97",
      sheet: "SEDE 2",
      rowNumber: 5,
      sku: "M97",
      name: "KAYROS K2118 CAFE",
      brand: "KAYROS",
      categories: ["Hombre"],
      productType: "marco_optico",
      basePrice: 100000,
      status: "SIN_CAMBIOS",
      detail: null,
      existing: {
        name: "KAYROS K2118",
        basePrice: 100000,
        brand: "KAYROS",
        categories: ["Hombre"],
        productType: "marco_optico",
        productId: "prod-114",
      },
      suggestedAction: "NONE",
      productName: "KAYROS K2118",
      color: "Cafe",
      needsColorReview: false,
      groupKey: "B:KAYROS|P:KAYROSK2118",
    },
    {
      rowKey: "SKU:M100",
      sheet: "SEDE 1",
      rowNumber: 3,
      sku: "M100",
      name: "WONDERTH 68043 NEGRO",
      brand: "WONDERTH",
      categories: ["Hombre"],
      productType: "marco_optico",
      basePrice: 130000,
      status: "SIN_CAMBIOS",
      detail: null,
      existing: {
        name: "WONDERTH 68043",
        basePrice: 130000,
        brand: "WONDERTH",
        categories: ["Hombre"],
        productType: "marco_optico",
        productId: "prod-100",
      },
      suggestedAction: "NONE",
      productName: "WONDERTH 68043",
      color: "Negro",
      needsColorReview: false,
      groupKey: "B:WONDERTH|P:WONDERTH68043",
    },
    {
      rowKey: "SKU:BAD",
      sheet: "SEDE 1",
      rowNumber: 9,
      sku: "BAD",
      name: null,
      brand: null,
      categories: [],
      productType: null,
      basePrice: null,
      status: "ERROR",
      detail: "Sin descripción",
      existing: null,
      suggestedAction: "SKIP",
      productName: null,
      color: "ÚNICO",
      needsColorReview: false,
      groupKey: null,
    },
  ],
  summary: {
    total: 4,
    nuevos: 0,
    actualizar: 0,
    sinCambios: 3,
    conflictos: 0,
    errores: 1,
  },
  brands: [
    {
      rawName: "KAYROS",
      count: 2,
      suggestedBrandId: "brand-kayros",
      suggestedBrandName: "KAYROS",
    },
    {
      rawName: "WONDERTH",
      count: 1,
      suggestedBrandId: null,
      suggestedBrandName: null,
    },
  ],
  categories: [
    {
      rawName: "Hombre",
      count: 3,
      suggestedCategoryId: "cat-hombre",
      suggestedCategoryName: "Hombre",
    },
  ],
  existingBrands: [{ id: "brand-kayros", name: "KAYROS" }],
  existingCategories: [{ id: "cat-hombre", name: "Hombre" }],
} as unknown as InventoryPreview

function linkedRow(
  sku: string,
  productName: string,
  brand: string,
  store: { name: string; brand: string; productId: string },
  rowNumber = 2,
): PreviewRows[number] {
  return {
    rowKey: `SKU:${sku}`,
    sheet: "SEDE 1",
    rowNumber,
    sku,
    name: `${productName} NEGRO`,
    brand,
    categories: ["Hombre"],
    productType: "marco_optico",
    basePrice: 100000,
    status: "ACTUALIZAR",
    detail: null,
    existing: {
      name: store.name,
      basePrice: 100000,
      brand: store.brand,
      categories: ["Hombre"],
      productType: "marco_optico",
      productId: store.productId,
    },
    suggestedAction: "UPDATE",
    productName,
    color: "Negro",
    needsColorReview: false,
    groupKey: `B:X|P:${productName}`,
  } as unknown as PreviewRows[number]
}

describe("import wizard", () => {
  it("agrupa por groupKey y excluye filas con error", () => {
    const state = buildWizardState(preview.rows)
    expect(state.groups).toHaveLength(2)
    const kayros = state.groups.find((group) => group.brandRaw === "KAYROS")
    expect(kayros?.variantKeys).toHaveLength(2)
    expect(kayros?.name).toBe("KAYROS K2118")
    expect(state.variants["SKU:BAD"]).toBeUndefined()
  })

  it("incluye todas las marcas y categorías por defecto", () => {
    expect(defaultOmittedBrands(preview)).toEqual({})
    expect(defaultOmittedCategories(preview)).toEqual({})
  })

  it("el plan reutiliza lo registrado, crea lo nuevo y omite", () => {
    const state = buildWizardState(preview.rows)
    const plan = buildPlan(preview, { WONDERTH: true }, {}, {}, {}, state)
    expect(plan.products).toHaveLength(1)
    expect(plan.products[0]?.existingProductId).toBe("prod-114")
    expect(plan.products[0]?.variants.map((variant) => variant.mode)).toEqual([
      "REPLACE",
      "REPLACE",
    ])
    expect(
      plan.brands.find((brand) => brand.rawName === "KAYROS"),
    ).toMatchObject({ action: "MAP", brandId: "brand-kayros" })
    expect(
      plan.brands.find((brand) => brand.rawName === "WONDERTH"),
    ).toMatchObject({ action: "OMIT" })
    expect(plan.categories[0]).toMatchObject({
      action: "MAP",
      categoryId: "cat-hombre",
    })
  })

  it("el plan excluye variantes sin precio", () => {
    const state = buildWizardState(preview.rows)
    state.variants["SKU:M114"] = {
      ...state.variants["SKU:M114"],
      basePrice: 0,
    }
    const plan = buildPlan(preview, {}, {}, {}, {}, state)
    const kayros = plan.products.find(
      (product) => product.name === "KAYROS K2118",
    )
    expect(kayros?.variants.map((variant) => variant.sku)).toEqual(["M97"])
  })

  it("separa categorías en tienda de las que se agregarán", () => {
    expect(splitStoreAddedCategories(null, ["Mujer"])).toBeNull()
    expect(splitStoreAddedCategories(["Hombre"], ["Hombre", "Mujer"])).toEqual({
      store: ["Hombre"],
      added: ["Mujer"],
    })
    expect(splitStoreAddedCategories(["Hombre"], ["hombre"])).toEqual({
      store: ["Hombre"],
      added: [],
    })
  })

  it("el wizard conserva las categorías registradas", () => {
    const state = buildWizardState(preview.rows)
    expect(state.variants["SKU:M114"].existingCategories).toEqual(["Hombre"])
  })

  it("la cascada producto/variante se sincroniza", () => {
    const state = buildWizardState(preview.rows)
    const group = state.groups.find((item) => item.variantKeys.length >= 2)
    expect(group).toBeDefined()
    if (!group) return
    const [first, second] = group.variantKeys

    // Apagar el producto omite sus variantes.
    let next = toggleProductOmissions({}, {}, group, true)
    expect(next.omittedProducts[group.id]).toBe(true)
    for (const key of group.variantKeys) {
      expect(next.omittedVariants[key]).toBe(true)
    }
    // Encender el producto las incluye a todas.
    next = toggleProductOmissions(
      next.omittedProducts,
      next.omittedVariants,
      group,
      false,
    )
    expect(next).toEqual({ omittedProducts: {}, omittedVariants: {} })

    // Omitir una variante no apaga el producto; omitir la última sí.
    next = toggleVariantOmission({}, {}, group, first, true)
    expect(next.omittedProducts[group.id]).toBeUndefined()
    next = toggleVariantOmission(
      next.omittedProducts,
      next.omittedVariants,
      group,
      second,
      true,
    )
    expect(next.omittedProducts[group.id]).toBe(true)
    // Incluir una variante enciende el producto.
    next = toggleVariantOmission(
      next.omittedProducts,
      next.omittedVariants,
      group,
      first,
      false,
    )
    expect(next.omittedProducts[group.id]).toBeUndefined()
    expect(next.omittedVariants[first]).toBeUndefined()
    expect(next.omittedVariants[second]).toBe(true)
  })

  it("el plan excluye variantes omitidas por variante", () => {
    const state = buildWizardState(preview.rows)
    const plan = buildPlan(preview, {}, {}, {}, { "SKU:M114": true }, state)
    const kayros = plan.products.find(
      (product) => product.name === "KAYROS K2118",
    )
    expect(kayros?.variants.map((variant) => variant.sku)).toEqual(["M97"])
    const stats = computeStats(preview, {}, {}, {}, { "SKU:M114": true }, state)
    expect(stats).toMatchObject({ variantsUpdate: 2, variantsOmitted: 1 })
  })

  it("calcula el resumen", () => {
    const state = buildWizardState(preview.rows)
    const stats = computeStats(preview, { WONDERTH: true }, {}, {}, {}, state)
    expect(stats).toMatchObject({
      brandsExisting: 1,
      brandsNew: 0,
      brandsOmitted: 1,
      categoriesExisting: 1,
      productsNew: 0,
      productsExisting: 1,
      productsOmitted: 1,
      variantsUpdate: 2,
      variantsCreate: 0,
      variantsOmitted: 1,
      variantsNoPrice: 0,
      errorRows: 1,
    })
  })

  it("el preview sano no bloquea el paso 1", () => {
    expect(validatePreviewBlocking(preview.rows)).toEqual([])
  })

  it("bloquea el mismo producto en dos marcas", () => {
    const rows = [
      linkedRow("T1-001", "Producto A100 para agrupar", "MARCA BASE 1", {
        name: "Producto A100 para agrupar",
        brand: "MARCA BASE 1",
        productId: "prod-a100",
      }),
      linkedRow(
        "T1-002",
        "Producto A100 para agrupar",
        "MARCA BASE 2",
        {
          name: "Producto A100 para agrupar",
          brand: "MARCA BASE 1",
          productId: "prod-a100",
        },
        3,
      ),
    ]
    const blockers = validatePreviewBlocking(rows)
    expect(
      blockers.some(
        (issue) => issue.includes("dos marcas") && issue.includes("T1-002"),
      ),
    ).toBe(true)
  })

  it("bloquea el SKU fusionado con datos distintos", () => {
    const rows = [
      {
        rowKey: "SKU:T1-003",
        sheet: "SEDE 1",
        rowNumber: 4,
        sku: "T1-003",
        name: "Producto A200 AZUL OSCURO",
        brand: "MARCA BASE 1",
        categories: ["Hombre"],
        productType: "marco_optico",
        basePrice: 125000,
        status: "CONFLICTO",
        detail:
          "El SKU aparece 2 veces con datos distintos (SEDE 1 fila 4: precio 125000; SEDE 2 fila 2: precio 110000). Se aplican los datos de SEDE 1 fila 4",
        existing: null,
        suggestedAction: "DECIDE",
        productName: "Producto A200",
        color: "Azul Oscuro",
        needsColorReview: false,
        groupKey: "B:X|P:Y",
      },
    ] as unknown as PreviewRows
    const blockers = validatePreviewBlocking(rows)
    expect(blockers).toHaveLength(1)
    expect(blockers[0]).toContain("T1-003")
    expect(blockers[0]).toContain("Corrige el Excel")
  })

  it("bloquea SKU existente con otro nombre en el Excel", () => {
    const rows = [
      linkedRow("T1-023", "Producto D101 renombrado", "MARCA BASE 4", {
        name: "Producto D100 para agrupar",
        brand: "MARCA BASE 4",
        productId: "prod-d100",
      }),
    ]
    const blockers = validatePreviewBlocking(rows)
    expect(blockers).toHaveLength(1)
    expect(blockers[0]).toContain("T1-023")
    expect(blockers[0]).toContain("no coincide con el registrado")
  })

  it("bloquea SKU existente con otra marca en el Excel", () => {
    const rows = [
      linkedRow("T1-013", "Producto B400", "MARCA BASE 9", {
        name: "Producto B400",
        brand: "MARCA BASE 2",
        productId: "prod-b400",
      }),
    ]
    const blockers = validatePreviewBlocking(rows)
    expect(blockers).toHaveLength(1)
    expect(blockers[0]).toContain("T1-013")
    expect(blockers[0]).toContain("MARCA BASE 9")
    expect(blockers[0]).toContain("MARCA BASE 2")
  })

  it("bloquea SKUs distintos con mismo producto, marca y color", () => {
    const base = {
      sheet: "SEDE 1",
      brand: "MARCA BASE 1",
      categories: ["Hombre"],
      productType: "marco_optico",
      basePrice: 100000,
      status: "NUEVO",
      detail: null,
      existing: null,
      suggestedAction: "CREATE",
      productName: "Producto W100",
      color: "Negro",
      needsColorReview: false,
    } as const
    const rows = [
      {
        ...base,
        rowKey: "SKU:T4-001",
        rowNumber: 2,
        sku: "T4-001",
        name: "Producto W100 NEGRO",
      },
      {
        ...base,
        rowKey: "SKU:T4-002",
        rowNumber: 3,
        sku: "T4-002",
        name: "Producto W100 NEGRO",
      },
    ] as unknown as PreviewRows
    const blockers = validatePreviewBlocking(rows)
    expect(blockers).toHaveLength(1)
    expect(blockers[0]).toContain("T4-001")
    expect(blockers[0]).toContain("T4-002")
    expect(blockers[0]).toContain("compartir color")
  })

  it("el color sin detectar no dispara el bloqueo de color duplicado", () => {
    const base = {
      sheet: "SEDE 1",
      brand: "X",
      categories: ["Hombre"],
      productType: "marco_optico",
      basePrice: 100000,
      status: "NUEVO",
      detail: null,
      existing: null,
      suggestedAction: "CREATE",
      productName: "Producto Raro",
      color: "ÚNICO",
      needsColorReview: true,
    } as const
    const rows = [
      {
        ...base,
        rowKey: "SKU:R1",
        rowNumber: 2,
        sku: "R1",
        name: "Producto Raro XYZ",
      },
      {
        ...base,
        rowKey: "SKU:R2",
        rowNumber: 3,
        sku: "R2",
        name: "Producto Raro QWE",
      },
    ] as unknown as PreviewRows
    expect(validatePreviewBlocking(rows)).toEqual([])
  })

  it("bloquea un grupo del Excel hacia varios productos en tienda", () => {
    const rows = [
      linkedRow("T5-001", "Producto Duplicado", "X", {
        name: "Producto Duplicado",
        brand: "X",
        productId: "prod-1",
      }),
      linkedRow(
        "T5-002",
        "Producto Duplicado",
        "X",
        {
          name: "Producto Duplicado",
          brand: "X",
          productId: "prod-2",
        },
        3,
      ),
    ]
    // Nombres y marcas coinciden: el enlace múltiple bloquea (y también el
    // color duplicado entre SKUs distintos: dos bloqueos, misma causa).
    const blockers = validatePreviewBlocking(rows)
    expect(blockers).toHaveLength(2)
    expect(
      blockers.some((issue) => issue.includes("2 productos distintos")),
    ).toBe(true)
  })

  it("las filas con error no bloquean (se omiten solas)", () => {
    const errorRow = preview.rows.find((row) => row.status === "ERROR")
    expect(validatePreviewBlocking([errorRow!])).toEqual([])
  })

  it("bloquea filas sin precio", () => {
    const rows = [
      {
        rowKey: "SKU:P0",
        sheet: "SEDE 1",
        rowNumber: 5,
        sku: "P0",
        name: "Producto Barato NEGRO",
        brand: "X",
        categories: ["Hombre"],
        productType: "marco_optico",
        basePrice: null,
        status: "NUEVO",
        detail: "Sin precio en el Excel",
        existing: null,
        suggestedAction: "CREATE",
        productName: "Producto Barato",
        color: "Negro",
        needsColorReview: false,
        groupKey: "B:X|P:Q",
      },
    ] as unknown as PreviewRows
    const blockers = validatePreviewBlocking(rows)
    expect(blockers).toHaveLength(1)
    expect(blockers[0]).toContain("P0")
    expect(blockers[0]).toContain("no trae precio")
  })

  it("bloquea el SKU repetido idéntico entre sedes", () => {
    const rows = [
      {
        rowKey: "SKU:R1",
        sheet: "SEDE 1",
        rowNumber: 6,
        sku: "R1",
        name: "Producto Repetido ROJO",
        brand: "X",
        categories: ["Hombre"],
        productType: "marco_optico",
        basePrice: 107000,
        status: "SIN_CAMBIOS",
        detail:
          "Repetido en SEDE 1, SEDE 2 con los mismos datos: se importa una vez",
        existing: null,
        suggestedAction: "CREATE",
        productName: "Producto Repetido",
        color: "Rojo",
        needsColorReview: false,
        groupKey: "B:X|P:R",
      },
    ] as unknown as PreviewRows
    const blockers = validatePreviewBlocking(rows)
    expect(blockers).toHaveLength(1)
    expect(blockers[0]).toContain("R1")
    expect(blockers[0]).toContain("repetido")
  })

  it("emite advertencias sin bloquear", () => {
    const rows = [
      {
        rowKey: "SKU:U1",
        sheet: "SEDE 1",
        rowNumber: 2,
        sku: "U1",
        name: "Producto Raro XYZW",
        brand: "X",
        categories: [],
        productType: "marco_optico",
        basePrice: 50000,
        status: "NUEVO",
        detail: null,
        existing: null,
        suggestedAction: "CREATE",
        productName: "Producto Raro XYZW",
        color: "ÚNICO",
        needsColorReview: true,
        groupKey: "B:X|P:Y",
      },
      {
        rowKey: "SKU:V1",
        sheet: "SEDE 1",
        rowNumber: 3,
        sku: "V1",
        name: "Producto Mixto VARIOS",
        brand: "X",
        categories: ["Hombre"],
        productType: "marco_optico",
        basePrice: 60000,
        status: "NUEVO",
        detail: null,
        existing: null,
        suggestedAction: "CREATE",
        productName: "Producto Mixto",
        color: "VARIOS",
        needsColorReview: true,
        groupKey: "B:X|P:Z",
      },
      {
        rowKey: "SKU:C1",
        sheet: "SEDE 1",
        rowNumber: 4,
        sku: "C1",
        name: "Producto Duo CAFE/NEGRO",
        brand: "X",
        categories: ["Hombre"],
        productType: "marco_optico",
        basePrice: 70000,
        status: "NUEVO",
        detail: null,
        existing: null,
        suggestedAction: "CREATE",
        productName: "Producto Duo",
        color: "CAFE/NEGRO",
        needsColorReview: true,
        groupKey: "B:X|P:W",
      },
    ] as unknown as PreviewRows
    const warnings = validatePreviewWarnings(rows)
    expect(warnings.some((w) => w.includes("SIN DETECTAR"))).toBe(true)
    expect(warnings.some((w) => w.includes("VARIOS"))).toBe(true)
    expect(warnings.some((w) => w.includes("COMBINADO"))).toBe(true)
    expect(warnings.some((w) => w.includes("SIN CATEGORÍA"))).toBe(true)
    expect(validatePreviewBlocking(rows)).toEqual([])
  })

  it("detecta posibles coincidencias sin exigir igualdad", () => {
    expect(findNearMiss("MARCA DIFUSA 1", ["MARCA DIFUSA-1"])).toBe(
      "MARCA DIFUSA-1",
    )
    expect(findNearMiss("KAYROS", ["KAYROS"])).toBeNull()
    expect(findNearMiss("LUNA", ["SOL"])).toBeNull()
    expect(findNearMiss("", ["SOL"])).toBeNull()
  })

  it("clasifica colores para los avisos", () => {
    expect(isUnresolvedColor("ÚNICO")).toBe(true)
    expect(isUnresolvedColor("Único")).toBe(true)
    expect(isUnresolvedColor(null)).toBe(true)
    expect(isUnresolvedColor("Negro")).toBe(false)
    expect(isVariosColor("VARIOS")).toBe(true)
    expect(isVariosColor("Varios")).toBe(true)
    expect(isVariosColor("Negro")).toBe(false)
    expect(isCombinedColor("CAFE/NEGRO")).toBe(true)
    expect(isCombinedColor("Negro")).toBe(false)
  })

  it("enlaza el producto compartido y filtra sin precio", () => {
    const state = buildWizardState(preview.rows)
    const kayros = state.groups.find((group) => group.brandRaw === "KAYROS")
    if (!kayros) throw new Error("fixture sin grupo KAYROS")
    expect(groupLinkedProductId(kayros, state.variants)).toBe("prod-114")
    expect(pricedVariants(kayros, state.variants)).toHaveLength(2)
  })

  it("el grupo mixto (variante nueva + actualizadas) actualiza el registrado", () => {
    const state = buildWizardState(preview.rows)
    const kayros = state.groups.find((group) => group.brandRaw === "KAYROS")
    if (!kayros) throw new Error("fixture sin grupo KAYROS")
    // Simula una variante nueva dentro del mismo producto registrado.
    const key = kayros.variantKeys[0]
    state.variants[key] = {
      ...state.variants[key],
      status: "NUEVO",
      existingProductId: null,
      existingName: null,
      existingCategories: null,
    }
    expect(groupLinkedProductId(kayros, state.variants)).toBe("prod-114")
    const plan = buildPlan(preview, {}, {}, {}, {}, state)
    expect(
      plan.products.find((product) => product.name === "KAYROS K2118")
        ?.existingProductId,
    ).toBe("prod-114")
  })
})
