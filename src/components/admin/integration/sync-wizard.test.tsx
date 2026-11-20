// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SyncWizard } from "#/components/admin/integration/sync-wizard"
import type * as AdminServices from "#/services/admin"
import { fetchSoftixConnection, fetchSoftixSyncPreview } from "#/services/admin"

vi.mock("#/services/admin", async (importOriginal) => {
  const actual = await importOriginal<typeof AdminServices>()
  return {
    ...actual,
    fetchSoftixConnection: vi.fn(),
    fetchSoftixSyncPreview: vi.fn(),
  }
})

function renderWizard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <SyncWizard onViewLogs={() => {}} />
    </QueryClientProvider>,
  )
}

describe("SyncWizard", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("no permite avanzar si Softix no está conectado", async () => {
    vi.mocked(fetchSoftixConnection).mockResolvedValue({
      connected: false,
      message: "No fue posible comunicarse con Softix",
      checkedAt: "2026-11-20T10:00:00",
    })

    renderWizard()

    expect(
      await screen.findByText("No fue posible comunicarse con Softix"),
    ).toBeTruthy()
    const next = screen.getByRole("button", { name: "Siguiente" })
    expect((next as HTMLButtonElement).disabled).toBe(true)
  })

  it("muestra la vista previa con los cambios que se aplicarían", async () => {
    vi.mocked(fetchSoftixConnection).mockResolvedValue({
      connected: true,
      message: "Conexión correcta con Softix",
      checkedAt: "2026-11-20T10:00:00",
    })
    vi.mocked(fetchSoftixSyncPreview).mockResolvedValue({
      updated: 120,
      hidden: 2,
      errors: 1,
      stockChanged: 40,
      priceChanged: 7,
      issues: [],
    })

    renderWizard()

    const next = await screen.findByRole("button", { name: "Siguiente" })
    await waitFor(() =>
      expect((next as HTMLButtonElement).disabled).toBe(false),
    )
    fireEvent.click(next)

    expect(await screen.findByText("Cambios de stock")).toBeTruthy()
    expect(screen.getByText("40")).toBeTruthy()
    expect(screen.getByText("Cambios de precio")).toBeTruthy()
    expect(
      screen.getByText(
        "2 productos dejarán de mostrarse porque ya no aparecen en Softix.",
      ),
    ).toBeTruthy()
  })
})
