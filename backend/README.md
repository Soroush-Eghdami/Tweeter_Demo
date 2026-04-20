# Tweeter API

A Twitter-like REST API built with Django and Django REST Framework.

## Features
- JWT Authentication (register, login, logout, refresh)
- User profiles with media uploads (profile picture, banner)
- Follow/unfollow system
- Public/private account settings
- Tweets, retweets, and likes
- Public/private timelines with visibility rules
- Paginated responses
- Interactive API docs (Swagger/ReDoc)

## Tech Stack
- Django 6.0+
- Django REST Framework
- Simple JWT
- SQLite (dev) / PostgreSQL (prod)
- Docker support

## Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd tweeter

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

API runs at `http://127.0.0.1:8000`

## Documentation

For detailed API reference, environment variables, testing, and deployment instructions, see the full **[DOCUMENTATION.md](DOCUMENTATION.md)**.

Interactive API docs are also available at:
- Swagger UI: `http://127.0.0.1:8000/api/docs/`
- ReDoc: `http://127.0.0.1:8000/api/redoc/`

## Testing

```bash
python manage.py test
```

## License

MIT