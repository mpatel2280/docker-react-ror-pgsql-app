# Docker React + Rails + PostGres App

A full-stack application with React frontend, Ruby on Rails API backend, and PostGres database, all containerized with Docker.

## Features

- User Registration and Login (JWT Authentication)
- CRUD Operations for Items
- Dockerized setup for easy deployment
- React frontend with Vite
- Rails API backend
- PostGres database

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone the repository
2. Run the application:

```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## API Endpoints

### Authentication
- POST `/signup` - Register a new user
- POST `/login` - Login user

### Items (Protected)
- GET `/api/items` - Get all items
- POST `/api/items` - Create a new item
- GET `/api/items/:id` - Get a specific item
- PUT `/api/items/:id` - Update an item
- DELETE `/api/items/:id` - Delete an item

## Stopping the Application

```bash
docker-compose down
```

To remove volumes as well:

```bash
docker-compose down -v
```

