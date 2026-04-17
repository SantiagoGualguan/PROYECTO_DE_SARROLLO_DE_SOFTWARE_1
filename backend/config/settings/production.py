from .base import *

import os

DEBUG = False

ALLOWED_HOSTS = [os.environ.get('ALLOWED_HOSTS', 'localhost')]

CORS_ALLOWED_ORIGINS = [os.environ.get('FRONTEND_URL', 'http://localhost:5173')]

# Conexión a Supabase — Direct Connection
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     os.environ.get('SUPABASE_DB_NAME', 'postgres'),
        'USER':     os.environ.get('SUPABASE_DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('SUPABASE_DB_PASSWORD'),
        'HOST':     os.environ.get('SUPABASE_DB_HOST'),
        'PORT':     '5432',
        'OPTIONS':  {'sslmode': 'require'},
    }
}