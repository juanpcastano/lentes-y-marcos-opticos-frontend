import { SignupForm } from "#/components/signup-form"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const signupSearchSchema = z.object({
  redirect: z.string().default("/"),
})

export const Route = createFileRoute("/signup")({
  validateSearch: signupSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = Route.useSearch()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm redirect={redirect} />
      </div>
    </div>
  )
}
