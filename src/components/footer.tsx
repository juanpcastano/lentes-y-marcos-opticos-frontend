import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { enterpriseData, socialLinks } from "#/components/contact-dialog"

const Footer = () => {
  return (
    <footer className="bg-sidebar border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid  grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4 flex-col flex items-center">
            <h3 className="text-xl font-semibold text-sidebar-foreground">
              {enterpriseData.name}
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-6 shrink-0 text-sidebar-foreground" />
                <span>{enterpriseData.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-6 shrink-0 text-sidebar-foreground" />
                <span>{enterpriseData.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-6 shrink-0 text-sidebar-foreground" />
                <span>{enterpriseData.email}</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="size-6 shrink-0 text-sidebar-foreground" />
                <span>{enterpriseData.hours}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4 flex-col flex items-center">
            <h3 className="text-xl font-semibold text-sidebar-foreground">
              Síguenos
            </h3>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="inline-flex items-center justify-center rounded-md p-2 text-sidebar-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="size-10" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {enterpriseData.name}. Todos los
          derechos reservados.
        </div>
      </div>
    </footer>
  )
}

export default Footer
