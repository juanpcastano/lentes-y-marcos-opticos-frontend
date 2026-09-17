import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card"
import { Checkbox } from "#/components/ui/checkbox"
import { Field, FieldLabel } from "#/components/ui/field"
import { Input } from "#/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
import { Textarea } from "#/components/ui/textarea"
import { PRODUCT_TYPES } from "./types"
import type { ProductForm } from "./use-product-form"

/** Tarjeta "Información principal": nombre, marca, tipo, material, IVA, etc. */
export function ProductInfoCard({ form }: { form: ProductForm }) {
  const { input, brands, categories, updateField } = form
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información principal</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="product-name">Nombre</FieldLabel>
          <Input
            id="product-name"
            value={input.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="product-brand">Marca</FieldLabel>
          <Select
            value={input.brandId ?? "none"}
            onValueChange={(value) =>
              updateField("brandId", value === "none" ? null : value)
            }
          >
            <SelectTrigger id="product-brand" className="w-full">
              <SelectValue placeholder="Sin marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin marca</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="product-type">Tipo</FieldLabel>
          <Select
            value={input.productType}
            onValueChange={(value) => updateField("productType", value)}
          >
            <SelectTrigger id="product-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="product-material">Material</FieldLabel>
          <Input
            id="product-material"
            value={input.material}
            onChange={(e) => updateField("material", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="product-shape">Forma</FieldLabel>
          <Input
            id="product-shape"
            value={input.shape}
            onChange={(e) => updateField("shape", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="product-tax-rate">IVA (%)</FieldLabel>
          <Input
            id="product-tax-rate"
            type="number"
            value={input.taxRate ?? ""}
            onChange={(e) =>
              updateField(
                "taxRate",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="product-description">Descripción</FieldLabel>
          <Textarea
            id="product-description"
            className="min-h-28"
            value={input.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-medium">Categorías</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
              >
                <Checkbox
                  checked={input.categories.includes(category.name)}
                  onCheckedChange={(checked) =>
                    updateField(
                      "categories",
                      checked === true
                        ? [...input.categories, category.name]
                        : input.categories.filter(
                            (name) => name !== category.name,
                          ),
                    )
                  }
                />
                {category.name}
              </label>
            ))}
          </div>
        </fieldset>
      </CardContent>
    </Card>
  )
}
