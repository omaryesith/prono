# Production Frontend Deployment Test

## Quick Test Commands

### 1. Build production images
```bash
docker compose -f docker-compose.prod.yml build nginx
```

### 2. Start production stack
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 3. Verify services
```bash
docker compose -f docker-compose.prod.yml ps
```

### 4. Check logs
```bash
docker compose -f docker-compose.prod.yml logs nginx
```

### 5. Test endpoints
```bash
# Frontend (should serve React app)
curl -I http://localhost

# API (should proxy to Django)
curl -I http://localhost/api/docs

# Health check
curl http://localhost/api/docs
```

## Expected Results

✅ **Frontend**: Loads at http://localhost  
✅ **API**: Available at http://localhost/api/docs  
✅ **Static Assets**: Served with proper cache headers  
✅ **React Router**: Works on page refresh  

## Environment Variables (Production)

The following variables are injected at **build time**:

- `VITE_API_URL=/api` - Relative URL (nginx proxies to Django)
- `VITE_WS_URL=/ws/projects` - Would need similar config for WebSockets

## Cleanup

```bash
docker compose -f docker-compose.prod.yml down
```
