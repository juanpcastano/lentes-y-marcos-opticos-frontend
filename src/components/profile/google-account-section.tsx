import { useEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Chrome } from "lucide-react"
import type { User } from "#/services/auth"
import {
  linkGoogle,
  unlinkGoogle,
  GOOGLE_CLIENT_ID_VALUE,
  isGoogleReady,
} from "#/services/auth"
import { ME_QUERY_KEY } from "#/query-options/auth"
import { Button } from "#/components/ui/button"
import { Card, CardContent } from "#/components/ui/card"
import { FieldDescription, FieldGroup } from "#/components/ui/field"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#/components/ui/tooltip"
import { ApiError } from "#/lib/api"

interface GoogleAccountSectionProps {
  user: User
}

export function GoogleAccountSection({ user }: GoogleAccountSectionProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState("")
  const [unlinkOpen, setUnlinkOpen] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)

  const linkMutation = useMutation({
    mutationFn: (idToken: string) => linkGoogle(idToken),
    onSuccess: () => {
      setError("")
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 409) {
        setError("Esta cuenta de Google ya está vinculada a otro usuario")
      } else if (e instanceof ApiError && e.status === 400) {
        setError(e.message)
      } else {
        setError("No se pudo vincular Google. Intenta de nuevo.")
      }
    },
  })

  const unlinkMutation = useMutation({
    mutationFn: () => unlinkGoogle(),
    onSuccess: () => {
      setError("")
      setUnlinkOpen(false)
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
    },
    onError: () => setError("No se pudo desvincular Google. Intenta de nuevo."),
  })

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID_VALUE || user.hasGoogle) return

    const initGoogle = () => {
      if (!isGoogleReady() || !googleButtonRef.current) return
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID_VALUE,
        callback: (response) => {
          if (response.credential) {
            linkMutation.mutate(response.credential)
          }
        },
      })
      window.google!.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
      })
    }

    if (isGoogleReady()) {
      initGoogle()
      return
    }

    const timer = window.setInterval(() => {
      if (isGoogleReady()) {
        window.clearInterval(timer)
        initGoogle()
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [user.hasGoogle])

  const handleLinkGoogle = () => {
    const btn = googleButtonRef.current?.querySelector<HTMLElement>(
      'div[role="button"]',
    )
    btn?.click()
  }

  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Chrome className="size-5" />
          <h2 className="text-lg font-semibold">Google</h2>
        </div>

        <FieldGroup>
          {!user.hasGoogle && (
            <>
              <FieldDescription>
                Vincula tu cuenta de Google para iniciar sesión más rápido.
              </FieldDescription>
              <Button
                variant="outline"
                type="button"
                onClick={handleLinkGoogle}
                disabled={linkMutation.isPending}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                {linkMutation.isPending ? "Vinculando..." : "Vincular Google"}
              </Button>
              <div
                ref={googleButtonRef}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  top: "0",
                  width: "1px",
                  height: "1px",
                  overflow: "hidden",
                }}
              />
            </>
          )}

          {user.hasGoogle && user.hasPassword && (
            <>
              <FieldDescription>
                Tu cuenta está vinculada a Google.
              </FieldDescription>
              <Dialog open={unlinkOpen} onOpenChange={setUnlinkOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" type="button">
                    Desvincular Google
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Desvincular Google</DialogTitle>
                    <DialogDescription>
                      ¿Estás seguro? Ya no podrás iniciar sesión con tu cuenta
                      de Google. Siempre podrás vincularla de nuevo.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => unlinkMutation.mutate()}
                      disabled={unlinkMutation.isPending}
                    >
                      {unlinkMutation.isPending
                        ? "Desvinculando..."
                        : "Sí, desvincular"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          {user.hasGoogle && !user.hasPassword && (
            <>
              <FieldDescription>Tu cuenta está vinculada a Google.</FieldDescription>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-block">
                    <Button variant="outline" type="button" disabled>
                      Desvincular Google
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  Al ser tu única forma de autenticación, no puedes desvincular
                  Google porque perderías acceso a tu cuenta
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {error && (
            <FieldDescription className="text-destructive">
              {error}
            </FieldDescription>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
