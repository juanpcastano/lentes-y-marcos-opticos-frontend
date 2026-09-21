import { describe, expect, it } from "vitest"
import { formatChangeLines } from "#/components/admin/import/products-step"

describe("formatChangeLines", () => {
  it("separa un renglón por aspecto y formatea precios", () => {
    expect(formatChangeLines("Se actualizará: precio 135000 → 115000")).toEqual(
      ["precio $135.000 → $115.000"],
    )
    expect(
      formatChangeLines(
        "Se actualizará: precio 98000 → 95000; categorías [Hombre] → [Hombre, Mujer]; tipo marco_optico → gafa_sol",
      ),
    ).toEqual([
      "precio $98.000 → $95.000",
      "categorías [Hombre] → [Hombre, Mujer]",
      "tipo marco_optico → gafa_sol",
    ])
  })

  it("ignora notas previas al marcador", () => {
    expect(
      formatChangeLines(
        "Repetido en SEDE 1, SEDE 2 con los mismos datos. Se actualizará: precio 100000 → 90000",
      ),
    ).toEqual(["precio $100.000 → $90.000"])
  })
})
