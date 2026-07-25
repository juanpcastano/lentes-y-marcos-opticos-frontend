## 1. Data layer (service + query options)

- [x] 1.1 Create `src/services/user-appointments.ts`: export `UserAppointmentStatus` (`"pending" | "completed"`), `MedicalResult` (`{ prescription?: string; notes?: string }`), `UserAppointment` (`{ id; date: string; time: string; status: UserAppointmentStatus; medicalResult?: MedicalResult }`) types and `fetchUserAppointments(): Promise<UserAppointment[]>` returning hardcoded data with at least one pending and several completed appointments (one with prescription+notes, one prescription-only, one notes-only, one without medical result).
- [x] 1.2 Create `src/query-options/user-appointments.ts` exporting a default `createUserAppointmentsQueryOptions<TData, TError>` factory (mirroring `src/query-options/orders.ts`) with query key `["user-appointments"]` bound to `fetchUserAppointments`.

## 2. MyAccount appointments page

- [x] 2.1 Replace the placeholder component in `src/routes/_main-layout/_authenticated/myaccount/appointments.tsx` with a `RouteComponent` that reads appointments via `useSuspenseQuery(createUserAppointmentsQueryOptions())`, splits them into `pending` and `completed` arrays, and renders a max-w-2xl container with a "Citas" title and a `Tabs` with default value `pending`.
- [x] 2.2 Add `TabsList` with two triggers (`Citas Pendientes` value `pending`, `Historial` value `history`) and two `TabsContent` blocks, each rendering its filtered list or the `EmptyState` ("No tienes citas pendientes." / "No tienes historial de citas.") when empty.
- [x] 2.3 Implement `PendingAppointmentCard` rendering a `Card`/`CardHeader` showing the appointment date and time formatted via `date-fns` (`format` with `es` locale) as "{d} de {MMMM} a las {HH:mm}", combining `date` + `time` into a local `Date` (`new Date(`${date}T${time}:00`)`).
- [x] 2.4 Implement `CompletedAppointmentCard` rendering the same date/time header, then `CardContent` showing a medical result section only when `medicalResult` is present: a "Receta" line with `medicalResult.prescription` when defined, and a "Notas" line with `medicalResult.notes` when defined.
- [x] 2.5 Reuse the orders page `EmptyState` pattern (lucide `CalendarX`/`PackageOpen` icon + muted message) inside a rounded `bg-muted/40` container for both tabs.

## 3. Verification

- [x] 3.1 Run `pnpm generate-routes` so `src/routeTree.gen.ts` picks up any route changes (no-op expected since the file already exists, but ensures consistency).
- [x] 3.2 Run `pnpm check` (formatting) and `pnpm lint` and fix any issues.
- [x] 3.3 Run `pnpm build` (or `pnpm dev` smoke test) to confirm the page renders at `/myaccount/appointments`, both tabs display the correct filtered hardcoded data, and the empty states render when filters yield no items.
