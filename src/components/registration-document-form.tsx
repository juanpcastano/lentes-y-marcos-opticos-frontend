import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "#/components/ui/button"
import { Field, FieldLabel } from "#/components/ui/field"
import { Input } from "#/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
import { fetchDocumentTypes } from "#/services/softix"
import type { DocumentType } from "#/services/softix"

interface RegistrationDocumentFormProps {
  pending: boolean
  initialType?: string
  initialId?: string
  onSubmit: (documentType: string, documentId: string) => void
}

export function RegistrationDocumentForm({
  pending,
  initialType,
  initialId,
  onSubmit,
}: RegistrationDocumentFormProps) {
  const [documentType, setDocumentType] = useState(initialType ?? "CC")
  const [documentId, setDocumentId] = useState(initialId ?? "")

  const { data: documentTypes = [] } = useQuery({
    queryKey: ["softix-document-types"],
    queryFn: fetchDocumentTypes,
  })

  // El catálogo de Softix trae duplicados; deduplicamos también en el cliente
  // para que los SelectItem nunca compartan key/value.
  const documentTypeOptions = useMemo(() => {
    const allowed = new Set(["CC", "CE", "TI", "PA"])
    const seen = new Set<string>()
    const result: DocumentType[] = []
    for (const type of documentTypes) {
      const id = (type.id ?? "").trim().toUpperCase()
      if (!allowed.has(id) || seen.has(id)) continue
      seen.add(id)
      result.push({ ...type, id })
    }
    return result
  }, [documentTypes])

  useEffect(() => {
    if (documentTypeOptions.length === 0) return
    if (!documentTypeOptions.some((type) => type.id === documentType)) {
      setDocumentType(documentTypeOptions[0]?.id ?? documentType)
    }
  }, [documentTypeOptions, documentType])

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        const value = documentId.trim()
        if (!value) return
        onSubmit(documentType, value)
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
        <Field>
          <FieldLabel htmlFor="registration-document-type">Tipo</FieldLabel>
          <Select
            value={documentType}
            onValueChange={setDocumentType}
            disabled={pending}
          >
            <SelectTrigger id="registration-document-type" className="w-full">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {documentTypeOptions.length === 0 && (
                <>
                  <SelectItem value="CC">Cédula de ciudadanía</SelectItem>
                  <SelectItem value="CE">Cédula de extranjería</SelectItem>
                  <SelectItem value="TI">Tarjeta de identidad</SelectItem>
                  <SelectItem value="PA">Pasaporte</SelectItem>
                </>
              )}
              {documentTypeOptions.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name ?? type.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="registration-document-id">
            Número de documento
          </FieldLabel>
          <Input
            id="registration-document-id"
            inputMode="numeric"
            value={documentId}
            onChange={(event) =>
              setDocumentId(event.target.value.replace(/\D/g, ""))
            }
            onKeyDown={(event) => {
              if (
                !event.ctrlKey &&
                !event.metaKey &&
                /[\s.-]/.test(event.key)
              ) {
                event.preventDefault()
              }
            }}
            maxLength={10}
            disabled={pending}
            required
          />
        </Field>
      </div>

      <Button type="submit" disabled={pending || documentId.trim().length < 1}>
        {pending ? "Revisando…" : "Continuar"}
      </Button>
    </form>
  )
}
