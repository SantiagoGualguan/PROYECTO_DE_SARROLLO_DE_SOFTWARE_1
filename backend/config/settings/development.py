from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

CORS_ALLOW_ALL_ORIGINS = True  # solo en desarrollo
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Turnstile cloudfare secret key (dummy value for development)
TURNSTILE_SECRET_KEY = os.environ.get("TURNSTILE_SECRET_KEY")
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "sk_test_local_demo")
