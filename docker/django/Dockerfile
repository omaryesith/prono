FROM python:3.11-slim-bullseye AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
  build-essential \
  libpq-dev \
  && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip
RUN pip install "poetry==1.8.4"

COPY ./pyproject.toml ./poetry.lock* /app/

RUN poetry export -f requirements.txt --output requirements.txt --without-hashes --with dev

FROM python:3.11-slim-bullseye

ENV PYTHONBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

RUN apt-get update && apt-get install -y \
  libpq5 \
  netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY ./docker/django/entrypoint.sh /entrypoint.sh
COPY ./docker/django/start.sh /start.sh
RUN chmod +x /entrypoint.sh /start.sh

COPY ./app /app

ENTRYPOINT [ "/entrypoint.sh" ]
