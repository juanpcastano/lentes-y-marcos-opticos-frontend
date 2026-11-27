import { api, getAccessToken, setAccessToken } from "#/lib/api"
import { clearCart } from "#/services/cart"
import type { SoftixCreateCustomer } from "#/services/softix"

export interface User {
  id: string
  phone: string
  phoneVerified: boolean
  softixLinked: boolean
  isAdmin: boolean
}

export type LinkStatus =
  "LINKED" | "NEEDS_DOCUMENT" | "NEEDS_CREATE" | "CONTACT_STAFF"

export interface LinkState {
  status: LinkStatus
  challengeId: string | null
  documentHints: string[]
}

export interface PhoneAuthResponse {
  accessToken: string | null
  user: User | null
  link: LinkState
  registrationPending: boolean
}

/**
 * Datos de la ficha que el usuario revisa antes de crear su cuenta. `LINK`
 * indica que ya existe en Softix y se vinculará; `CREATE` que se creará.
 */
export interface RegistrationProfile {
  status: "LINK" | "CREATE"
  documentType: string
  documentId: string
  firstName: string | null
  middleName: string | null
  lastName: string | null
  secondLastName: string | null
  email: string | null
  birthDate: string | null
  gender: string | null
}

/** Pide un OTP por WhatsApp. Siempre responde igual para no enumerar teléfonos. */
export async function startPhone(
  phone: string,
  captchaToken?: string,
): Promise<void> {
  await api.post("/auth/phone/start", { phone, captchaToken })
}

/**
 * Verifica el OTP. Si la cuenta ya existe y está vinculada, devuelve sesión.
 * Si no, deja el registro pendiente y la cuenta se crea al vincular/crear.
 */
export async function verifyPhone(
  phone: string,
  code: string,
  consentAccepted: boolean,
): Promise<PhoneAuthResponse> {
  const result = await api.post<PhoneAuthResponse>("/auth/phone/verify", {
    phone,
    code,
    consentAccepted,
  })
  if (result.accessToken) {
    setAccessToken(result.accessToken)
  }
  return result
}

export function confirmPhoneDocument(
  challengeId: string,
  documentId: string,
): Promise<RegistrationProfile> {
  return api.post<RegistrationProfile>("/auth/phone/confirm", {
    challengeId,
    documentId,
  })
}

/**
 * Busca una ficha por documento durante el registro. Si existe, devuelve sus
 * datos para precargar el formulario y vincularla; si no, el formulario sigue
 * como creación normal.
 */
export function lookupRegistrationDocument(
  documentType: string,
  documentId: string,
): Promise<RegistrationProfile> {
  return api.post<RegistrationProfile>("/auth/phone/lookup", {
    documentType,
    documentId,
  })
}

/**
 * Confirma el formulario de registro. Vincula la ficha existente o crea una
 * nueva, y solo entonces crea la cuenta local.
 */
export async function linkPhoneCustomer(
  data: SoftixCreateCustomer,
): Promise<PhoneAuthResponse> {
  const result = await api.post<PhoneAuthResponse>("/auth/phone/link", data)
  setAccessToken(result.accessToken)
  return result
}

export async function createPhoneCustomer(
  data: SoftixCreateCustomer,
): Promise<PhoneAuthResponse> {
  const result = await api.post<PhoneAuthResponse>("/auth/phone/create", data)
  setAccessToken(result.accessToken)
  return result
}

/**
 * Restaura la sesión desde la cookie httpOnly de refresh.
 */
export async function bootstrapSession(): Promise<boolean> {
  return (await api.bootstrap()) !== null
}

export async function fetchMe(): Promise<User | null> {
  if (!getAccessToken()) {
    const restored = await bootstrapSession()
    if (!restored) return null
  }
  try {
    return await api.get<User>("/users/me")
  } catch {
    setAccessToken(null)
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout")
  } catch {
    // La sesión local debe cerrarse aunque falle el servidor.
  } finally {
    setAccessToken(null)
    await clearCart()
  }
}
