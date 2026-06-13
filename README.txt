CodeBurn Usage Export
====================

Generated: 2026-06-13T14:19:11.433Z
Currency:  USD
Periods:   Today, 7 Days, 30 Days

Files
-----
  summary.csv           One row per period. Headline totals.
  daily.csv             Day-by-day breakdown, Period column distinguishes the window.
  activity.csv          Time spent per task category (Coding, Debugging, Exploration, etc.).
  models.csv            Spend per model with token totals and cache usage.
  projects.csv          Spend per project folder for the selected detail period.
  sessions.csv          One row per session for the selected detail period.
  tools.csv             Tool invocations and share for the selected detail period.
  shell-commands.csv    Shell commands executed via Bash tool for the selected detail period.

Notes
-----
  Every cost column is already converted to the active currency. Tokens are raw integer
  counts from provider telemetry. Share (%) is relative to the period/table total.
