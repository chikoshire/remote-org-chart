# Data Health

Trust view for reporting edges and thin profiles. Path: **Settings → Data Health** (`/settings/data-health`).

## Issue types

- **Reporting cycles:** looped manager chains
- **Manager missing:** manager id set but person not in the active set
- **Incomplete profiles:** missing title, department, and/or country

## Fix in profile

Each card links to the People profile where you can fill missing fields. Changes are **local overlays** (read-only Remote token). They improve the demo experience but do not update Remote.

## Refresh from Remote

Use **Refresh from Remote** beside the intro copy to force a new Remote sync. The Sync KPI shows the last successful pull. Refresh keeps prior data if the rebuild fails.
