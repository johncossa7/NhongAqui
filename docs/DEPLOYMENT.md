# Deployment

The production web application, Django API, PostgreSQL database and media volume run in the Railway project `NhongAqui website`. Keep the older `thriving-transformation` project disabled to avoid duplicate deploy alerts and charges.

## Railway services

### Backend

- Root directory: `/backend`
- Start command: the `backend/Procfile` migrates the database, removes known demo accounts, collects static files and starts Gunicorn
- Healthcheck path: `/health/`
- Media volume mount: `/app/media`

Required variables:

- `DJANGO_SECRET_KEY`: a long random value, never the placeholder from the example file
- `DJANGO_DEBUG=false`
- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `ALLOWED_HOSTS=.up.railway.app,healthcheck.railway.app`
- `CORS_ALLOWED_ORIGINS=https://web-production-d7b9f.up.railway.app`
- `CSRF_TRUSTED_ORIGINS=https://web-production-d7b9f.up.railway.app,https://nhongaqui-production.up.railway.app`
- `SERVE_MEDIA_FILES=true`
- `WEB_APP_URL=https://web-production-d7b9f.up.railway.app`
- `EMAIL_VERIFICATION_ENABLED=false`
- `PASSWORD_RESET_ENABLED=false`

### Web

- Root directory: `/web`
- Build command: `npm run build`
- Start command: `npm start`
- `VITE_API_URL=https://nhongaqui-production.up.railway.app/api/v1`

## Backups

Backups are infrastructure settings and are not enabled by application code.

1. Open the `Postgres` service, select **Backups**, and enable daily and weekly volume backups.
2. Enable point-in-time recovery when the production plan permits it.
3. Open the `nhongaqui-volume` attached to the backend and enable scheduled backups for uploaded images.
4. Keep a periodic logical `pg_dump` outside the Railway project. Railway volume backups do not survive deletion of the volume or project.
5. Run and record a restore drill before launch and at least every three months.

Railway reference: <https://docs.railway.com/guides/postgres-backups-restores>

## Monitoring

Railway healthchecks run during deployment, not continuously. Configure `/health/` on the backend service; it returns `503` when PostgreSQL cannot be reached. Add an external uptime monitor for:

- `https://nhongaqui-production.up.railway.app/health/`
- `https://web-production-d7b9f.up.railway.app/`

Send alerts only for the `NhongAqui website` project. Review Railway storage, memory, CPU and restart metrics weekly during the launch period.

Railway reference: <https://docs.railway.com/deployments/healthchecks>

## Release checklist

- Run backend tests and lint.
- Run web lint and build.
- Apply migrations and collect static files.
- Confirm the health endpoint reports both application and database as healthy.
- Upload, open, replace and delete a product image.
- Test registration, login, messaging, reporting and permanent account deletion.
- Confirm PostgreSQL and media-volume backup schedules in the correct project.
- Confirm HTTPS, CORS, allowed hosts and production secrets.
- Confirm no identity documents, credentials or tokens appear in logs.
