#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

# Activate Poetry's virtual environment
source /app/.venv/bin/activate

echo "Starting Celery worker..."
exec celery -A core worker -l info
