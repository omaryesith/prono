# Prono - Real-Time Project Management System

**Prono** is a collaborative project management platform designed with a **hybrid architecture (REST + WebSocket)**. It enables real-time state synchronization between multiple clients through a distributed event bus.

## 🏗 System Architecture

The system implements an **Event-Driven** pattern on a modern dockerized monolithic stack:

- **Core Backend:** Python 3.11 + Django 5 (ASGI Mode)
- **API Interface:** Django Ninja (Schema-driven REST API)
- **Real-Time Layer:** Django Channels + Daphne Server
- **Message Broker:** Redis 7 (Pub/Sub for WebSockets and Task Queues)
- **Persistence:** PostgreSQL 15
- **Asynchronous Workers:** Celery for heavy background tasks
- **Dependency Management:** Poetry

### Hybrid Data Flow

Prono implements a `sync_to_async` bridge that allows standard RESTful operations to inject events into the WebSocket bus, achieving instant notifications without polling.

## 🚀 Quick Start

The environment is fully reproducible using Docker Compose.

### Prerequisites

- Docker & Docker Compose
- Make (optional, for quick commands)

### Installation

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd prono
    ```

2. **Configure environment variables:**

    ```bash
    # Copy example file
    cp .env.example .env
    # The .env file already contains safe values for local development
    ```

3. **Start complete infrastructure:**

    ```bash
    # Option A: Using Make (recommended)
    make setup    # Build, migrate DB, and create superuser

    # Option B: Using Docker Compose directly
    docker compose up --build -d
    docker compose run --rm web python manage.py migrate
    docker compose run --rm web python manage.py createsuperuser
    ```

### Available Services

Once the system is started, the following services will be available:

- **REST API (Swagger):** http://localhost:8000/api/docs
- **Admin Panel:** http://localhost:8000/admin
- **WebSocket Endpoint:** `ws://localhost:8000/ws/projects/{id}/`

### Default Credentials

If you used `make setup`, it will automatically create:
- **Username:** admin  
- **Email:** admin@example.com
- **Password:** (the one you configure during the process)

## 🛠 Available Commands (Makefile)

The project includes a `Makefile` with useful commands for development:

```bash
make setup           # Complete setup: build, migrate and create superuser
make build           # Build Docker images
make up              # Start services in background
make up-dev          # Start services in foreground (view logs)
make down            # Stop all services
make logs            # View logs in real-time
make test            # Run test suite (pytest)
make shell           # Open Django shell
make migrate         # Run migrations
make makemigrations  # Create new migrations
make clean           # Clean __pycache__ and volumes
```

## 🧪 Testing & QA

The project includes an integration test suite using `pytest`.

```bash
# Option A: Using Make
make test

# Option B: Using Docker Compose
docker compose run --rm web pytest
```

## 📁 Project Structure

```
prono/
├── app/                    # Django source code
│   ├── core/              # Main project configuration
│   │   ├── settings.py    # Django settings
│   │   ├── asgi.py        # ASGI configuration for Channels
│   │   └── urls.py        # Main URLs
│   ├── projects/          # Projects app
│   │   ├── models.py      # Data models
│   │   ├── api.py         # REST endpoints (Django Ninja)
│   │   ├── schemas.py     # Validation schemas
│   │   └── consumers.py   # WebSocket consumers
│   └── manage.py
├── docker/                # Dockerfiles and scripts
├── .env.example           # Environment variables example
├── docker-compose.yml     # Service orchestration
├── pyproject.toml         # Poetry dependencies
└── Makefile              # Development commands

```

## 🔧 Environment Variables

The `.env.example` file contains all necessary variables. Important values:

| Variable | Description | Default value |
|----------|-------------|-------------------|
| `SECRET_KEY` | Django secret key | `insecure-dev-key` |
| `DEBUG` | Debug mode | `True` |
| `POSTGRES_DB` | Database name | `prono_db` |
| `POSTGRES_USER` | PostgreSQL user | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `REDIS_URL` | Redis URL | `redis://redis:6379/0` |
| `ALLOWED_HOSTS` | Allowed hosts | `localhost,127.0.0.1` |

> [!WARNING]
> **Never use these values in production.** Generate new secure credentials before deploying.

## 📝 Development Notes

- The project uses **Poetry** for Python dependency management
- Docker services include hot-reload for development
- Redis serves both as message broker for Celery and channel layer for Django Channels
- Django migrations **are included in Git** and should be committed
