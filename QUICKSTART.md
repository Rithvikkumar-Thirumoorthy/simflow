# SimplrFlow - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Rithvikkumar-Thirumoorthy/simflow.git
cd simflow
```

### 2. Set Up Environment
```bash
# Copy environment file
cp backend/.env.example backend/.env

# (Optional) Generate a new secret key
# openssl rand -hex 32
# Then update SECRET_KEY in backend/.env
```

### 3. Start the Application
```bash
# Start all services (PostgreSQL, Redis, MinIO, Backend, Frontend)
docker-compose up -d

# Wait for services to be ready (about 30-60 seconds)
docker-compose logs -f
```

### 4. Run Database Migrations
```bash
# Create initial migration
docker-compose exec backend alembic revision --autogenerate -m "Initial schema"

# Apply migrations
docker-compose exec backend alembic upgrade head
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **MinIO Console:** http://localhost:9001 (minioadmin / minioadmin)

### 6. Create Your First Account

1. Go to http://localhost:3000
2. Click "Sign up"
3. Enter your email and password (min 8 characters)
4. You'll be automatically logged in

### 7. Create Your First Dataset

1. Click "Create Dataset"
2. Enter a name (e.g., "My First Dataset")
3. Add a description (optional)
4. Click "Create"

### 8. Upload Images

1. Click on your dataset
2. Click "Upload Images"
3. Select one or more image files
4. Wait for upload to complete

### 9. Start Annotating

1. Click "Annotate" on any image
2. Click the "Bounding Box" tool
3. Click and drag on the image to draw a box
4. Enter a label (e.g., "person", "car", "dog")
5. Press Enter or click "Save"

### Keyboard Shortcuts

- **Delete**: Delete selected annotation
- **Escape**: Switch to select tool
- **Left Arrow**: Previous image
- **Right Arrow**: Next image

## 🛠️ Development Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Rebuild After Code Changes
```bash
# Backend
docker-compose up -d --build backend

# Frontend
docker-compose up -d --build frontend
```

### Database Operations
```bash
# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "Description"

# Apply migrations
docker-compose exec backend alembic upgrade head

# Rollback one migration
docker-compose exec backend alembic downgrade -1

# Access PostgreSQL
docker-compose exec db psql -U simplrflow -d simplrflow
```

### Stop Everything
```bash
# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose down -v
```

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Clean restart
docker-compose down -v
docker-compose up -d --build
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs db

# Wait for healthcheck to pass
docker-compose logs -f db
```

### MinIO Bucket Not Found
1. Go to http://localhost:9001
2. Login: minioadmin / minioadmin
3. Create bucket named "simplrflow"

### Frontend Can't Reach Backend
- Check both containers are running: `docker-compose ps`
- Check CORS settings in `backend/app/main.py`
- Check proxy in `frontend/vite.config.ts`

### Port Already in Use
If ports 3000, 8000, 5432, 6379, 9000, or 9001 are already in use:

Edit `docker-compose.yml` and change the port mappings:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

## 📝 What's Been Implemented (Phase 1)

✅ User authentication (JWT)
✅ Dataset management
✅ Image upload with thumbnails
✅ Bounding box annotations
✅ Annotation editing and deletion
✅ Multi-image navigation
✅ S3/MinIO storage

## 🚧 Coming Next (Phase 2)

⏳ Polygon annotations
⏳ Point annotations
⏳ Undo/redo functionality
⏳ Export to COCO format
⏳ Export to YOLO format
⏳ Export to Pascal VOC format
⏳ Data augmentation

## 📚 Additional Resources

- [Full Project Status](PROJECT_STATUS.md)
- [API Documentation](http://localhost:8000/docs) (when running)
- [Design Document](roboflow_full_system_design_document.pdf)

## 🆘 Need Help?

Check the [PROJECT_STATUS.md](PROJECT_STATUS.md) file for detailed implementation information and troubleshooting tips.
