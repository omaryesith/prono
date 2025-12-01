# 🎨 Frontend Development Guide

## Quick Start

### Start all services (Backend + Frontend)
```bash
docker compose up -d
```

### Start only frontend (requires backend to be running)
```bash
docker compose up -d frontend
```

### View frontend logs
```bash
docker compose logs -f frontend
```

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| 🎨 **Frontend** | http://localhost:5173 | React app with hot-reload |
| 📚 **API Docs** | http://localhost:8000/api/docs | Backend API documentation |
| 🔐 **Admin** | http://localhost:8000/admin | Django admin panel |

## Development Workflow

### Making Changes
1. Edit files in `frontend/src/`
2. Changes will auto-reload thanks to Vite HMR (Hot Module Replacement)
3. No need to restart the container!

### Installing New Dependencies
```bash
# Inside the container
docker compose exec frontend npm install <package-name>

# Or rebuild the container
docker compose up -d --build frontend
```

### Troubleshooting

**Port 5173 already in use?**
```bash
# Stop any local Vite servers
pkill -f vite

# Or change the port in docker-compose.yml
```

**Hot-reload not working?**
- Ensure `vite.config.ts` has `watch.usePolling: true`
- Check that volumes are mounted correctly

**Can't connect to backend?**
- Verify backend is running: `docker compose ps`
- Check `VITE_API_URL` in environment

## Environment Variables

Add to your `.env` file:

```bash
VITE_API_URL=http://localhost:8000  # Backend API URL
```

## Tips

- **Fast refresh**: Vite provides instant feedback on code changes
- **Network access**: Frontend is accessible from `http://0.0.0.0:5173/` inside Docker
- **Node modules**: Protected by anonymous volume mount - won't be overwritten by host
