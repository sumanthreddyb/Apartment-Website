# ApartmentHub

ApartmentHub is a self-hostable apartment community management app for Bangalore communities. The repository includes a responsive operations workspace, PostgreSQL and Drizzle data model, sample apartment data, and a Docker Compose deployment.

## Run locally

Requirements: Node.js 22+, npm, and Docker Compose.

```sh
cp .env.example .env
docker compose up -d db
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000. The dashboard can also be explored without a database in demo mode. For a container deployment, run `docker compose up --build`; it starts PostgreSQL, applies migrations, then starts the app. Run `docker compose run --rm db-migrate npm run db:seed` to load the example community in a container deployment.

## Current application scope

The workspace ships with a 10-flat Bangalore sample community and interactive sections for overview, payments, facilities, service requests, residents, notices, events, directory, group buying, visitors, vendors, assets, documents, reports, and settings. Auth.js is configured for database-backed sessions and passwordless email sign-in using a self-hosted SMTP server. Request and booking APIs validate apartment membership and scope records to the authorized apartment; the authenticated service request screen reads and creates persistent requests. The dashboard’s other sections use demonstration content and are scaffolding backed by tenant-aware tables, not complete workflows. Complete CRUD, role-specific screens, billing and collection flows, notification delivery, and per-apartment UI selection remain to be built before using it as an association’s system of record.

All database rows belonging to an apartment carry an `apartment_id`. API/server code must resolve the selected membership from the authenticated session and apply it to every tenant query. Never accept an apartment ID from a form as authorization. The schema includes membership roles, Auth.js-compatible database sessions, and audit records. Use row-level security policies in PostgreSQL before exposing direct database access to application roles.

## Deployment

For production, set unique random values for `AUTH_SECRET` and `POSTGRES_PASSWORD`, set `AUTH_URL`, `SMTP_URL`, `SMTP_FROM`, disable demo mode, and use TLS at the reverse proxy. Generate a secret with `openssl rand -base64 32`. The default database password is only for local development. `docker-compose.yml` exposes the app and PostgreSQL for local development. For VPS use, set `DOMAIN`, start with `docker compose --profile proxy up --build`, remove the database port mapping, and configure automated backups. Uploads use a tenant-partitioned local storage adapter and a persistent `data/uploads` volume. Hardware, electricity, network access and a domain may cost money; this project does not include a hosting provider.

## License

MIT. Runtime dependencies are open source; see their package metadata for individual licenses. Direct package versions and licenses were checked against npm metadata on 1 November 2026. `npm audit --omit=dev` reports no known runtime advisories; npm reports remaining moderate advisories in development-only tooling which currently has no non-breaking fix.
