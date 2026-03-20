from .base import *

DEBUG = False

ALLOWED_HOSTS = [os.environ.get('ALLOWED_HOSTS', '')]

CORS_ALLOWED_ORIGINS = [os.environ.get('FRONTEND_URL', '')]

# DATABASE_URL ya viene del entorno (Supabase)

