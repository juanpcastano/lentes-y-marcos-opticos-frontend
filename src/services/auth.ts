export interface User {
  id: string
  name: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
}

const MOCK_SESSION_KEY = "mock_auth_session"
const MOCK_USER: User = {
  id: "1",
  name: "Usuario Demo",
  email: "demo@optica.com",
}

export const GOOGLE_OAUTH_URL = "/api/auth/google"

export async function fetchMe(): Promise<User | null> {
  const session = localStorage.getItem(MOCK_SESSION_KEY)
  return session ? MOCK_USER : null
}

export async function login(_credentials: LoginCredentials): Promise<User> {
  localStorage.setItem(MOCK_SESSION_KEY, "true")
  return MOCK_USER
}

export async function signup(_credentials: SignupCredentials): Promise<User> {
  localStorage.setItem(MOCK_SESSION_KEY, "true")
  return MOCK_USER
}

export async function logout(): Promise<void> {
  localStorage.removeItem(MOCK_SESSION_KEY)
}

export function loginWithGoogleMock(): void {
  localStorage.setItem(MOCK_SESSION_KEY, "true")
}
