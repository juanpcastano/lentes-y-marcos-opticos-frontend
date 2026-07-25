import { useQuery } from "@tanstack/react-query"
import { createContext, useContext } from "react"
import { createMeQueryOptions, ME_QUERY_KEY } from "#/query-options/auth"
import type { User } from "#/services/auth"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery(createMeQueryOptions())

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
