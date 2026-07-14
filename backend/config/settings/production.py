from .base import *

import os


def _split_env_list(key, default=""):
    return [
        item.strip()
        for item in os.environ.get(key, default).split(",")
        if item.strip()
    ]


DEBUG = False

ALLOWED_HOSTS = _split_env_list("ALLOWED_HOSTS", "localhost",'dancelearn.onrender.com','proyecto-de-sarrollo-de-software-1.vercel.app')

CORS_ALLOWED_ORIGINS = _split_env_list("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# DATABASE_URL is configured in base.py via dj-database-url (ssl_require=True).

MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
