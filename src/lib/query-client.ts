import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
})

/**
 * Borra los datos cacheados de la sesión actual. Se conserva la consulta
 * ["me"] porque es la que determina si hay usuario autenticado; el resto se
 * vuelve a pedir con la nueva identidad.
 */
export function clearUserQueries(client: QueryClient = queryClient): void {
  client.removeQueries({
    predicate: (query) => query.queryKey[0] !== "me",
  })
}
