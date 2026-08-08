#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$PROJECT_DIR/.venv"

if [ ! -x "$VENV_DIR/bin/python" ]; then
    echo "Virtual environment not found. Run ./setup.sh first." >&2
    exit 1
fi

cd "$PROJECT_DIR/backend"
exec "$VENV_DIR/bin/python" app.py
