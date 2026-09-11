import { z } from "zod"

export const adminProductsSearchSchema = z.object({
  q: z.string().optional(),
  brands: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  materials: z.array(z.string()).default([]),
  shapes: z.array(z.string()).default([]),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  active: z.enum(["true", "false"]).optional().catch(undefined),
  page: z.coerce.number().int().min(0).catch(0).optional(),
  sort: z
    .enum([
      "name,asc",
      "name,desc",
      "brand,asc",
      "brand,desc",
      "basePrice,asc",
      "basePrice,desc",
      "isActive,asc",
      "isActive,desc",
      "createdAt,asc",
      "createdAt,desc",
      "updatedAt,asc",
      "updatedAt,desc",
    ])
    .optional()
    .catch(undefined),
})

export type AdminProductsSearch = z.infer<typeof adminProductsSearchSchema>
