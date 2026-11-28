export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CC: "Cédula de ciudadanía",
  CE: "Cédula de extranjería",
  TI: "Tarjeta de identidad",
  PA: "Pasaporte",
}

export function documentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] ?? type
}
