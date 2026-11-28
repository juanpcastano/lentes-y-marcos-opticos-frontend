import { describe, expect, it } from "vitest"
import { QueryClient } from "@tanstack/react-query"
import { clearUserQueries } from "#/lib/query-client"

describe("clearUserQueries", () => {
  it("conserva la consulta de identidad y borra los datos de la cuenta", () => {
    const client = new QueryClient()
    client.setQueryData(["me"], { id: "usuario-a" })
    client.setQueryData(["softix-profile"], { firstName: "Ana" })
    client.setQueryData(["orders", {}], [])
    client.setQueryData(["notification-preferences"], {
      orderUpdates: true,
    })

    clearUserQueries(client)

    expect(client.getQueryData(["me"])).toEqual({ id: "usuario-a" })
    expect(client.getQueryData(["softix-profile"])).toBeUndefined()
    expect(client.getQueryData(["orders", {}])).toBeUndefined()
    expect(client.getQueryData(["notification-preferences"])).toBeUndefined()
  })
})
