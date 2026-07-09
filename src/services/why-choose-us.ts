import type { WhyChooseUsData } from "#/components/why-choose-us/types"

export async function fetchWhyChooseUs(): Promise<WhyChooseUsData> {
  return {
    imageUrl:
      "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=800&q=80",
    title: "Tu Visión, Nuestra Prioridad Técnica",
    features: [
      {
        icon: "ScanEye",
        title: "Tecnología de Punta",
        description:
          "Utilizamos los últimos avances en diagnósticos ópticos para garantizar la graduación más precisa posible.",
        variant: "primary",
      },
      {
        icon: "Tag",
        title: "Curaduría de Marcas",
        description:
          "Seleccionamos monturas de diseñadores globales que priorizan tanto la estética como la ergonomía.",
        variant: "secondary",
      },
      {
        icon: "CalendarDays",
        title: "Agendamiento Ágil",
        description:
          "Reserva tu cita en segundos y recibe atención personalizada sin esperas prolongadas.",
        variant: "primary",
      },
    ],
  }
}
