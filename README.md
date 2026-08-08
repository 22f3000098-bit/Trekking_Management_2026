# Trekking Management Application (TMA)

A full-stack web application for managing trekking activities with role-based access for Admin, Trek Staff, and Trekkers.

## Tech Stack
- **Backend**: Flask, SQLite (SQLAlchemy), Flask-JWT-Extended
- **Frontend**: Vue.js 3 (CDN), Bootstrap 5
- **Cache**: Redis
- **Async Jobs**: Celery + Redis

## Quick start

Requires Python 3.9 or newer. From the project root:

```bash
./setup.sh   # creates the virtual environment, installs dependencies, seeds the database
./run.sh     # starts the app at http://localhost:5000
```

`setup.sh` only needs to be run once after cloning. It creates `.venv/`, installs
everything in `requirements.txt`, copies `.env.example` to `backend/.env`, and
populates the database with demo data.

Log in with the admin account created during setup:

- **Email**: admin@tma.com (or as set in `backend/.env`)
- **Password**: Admin@123 (or as set in `backend/.env`)

## Manual setup

If you prefer to run the steps yourself:

```bash
python3 -m venv .venv
source .venv/bin/activate        # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example backend/.env
cd backend && python seed_data.py && python app.py
```

## Background jobs (optional)

Redis powers caching and Celery. The app runs without it — caching is simply
disabled and a warning is logged — but reminders, monthly reports, and CSV
exports need it.

```bash
redis-server                                              # terminal 1
cd backend && celery -A celery_worker.celery_app worker --loglevel=info   # terminal 2
cd backend && celery -A celery_worker.celery_app beat --loglevel=info     # terminal 3
```

## Roles
| Role    | Access                                      |
|---------|---------------------------------------------|
| Admin   | Full system management, reports, dashboards |
| Staff   | Manage assigned treks, view participants    |
| Trekker | Browse treks, book, view history            |

## API Endpoints
- `POST /api/auth/register` — Trekker registration
- `POST /api/auth/login` — Login (all roles)
- `GET /api/admin/stats` — Admin dashboard stats
- `GET /api/user/treks` — Browse open treks
- `POST /api/user/bookings` — Book a trek
- `POST /api/user/bookings/export` — Export booking history (async)
