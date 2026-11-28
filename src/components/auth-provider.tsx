import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createContext, useContext, useEffect, useRef } from "react"
import { createMeQueryOptions, ME_QUERY_KEY } from "#/query-options/auth"
import { CART_QUERY_KEY } from "#/query-options/cart"
import { clearUserQueries } from "#/lib/query-client"
import { clearCart } from "#/services/cart"
import type { User } from "#/services/auth"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery(createMeQueryOptions())
  const queryClient = useQueryClient()
  const previousUserId = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    if (isLoading) return

    const currentUserId = user?.id ?? null
    if (previousUserId.current === undefined) {
      previousUserId.current = currentUserId
      return
    }

    if (previousUserId.current !== currentUserId) {
      previousUserId.current = currentUserId
      clearUserQueries(queryClient)
      void clearCart().then((cart) => {
        queryClient.setQueryData(CART_QUERY_KEY, cart)
      })
    }
  }, [isLoading, queryClient, user?.id])

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { ME_QUERY_KEY }
