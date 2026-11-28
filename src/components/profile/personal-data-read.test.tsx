// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { PersonalDataRead } from "#/components/profile/personal-data-read"
import type { SoftixProfile } from "#/services/softix"

const user = {
  id: "3f0f0a4a-5c8b-4f2a-9d4e-6a7b8c9d0e1f",
  phone: "+573001234567",
  phoneVerified: true,
  softixLinked: true,
  isAdmin: false,
}

function profile(nextEditAllowedAt: string | null): SoftixProfile {
  return {
    documentType: "CC",
    maskedDocumentId: "******4567",
    firstName: "Ana",
    middleName: null,
    lastName: "Pérez",
    secondLastName: null,
    email: "ana@example.com",
    birthDate: "1990-01-02",
    gender: "Femenino",
    city: "76",
    locality: "001",
    postalCode: "",
    maritalStatus: "",
    occupation: "",
    nextEditAllowedAt,
  }
}

function inDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 19)
}

afterEach(cleanup)

describe("PersonalDataRead", () => {
  it("muestra la fecha de la próxima edición durante el cooldown", () => {
    render(<PersonalDataRead user={user} profile={profile(inDays(7))} />)

    expect(
      screen.getByText(/Podrás volver a editar tus datos el/),
    ).not.toBeNull()
  })

  it("no muestra avisos cuando no hay cooldown activo", () => {
    render(<PersonalDataRead user={user} profile={profile(null)} />)

    expect(screen.queryByText(/Podrás volver a editar tus datos el/)).toBeNull()
    expect(document.body.textContent).not.toContain(
      "Para cambiar tu documento o celular",
    )
  })
})
