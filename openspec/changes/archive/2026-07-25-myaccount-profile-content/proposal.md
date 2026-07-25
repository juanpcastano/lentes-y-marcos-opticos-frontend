## Why

The My Account layout is complete, but the `/myaccount/profile` page is still a placeholder. Users need a functional profile page where they can view and edit their personal information, change their password, and delete their account. The signup form also lacks a phone number field, which is essential for an optical store that may need to contact customers about appointments and orders.

## What Changes

- Build the `/myaccount/profile` page with editable personal information (name, email, phone) using the existing sidebar layout.
- Add a **Cambiar Contraseña** section (visible only for email-authenticated users, hidden for Google OAuth users).
- Add an **Eliminar Cuenta** section with a confirmation dialog that informs the user their account will be deleted 15 days from the confirmation date.
- Extend the `User` model to include `phone` and `authMethod` ("email" | "google").
- Update the mock auth service to store `authMethod` in `localStorage` so the frontend can differentiate email and Google users.
- Add a phone number field to the signup form.
- Create a `/forgot-password` placeholder page with an email input and a "Cancelar" button (no backend logic yet).

## Capabilities

### New Capabilities

- `myaccount-profile`: Profile page content — personal info editing, password change, and account deletion.

### Modified Capabilities

- `user-auth`: Extended user model (`phone`, `authMethod`), signup form adds phone field, mock service tracks auth method, forgot-password placeholder page added.

## Impact

- New files: `src/routes/_main-layout/_authenticated/myaccount/profile.tsx` (rewrite), `src/routes/forgot-password.tsx`.
- Modified files: `src/services/auth.ts`, `src/components/signup-form.tsx`, `src/components/login-form.tsx` (forgot-password link), `src/query-options/auth.ts`.
- No backend changes; all auth data remains hardcoded/mocked.
