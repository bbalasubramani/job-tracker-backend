# Job Tracker Backend API

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=000000)](https://render.com/)

**Live demo:** [job-tracker-frontend-red.vercel.app](https://job-tracker-frontend-red.vercel.app)

This repository contains the backend REST API for **Job Tracker**, a full-stack application for tracking job applications from a separate React frontend.

> Frontend repository: [Job Tracker Frontend](https://github.com/your-username/job-tracker-frontend) <!-- Replace with the actual frontend repo URL. -->

## What the API Does

The Job Tracker API lets authenticated users manage their personal job application pipeline. It provides endpoints to:

- Register a new user account.
- Log in with email and password.
- Issue JWTs for authenticated API access.
- Create job application records.
- View only the logged-in user's job applications.
- Update a job application's status.
- Delete a job application owned by the logged-in user.

## Tech Stack

- **Node.js** - JavaScript runtime for the backend service.
- **Express.js** - REST API routing and middleware framework.
- **PostgreSQL / Supabase** - Relational database for users and job applications.
- **JWT** - Stateless authentication for protected routes.
- **bcrypt** - Password hashing before storing credentials.
- **GitHub Actions** - CI/CD automation for checks and deployment workflows.
- **Render** - Backend hosting platform.

## API Endpoints

| Method | Route | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/register` | Creates a new user account with a hashed password. | No |
| `POST` | `/login` | Validates credentials and returns a signed JWT. | No |
| `GET` | `/jobs` | Returns all job applications for the authenticated user. | Yes |
| `POST` | `/jobs` | Creates a new job application for the authenticated user. | Yes |
| `PUT` | `/jobs/:id` | Updates a job application's `status`. | Yes |
| `DELETE` | `/jobs/:id` | Deletes a job application owned by the authenticated user. | Yes |

### Example Auth Header

Protected routes require a bearer token in the `Authorization` header:

```http
Authorization: Bearer <jwt-token>
```

## JWT Authentication Flow

1. **Register**
   - The client sends `username`, `email`, and `password` to `POST /register`.
   - The API checks that all required fields are present.
   - The API verifies that the email is not already registered.
   - The password is hashed with bcrypt.
   - A new user row is inserted into PostgreSQL.

2. **Login**
   - The client sends `email` and `password` to `POST /login`.
   - The API finds the user by email.
   - bcrypt compares the provided password against the stored password hash.
   - If the credentials are valid, the API signs a JWT containing the user's `id`.
   - The JWT expires after one day.

3. **Protected routes**
   - The frontend stores the JWT and sends it as `Authorization: Bearer <jwt-token>`.
   - The backend middleware verifies the token with `JWT_SECRET`.
   - When valid, the decoded user id is attached to the request as `req.user.id`.
   - Job routes use that id to associate records with the logged-in user.

## Database Schema Overview

The backend uses PostgreSQL, hosted with Supabase, with at least the following tables.

### `users`

| Column | Type | Description |
| --- | --- | --- |
| `id` | integer / UUID | Primary key for the user. |
| `username` | text / varchar | Display name chosen during registration. |
| `email` | text / varchar | Unique email used for login. |
| `password` | text / varchar | bcrypt-hashed password. |
| `created_at` | timestamp | Timestamp for when the account was created. |

### `jobs`

| Column | Type | Description |
| --- | --- | --- |
| `id` | integer / UUID | Primary key for the job application. |
| `company` | text / varchar | Company name. |
| `role` | text / varchar | Position or role title. |
| `status` | text / varchar | Current application status, such as applied, interview, offer, or rejected. |
| `applied_date` | date | Date the user applied. |
| `user_id` | integer / UUID | Foreign key linking the job to a user. |
| `created_at` | timestamp | Timestamp for when the job record was created. |

## GitHub Actions CI/CD Pipeline

This backend is designed to use GitHub Actions for CI/CD before deployment to Render.

A typical pipeline should:

1. **Run on push and pull request**
   - Trigger checks whenever code is pushed or a PR is opened.

2. **Install dependencies**
   - Check out the repository.
   - Set up Node.js.
   - Run `npm ci` to install dependencies from `package-lock.json`.

3. **Run quality checks**
   - Run tests, linting, or formatting checks when configured.
   - Fail the workflow if the backend does not pass required checks.

4. **Deploy to Render**
   - After successful checks on the deployment branch, trigger Render deployment.
   - Render starts the API with `npm start`.
   - Production environment variables are configured in the Render dashboard.

## Local Setup

### Prerequisites

- Node.js installed locally.
- npm installed locally.
- PostgreSQL database connection string, such as a Supabase `DATABASE_URL`.

### Installation

Clone the repository:

```bash
git clone https://github.com/your-username/job-tracker-backend.git
cd job-tracker-backend
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

If `.env.example` does not exist yet, create `.env` manually:

```bash
touch .env
```

Add your environment variables to `.env`:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=replace-with-a-long-random-secret
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

Start the server:

```bash
npm start
```

The API runs locally at:

```text
http://localhost:3000
```

## Environment Variables

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by the `pg` connection pool. | `postgresql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `JWT_SECRET` | Yes | Secret key used to sign and verify JWT access tokens. | `super-long-random-secret` |
| `PORT` | No | Port the Express server listens on. Defaults to `3000`. | `3000` |
| `CORS_ORIGIN` | Recommended | Frontend URL allowed to call the API in production. | `https://job-tracker-frontend-red.vercel.app` |

## What I Learned

Building this backend strengthened my understanding of:

- **PostgreSQL data modeling** - Designing relational tables for users and job applications, including linking user-owned records with `user_id`.
- **JWT authentication** - Creating a register/login flow, signing tokens, verifying bearer tokens, and protecting private routes.
- **Password security** - Hashing passwords with bcrypt before storing them in the database.
- **REST API design** - Structuring endpoints around resources, HTTP methods, status codes, and JSON responses.
- **Authorization patterns** - Returning job data for only the authenticated user instead of exposing all records.
- **CI/CD fundamentals** - Using GitHub Actions concepts to automate dependency installation, checks, and deployment workflows.
- **Production deployment** - Preparing an Express API for Render with environment variables and an `npm start` command.
