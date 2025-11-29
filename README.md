<div align="center">

# 🚀 Prono

### Real-Time Collaborative Project Management Platform

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

*A modern, event-driven project management system with hybrid REST + WebSocket architecture for seamless real-time collaboration.*

> [!NOTE]
> **Portfolio Demonstration Project**  
> This is a demonstration project showcasing modern web development practices, real-time communication patterns, and full-stack Python architecture. It is part of my professional portfolio to demonstrate technical skills in Django, WebSockets, event-driven design, and containerized deployment.

[Features](#-features) •
[Architecture](#-architecture) •
[Quick Start](#-quick-start) •
[API Documentation](#-api-documentation) •
[Contributing](#-contributing)

</div>

---

## 📖 Overview

**Prono** is a cutting-edge collaborative project management platform that leverages a **hybrid architecture (REST + WebSocket)** to enable real-time state synchronization across multiple clients. Built with modern Python technologies and containerized for seamless deployment, Prono delivers instant notifications and updates without polling overhead.

### ✨ Features

- 🔄 **Real-Time Synchronization** - WebSocket-based instant updates across all connected clients
- 🎯 **RESTful API** - Clean, schema-driven REST API powered by Django Ninja
- 🔐 **JWT Authentication** - Secure token-based authentication for both REST and WebSocket connections
- 🌐 **React Frontend** - Modern TypeScript React frontend with real-time updates
- 📊 **Project & Task Management** - Comprehensive project organization with task tracking
- ⚡ **Asynchronous Processing** - Celery workers for heavy background operations
- 🐳 **Docker-First** - Fully containerized with Docker Compose orchestration
- 🔀 **Nginx Reverse Proxy** - Production-ready setup with nginx serving frontend and proxying API/WebSocket traffic
- 📡 **Event-Driven Architecture** - Decoupled components communicating via Redis Pub/Sub
- 🔧 **Developer Friendly** - Hot-reload, comprehensive Makefile commands, and clear documentation
- 📝 **Auto-Generated Docs** - Interactive Swagger/OpenAPI documentation

### 📸 Screenshot

<div align="center">

![Frontend Demo - Real-time Project Management](docs/images/frontend_demo.png)
*Real-time collaborative project management interface with WebSocket updates*

</div>

---

## 🏗 Architecture

### Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript + Vite | Modern UI with real-time updates |
| **Reverse Proxy** | Nginx 1.25 | Serve frontend, proxy API/WebSocket, handle static files |
| **Backend** | Python 3.11 + Django 5 | Core application logic (ASGI mode) |
| **API** | Django Ninja | Schema-driven REST API framework |
| **Real-Time** | Django Channels + Daphne | WebSocket server and ASGI handling |
| **Message Broker** | Redis 7 | Pub/Sub for WebSockets & Celery queues |
| **Database** | PostgreSQL 15 | Primary data persistence |
| **Task Queue** | Celery | Asynchronous background jobs |
| **Dependencies** | Poetry | Python package management |
| **Container** | Docker + Docker Compose | Service orchestration |

</div>

### System Architecture

```mermaid
graph TB
    Client[Web Client<br/>React + TypeScript]
    Nginx[Nginx<br/>Reverse Proxy]
    API[REST API<br/>Django Ninja]
    WS[WebSocket Server<br/>Django Channels]
    Redis[(Redis<br/>Message Broker)]
    DB[(PostgreSQL<br/>Database)]
    Celery[Celery Workers<br/>Background Tasks]
    
    Client <-->|Port 80| Nginx
    Nginx -->|/api/*| API
    Nginx -->|/ws/*| WS
    Nginx -->|/*| Client
    API --> DB
    WS --> Redis
    API -->|async_to_sync| Redis
    Redis --> WS
    Celery --> Redis
    Celery --> DB
    
    style Client fill:#e1f5ff
    style Nginx fill:#ffe0b2
    style API fill:#fff4e6
    style WS fill:#f3e5f5
    style Redis fill:#ffebee
    style DB fill:#e8f5e9
    style Celery fill:#fff9c4
```

### Data Flow

**REST → WebSocket Bridge:**
Prono implements a unique `sync_to_async` bridge that enables standard RESTful operations to inject events into the WebSocket bus, achieving instant push notifications without client polling.

**Example Flow:**
1. Client creates task via REST API (`POST /api/projects/{id}/tasks`)
2. API handler updates database synchronously
3. API triggers event via `async_to_sync(channel_layer.group_send())`
4. Redis broadcasts event to all WebSocket subscribers in project room
5. All connected clients receive real-time notification instantly

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Docker** (v20.10+) & **Docker Compose** (v2.0+)
- **Make** (optional, for convenience commands)
- **Git**

### Installation

1️⃣ **Clone the repository:**

```bash
git clone https://github.com/omaryesith/prono.git
cd prono
```

2️⃣ **Configure environment:**

```bash
cp .env.example .env
# The .env file contains safe defaults for local development
# Modify if needed for your environment

# Create symlink for Django to read .env from app/ directory
ln -sf ../.env app/.env
```

3️⃣ **Start the application:**

**Option A: Using Make (Recommended)**
```bash
make setup
# This will: build images, run migrations, and create a superuser
```

**Option B: Using Docker Compose directly**
```bash
docker compose up --build -d
docker compose run --rm web python manage.py migrate
docker compose run --rm web python manage.py createsuperuser
```

4️⃣ **Access the services:**

**Development Mode (default):**
| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Frontend** | http://localhost:5173 | React development server (Vite) |
| 📚 **API Docs (Swagger)** | http://localhost:8000/api/docs | Interactive API documentation |
| 🔐 **Admin Panel** | http://localhost:8000/admin | Django admin interface |
| 🔌 **WebSocket** | `ws://localhost:8000/ws/projects/{id}/?token=YOUR_JWT` | Real-time project updates |

**Production Mode:**
```bash
# Build and start production containers
docker compose -f docker-compose.prod.yml up --build -d
```

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Application** | http://localhost | Full application via Nginx reverse proxy |
| 📚 **API** | http://localhost/api/ | REST API endpoints |
| 🔌 **WebSocket** | `ws://localhost/ws/projects/{id}/?token=YOUR_JWT` | Real-time WebSocket connections |
| 🔐 **Admin** | http://localhost/admin/ | Django admin panel |

### Default Credentials

If you used `make setup`, a superuser is created with:

- **Username:** `admin`
- **Email:** `admin@example.com`
- **Password:** *(set during creation)*

---

## 🛠 Development Commands

The project includes a comprehensive `Makefile` for common operations:

```bash
# Setup & Build
make setup           # Complete setup: build, migrate, create superuser
make build           # Build Docker images

# Running Services
make up              # Start all services in background
make up-dev          # Start services in foreground (view logs)
make down            # Stop all services

# Development
make shell           # Open Django shell
make logs            # View real-time logs from all services
make migrate         # Run pending migrations
make makemigrations  # Create new migrations

# Maintenance
make clean           # Remove __pycache__ and volumes
```

---

## 📡 API Documentation

### Authentication

Prono uses **JWT (JSON Web Tokens)** for authentication. Obtain a token pair:

```bash
POST /api/token/pair
{
  "username": "admin",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

Use the `access` token in the `Authorization` header:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Core Endpoints

#### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/projects/` | Create new project |
| `GET` | `/api/projects/` | List user's projects |
| `GET` | `/api/projects/{id}` | Get project details |

#### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/projects/{id}/tasks` | Create task in project |
| `POST` | `/api/tasks/{id}/complete` | Mark task as complete + real-time notify |

### Example: Create Project

```bash
curl -X POST http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Complete UI/UX overhaul"
  }'
```

**Response:**
```json
{
  "id": 1,
  "name": "Website Redesign",
  "description": "Complete UI/UX overhaul",
  "owner_id": 1,
  "created_at": "2025-11-27T19:30:00Z",
  "tasks": []
}
```

### WebSocket Authentication

WebSocket connections require JWT authentication via query parameter:

**Development Mode (direct to Django):**
```javascript
// First, obtain JWT token from REST API
const token = 'YOUR_ACCESS_TOKEN';

// Connect to WebSocket with token in query string
const ws = new WebSocket(`ws://localhost:8000/ws/projects/1/?token=${token}`);

ws.onopen = () => {
  console.log('Connected to project room');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  // Handle real-time updates (e.g., task completed, new comment)
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Send a message
ws.send(JSON.stringify({
  type: 'chat_message',
  text: 'Hello from client!',
  sender: 'username'
}));
```

**Production Mode (via Nginx reverse proxy):**
```javascript
const token = 'YOUR_ACCESS_TOKEN';

// Connect through nginx (no port 8000, just port 80)
const ws = new WebSocket(`ws://localhost/ws/projects/1/?token=${token}`);
// In production with domain: ws://yourdomain.com/ws/projects/1/?token=${token}
```

**Note:** The JWT token is validated via the custom `JwtAuthMiddleware` in `app/core/middleware.py`.

For full API documentation, visit the **Swagger UI** at http://localhost:8000/api/docs after starting the server.

---

## 📁 Project Structure

```
prono/
├── app/                        # Django application source
│   ├── core/                  # Project configuration
│   │   ├── settings.py        # Django settings
│   │   ├── asgi.py            # ASGI config for Channels
│   │   ├── urls.py            # URL routing
│   │   ├── celery.py          # Celery configuration
│   │   └── middleware.py      # JWT WebSocket authentication
│   ├── projects/              # Projects app
│   │   ├── models.py          # Project and Task models
│   │   ├── api.py             # REST API endpoints
│   │   ├── schemas.py         # Pydantic validation schemas
│   │   ├── consumers.py       # WebSocket consumers
│   │   └── admin.py           # Django admin config
│   └── static/                # Collected static files (generated)
├── frontend/                  # React frontend application
│   ├── src/                  # React source code
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # Entry point
│   │   └── assets/           # Static assets
│   ├── package.json          # npm dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── tsconfig.json         # TypeScript configuration
├── docker/                    # Docker configuration
│   ├── django/               # Django container
│   │   ├── Dockerfile        # Python app container
│   │   ├── entrypoint.sh     # Container entrypoint
│   │   └── start.sh          # Startup script
│   ├── frontend/             # Frontend build container
│   │   └── Dockerfile        # Multi-stage build for React
│   └── nginx/                # Nginx reverse proxy
│       └── default.conf      # Nginx configuration
├── .env.example               # Environment variables template
├── .dockerignore              # Docker build exclusions
├── docker-compose.yml         # Development orchestration
├── docker-compose.prod.yml    # Production orchestration
├── pyproject.toml             # Poetry dependencies
├── Makefile                   # Development commands
└── README.md                  # This file
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file from `.env.example` and customize as needed:

| Variable | Description | Default | Production Notes |
|----------|-------------|---------|------------------|
| `SECRET_KEY` | Django secret key | `insecure-dev-key` | ⚠️ **Must change** |
| `DEBUG` | Debug mode | `True` | ⚠️ Set to `False` |
| `ALLOWED_HOSTS` | Allowed hostnames | `localhost,127.0.0.1` | Add your domain |
| `POSTGRES_DB` | Database name | `prono_db` | - |
| `POSTGRES_USER` | Database user | `postgres` | ⚠️ Use strong credentials |
| `POSTGRES_PASSWORD` | Database password | `postgres` | ⚠️ Use strong credentials |
| `POSTGRES_HOST` | Database host | `db` | - |
| `POSTGRES_PORT` | Database port | `5432` | - |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379/0` | - |

> [!CAUTION]
> **Never commit `.env` to version control!** The `.env.example` file contains safe defaults for development only. Always generate strong, unique credentials for production deployments.

---

## 🐛 Troubleshooting

### Port Already in Use

If port 8000 is already occupied:
```bash
# Find process using port 8000
sudo lsof -i :8000

# Kill the process or change port in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps

# View database logs
docker compose logs db

# Restart database
docker compose restart db
```

### Redis Connection Issues

```bash
# Check Redis status
docker compose exec redis redis-cli ping
# Should respond: PONG

# View Redis logs
docker compose logs redis
```

### Migration Errors

```bash
# Reset database (⚠️ destroys data)
docker compose down -v
docker compose up -d db
docker compose run --rm web python manage.py migrate
```

---

## 📝 Development Notes

- **Poetry** manages Python dependencies (see `pyproject.toml`)
- **Frontend** uses Vite for fast development with HMR (Hot Module Replacement)
- **Hot-reload** is enabled for both Django and React in development mode
- **Redis** serves dual purpose: Celery broker + Channels layer
- **Migrations** are tracked in Git and should be committed
- **Code formatting**: Black + isort (configured in `pyproject.toml`)
- **CORS**: Configured to allow `localhost:5173` for local frontend development
- **Production deployment**: Uses multi-stage Docker builds and nginx reverse proxy

### ⚠️ Security Notes

> [!WARNING]
> **Authentication Disabled for Testing**: Several API endpoints currently have authentication checks commented out for development convenience. Before deploying to production, search for `# TODO: Re-enable authentication` comments in `app/projects/api.py` and restore proper owner verification.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

This project uses:
- **Black** for code formatting
- **isort** for import sorting

Run formatters before committing:
```bash
docker compose run --rm web black .
docker compose run --rm web isort .
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Django](https://www.djangoproject.com/)
- API framework: [Django Ninja](https://django-ninja.rest-framework.com/)
- Real-time: [Django Channels](https://channels.readthedocs.io/)
- Task queue: [Celery](https://docs.celeryproject.org/)

---

<div align="center">

**Made with ❤️ by [Omar Alvarado](https://github.com/omaryesith)**

⭐ Star this repo if you find it useful!

</div>
