from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

CORS_ALLOW_ALL_ORIGINS = True  # solo en desarrollo

# Turnstile cloudfare secret key (dummy value for development)
TURNSTILE_SECRET_KEY = os.environ.get("TURNSTILE_SECRET_KEY")
