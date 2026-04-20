# Tweeter API Documentation

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Installation](#local-installation)
  - [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
  - [Register](#register)
  - [Login (Obtain JWT Token)](#login-obtain-jwt-token)
  - [Refresh Token](#refresh-token)
  - [Using the Token](#using-the-token)
- [API Endpoints](#api-endpoints)
  - [Base URLs](#base-urls)
  - [Accounts App](#accounts-app)
    - [User Management](#user-management)
    - [Profile Management](#profile-management)
    - [Follow System](#follow-system)
    - [Timelines](#timelines)
    - [User Relations](#user-relations)
  - [Tweets App](#tweets-app)
    - [Tweet Listing & Detail](#tweet-listing--detail)
    - [Retweet / Unretweet](#retweet--unretweet)
- [Data Models](#data-models)
  - [User](#user)
  - [Follower](#follower)
  - [Tweet](#tweet)
  - [ReTweet](#retweet-model)
- [Pagination](#pagination)
- [Error Responses](#error-responses)
- [Testing](#testing)
- [API Documentation with Swagger/ReDoc](#api-documentation-with-swaggerredoc)
- [Deployment Considerations](#deployment-considerations)
- [Changelog](#changelog)

---

## Project Overview

Tweeter is a simplified Twitter-like REST API built with Django and Django REST Framework. It supports user registration, JWT authentication, public/private profiles, following/unfollowing users, creating tweets, retweeting, and timeline generation with visibility rules.

**Key Features:**

- JWT-based authentication
- Public/private user profiles
- Follow/unfollow system
- Tweets and retweets
- Public and private timelines with privacy-aware visibility
- Paginated API responses
- Full CRUD for user profile (GET, PATCH, DELETE)
- Auto-generated OpenAPI documentation (Swagger/ReDoc)

---

## Technology Stack
```
| Component          | Technology                           |
| ------------------ | ------------------------------------ |
| Backend Framework  | Django 6.0+                          |
| API Framework      | Django REST Framework                |
| Authentication     | JWT (djangorestframework-simplejwt)  |
| Database           | SQLite (dev), PostgreSQL (prod)      |
| API Documentation  | drf-spectacular (Swagger/ReDoc)      |
| Containerisation   | Docker & Docker Compose              |
| Testing            | Django TestCase + DRF APIClient      |
| WSGI Server        | Gunicorn (production)                |
```
---

## Project Structure
```
TweeterDemo/
│
├── accounts/
│     ├── admin.py
│     ├── apps.py
│     ├── models.py
│     ├── serializers.py
│     ├── services.py
│     ├── tests.py
│     ├── urls.py
│     └── views.py
│
├── core/
│     ├──  asgi.py
│     ├──  Dockerfile
│     ├──  settings.py
│     ├──  urls.py
│     └──   wsgi.py
│
├── tweets/
│     ├──  admin.py
│     ├──  apps.py
│     ├──  models.py
│     ├──  serializers.py
│     ├──  tests.py
│     ├──  urls.py
│     └──  views.py
│       
├──   docker-compose.yml
├──   DOCUMENTATION.md
├──   manage.py
├──   requirements.txt
└──   Tweeter API.yaml
```

## Getting Started

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- (Optional) Docker and Docker Compose for containerised setup

### Local Installation

1. **Clone the repository** and navigate to the project root (where `manage.py` is located).

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate      # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply database migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser (optional)**:
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server**:
   ```bash
   python manage.py runserver
   ```

7. The API will be available at `http://127.0.0.1:8000`.

### Docker Setup

If you prefer Docker, ensure Docker and Docker Compose are installed.

1. From the project root (where `docker-compose.yml` is located), run:
   ```bash
   docker-compose up --build
   ```

2. The API will be available at `http://localhost:8000`.

3. To stop the containers:
   ```bash
   docker-compose down
   ```

**Note:** The Docker setup uses PostgreSQL instead of SQLite. Environment variables are already configured in `docker-compose.yml`.

---

## Environment Variables

The application uses environment variables for configuration. In development, defaults are provided in `settings.py`. For production or Docker, set the following:
```
| Variable               | Description                                           | Default (dev)                        |
| ---------------------- | ----------------------------------------------------- | ------------------------------------ |
| `SECRET_KEY`           | Django secret key                                     | Insecure fallback key (change it!)   |
| `DEBUG`                | Debug mode (`True`/`False`)                           | `True`                               |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated list of allowed hosts                 | `localhost,127.0.0.1`                |
| `DATABASE_URL`         | Database connection string (PostgreSQL format)        | `sqlite:///db.sqlite3`               |
| `CSRF_TRUSTED_ORIGINS` | Comma-separated trusted origins for CSRF              | `http://localhost:8000,http://127.0.0.1:8000` |
```
**Example `DATABASE_URL` for PostgreSQL:**

```
postgres://username:password@host:port/database_name
```

---

## Authentication

All endpoints except registration and token obtain/refresh require authentication. Include the JWT access token in the `Authorization` header as a Bearer token:

```
Authorization: Bearer <your_access_token>
```

### Register

Register a new user account.

- **URL:** `POST /api/accounts/auth/register/`
- **Permission:** AllowAny

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Hello, Tweeter!"
}
```

**Response (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Hello, Tweeter!",
  "is_public": true,
  "is_following": false,
  "custom_id": "a1b2c3"
}
```

### Login (Obtain JWT Token)

- **URL:** `POST /api/accounts/auth/token/`
- **Permission:** AllowAny

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Refresh Token

Use the refresh token to obtain a new access token without re-login.

- **URL:** `POST /api/accounts/auth/token/refresh/`
- **Permission:** AllowAny

**Request Body:**

```json
{
  "refresh": "your_refresh_token_here"
}
```

**Response (200 OK):**

```json
{
  "access": "new_access_token_here"
}
```

### Using the Token

Include the `access` token in the `Authorization` header for all protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## API Endpoints

### Base URLs

- Accounts endpoints: `/api/accounts/`
- Tweets endpoints: `/api/`

All list endpoints support pagination via `?page=2&page_size=20` query parameters.

### Accounts App

#### User Management
```
| Method | Endpoint                         | Description                          |
| ------ | -------------------------------- | ------------------------------------ |
| `GET`  | `/api/accounts/users/`           | List all users (paginated)           |
| `GET`  | `/api/accounts/users/<uuid:pk>/` | Retrieve a specific user's profile   |
```
**Example `GET /api/accounts/users/` Response (paginated):**

```json
{
  "count": 42,
  "next": "http://127.0.0.1:8000/api/accounts/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "alice",
      "email": "alice@example.com",
      "first_name": "Alice",
      "last_name": "Smith",
      "bio": "I love tweeting!",
      "is_public": true,
      "is_following": false,
      "custom_id": "a1b2c3"
    }
  ]
}
```

#### Profile Management
```
| Method   | Endpoint                     | Description                                           |
| -------- | ---------------------------- | ----------------------------------------------------- |
| `GET`    | `/api/accounts/profile/`     | Get own profile (authenticated user)                  |
| `PATCH`  | `/api/accounts/profile/`     | Update own profile (email, name, bio, privacy)        |
| `DELETE` | `/api/accounts/profile/`     | Delete own account (permanent)                        |
```
**Example `PATCH /api/accounts/profile/` Request:**

```json
{
  "email": "newemail@example.com",
  "first_name": "Jonathan",
  "bio": "Updated bio",
  "is_public_user": false
}
```

**Response (200 OK):** Returns updated user object.

**Allowed fields for PATCH:**
- `email`
- `first_name`
- `last_name`
- `bio`
- `is_public_user`

*Note: `username` and `password` cannot be changed via this endpoint.*

#### Follow System
```
| Method   | Endpoint                      | Description                                  |
| -------- | ----------------------------- | -------------------------------------------- |
| `POST`   | `/api/accounts/follow/`       | Follow a user (provide `followee_id` in body)|
| `DELETE` | `/api/accounts/unfollow/`     | Unfollow a user (provide `followee_id` in body) |
```
**POST `/api/accounts/follow/` Request Body:**

```json
{
  "followee_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201 Created):**

```json
{
  "follower": { ... },
  "followee": { ... },
  "created_at": "2026-04-16T12:00:00Z"
}
```

**DELETE `/api/accounts/unfollow/` Request Body:**

```json
{
  "followee_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**

```json
{
  "message": "Unfollowed successfully"
}
```

**Possible Errors:**
- `400 Bad Request` – trying to follow yourself, already following, or not following when unfollowing.
- `404 Not Found` – user with given ID does not exist.

#### Timelines
```
| Method | Endpoint                           | Description                                                                 |
| ------ | ---------------------------------- | --------------------------------------------------------------------------- |
| `GET`  | `/api/accounts/timeline/public/`   | Public timeline: tweets from public users + followed private users           |
| `GET`  | `/api/accounts/timeline/private/`  | Private timeline: tweets only from users you follow (regardless of privacy)  |
```
Both endpoints accept pagination parameters `?page=1&page_size=10`.

**Example Response:**

```json
{
  "count": 42,
  "next": "http://127.0.0.1:8000/api/accounts/timeline/public/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "alice",
        "email": "alice@example.com",
        "first_name": "Alice",
        "last_name": "Smith"
      },
      "message": "Hello world!",
      "created_at": "2026-04-16T10:00:00Z",
      "updated_at": "2026-04-16T10:00:00Z",
      "retweet_count": 3,
      "parent_tweet": null
    }
  ]
}
```

#### User Relations
```
| Method | Endpoint                                      | Description                               |
| ------ | --------------------------------------------- | ----------------------------------------- |
| `GET`  | `/api/accounts/users/<uuid:user_id>/tweets/`  | List tweets by a specific user            |
| `GET`  | `/api/accounts/users/<uuid:user_id>/followers/` | List followers of a user                |
| `GET`  | `/api/accounts/users/<uuid:user_id>/following/` | List users that this user is following  |
```
All are paginated.

**Example `GET /api/accounts/users/<uuid>/followers/` Response:**

```json
{
  "count": 5,
  "results": [
    {
      "follower": {
        "id": "...",
        "username": "bob",
        "email": "bob@example.com",
        "first_name": "Bob",
        "last_name": "Johnson",
        "bio": "Bob's bio",
        "is_public": true,
        "is_following": false,
        "custom_id": "x7y8z9"
      },
      "followee": {
        "id": "...",
        "username": "alice",
        "email": "alice@example.com",
        "first_name": "Alice",
        "last_name": "Smith",
        "bio": "Alice's bio",
        "is_public": true,
        "is_following": true,
        "custom_id": "a1b2c3"
      },
      "created_at": "2026-04-16T09:00:00Z"
    }
  ]
}
```

---

### Tweets App

#### Tweet Listing & Detail
```
| Method | Endpoint                  | Description                                            |
| ------ | ------------------------- | ------------------------------------------------------ |
| `GET`  | `/api/tweets/`            | List all tweets visible to the authenticated user      |
| `GET`  | `/api/tweets/<int:pk>/`   | Retrieve a single tweet (404 if not visible)           |
```
**Visibility Rules:**
- Public tweets from any user are visible to everyone.
- Private tweets are visible only to the author and their followers.

**Example `GET /api/tweets/` Response (paginated):**

```json
{
  "count": 15,
  "next": "http://127.0.0.1:8000/api/tweets/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "alice",
        "email": "alice@example.com",
        "first_name": "Alice",
        "last_name": "Smith"
      },
      "message": "This is a tweet",
      "created_at": "2026-04-16T08:00:00Z",
      "updated_at": "2026-04-16T08:00:00Z",
      "retweet_count": 2,
      "parent_tweet": null
    }
  ]
}
```

#### Retweet / Unretweet
```
| Method | Endpoint                              | Description                           |
| ------ | ------------------------------------- | ------------------------------------- |
| `POST` | `/api/tweets/<int:pk>/retweet/`       | Retweet a tweet (must be visible)     |
| `POST` | `/api/tweets/<int:pk>/unretweet/`     | Remove your retweet                   |
```
**POST `/api/tweets/1/retweet/` Response (201 Created):**

```json
{
  "id": 5,
  "user": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "username": "bob",
    "email": "bob@example.com",
    "first_name": "Bob",
    "last_name": "Johnson"
  },
  "original_tweet": {
    "id": 1,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "alice",
      "email": "alice@example.com",
      "first_name": "Alice",
      "last_name": "Smith"
    },
    "message": "Original tweet",
    "created_at": "2026-04-16T08:00:00Z",
    "updated_at": "2026-04-16T08:00:00Z",
    "retweet_count": 1,
    "parent_tweet": null
  },
  "created_at": "2026-04-16T12:30:00Z"
}
```

**POST `/api/tweets/1/unretweet/` Response (200 OK):**

```json
{
  "message": "Unretweeted successfully"
}
```

**Errors:**
- `403 Forbidden` – tweet not visible to user.
- `400 Bad Request` – trying to unretweet a tweet you haven't retweeted.
- `404 Not Found` – tweet doesn't exist.

---

## Data Models

### User

Custom user model extending Django's `AbstractUser`.
```
| Field            | Type      | Description                                       |
| ---------------- | --------- | ------------------------------------------------- |
| `id`             | UUID      | Primary key, auto-generated                       |
| `username`       | String    | Unique username                                   |
| `email`          | Email     | User's email address                              |
| `first_name`     | String    |                                                   |
| `last_name`      | String    |                                                   |
| `bio`            | Text      | Max 200 characters, optional                      |
| `is_public_user` | Boolean   | Default `True`. If `False`, profile/tweets are private |
| `custom_id`      | String(6) | Auto-generated 6-character unique identifier      |
| `password`       | (hashed)  |                                                   |
| `is_active`      | Boolean   |                                                   |
| `is_staff`       | Boolean   |                                                   |
| `is_superuser`   | Boolean   |                                                   |
| `date_joined`    | DateTime  |                                                   |
| `last_login`     | DateTime  |                                                   |
```
**Properties:**
- `is_public` → returns `is_public_user`
- `is_private` → returns `not is_public_user`

### Follower

Represents a follow relationship between two users.
```
| Field        | Type      | Description                                |
| ------------ | --------- | ------------------------------------------ |
| `id`         | AutoField |                                            |
| `follower`   | FK(User)  | The user who follows                       |
| `followee`   | FK(User)  | The user being followed                    |
| `created_at` | DateTime  | Auto-set on creation                       |
```
**Constraints:** `unique_together = ('follower', 'followee')`

### Tweet
```
| Field          | Type          | Description                                |
| -------------- | ------------- | ------------------------------------------ |
| `id`           | AutoField     |                                            |
| `user`         | FK(User)      | Author                                     |
| `content`      | Text(280)     | Tweet content                              |
| `created_at`   | DateTime      | Auto-set on creation                       |
| `updated_at`   | DateTime      | Auto-updated                               |
| `parent_tweet` | FK('self')    | For reply functionality (optional)         |
```
**Methods:**
- `is_visible_to(user)` – Returns `True` if `user` can see this tweet.
- `retweet(user)` – Creates a `ReTweet` for the given user.
- `unretweet(user)` – Deletes the `ReTweet` if exists.
- `get_retweet_count()` – Returns number of retweets.

### ReTweet Model
```
| Field            | Type      | Description                               |
| ---------------- | --------- | ----------------------------------------- |
| `id`             | AutoField |                                           |
| `user`           | FK(User)  | User who retweeted                        |
| `original_tweet` | FK(Tweet) | The tweet being retweeted                 |
| `created_at`     | DateTime  | Auto-set                                  |
```
**Constraints:** `unique_together = ('user', 'original_tweet')` – a user can retweet a tweet only once.

---

## Pagination

All list endpoints use DRF's `PageNumberPagination` with a default page size of 10. Clients can override via query parameters:

- `?page=2` – request page 2
- `?page_size=20` – set items per page (max 100)

The response includes `count`, `next`, `previous`, and `results`.

---

## Error Responses

Common error responses follow DRF conventions.

**400 Bad Request:**

```json
{
  "error": "You cannot follow yourself"
}
```

**401 Unauthorized:**

```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden:**

```json
{
  "detail": "You do not have permission to perform this action."
}
```

**404 Not Found:**

```json
{
  "detail": "Not found."
}
```

---

## Testing

Run the test suite with:

```bash
python manage.py test -v2
```

Tests cover:
- User registration and JWT authentication
- Profile retrieval, update, deletion
- Follow/unfollow logic
- Timeline generation with privacy rules
- Tweet visibility and retweet permissions
- Pagination

All 25 tests should pass.

---

## API Documentation with Swagger/ReDoc

Interactive API documentation is automatically generated and available at:

- **Swagger UI:** `http://127.0.0.1:8000/api/accounts/docs/`
  (Try out endpoints directly in the browser)

- **ReDoc:** `http://127.0.0.1:8000/api/accounts/redoc/`

- **OpenAPI Schema (JSON):** `http://127.0.0.1:8000/api/accounts/schema/`

*Note: If you moved docs to `/api/docs/` in main urls, adjust the URLs accordingly.*

---

## Deployment Considerations

- Set `DEBUG=False` and a strong `SECRET_KEY` in production.
- Use a production-ready database like PostgreSQL (as configured in Docker).
- Collect static files with `python manage.py collectstatic`.
- Serve static/media files via a reverse proxy (Nginx) or cloud storage.
- Enable HTTPS and set `SECURE_SSL_REDIRECT=True`.
- For Docker deployments, consider using an `.env` file for secrets instead of hardcoding in `docker-compose.yml`.

---

## Changelog

### [1.0.0] - 2026-04-16

**Added**
- JWT Authentication using `djangorestframework-simplejwt`
- User profile management (GET, PATCH, DELETE own profile)
- Follow/unfollow functionality
- Public and private timelines with visibility rules
- Tweet listing with privacy enforcement
- Retweet and unretweet endpoints
- Pagination for all list views
- API documentation with drf-spectacular (Swagger/ReDoc)
- Docker support with Dockerfile and docker-compose.yml
- Environment-based configuration

**Changed**
- Combined serializers and used `__all__` where appropriate
- Fixed model relationships and Meta classes
- Improved test coverage (25 tests)

**Fixed**
- Indentation errors in serializers
- Visibility logic for private tweets
- Pagination handling in tests

**Removed**
- Legacy Token authentication views (replaced by JWT)
- Redundant serializers
