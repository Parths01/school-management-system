# Scholar — School Management System

A MERN school administration app with a responsive React dashboard and a MongoDB-backed student directory. It supports searchable, sortable, paginated student records and full create, read, update, and delete workflows.

## Requirements

- Node.js 20 or newer
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

1. Configure the API environment:

   ```powershell
   cd server
   Copy-Item .env.example .env
   ```

   Set `MONGODB_URI` in `server/.env` to your MongoDB connection string. `PORT` defaults to `5000`.

2. Install and run the API in one terminal:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

3. Install and run Vite in another terminal:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

   Open the URL printed by Vite. The dev server proxies `/api` to `http://localhost:5000`. Set `VITE_API_URL` at client build time if the API is hosted elsewhere.

On Windows, `start.bat` starts both services and waits for the API health check before starting Vite; `stop.bat` stops them.

## Troubleshooting

If Vite logs `http proxy error` or `ECONNREFUSED` for `/api` requests, the Express API is not reachable. Make sure MongoDB is running and `server/.env` contains a valid `MONGODB_URI`, then start `npm run dev` from `server` and wait for the API listening message. Check `http://127.0.0.1:5000/api/health`; it should return `status: ok` and `database: true`. Restart Vite after changing its proxy configuration.

## Environment variables

| Variable | Used by | Default | Description |
| --- | --- | --- | --- |
| `MONGODB_URI` | Server | — | MongoDB connection string (required) |
| `PORT` | Server | `5000` | Express API port |
| `VITE_API_URL` | Client build | `/api` | API base URL used by the browser |

## API

All endpoints are under `/api`. Student, school, and dashboard data is loaded from MongoDB. No demo records are inserted automatically. Student objects are returned in a `data` property; list responses also include pagination metadata. Errors return `{ "message": "..." }`. Configure the school name, administrator, and academic year using the **Edit school profile** control in the app; those details are saved in MongoDB.

- `GET /health` — API and database readiness
- `GET /students?page=1&limit=10&sortBy=lastName&sortOrder=asc` — search, filter, sort, and paginate. Search covers name, email, student ID, grade, and section. Sort fields: `firstName`, `lastName`, `email`, `grade`, `section`, `status`, `enrollmentDate`, `createdAt`.
- `GET /dashboard` — database-backed totals, class counts, grade breakdown, and recently enrolled students
- `GET /school` — get the saved school profile (returns `data: null` before setup)
- `PATCH /school` — save school name, administrator name/title, and academic year
- `GET /students/:id` — get one student
- `POST /students` — create a student (`firstName`, `lastName`, `email`, `grade`, and `section` required; `phone` and `status` optional)
- `PATCH /students/:id` — update supplied student fields
- `DELETE /students/:id` — delete a student

Email addresses are validated and unique. Invalid IDs and fields, missing records, and duplicate emails return explicit client errors.

## Checks

From `client`, run `npm run build`. From `server`, run `npm test` and `npm run dev` (with MongoDB configured). The server uses Node's built-in test runner for schema validation tests.
