# SimplrFlow

A computer vision annotation and dataset management platform for building and managing image datasets with support for multiple annotation formats.

## Features

- Multi-format annotation tools (bounding boxes, polygons, points)
- Data augmentation with automatic annotation transformation
- Export to COCO, YOLO, and Pascal VOC formats
- User authentication and role-based access control
- Dataset management and organization
- S3-compatible object storage

## Tech Stack

### Backend
- FastAPI (Python 3.11+)
- SQLAlchemy with PostgreSQL
- Celery for background tasks
- Redis for caching and task queue
- Albumentations for image augmentation
- OpenCV and Pillow for image processing

### Frontend
- React 18+
- TypeScript
- React-Konva for canvas-based annotation
- Zustand for state management
- Tailwind CSS for styling
- Vite for build tooling

### Infrastructure
- Docker & Docker Compose
- PostgreSQL for database
- Redis for caching
- MinIO for S3-compatible object storage (development)

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Development Setup

1. Clone the repository
2. Copy environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. Start all services with Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Access the services:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - MinIO Console: http://localhost:9001

### Local Development (without Docker)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
simplr-flow/
├── backend/
│   ├── app/
│   │   ├── api/          # API route handlers
│   │   ├── core/         # Core configurations
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── exporters/    # Export format handlers
│   │   └── main.py       # FastAPI application
│   ├── tests/            # Backend tests
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── stores/       # Zustand stores
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── pages/        # Page components
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## Development Phases

### Phase 0: Preparation (Week 1) - Current
- [x] Project structure setup
- [x] Docker Compose configuration
- [x] Basic FastAPI and React skeleton
- [ ] Database migrations setup
- [ ] CI/CD baseline

### Phase 1: Core MVP (Weeks 2-4)
- [ ] JWT authentication system
- [ ] Dataset CRUD operations
- [ ] Image upload with thumbnail generation
- [ ] Basic bounding box annotation UI

### Phase 2: Features (Weeks 5-8)
- [ ] Polygon annotation support
- [ ] Undo/redo functionality
- [ ] Export to COCO, YOLO, Pascal VOC
- [ ] Data augmentation with Albumentations

### Phase 3: Production Readiness (Weeks 9-12)
- [ ] Celery workers for async processing
- [ ] S3/object storage integration
- [ ] Production database setup
- [ ] CI/CD pipeline
- [ ] Monitoring and logging

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
