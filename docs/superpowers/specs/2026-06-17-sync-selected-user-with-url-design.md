# Sync selected user with URL search params

## Problem

`selectedUser` in `dashboard/src/App.tsx` is plain React state. There's no way
to deep-link directly to a specific user's usage dashboard — refreshing or
sharing the URL always lands on the "select a user" prompt.

## Goal

Reflect the selected user in the URL as a query param so a direct link like
`https://.../?u=alice` opens straight into that user's dashboard.

## Design

- No new dependency. The app has no router (single page), so use the native
  `URLSearchParams` + `history` API directly in `App.tsx`.
- Query param name: `u`.
- On mount: read `u` from `window.location.search`. Once `useUsers()` resolves
  the user list, if `u` matches one of the returned usernames, initialize
  `selectedUser` to it; otherwise leave `selectedUser` as `null` (no implicit
  fallback to an invalid/removed user).
- Selecting a user (via `UserSelector`) calls a `selectUser(username)` wrapper
  that:
  1. calls `setSelectedUser(username)`
  2. calls `history.pushState(null, '', urlWithUpdatedUParam)`
  - Uses `pushState` (not `replaceState`) so browser Back/Forward navigates
    between previously selected users.
- A `popstate` listener (registered once via `useEffect`) re-reads `u` from
  the URL on Back/Forward and calls `setSelectedUser` to keep state in sync
  with the address bar.
- `period` is out of scope — not reflected in the URL.

## Out of scope

- Persisting `period` in the URL.
- Routing library / multi-page navigation.
- Validating/sanitizing `u` beyond checking membership in the known `users`
  list (prevents arbitrary/stale usernames from forcing a load attempt).
