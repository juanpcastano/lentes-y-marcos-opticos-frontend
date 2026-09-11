import { api, getAccessToken, setAccessToken } from "#/lib/api"

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  hasPassword: boolean
  hasGoogle: boolean
  isAdmin: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
  phone?: string
}

export interface ProfileUpdate {
  name?: string
  phone?: string
}

interface AuthResponse {
  accessToken: string
  user: User
}

interface LoginOptionsResponse {
  hasPassword: boolean
  hasGoogle: boolean
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  string | undefined

export const GOOGLE_CLIENT_ID_VALUE = GOOGLE_CLIENT_ID ?? ""

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string
              size?: string
              type?: string
              text?: string
              shape?: string
              width?: number
            },
          ) => void
          prompt: () => void
        }
      }
    }
  }
}

/** True once the Google Identity Services script has finished loading. */
export function isGoogleReady(): boolean {
  return Boolean(window.google?.accounts.id)
}

/**
 * Restores the session from the httpOnly refresh cookie.
 * Returns true when a valid session was recovered.
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

export async function login(credentials: LoginCredentials): Promise<User> {
  const result = await api.post<AuthResponse>("/auth/login", credentials)
  setAccessToken(result.accessToken)
  return result.user
}

export async function signup(credentials: SignupCredentials): Promise<User> {
  const result = await api.post<AuthResponse>("/auth/signup", credentials)
  setAccessToken(result.accessToken)
  return result.user
}

/** Exchanges a Google ID token for our own session. */
export async function loginWithGoogle(idToken: string): Promise<User> {
  const result = await api.post<AuthResponse>("/auth/google", { idToken })
  setAccessToken(result.accessToken)
  return result.user
}

/** Links the current account to a Google account using a Google ID token. */
export async function linkGoogle(idToken: string): Promise<User> {
  return api.post<User>("/auth/link/google", { idToken })
}

/** Unlinks Google from the current account. */
export async function unlinkGoogle(): Promise<User> {
  return api.delete<User>("/auth/link/google")
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout")
  } catch {
    // The local session must be cleared even if the server call fails.
  } finally {
    setAccessToken(null)
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post("/auth/password/reset/request", { email })
}

export async function verifyPasswordReset(
  email: string,
  code: string,
): Promise<void> {
  await api.post("/auth/password/reset/verify", { email, code })
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await api.post("/auth/password/reset/confirm", { email, code, newPassword })
}

export async function getLoginOptions(
  email: string,
): Promise<LoginOptionsResponse> {
  return api.post<LoginOptionsResponse>("/auth/login/options", { email })
}

export async function requestLoginCode(email: string): Promise<void> {
  await api.post("/auth/login/code-request", { email })
}

export async function verifyLoginCode(
  email: string,
  code: string,
): Promise<User> {
  const result = await api.post<AuthResponse>("/auth/login/code-verify", {
    email,
    code,
  })
  setAccessToken(result.accessToken)
  return result.user
}

export async function updateProfile(updates: ProfileUpdate): Promise<User> {
  return api.put<User>("/auth/profile", updates)
}

export async function requestPasswordCode(): Promise<void> {
  await api.post("/auth/password/code-request")
}

export interface PasswordCodeStatus {
  active: boolean
  cooldownSeconds: number
}

export async function getPasswordCodeStatus(): Promise<PasswordCodeStatus> {
  return api.get<PasswordCodeStatus>("/auth/password/code-status")
}

export async function verifyPasswordCode(code: string): Promise<void> {
  await api.post("/auth/password/code-verify", { code })
}

export async function setPassword(
  code: string,
  newPassword: string,
): Promise<void> {
  await api.post("/auth/password/set", { code, newPassword })
}
