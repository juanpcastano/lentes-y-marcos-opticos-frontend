## Context

`/myaccount/appointments` already exists as a placeholder route and is mounted under the `_authenticated` layout. The companion `/myaccount/orders` page (`src/routes/_main-layout/_authenticated/myaccount/orders.tsx`) establishes the canonical pattern for a tabbed myaccount list page: a `useSuspenseQuery` backed by a `queryOptions` factory, a `Tabs` split by status, per-item `Card`s, and an `EmptyState`. The scheduling page's `src/services/appointments.ts` and `src/query-options/appointments.ts` already occupy the `appointments` query key and deal with availability slots — they must remain untouched because the public scheduling page depends on them.

## Goals / Non-Goals

**Goals:**

- Deliver a `/myaccount/appointments` page that mirrors theOrders page UX with "Citas Pendientes" and "Historial" tabs.
- Surface medical results (prescription + notes) on completed appointment cards.
- Follow the existing data-fetching pattern (service → `queryOptions` → `useSuspenseQuery`) with hardcoded in-memory data, per AGENTS.md.

**Non-Goals:**

- Implementing confirm/cancel actions (button is display-only this iteration).
- Replacing or modifying the existing scheduling-page `appointments` service/query options.
- Adding pagination, filtering, or search.
- Persisting data; everything stays hardcoded in memory.

## Decisions

### Decision: Separate service and query key from the scheduling page

Use new files `src/services/user-appointments.ts` and `src/query-options/user-appointments.ts` with query key `["user-appointments"]`, instead of extending `src/services/appointments.ts`.

**Why:** The existing `appointments.ts` returns `AppointmentDay[]` (availability slots) and is consumed by the `/appointments` scheduling page and its components. The myaccount page needs a different shape (`UserAppointment[]` including `medicalResult`). Sharing a service would force a union type and pollute the scheduling page's query cache under the same key. Separate files keep single-responsibility and let each query cache invalidation stay independent.

**Alternatives considered:**

- Extend `appointments.ts` with a second export — rejected for the coupling reason above.
- Put both behind a single `appointments` service with discriminated results — rejected as premature complexity.

### Decision: New capability name `myaccount-appointments`

The capability lives under `specs/myaccount-appointments/`, distinct from the existing `appointments-page` capability (public scheduling page).

**Why:** They describe unrelated user-facing behavior (managing one's own appointments vs. booking a slot). Keeping them separate preserves clarity in `openspec/specs/` and avoids a `MODIFIED` delta that would mix concerns.

### Decision: `medicalResult` is optional on every appointment

Type: `UserAppointment.medicalResult?: { prescription?: string; notes?: string }`. The card renders prescription/notes sections only when present, and hides the whole block when absent.

**Why:** Past appointments may predate digitized records or have only a prescription or only notes. Modeling it as optional+optional covers every state without nullable sentinel strings.

**Alternatives considered:**

- Always-present `medicalResult` with empty strings — rejected because it forces the view to check string emptiness and risks rendering empty labeled sections.

### Decision: Reuse shadcn `Card` + `Tabs`, no new components

The page composes `Card`, `CardHeader`, `CardContent`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` already in `src/components/ui/`. Date formatting via `date-fns` `format` with `es` locale, mirroring the orders page.

**Why:** Keeps the visual language consistent with `/myaccount/orders` and avoids new shadcn installs. The AGENTS.md note that all data is hardcoded keeps the data layer trivial.

### Decision: Combine date and time before formatting

Appointment records store `date` (`yyyy-MM-dd`) and `time` (`HH:mm`) separately for clarity. The card formats a single combined `Date` (`new Date(`${date}T${time}:00`)`) with a custom `date-fns` pattern producing "{d} de {MMMM} a las {HH:mm}" using the `es` locale.

**Why:** Storing separate fields matches the scheduling page's `AppointmentDay.date` + slot strings, and a single `format` call produces the spec-required "10 de Noviembre a las 10:00 AM"-style text (locale-aware).

## Risks / Trade-offs

- [Time-zone drift when combining `date` + `time`] → Mitigation: parse as local time (`T${time}:00` without a `Z`), so the formatted hour matches the stored string regardless of the client's timezone. Acceptable since data is in-memory local time anyway.
- [Page and spec drift between `appointments-page` and `myaccount-appointments` capabilities] → Mitigation: the myaccount spec explicitly references the orders-page pattern and scopes to `/myaccount/appointments`; the capability name keeps them visually distinct in `openspec/specs/`.
- [Future confirm/cancel actions will require a mutation layer not introduced here] → Mitigation: the spec marks the action as a no-op, and the service remains a plain `fetchUserAppointments` with no write path — adding mutations later will not break the current read shape.
