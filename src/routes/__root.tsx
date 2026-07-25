import {
  Outlet,
  createRootRouteWithContext,
  useNavigate,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient} from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"

import "../styles.css"
import { ThemeProvider } from "#/components/theme-provider"
import { TooltipProvider } from "#/components/ui/tooltip"
import { AuthProvider } from "#/components/auth-provider"
import { queryClient } from "#/lib/query-client"
import { ME_QUERY_KEY } from "#/query-options/auth"

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const navigate = useNavigate()

  useEffect(() => {
    const redirect = sessionStorage.getItem("auth_redirect")
    if (redirect) {
      sessionStorage.removeItem("auth_redirect")
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
      navigate({ to: redirect })
    }
  }, [navigate])

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="system">
            <TooltipProvider>
              <Outlet />
              <TanStackDevtools
                config={{
                  position: "bottom-right",
                }}
                plugins={[
                  {
                    name: "TanStack Router",
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  )
}
