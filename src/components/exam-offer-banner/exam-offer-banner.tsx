import { Link } from "@tanstack/react-router"
import { CalendarDays } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Image } from "#/components/ui/image"

const BANNER_DATA = {
  headline: "Tu Examen de la Vista es 100% Bonificado",
  description:
    "Por la compra de tus cristales graduados, el examen profesional corre por nuestra cuenta. Tecnologia computarizada de ultima generacion.",
  ctaText: "Reservar Mi Turno",
  ctaLink: "/apointments",
  imageUrl:
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
  imageAlt: "Sala de examen visual con tecnologia computarizada",
}

export function ExamOfferBanner() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 p-8">
      {/* Left column — text content */}
      <div className="flex flex-col justify-center gap-6 bg-primary rounded-t-xl md:rounded-l-xl md:rounded-tr-none p-6 text-primary-foreground md:p-10 lg:p-16">
        <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl">
          {BANNER_DATA.headline}
        </h2>
        <p className="text-sm leading-relaxed text-primary-foreground/90 md:text-base">
          {BANNER_DATA.description}
        </p>
        <Button variant="secondary" asChild className="w-fit gap-2">
          <Link to={BANNER_DATA.ctaLink}>
            <CalendarDays className="size-4" />
            {BANNER_DATA.ctaText}
          </Link>
        </Button>
      </div>

      {/* Right column — promotional image */}
      <div className="overflow-hidden">
        <Image
          src={BANNER_DATA.imageUrl}
          alt={BANNER_DATA.imageAlt}
          containerClassName="aspect-[4/3] w-full md:h-full rounded-b-xl md:rounded-r-xl md:rounded-bl-none"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  )
}
