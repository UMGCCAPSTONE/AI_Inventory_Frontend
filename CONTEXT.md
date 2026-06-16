# Mise Frontend — Domain Glossary

## placeholder spec
A `describe.skip` / `it.todo` block that names a user-story behaviour without containing any assertions or render calls. The test body is written by the page ticket (T-6/T-7/T-8/T-9/T-10) when the component exists. The prose description is the durable artefact; it survives prop renames and interface changes.

## Dashboard Page
The single React component (`DashboardPage`) that owns the dashboard layout and composes `DashboardHeader`, `TodayDashboard`, and any sections added by T-6A/B/C. Introduced by T-6A. `App.tsx` renders `<DashboardPage />` rather than individual dashboard sub-components directly.

## coverage matrix
The file `docs/test-coverage-matrix.md` committed to the frontend repo. It is the **living reference** — updated as each page ticket un-skips its specs. Distinct from the **Test Plan deliverable**, which is submitted to github.com/UMGCCAPSTONE/CourseDeliverables. When a testing milestone is reached, copy the coverage summary from `npm run test:coverage` into the deliverable.

## server-computed fields
Derived values calculated exclusively by the backend and returned in API responses. The frontend renders them as-is and never recomputes from raw data. Canonical fields (from shared ADR 0004): `isLowStock`, `isExpiringSoon`, `atRiskValue`, `isAvailable`, `limitingIngredient`, and dashboard summary counts. Any spec that touches these fields must assert against the API field value, not a locally derived result.

## API path assertion
When a spec asserts that a user action fires an API call, it targets the string literal path (e.g. `'/inventory'`) passed to `apiClient.post/patch/delete`. No route-constant layer exists; the path string is the unit of assertion.
