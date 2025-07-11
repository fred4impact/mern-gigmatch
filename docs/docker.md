## CI/CD with GitHub Actions

This project uses GitHub Actions for continuous integration and delivery. The workflow performs the following steps on push or pull request:

1. **Checkout code**
2. **Install dependencies** for both backend and frontend
3. **Run unit tests** (Jest, React Testing Library)
4. **Run security scan** (`npm audit` for both frontend and backend)
5. **Build Docker images** for frontend and backend
6. **Push Docker images to Docker Hub** (on main branch or with tag)

### Example Workflow: `.github/workflows/ci-cd.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, feature-* ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    services:
      mongo:
        image: mongo:5.0
        ports: [27017:27017]
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install backend dependencies
        run: cd backend && npm ci
      - name: Install frontend dependencies
        run: cd frontend && npm ci
      - name: Run backend tests
        run: cd backend && npm test
      - name: Run frontend tests
        run: cd frontend && npm test -- --watchAll=false
      - name: Security scan backend
        run: cd backend && npm audit --audit-level=high || true
      - name: Security scan frontend
        run: cd frontend && npm audit --audit-level=high || true
      - name: Build backend Docker image
        run: docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/gigmatch-backend:latest ./backend
      - name: Build frontend Docker image
        run: docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/gigmatch-frontend:latest ./frontend
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Push backend Docker image
        run: docker push ${{ secrets.DOCKERHUB_USERNAME }}/gigmatch-backend:latest
      - name: Push frontend Docker image
        run: docker push ${{ secrets.DOCKERHUB_USERNAME }}/gigmatch-frontend:latest
```

- Set your Docker Hub credentials as repository secrets: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`.
- Adjust image names/tags as needed for your workflow. 

## Manual Docker Build and Push Commands

To manually build and push Docker images to Docker Hub, use the following commands:

### Build and Push Backend Image
```bash
# Build the backend image
docker build -t your-dockerhub-username/gigmatch-backend:latest ./backend

# Push to Docker Hub
docker push your-dockerhub-username/gigmatch-backend:latest
```

### Build and Push Frontend Image
```bash
# Build the frontend image
docker build -t your-dockerhub-username/gigmatch-frontend:latest ./frontend

# Push to Docker Hub
docker push your-dockerhub-username/gigmatch-frontend:latest
```

### Build and Push Both Images (Combined)
```bash
# Build both images
docker build -t your-dockerhub-username/gigmatch-backend:latest ./backend
docker build -t your-dockerhub-username/gigmatch-frontend:latest ./frontend

# Push both images
docker push your-dockerhub-username/gigmatch-backend:latest
docker push your-dockerhub-username/gigmatch-frontend:latest
```

### Login to Docker Hub First
Before pushing, make sure you're logged in to Docker Hub:
```bash
docker login
```

**Note:** Replace `your-dockerhub-username` with your actual Docker Hub username.