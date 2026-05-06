# Tweeter API – Frontend Integration Guide

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
  - [Register](#register)
  - [Login](#login)
  - [Refresh Token](#refresh-token)
  - [Logout](#logout)
- [Users](#users)
  - [List Users](#list-users)
  - [Get User Details](#get-user-details)
  - [Get Own Profile](#get-own-profile)
  - [Update Profile](#update-profile)
  - [Delete Account](#delete-account)
  - [Change Password](#change-password)
- [Follow / Unfollow](#follow--unfollow)
  - [Follow User](#follow-user)
  - [Unfollow User](#unfollow-user)
- [Tweets](#tweets)
  - [List Tweets](#list-tweets)
  - [Get Tweet](#get-tweet)
  - [Create Tweet](#create-tweet)
  - [Create Tweet with Media](#create-tweet-with-media)
  - [Delete Tweet](#delete-tweet)
  - [Like Tweet](#like-tweet)
  - [Unlike Tweet](#unlike-tweet)
  - [Retweet](#retweet)
  - [Unretweet](#unretweet)
- [Timelines](#timelines)
  - [Public Timeline](#public-timeline)
  - [Private Timeline](#private-timeline)
- [Search Users](#search-users)
- [Pagination](#pagination)
- [File Uploads](#file-uploads)
- [Error Handling](#error-handling)
- [CORS & Security](#cors--security)
- [Interactive API Documentation](#interactive-api-documentation)

---

## Base URL

```
http://localhost:8000/api/
```

All endpoints are prefixed with this base URL.

---

## Authentication

The backend uses **HttpOnly cookies** for JWT tokens. You **do not** need to store tokens or send an `Authorization` header.

**Every request** must include credentials so the browser sends the cookies automatically:

**Fetch API:**
```js
fetch(url, { credentials: 'include' })
```

**Axios:**
```js
axios.defaults.withCredentials = true;
```

---

### Register

Create a new user account.

**Request**

```
POST /api/accounts/register/
Content-Type: application/json
```

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

**Response** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "custom_id": "a1b2c3",
  "bio": "Hello, Tweeter!",
  "is_public_user": true,
  "is_public": true,
  "is_following": false,
  "profile_picture": null,
  "profile_banner": null,
  "date_joined": "2026-05-04T12:00:00Z",
  "followers_count": 0,
  "following_count": 0,
  "tweets_count": 0,
  "likes_received": 0
}
```

---

### Login

Authenticate and receive JWT tokens as HttpOnly cookies.

**Request**

```
POST /api/accounts/login/
Content-Type: application/json
```

```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response** `200 OK`

The backend sets two **HttpOnly** cookies:
- **`access_token`** – valid for 1 day, path `/`
- **`refresh_token`** – valid for 7 days, path `/api/accounts/refresh/`

The response body is not needed for authentication. All subsequent requests automatically include the `access_token` cookie when `credentials: 'include'` is used.

```json
{
  "detail": "Successfully logged in."
}
```

---

### Refresh Token

Obtain a new access token using the refresh token (sent automatically via cookie).

**Request**

```
POST /api/accounts/refresh/
credentials: 'include'
```

**Response** `200 OK`

The response includes a new `access_token` cookie. If token rotation is enabled, a new `refresh_token` cookie is also set.

```json
{
  "detail": "Token refreshed successfully."
}
```

---

### Logout

Blacklist the refresh token and clear cookies.

**Request**

```
POST /api/accounts/logout/
credentials: 'include'
Content-Type: application/json
```

```json
{
  "refresh": "optional-refresh-token"
}
```

**Response** `205 Reset Content`

Both `access_token` and `refresh_token` cookies are deleted.

---

## Users

### List Users

**Request**

```
GET /api/accounts/users/?page=1&page_size=10
credentials: 'include'
```

**Response** `200 OK`

Paginated list of users (see [Pagination](#pagination)).

---

### Get User Details

**Request**

```
GET /api/accounts/users/<uuid>/
credentials: 'include'
```

**Response** `200 OK`

Same structure as the profile response (see [Get Own Profile](#get-own-profile)).

---

### Get Own Profile

**Request**

```
GET /api/accounts/profile/
credentials: 'include'
```

**Response** `200 OK`

```json
{
  "id": "550e8400-...",
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "custom_id": "a1b2c3",
  "bio": "Hello, Tweeter!",
  "is_public_user": true,
  "is_public": true,
  "is_following": false,
  "profile_picture": null,
  "profile_banner": null,
  "date_joined": "2026-05-04T12:00:00Z",
  "followers_count": 42,
  "following_count": 100,
  "tweets_count": 300,
  "likes_received": 1024
}
```

---

### Update Profile

**Request**

```
PATCH /api/accounts/profile/
credentials: 'include'
Content-Type: application/json
```

```json
{
  "username": "new_username",
  "email": "new@example.com",
  "bio": "Updated bio",
  "is_public_user": false
}
```

**For file uploads**, see [File Uploads](#file-uploads).

**Response** `200 OK`

Returns the updated user profile.

---

### Delete Account

**Request**

```
DELETE /api/accounts/profile/
credentials: 'include'
```

**Response** `204 No Content`

The account is permanently deleted.

---

### Change Password

**Request**

```
POST /api/accounts/profile/change-password/
credentials: 'include'
Content-Type: application/json
```

```json
{
  "old_password": "OldPass123!",
  "new_password": "NewPass456!",
  "confirm_new_password": "NewPass456!"
}
```

**Response** `200 OK`

```json
{
  "detail": "Password changed successfully."
}
```

---

## Follow / Unfollow

### Follow User

**Request**

```
POST /api/accounts/follow/
credentials: 'include'
Content-Type: application/json
```

```json
{
  "followee_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response** `201 Created`

```json
{
  "id": 1,
  "follower": { ... },
  "followee": { ... },
  "created_at": "2026-05-04T12:00:00Z"
}
```

---

### Unfollow User

**Request**

```
POST /api/accounts/unfollow/
credentials: 'include'
Content-Type: application/json
```

```json
{
  "followee_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response** `200 OK`

```json
{
  "message": "Unfollowed successfully"
}
```

---

## Tweets

### List Tweets

**Request**

```
GET /api/tweets/?page=1&page_size=10
credentials: 'include'
```

**Response** `200 OK`

Paginated list of visible tweets. Each tweet includes:

```json
{
  "id": 1,
  "user": { ... },
  "content": "Hello, world!",
  "message": "Hello, world!",
  "media": null,
  "parent_tweet": null,
  "retweet_count": 3,
  "like_count": 12,
  "is_liked": false,
  "created_at": "2026-05-04T12:00:00Z",
  "updated_at": "2026-05-04T12:00:00Z"
}
```

---

### Get Tweet

**Request**

```
GET /api/tweets/<id>/
credentials: 'include'
```

**Response** `200 OK`

Same structure as above.

---

### Create Tweet

**Request**

```
POST /api/tweets/
credentials: 'include'
Content-Type: application/json
```

```json
{
  "content": "My first tweet!"
}
```

**Response** `201 Created`

Returns the created tweet object.

**To reply**, include the `parent_tweet` field with the ID of the tweet you're replying to:

```json
{
  "content": "Great point!",
  "parent_tweet": 1
}
```

---

### Create Tweet with Media

**Request**

```
POST /api/tweets/
credentials: 'include'
```

Use `FormData` (multipart/form-data) and do **not** manually set the `Content-Type` header.

```js
const form = new FormData();
form.append('content', 'Check out this photo!');
form.append('media', fileInput.files[0]);

fetch('/api/tweets/', { method: 'POST', credentials: 'include', body: form });
```

**Response** `201 Created`

---

### Delete Tweet

**Request**

```
DELETE /api/tweets/<id>/
credentials: 'include'
```

**Response** `204 No Content`

Only the tweet author can delete it.

---

### Like Tweet

**Request**

```
POST /api/tweets/<id>/like/
credentials: 'include'
```

**Response** `201 Created` if newly liked, `200 OK` if already liked.

```json
{
  "message": "Liked",
  "like_count": 13
}
```

---

### Unlike Tweet

**Request**

```
POST /api/tweets/<id>/unlike/
credentials: 'include'
```

**Response** `200 OK`

```json
{
  "message": "Unliked",
  "like_count": 12
}
```

---

### Retweet

**Request**

```
POST /api/tweets/<id>/retweet/
credentials: 'include'
```

**Response** `201 Created` if newly retweeted, `200 OK` if already retweeted.

---

### Unretweet

**Request**

```
POST /api/tweets/<id>/unretweet/
credentials: 'include'
```

**Response** `200 OK`

---

## Timelines

### Public Timeline

**Request**

```
GET /api/accounts/timeline/public/?page=1&page_size=10
credentials: 'include'
```

**Response** `200 OK`

Paginated list of tweets from public users + private users you follow.

---

### Private Timeline

**Request**

```
GET /api/accounts/timeline/private/?page=1&page_size=10
credentials: 'include'
```

**Response** `200 OK`

Paginated list of tweets only from users you follow.

---

## Search Users

**Request**

```
GET /api/accounts/search/?q=alice
credentials: 'include'
```

**Response** `200 OK`

Returns an array of users matching the query by username, first name, or last name (non‑paginated, all results returned).

---

## Pagination

All list endpoints return a paginated response in the following format:

```json
{
  "count": 42,
  "next": "http://localhost:8000/api/accounts/users/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

Control pagination with the `page` and `page_size` query parameters:

- `?page=2` – request page 2
- `?page_size=20` – set items per page (default is 10)

---

## File Uploads

Profile pictures, banners, and tweet media are uploaded via `multipart/form-data`.

**Important:** Do **not** set the `Content-Type` header manually—the browser will handle it with `FormData`.

**Example (profile picture upload):**

```js
const form = new FormData();
form.append('profile_picture', fileInput.files[0]);

fetch('/api/accounts/profile/', {
  method: 'PATCH',
  credentials: 'include',
  body: form
});
```

**Allowed fields:**
- Profile: `profile_picture`, `profile_banner`
- Tweets: `media` (alongside `content`)

---

## Error Handling

All API errors return a consistent JSON format.

**400 Bad Request (validation):**
```json
{
  "error": "Validation error",
  "status": 400,
  "detail": {
    "username": ["This username is already taken."]
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication credentials were not provided.",
  "status": 401
}
```

**404 Not Found:**
```json
{
  "error": "Not found.",
  "status": 404
}
```

---

## CORS & Security

The backend allows cross‑origin requests from:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

These origins are configured in `CORS_ALLOWED_ORIGINS`. If you change the frontend port, update the backend settings accordingly. Credentials (cookies) are allowed because `CORS_ALLOW_CREDENTIALS = True`.

---

## Interactive API Documentation

A Swagger UI is available at:

```
http://localhost:8000/api/docs/
```

You can explore and test all endpoints directly in the browser.