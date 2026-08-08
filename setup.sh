#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$PROJECT_DIR/.venv"

cd "$PROJECT_DIR"

echo "==> Creating virtual environment"
python3 -m venv "$VENV_DIR"

echo "==> Installing dependencies"
"$VENV_DIR/bin/pip" install --quiet --upgrade pip
"$VENV_DIR/bin/pip" install --quiet -r requirements.txt

if [ ! -f backend/.env ]; then
    echo "==> Creating backend/.env from .env.example"
    cp .env.example backend/.env
else
    echo "==> backend/.env already exists, leaving it unchanged"
fi

echo "==> Creating and seeding the database"
(cd backend && "$VENV_DIR/bin/python" seed_data.py)

echo
echo "Setup complete. Start the app with:"
echo "    ./run.sh"
