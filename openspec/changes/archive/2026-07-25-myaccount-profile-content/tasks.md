## 1. Auth Service & Model Updates

- [x] 1.1 Add `phone` and `authMethod` to `User` interface in `src/services/auth.ts`
- [x] 1.2 Add `phone` to `SignupCredentials` interface
- [x] 1.3 Update `MOCK_USER` to include `phone` and `authMethod`
- [x] 1.4 Update `login` to store `mock_auth_method = "email"` in `localStorage`
- [x] 1.5 Update `signup` to accept `phone` and store `mock_auth_method = "email"`
- [x] 1.6 Update `loginWithGoogleMock` to store `mock_auth_method = "google"`
- [x] 1.7 Update `fetchMe` to read `mock_auth_method` and return `authMethod`; prefer persisted user data over `MOCK_USER` default
- [x] 1.8 Update `logout` to clear `mock_auth_method` and any persisted user data from `localStorage`
- [x] 1.9 Create `updateProfile` mock service that updates persisted user data in `localStorage`
- [x] 1.10 Create `changePassword` mock service (no-op except client-side validation)

## 2. Signup Form Update

- [x] 2.1 Add phone number `<Field>` and `<Input>` to `src/components/signup-form.tsx`
- [x] 2.2 Add `phone` state variable and pass it to `signup` mutation
- [x] 2.3 Mark phone as optional (no `required` attribute) but with a helpful description

## 3. Forgot-Password Page

- [x] 3.1 Create `src/routes/forgot-password.tsx` route file
- [x] 3.2 Build a card-style form with email input, "Enviar enlace" button, and "Cancelar" button
- [x] 3.3 Wire "Cancelar" to `window.history.back()`
- [x] 3.4 On "Enviar enlace", show a static message: "Te enviaremos un enlace de recuperación a tu correo."
- [x] 3.5 Wire the existing "Olvidaste tu contraseña?" link in `src/components/login-form.tsx` to route to `/forgot-password`
- [x] 3.6 Run `pnpm generate-routes` to register the new route

## 4. Profile Page — Read-Only Display & Edit Mode

- [x] 4.1 Rewrite `src/routes/_main-layout/_authenticated/myaccount/profile.tsx`
- [x] 4.2 Fetch current user via `useQuery(createMeQueryOptions())`
- [x] 4.3 Render a styled read-only profile card showing name, email, phone, and notification preferences summary
- [x] 4.4 Add a single "Editar preferencias" button that switches the page to edit mode, revealing ALL editable sections at once
- [x] 4.5 Add a "Cerrar edición" action that exits edit mode and returns to the read-only display
- [x] 4.6 On exit, read-only display SHALL reflect any persisted updates

## 5. Profile Page — Personal Info Section (Edit Mode)

- [x] 5.1 In edit mode, render an editable form for name, email, phone
- [x] 5.2 Add local state for form values, initialized from user data
- [x] 5.3 Add "Guardar cambios" button wired to `updateProfile` mutation
- [x] 5.4 Add "Cancelar" button that discards unsaved changes and restores saved values
- [x] 5.5 On success, invalidate `["me"]` query and show a confirmation

## 6. Profile Page — Change Password Section (Edit Mode)

- [x] 6.1 Conditionally render the "Seguridad" section in edit mode only when `user.authMethod === "email"`
- [x] 6.2 Add fields: old password, new password, confirm new password
- [x] 6.3 Add client-side validation: new password must match confirm
- [x] 6.4 Add "Guardar contraseña" button wired to `changePassword` mutation
- [x] 6.5 Add "Cancelar" button that clears fields and validation errors
- [x] 6.6 On success, clear the password fields and show a confirmation message
- [x] 6.7 On mismatch error, display inline validation message

## 7. Profile Page — Notification Preferences (Edit Mode)

- [x] 7.1 Create `src/services/notifications.ts` with `NotificationPreferences` interface and mock fetch/update functions backed by `localStorage`
- [x] 7.2 Create `src/query-options/notifications.ts` with `createNotificationPreferencesQueryOptions`
- [x] 7.3 Create `src/components/ui/switch.tsx` (shadcn-style Switch)
- [x] 7.4 In edit mode, render a "Preferencias de notificaciones" section with three toggles: order & tracking updates, appointment reminders, news & recommendations
- [x] 7.5 Initialize toggles from the persisted preferences via `useQuery`
- [x] 7.6 Add "Guardar preferencias" button wired to a `useMutation` calling `updateNotificationPreferences`
- [x] 7.7 Add "Cancelar" button that restores toggles to the previously persisted values
- [x] 7.8 On success, invalidate the notifications query and show a confirmation
- [x] 7.9 In read-only mode, display a summary of which notifications are enabled

## 8. Profile Page — Delete Account Section (Edit Mode)

- [x] 8.1 In edit mode only, reveal the "Zona de peligro" section with an "Eliminar cuenta" button styled as destructive
- [x] 8.2 Create a confirmation dialog (using shadcn Dialog)
- [x] 8.3 Dialog message computes `today + 15 days` and formats it in Spanish
- [x] 8.4 Provide "Cancelar" and "Sí, eliminar" buttons in the dialog
- [x] 8.5 On confirm, call `logout()`, invalidate `["me"]` query, navigate to `/`
- [x] 8.6 On cancel, close the dialog without any side effects

## 9. Verification

- [x] 9.1 Start dev server and verify `/myaccount/profile` renders the styled read-only profile
- [x] 9.2 Verify "Editar preferencias" reveals all editable sections at once
- [x] 9.3 Verify "Cerrar edición" returns to read-only display with updated values
- [x] 9.4 Verify editing name/email/phone persists across refreshes (mock localStorage)
- [x] 9.5 Verify change-password section is visible for email users and hidden for Google users in edit mode
- [x] 9.6 Verify notification preferences toggles persist across refreshes
- [x] 9.7 Verify delete-account dialog shows the correct 15-day date and logs out on confirm
- [x] 9.8 Verify `/forgot-password` page renders and "Cancelar" navigates back
- [x] 9.9 Verify signup form includes the phone field
- [x] 9.10 Run `pnpm check` and `pnpm lint` to ensure formatting and lint pass
