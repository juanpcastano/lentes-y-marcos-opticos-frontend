## Context

The My Account layout (`myaccount.tsx`) and sidebar navigation are already implemented and working. The child routes (`profile`, `orders`, `appointments`) exist but render placeholder text. The auth system is mocked via `localStorage` and currently tracks only a boolean session flag. The `User` model contains `id`, `name`, and `email` only.

The goal is to turn the profile placeholder into a functional settings page where users manage their identity, security, and account lifecycle. At the same time, the auth layer needs to grow slightly to support auth-method differentiation and phone numbers.

## Goals / Non-Goals

**Goals:**

- Provide an editable personal-info form on `/myaccount/profile` (name, email, phone).
- Provide a password-change flow for email-authenticated users.
- Provide an account-deletion flow with a 15-day grace-period message.
- Differentiate email users from Google OAuth users in the mock auth layer.
- Add a phone field to the signup form.
- Provide a forgot-password placeholder page (no logic yet).

**Non-Goals:**

- Building saved addresses (separate future change).
- Prescription history.
- Avatar upload.
- Real email-sending or password-reset backend logic.
- Changing the sidebar layout or active-state behavior (already complete).
- Mobile-specific sidebar behavior.

## Decisions

### 1. Auth method stored in localStorage alongside session flag

**Rationale:** The mock auth system must distinguish email from Google logins so the profile page can conditionally show/hide the change-password section. The simplest mock-compatible approach is to store `mock_auth_method` ("email" | "google") in `localStorage` on login/signup/GoogleMock, and read it in `fetchMe`.

**Alternative considered:** Add an `authMethod` field to the login/signup credentials and pass it through. Rejected because it couples the form state to the service unnecessarily. The service knows which method was used.

### 2. Phone added to `User` model and `SignupCredentials`

**Rationale:** The optical store needs a way to contact customers about appointments and orders. Phone is identity data, not an address, so it belongs on the user profile. The signup form should collect it at registration time.

### 3. Password change form: old + new + confirm

**Rationale:** In the mock phase, the "old password" check cannot be verified against a real hash, but the _form shape_ is what the real backend will need. Building the correct UI now avoids a redesign later. Mock behavior: accept any non-empty old password, validate new === confirm client-side, simulate success.

**Alternative considered:** New + confirm only. Rejected because it would require redesigning the form when the backend arrives.

### 4. Delete account uses a confirmation dialog with a computed date

**Rationale:** The user explicitly wants a 15-day grace period message. The dialog computes `today + 15 days` for the message text. In mock phase, confirming deletion simply clears the session and redirects. No scheduled job or soft-delete state is maintained.

### 5. Forgot-password page is a dead-end placeholder

**Rationale:** The login form already has an "Olvidaste tu contraseña?" link going nowhere. Rather than leave a broken link, we create the page shell with an email input and a "Te enviaremos un enlace de recuperación" message, but wire no backend logic. This sets the UI expectation without opening the email-sending rabbit hole.

### 6. Profile updates simulated via mock service mutation

**Rationale:** Since there is no backend, profile edits will update the in-memory `MOCK_USER` object and return it. On page refresh, changes are lost unless we also persist them to `localStorage`. We will persist the editable fields (`name`, `email`, `phone`) in `localStorage` so the mock feels realistic across refreshes.

## Risks / Trade-offs

- **[Risk]** `localStorage`-based mock user data drifts from the hardcoded `MOCK_USER` default.  
  **Mitigation:** On `fetchMe`, prefer the persisted object over the hardcoded one. On logout, clear everything.

- **[Risk]** Phone field added to signup increases form friction.  
  **Mitigation:** Mark it as optional in the form validation (but encourage it). The requirement allows optional phone at signup.

- **[Risk]** The 15-day deletion message creates an expectation the mock cannot fulfill.  
  **Mitigation:** The dialog text explicitly frames it as a scheduled deletion; the mock simply logs out. When the backend arrives, the same dialog text and flow remain, but the backend enforces the actual grace period.
