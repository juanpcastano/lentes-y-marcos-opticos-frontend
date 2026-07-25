import { Mail, Phone, User } from "lucide-react"
import type { User as AuthUser } from "#/services/auth"
import { Card, CardContent } from "#/components/ui/card"

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-base font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-base text-foreground">{value || "—"}</span>
      </div>
    </div>
  )
}

export function PersonalInfoRead({ user }: { user: AuthUser }) {
  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="size-5" />
          <h2 className="text-lg font-semibold">Información Personal</h2>
        </div>
        <div className="flex flex-col gap-4">
          <InfoRow
            icon={<User className="size-4 text-muted-foreground" />}
            label="Nombre"
            value={user.name}
          />
          <InfoRow
            icon={<Mail className="size-4 text-muted-foreground" />}
            label="Email"
            value={user.email}
          />
          <InfoRow
            icon={<Phone className="size-4 text-muted-foreground" />}
            label="Teléfono"
            value={user.phone}
          />
        </div>
      </CardContent>
    </Card>
  )
}
