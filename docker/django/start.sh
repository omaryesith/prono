#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

python manage.py migrate

exec daphne core.asgi:application -b 0.0.0.0 -p 8000
