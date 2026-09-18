# NhongAqui

**Encontre. Venda. Confie.**

NhongAqui is a production-oriented marketplace MVP for Mozambique, initially focused on Maputo and Matola. It is built as a monorepo with one Django REST API consumed by both the responsive web app and the Expo mobile app.

## Architecture

- `backend/` - Django, Django REST Framework, PostgreSQL, JWT auth.
- `web/` - React, Vite, TypeScript, Tailwind CSS.
- `mobile/` - React Native, Expo Router, TypeScript.
- `docs/` - architecture, API, deployment, mobile and security notes.
- `docker-compose.yml` - local PostgreSQL, backend and web services.

## Quick Start

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Start the development stack:

   ```bash
   docker compose up --build
   ```

3. Run migrations and seed demo data:

   ```bash
   docker compose exec backend python manage.py migrate
   docker compose exec backend python manage.py seed_demo
   docker compose exec backend python manage.py createsuperuser
   ```

4. Open:

   - API: `http://localhost:8000/api/v1/`
   - Swagger docs: `http://localhost:8000/api/docs/`
   - Web: `http://localhost:5173/`

## Local Backend Without Docker

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

PostgreSQL is the primary database. SQLite is only wired for lightweight automated tests when explicitly enabled with `DJANGO_TEST_SQLITE=true`.

## Local Web

```bash
cd web
npm install
npm run dev
```

## Local Mobile

```bash
cd mobile
npm install
npm run start
```

Expo uses the same API. Set `EXPO_PUBLIC_API_URL` when testing on a physical device.
See `docs/MOBILE.md` for the Android release and Play Console checklist.

## Tests And Quality

```bash
cd backend
pytest
ruff check .

cd ../web
npm run lint
npm run build

cd ../mobile
npm run typecheck
```

## Production Preparation

The web app, Django API, PostgreSQL database and product-image volume are deployed in the Railway project `NhongAqui website`. The Expo app is configured to produce an Android App Bundle for Google Play through EAS Build.

See `docs/DEPLOYMENT.md` and `docs/SECURITY.md` before launch.

## Legal Notice

The Terms, Privacy and prohibited-listing policies are published on the website. They still require review by a qualified Mozambican legal professional before a broad public launch.
