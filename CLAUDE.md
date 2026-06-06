# CLAUDE.md

## Frontend Project Overview

This frontend is part of the Mise capstone project, a smart inventory management and AI recommendation system. The frontend is responsible for user authentication, dashboard views, inventory management, menu recommendation screens, supplier management, reporting, and API integration with the backend.

Claude should assist with frontend development by following the existing project structure, keeping changes scoped to the ticket, and avoiding broad refactors unless explicitly requested.

## Tech Stack

* React
* TypeScript
* Vite
* Firebase Authentication
* React Router
* React Query or service-based API calls
* CSS modules, standard CSS, or existing project styling patterns
* PapaParse for CSV import/export if already installed

## Folder Structure

Follow the existing frontend folder structure. Common folders may include:

* `src/pages` for route-level screens
* `src/components` for reusable UI components
* `src/hooks` for custom React hooks
* `src/services` for API calls and backend communication
* `src/types` for shared TypeScript types
* `src/utils` for helper functions
* `src/assets` for static assets
* `src/styles` for global or shared styling

Do not create new top-level folders unless the ticket requires it or the existing structure clearly supports it.

## Component Guidelines

* Use functional React components.
* Use TypeScript for props and shared data types.
* Keep components focused on one responsibility.
* Prefer reusable components when patterns repeat.
* Name components using PascalCase.
* Name files to match the component name when practical.

Example:

```tsx
InventoryTable.tsx
InventoryForm.tsx
DashboardCard.tsx
```

Avoid placing large amounts of business logic directly inside UI components. Move reusable logic into hooks, services, or utility files.

## State Management

Use local component state for simple UI behavior.

Use shared hooks or React Query for server state, loading states, and API data.

Do not introduce a new global state library unless the team approves it.

## API and Data Fetching

API calls should be placed in service files or existing API utilities.

Components should not hardcode backend URLs. Use environment variables or the existing API configuration pattern.

API handling should include:

* Loading states
* Error states
* Empty states
* Type-safe request and response handling when possible

## Styling Standards

Follow the existing styling approach in the project.

Do not introduce a new styling library without approval.

Styles should be readable, scoped when possible, and responsive across common screen sizes.

Avoid large visual redesigns unless the ticket specifically requests them.

## Forms and Validation

Forms should use controlled inputs unless the existing codebase uses another pattern.

Validation should be clear to the user.

Required fields should be identified.

Error messages should be useful and specific.

Do not submit invalid forms to the backend.

## Error, Loading, and Empty States

All data-driven screens should account for:

* Loading state while data is being fetched
* Error state when a request fails
* Empty state when no records are available
* Success feedback when a user completes an action

Avoid leaving blank screens with no explanation.

## Testing Expectations

When adding or changing frontend logic, include or update tests if the project already has a test setup.

Prioritize testing:

* Component rendering
* User interactions
* Form validation
* API error handling
* Utility functions

Do not add a new testing framework without approval.

## Accessibility and Responsive Design

Frontend changes should be usable with keyboard navigation.

Use semantic HTML when possible.

Buttons, links, inputs, and forms should have clear labels.

Screens should work on desktop and smaller viewport sizes.

Do not rely only on color to communicate important information.

## Ticket Workflow

When working on a ticket, Claude should:

1. Read the ticket requirements carefully.
2. Identify the smallest set of files needed.
3. Follow existing project patterns.
4. Keep the change scoped to the ticket.
5. Avoid unrelated cleanup or refactoring.
6. Explain any assumptions before making major changes.
7. Update documentation if the ticket changes behavior or setup.

## Pull Request Expectations

Pull requests should include:

* Summary of what changed
* Files or areas affected
* Testing performed
* Screenshots for visible UI changes when useful
* Notes about known limitations or follow-up work

PRs should be small enough for teammates to review.

## Guardrails for Claude

Claude should not:

* Rewrite large parts of the frontend without approval
* Change backend API contracts without coordination
* Add new dependencies without approval
* Change authentication behavior without approval
* Remove existing features unless the ticket requires it
* Rename major folders or files without approval
* Modify unrelated files only for cleanup
* Make broad styling changes outside the ticket scope
* Commit secrets, API keys, or environment-specific values

Claude should:

* Keep changes focused
* Reuse existing patterns
* Ask for clarification when requirements conflict
* Prefer simple, maintainable code
* Document important assumptions
* Preserve working behavior unless intentionally changed

## Definition of Done

A frontend ticket is done when:

* The requested feature or fix is implemented
* The code follows existing frontend patterns
* Loading, error, and empty states are handled where needed
* TypeScript errors are resolved
* The app builds successfully
* Relevant tests are added or updated when applicable
* The change is reviewed through a pull request
