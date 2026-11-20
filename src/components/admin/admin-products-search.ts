import { z } from "zod"

export const adminProductsSearchSchema = z.object({
  q: z.string().optional(),
  brands: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  materials: z.array(z.string()).default([]),
  shapes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  statuses: z.array(z.enum(["ACTIVE", "INACTIVE", "HIDDEN"])).default([]),
  needsReview: z.boolean().optional(),
  page: z.coerce.number().int().min(0).catch(0).optional(),
  sort: z.string().optional(),
})

export type AdminProductsSearch = z.infer<typeof adminProductsSearchSchema>
