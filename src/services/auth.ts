export interface User {
  id: string
  name: string
  email: string
  phone: string
  authMethod: "email" | "google"
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
  email?: string
  phone?: string
}

export interface PasswordChange {
  oldPassword: string
  newPassword: string
}

const MOCK_SESSION_KEY = "mock_auth_session"
const MOCK_AUTH_METHOD_KEY = "mock_auth_method"
const MOCK_USER_STORAGE_KEY = "mock_auth_user"

const DEFAULT_MOCK_USER: User = {
  id: "1",
  name: "Usuario Demo",
  email: "demo@optica.com",
  phone: "",
  authMethod: "email",
}

export const GOOGLE_OAUTH_URL = "/api/auth/google"

function readAuthMethod(): User["authMethod"] {
  return localStorage.getItem(MOCK_AUTH_METHOD_KEY) === "google"
    ? "google"
    : "email"
}

function getMockUser(): User {
  const stored = localStorage.getItem(MOCK_USER_STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<User>
      return {
        ...DEFAULT_MOCK_USER,
        ...parsed,
        authMethod: readAuthMethod(),
      }
    } catch {
      // fall through to default
    }
  }
  return { ...DEFAULT_MOCK_USER, authMethod: readAuthMethod() }
}

function setMockUser(user: User): void {
  localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user))
}

function setAuthMethod(method: User["authMethod"]): void {
  localStorage.setItem(MOCK_AUTH_METHOD_KEY, method)
}

export async function fetchMe(): Promise<User | null> {
  const session = localStorage.getItem(MOCK_SESSION_KEY)
  return session ? getMockUser() : null
}

export async function login(_credentials: LoginCredentials): Promise<User> {
  localStorage.setItem(MOCK_SESSION_KEY, "true")
  setAuthMethod("email")
  const user = { ...getMockUser(), authMethod: "email" as const }
  setMockUser(user)
  return user
}

export async function signup(credentials: SignupCredentials): Promise<User> {
  localStorage.setItem(MOCK_SESSION_KEY, "true")
  setAuthMethod("email")
  const user: User = {
    ...getMockUser(),
    name: credentials.name,
    email: credentials.email,
    phone: credentials.phone ?? "",
    authMethod: "email",
  }
  setMockUser(user)
  return user
}

export async function logout(): Promise<void> {
  localStorage.removeItem(MOCK_SESSION_KEY)
  localStorage.removeItem(MOCK_AUTH_METHOD_KEY)
  localStorage.removeItem(MOCK_USER_STORAGE_KEY)
}

export function loginWithGoogleMock(): void {
  localStorage.setItem(MOCK_SESSION_KEY, "true")
  setAuthMethod("google")
  const user = { ...getMockUser(), authMethod: "google" as const }
  setMockUser(user)
}

export async function updateProfile(updates: ProfileUpdate): Promise<User> {
  const current = getMockUser()
  const updated: User = {
    ...current,
    ...updates,
    authMethod: current.authMethod,
  }
  setMockUser(updated)
  return updated
}

export async function changePassword(_change: PasswordChange): Promise<void> {
  // Mock: no real password storage. Client-side validation handled in the form.
}
