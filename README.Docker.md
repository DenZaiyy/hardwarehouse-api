# Docker Deployment Guide - HardwareHouse Admin API

Complete Docker deployment guide for the HardwareHouse Admin API application.

## 🐳 Building and Running Your Application

### Quick Start
When you're ready, start your application by running:
```bash
docker compose up --build
```

Your application will be available at **http://localhost:3333**

### Development vs Production

**Development Mode:**
```bash
# Run with hot reload and development environment
docker compose -f compose.dev.yaml up --build
```

**Production Mode:**
```bash
# Run optimized production build
docker compose up --build
```

## 🏗️ Docker Configuration Details

### Dockerfile Architecture
The application uses a multi-stage Docker build:

1. **Base Stage**: Node.js 24.5.0 Alpine
2. **Dependencies Stage**: Install production dependencies
3. **Build Stage**: Install all dependencies and build the application
4. **Final Stage**: Copy built application and production dependencies only

### Port Configuration
- **Development**: `3000` (Next.js default)
- **Production**: `3333` (Docker container)

### Environment Variables in Docker

Create a `.env.production` file for production deployment:
```env
NODE_ENV=production
DATABASE_URL=mongodb+srv://user:pass@prod-cluster.mongodb.net/hardwarehouse
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
API_KEY=secure_production_api_key_for_symfony
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

## ☁️ Deploying Your Application to the Cloud

### Step 1: Build for Your Target Platform

**For same architecture:**
```bash
docker build -t hardwarehouse-admin .
```

**For different CPU architecture:**
If your cloud uses a different CPU architecture than your development machine (e.g., you are on a Mac M1 and your cloud provider is amd64):
```bash
docker build --platform=linux/amd64 -t hardwarehouse-admin .
```

### Step 2: Tag and Push to Registry

**Docker Hub:**
```bash
# Tag the image
docker tag hardwarehouse-admin your-dockerhub-username/hardwarehouse-admin:latest

# Push to Docker Hub
docker push your-dockerhub-username/hardwarehouse-admin:latest
```

**AWS ECR:**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Tag for ECR
docker tag hardwarehouse-admin:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/hardwarehouse-admin:latest

# Push to ECR
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/hardwarehouse-admin:latest
```

**Google Container Registry:**
```bash
# Tag for GCR
docker tag hardwarehouse-admin gcr.io/your-project-id/hardwarehouse-admin:latest

# Push to GCR
docker push gcr.io/your-project-id/hardwarehouse-admin:latest
```

### Step 3: Deploy to Cloud Platform

**Docker Compose on VPS:**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  hardwarehouse-admin:
    image: your-registry/hardwarehouse-admin:latest
    ports:
      - "3333:3333"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - API_KEY=${API_KEY}
    restart: unless-stopped
```

## 🔧 Advanced Docker Commands

### Build with Custom Name
```bash
docker build -t hardwarehouse-admin:v1.0.0 .
```

### Run with Custom Port Mapping
```bash
docker run -p 8080:3333 hardwarehouse-admin
```

### Run with Environment Variables
```bash
docker run -p 3333:3333 \
  -e NODE_ENV=production \
  -e DATABASE_URL="your-mongodb-url" \
  -e CLERK_SECRET_KEY="your-clerk-secret" \
  hardwarehouse-admin
```

### Run in Background (Detached Mode)
```bash
docker run -d -p 3333:3333 --name hardwarehouse-api hardwarehouse-admin
```

### View Container Logs
```bash
docker logs hardwarehouse-api
```

### Stop and Remove Container
```bash
docker stop hardwarehouse-api
docker rm hardwarehouse-api
```

## 🐞 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find process using port 3333
lsof -i :3333

# Use different port
docker run -p 3334:3333 hardwarehouse-admin
```

**2. Database Connection Issues**
- Ensure MongoDB is accessible from Docker container
- Check if `DATABASE_URL` includes correct network settings
- For local MongoDB, use host.docker.internal instead of localhost

**3. Build Failures**
```bash
# Clean Docker cache
docker system prune -a

# Build without cache
docker build --no-cache -t hardwarehouse-admin .
```

**4. Clerk Authentication Issues**
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is accessible in browser
- Ensure `CLERK_SECRET_KEY` is set correctly in server environment
- Check Clerk dashboard for domain configuration

### Debug Container
```bash
# Run container with shell access
docker run -it --entrypoint /bin/sh hardwarehouse-admin

# Execute commands in running container
docker exec -it hardwarehouse-api /bin/sh
```

## 📊 Monitoring and Health Checks

### Health Check Endpoint
The application provides a health check at `/api/health`:
```bash
curl http://localhost:3333/api/health
```

### Docker Health Check
Add to Dockerfile:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3333/api/health || exit 1
```

## 🔒 Security Best Practices

### Production Security
1. **Use specific image tags** (not `latest`)
2. **Run as non-root user** (already configured in Dockerfile)
3. **Limit container resources**:
   ```bash
   docker run --memory=1g --cpus=1 -p 3333:3333 hardwarehouse-admin
   ```
4. **Use secrets for sensitive data**:
   ```bash
   echo "your-secret" | docker secret create clerk_secret -
   ```

### Network Security
```bash
# Create custom network
docker network create hardwarehouse-network

# Run container on custom network
docker run --network hardwarehouse-network -p 3333:3333 hardwarehouse-admin
```

## 📚 References

- [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
- [Docker Compose documentation](https://docs.docker.com/compose/)
- [Next.js Docker deployment](https://nextjs.org/docs/deployment#docker-image)
- [Docker getting started](https://docs.docker.com/go/get-started-sharing/)

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t hardwarehouse-admin .
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push hardwarehouse-admin
```

---

**Note**: This Docker guide is specifically tailored for the HardwareHouse Admin API. Always test deployment in a staging environment before production.