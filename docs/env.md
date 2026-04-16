# Environment separation

This repo uses environment files for local development and deployment.

## Files and precedence

- `.env.example`: committed template (safe placeholders only)
- `.env.local`: developer machine secrets (ignored by git)
- `.env.cloud`: cloud deployment values (ignored by git)

Many apps load env from the repository root by default (`.env`, then `.env.local` if present). Some apps also have their own per-app env files.

## App-specific env templates

- `apps/api/.env.example`
- `apps/web/.env.example`
- `apps/desktop/.env.example`
- `apps/mobile/.env.example`

## Flutter (mobile)

Prefer build-time defines over checked-in env files:

- `flutter run --dart-define=AMISI_API_BASE_URL=http://localhost:4000`
