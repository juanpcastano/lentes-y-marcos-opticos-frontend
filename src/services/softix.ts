import { api } from "#/lib/api"

export interface SoftixProfile {
  documentType: string
  maskedDocumentId: string
  firstName: string | null
  middleName: string | null
  lastName: string | null
  secondLastName: string | null
  email: string | null
  birthDate: string | null
  gender: string | null
  city: string | null
  locality: string | null
  postalCode: string | null
  maritalStatus: string | null
  occupation: string | null
}

export interface SoftixProfileUpdate {
  firstName: string
  middleName?: string
  lastName: string
  secondLastName?: string
  email?: string
  birthDate?: string
  gender: string
}

export interface SoftixCreateCustomer {
  documentType: string
  documentId: string
  firstName: string
  middleName?: string
  lastName: string
  secondLastName?: string
  email?: string
  birthDate: string
  gender: string
}

export interface DocumentType {
  id: string
  name: string
  code: number | null
}

export function fetchSoftixProfile() {
  return api.get<SoftixProfile>("/users/me/softix/profile")
}

export function updateSoftixProfile(data: SoftixProfileUpdate) {
  return api.put<SoftixProfile>("/users/me/softix/profile", data)
}

export function fetchDocumentTypes() {
  return api.get<DocumentType[]>("/auth/phone/document-types")
}
