# Deployment

Production is prepared for Azure, but this repository does not include deployment credentials.

## Expected Azure Topology

- Azure App Service: Django API.
- Azure Database for PostgreSQL: relational data.
- Azure Blob Storage: product images and private verification files.
- Azure Static Web Apps or equivalent: web client.

## Required Environment

Set all secrets outside source control:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG=false`
- `DATABASE_URL`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `AZURE_STORAGE_ACCOUNT_NAME`
- `AZURE_STORAGE_ACCOUNT_KEY`
- `AZURE_STORAGE_CONTAINER`

## Release Checklist

- Run backend tests and lint.
- Run web lint and build.
- Run mobile typecheck.
- Apply migrations.
- Collect static files.
- Confirm CORS and allowed hosts.
- Confirm HTTPS-only settings.
- Confirm no documents or tokens appear in logs.
