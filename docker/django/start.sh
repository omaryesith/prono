#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Applying migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting ASGI server..."
exec daphne core.asgi:application -b 0.0.0.0 -p 8000
