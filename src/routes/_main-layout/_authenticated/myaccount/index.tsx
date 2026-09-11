import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_main-layout/_authenticated/myaccount/")(
  {
    beforeLoad: () => {
      throw redirect({ to: "/myaccount/profile" })
    },
  },
)
