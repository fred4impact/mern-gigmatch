# API Endpoints

Below are the main API endpoints exposed by the backend, grouped by route. All endpoints are prefixed with `/api`.

---

## Auth Routes (`/api/auth`)
- `POST   /api/auth/register` — Register a new user
- `POST   /api/auth/login` — Login user
- `GET    /api/auth/me` — Get current user profile (protected)
- `PUT    /api/auth/me` — Update user profile (protected)
- `PUT    /api/auth/change-password` — Change password (protected)
- `POST   /api/auth/logout` — Logout user (protected)
- `POST   /api/auth/forgot-password` — Request password reset
- `POST   /api/auth/reset-password` — Reset password

## Events Routes (`/api/events`)
- `GET    /api/events/` — Get all events
- `GET    /api/events/my-events` — Get events created by the current user (protected)
- `GET    /api/events/:id` — Get event by ID
- `POST   /api/events/` — Create a new event (planners/studios only, protected)
- `PUT    /api/events/:id` — Update event (protected)
- `DELETE /api/events/:id` — Delete event (protected)

## Applications Routes (`/api/applications`)
- `POST   /api/applications/events/:eventId/apply` — Apply to an event (talents only, protected)
- `GET    /api/applications/applications/stats` — Get application statistics (protected)
- `POST   /api/applications/` — Apply to an event (RESTful, protected)

## Dashboard Routes (`/api/dashboard`)
- `GET    /api/dashboard/talent-stats` — Get talent dashboard statistics (protected)
- `GET    /api/dashboard/planner-stats` — Get planner/studio dashboard statistics (protected)
- `GET    /api/dashboard/public-stats` — Get public stats for homepage

## Admin Routes (`/api/admin`)
- `GET    /api/admin/users` — Get all users (admin only)
- `GET    /api/admin/events` — Get all events (admin only)
- `GET    /api/admin/bookings` — Get all bookings (admin only)
- `GET    /api/admin/disputes` — Get all disputes (admin only)
- `GET    /api/admin/analytics/overview` — Get analytics overview (admin only)
- `GET    /api/admin/subscriptions` — Get all subscriptions (admin only)

## Matching Routes (`/api/matching`)
- `GET    /api/matching/events/:eventId/matches` — Find talent matches for an event (planners/studios only, protected)
- `GET    /api/matching/talent/recommendations` — Get subscription recommendations for a talent (protected)

## Profile Routes (`/api/profile`)
- `POST   /api/profile/upload-picture` — Upload profile picture (protected, rate-limited)
- `GET    /api/profile/:userId?` — Get user profile (protected)

## Users Routes (`/api/users`)
- `GET    /api/users/` — Placeholder for user management (protected)

## Talents Routes (`/api/talents`)
- `GET    /api/talents/` — Placeholder for talent management (protected)

---

**Note:** Some endpoints require authentication (protected) or specific roles (e.g., admin, planner, talent). 

---

## Sample cURL Commands

### Register a New User (POST)
```sh
curl -X POST http://<server-ip>:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "category": "musician"
  }'
```

### Login (POST)
```sh
curl -X POST http://<server-ip>:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "Password123!"
  }'
```

### Get Public Stats (GET)
```sh
curl http://<server-ip>:5000/api/dashboard/public-stats
```

### Get Current User Profile (GET, with Bearer Token)
```sh
curl http://<server-ip>:5000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

> Replace `<server-ip>` with your actual server IP (e.g., 172.237.116.118) and `<your-jwt-token>` with a valid JWT from login. 