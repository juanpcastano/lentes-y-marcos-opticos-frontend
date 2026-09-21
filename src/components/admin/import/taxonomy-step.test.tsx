// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { OmitStep } from "#/components/admin/import/taxonomy-step"
import type { OmitCandidate } from "#/components/admin/import/taxonomy-step"

afterEach(cleanup)

function makeCandidates(count: number): OmitCandidate[] {
  return Array.from({ length: count }, (_, index) => ({
    rawName: `BRAND-${String(index).padStart(3, "0")}`,
    count: index + 1,
    suggestedName: null,
  }))
}

function renderStep(
  candidates: OmitCandidate[],
  existingNames: string[] = [],
  omitted: Record<string, true> = {},
) {
  const onToggle = vi.fn()
  render(
    <OmitStep
      itemLabel="marca"
      itemsLabel="marcas"
      unitLabel="productos"
      candidates={candidates}
      existingNames={existingNames}
      omitted={omitted}
      onToggle={onToggle}
      onIncludeAll={vi.fn()}
      onOmitAll={vi.fn()}
      nearMissHint={(name) => `Parece coincidir con ${name}`}
    />,
  )
  return onToggle
}

describe("OmitStep", () => {
  it("pagina la lista para no montar cientos de cards", () => {
    renderStep(makeCandidates(200))
    expect(screen.getByText("BRAND-000")).toBeDefined()
    expect(screen.getByText("BRAND-059")).toBeDefined()
    expect(screen.queryByText("BRAND-060")).toBeNull()
    fireEvent.click(screen.getByText(/Mostrar más/))
    expect(screen.getByText("BRAND-060")).toBeDefined()
  })

  it("separa registradas de nuevas", () => {
    renderStep([
      { rawName: "KAYROS", count: 2, suggestedName: "KAYROS" },
      { rawName: "NUEVA", count: 1, suggestedName: null },
    ])
    expect(screen.getByText("Registrada: KAYROS")).toBeDefined()
    expect(screen.getByText("NUEVA")).toBeDefined()
  })

  it("avisa la posible coincidencia en nuevas", () => {
    renderStep(
      [{ rawName: "MARCA DIFUSA 1", count: 2, suggestedName: null }],
      ["MARCA DIFUSA-1"],
    )
    expect(
      screen.getByText(/Parece coincidir con MARCA DIFUSA-1/),
    ).toBeDefined()
  })

  it("el switch omite e incluye", () => {
    const onToggle = renderStep([
      { rawName: "KAYROS", count: 2, suggestedName: "KAYROS" },
    ])
    const toggle = screen.getByRole("switch")
    fireEvent.click(toggle)
    expect(onToggle).toHaveBeenCalledWith("KAYROS", true)
  })
})
