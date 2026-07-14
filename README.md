# DanceLearn Academy

Plataforma web de aprendizaje de baile en línea que conecta instructores
con clientes para la compra y reproducción de coreografías.

Desarrollado por el **Grupo 6** — Desarrollo de Software I  
Universidad del Valle · Cali, Colombia · 2026

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TailwindCSS + MUI + ApexCharts |
| Backend | Python 3.11 + Django 4.2 + Django REST Framework |
| Base de datos | PostgreSQL 15 con funciones PL/pgSQL |
| Autenticación | JWT (djangorestframework-simplejwt, 60 min access / 7 días refresh) |
| CAPTCHA | Cloudflare Turnstile |
| Contenedores | Docker + Docker Compose |
| Despliegue | Vercel (frontend) · Render (backend) · Supabase (BD) |

---

## Arquitectura

El sistema adopta una arquitectura de tres capas desacoplada donde
el frontend y el backend se comunican exclusivamente a través de
una API REST.

- **Capa de datos:** PostgreSQL con schema DDL definido manualmente en `database/01_ddl.sql`.
  Las tablas son gestionadas con `managed = False` en Django (Django no crea ni migra tablas).
  Las transacciones críticas (registro de usuario, carrito, compra, creación de coreografía)
  se ejecutan mediante funciones PL/pgSQL almacenadas en `database/02_functions.sql`.

- **Capa de negocio:** Django REST Framework expone endpoints REST
  con autenticación JWT, control de acceso por rol (RBAC) y
  serializers con validaciones condicionales. Los modelos Django reflejan
  la estructura de las tablas pero no gestionan el schema.

- **Capa de presentación:** React 18 con Context API para estado
  global de autenticación y carrito. Rutas protegidas por rol
  (admin, director, instructor, cliente). Vite con proxy al backend en desarrollo.

---

## Arquitectura de base de datos

El schema físico vive en `database/`:

| Archivo | Propósito |
|---------|-----------|
| `01_ddl.sql` | Creación de tablas, constraints CHECK, relaciones FK |
| `02_functions.sql` | Stored procedures: `create_user`, `create_profesor`, `create_coreography`, `add_to_cart`, `create_purchase` |
| `03_dml.sql` | Datos semilla: 6 usuarios (password `admin123`), 2 profesores, 3 coreografías, carrito y compra de ejemplo |

Los modelos Django usan `managed = False` + `db_table` para reflejar estas tablas.
Las migraciones (`python manage.py migrate`) solo sincronizan los metadatos de Django,
**no** modifican el schema físico.

---

## Requisitos

- Git
- Docker Desktop (o Docker Engine + Docker Compose)
- Puerto `8000` libre (backend) y `5173` libre (frontend)

---

## Configuración local

### 1. Clonar el repositorio

```bash
git clone https://github.com/SantiagoGualguan/PROYECTO_DE_SARROLLO_DE_SOFTWARE_1.git
cd PROYECTO_DE_SARROLLO_DE_SOFTWARE_1
```

### 2. Variables de entorno

El archivo `.env` ya está configurado con valores por defecto funcionales para desarrollo local.
Si necesitas cambiarlos, copia el ejemplo y edítalo:

```bash
cp .env.example .env
```

Variables principales:

| Variable | Descripción | Valor por defecto (desarrollo) |
|----------|-------------|--------------------------------|
| `POSTGRES_DB` | Nombre de la BD | `dancelearn_db` |
| `POSTGRES_USER` | Usuario de BD | `dancelearn_user` |
| `POSTGRES_PASSWORD` | Contraseña de BD | (cambiar por una segura) |
| `SECRET_KEY` | Clave secreta de Django | (cambiar por una larga y segura) |
| `DATABASE_URL` | URL de conexión a Supabase (producción) | vacío (usa valores locales) |
| `TURNSTILE_SECRET_KEY` | Clave secreta de Cloudflare Turnstile | vacío |
| `VITE_TURNSTILE_SITE_KEY` | Site key de Turnstile para el frontend | vacío |

### 3. Iniciar contenedores

```bash
docker compose up --build
```

Esto levanta tres servicios:

| Servicio | Puerto | Container name |
|----------|--------|----------------|
| Backend (Django) | `8000` | `dancelearn_backend` |
| Frontend (Vite) | `5173` | `dancelearn_frontend` |

> **Nota:** El archivo `docker-compose.yml` no incluye un contenedor de PostgreSQL.
> La conexión a BD se realiza mediante la variable `DATABASE_URL` que apunta a Supabase
> (ya configurada en el `.env`). Para desarrollo completamente offline, añade un servicio
> `db` con PostgreSQL 15.

### 4. Inicializar la base de datos

Una vez los contenedores estén funcionando, abre una segunda terminal y ejecuta:

**Paso A — Sincronizar modelos con Django:**

```bash
docker compose exec backend python manage.py migrate
```

Este comando crea las tablas de metadatos de Django (`auth_permission`, `django_content_type`, etc.)
y registra los modelos del proyecto. No crea ni modifica las tablas del negocio
(los modelos usan `managed = False`).

**Paso B — Aplicar schema SQL (DDL + funciones + datos semilla):**

Si tienes acceso a una base de datos PostgreSQL (por ejemplo, la de Supabase),
conéctate y ejecuta los archivos SQL en orden:

```bash
# Opción 1: Usando psql
psql "$DATABASE_URL" -f database/01_ddl.sql
psql "$DATABASE_URL" -f database/02_functions.sql
psql "$DATABASE_URL" -f database/03_dml.sql

# Opción 2: Usando docker (si tienes un contenedor PostgreSQL local)
docker compose exec -T db psql -U dancelearn_user -d dancelearn_db < database/01_ddl.sql
docker compose exec -T db psql -U dancelearn_user -d dancelearn_db < database/02_functions.sql
docker compose exec -T db psql -U dancelearn_user -d dancelearn_db < database/03_dml.sql
```

**Paso C — Crear superusuario de Django:**

```bash
docker compose exec backend python manage.py createsuperuser
```

Este superusuario es independiente de los datos semilla cargados en `03_dml.sql`.

### 5. Verificar que funciona

Abre estas URLs en tu navegador:

| Servicio | URL |
|----------|-----|
| Frontend | [http://localhost:5173](http://localhost:5173) |
| API REST | [http://localhost:8000/api/](http://localhost:8000/api/) |
| Admin Django | [http://localhost:8000/admin/](http://localhost:8000/admin/) |
| Login API | `POST http://localhost:8000/api/auth/login/` |

Los datos semilla incluyen 6 usuarios con contraseña `admin123`:

| Email | Rol |
|-------|-----|
| juan.perez@example.com | admin |
| maria.garcia@example.com | director |
| carlos.lopez@example.com | profesor |
| ana.martinez@example.com | profesor |
| laura.rodriguez@example.com | client |
| pedro.ramirez@example.com | client |

> **Importante:** Los endpoints de autenticación requieren un token de Cloudflare Turnstile.
> Si `TURNSTILE_SECRET_KEY` está vacío, la verificación fallará. Para desarrollo sin Turnstile,
> puedes modificar temporalmente `verify_turnstile_token` en `backend/apps/users/views.py`
> para que retorne `True`.

---

## Ejecutar pruebas

El proyecto tiene **170 tests automatizados** (142 backend + 28 frontend).

Para instrucciones detalladas, consulta [`guia-test.md`](guia-test.md).

```bash
# Todos los tests del backend
docker compose exec backend python manage.py test

# Todos los tests del frontend
docker compose exec frontend npm test
```

---

## Comandos útiles

### Backend

```bash
# Abrir shell de Django
docker compose exec backend python manage.py shell

# Ver rutas disponibles
docker compose exec backend python manage.py show_urls

# Recopilar archivos estáticos
docker compose exec backend python manage.py collectstatic --noinput

# Ver logs
docker compose logs -f backend
```

### Frontend

```bash
# Modo desarrollo (ya corre con docker compose)
npm run dev

# Construir para producción
npm run build

# Ver logs
docker compose logs -f frontend
```

### Reconstruir contenedores

```bash
docker compose down
docker compose up --build
```

---

## Estructura del proyecto

```
PROYECTO_DE_SARROLLO_DE_SOFTWARE_1/
├── backend/
│   ├── apps/
│   │   ├── users/          # Auth, perfiles, usuarios internos
│   │   ├── choreographies/ # Coreografías y videos
│   │   ├── cart/           # Carrito de compras
│   │   ├── sales/          # Compras, facturación
│   │   └── dashboard/      # Métricas por rol
│   ├── config/             # Configuración Django (base, development, production)
│   ├── database/           # Tests de validación SQL
│   ├── manage.py
│   └── requirements.txt
├── database/               # Schema SQL y datos semilla
│   ├── 01_ddl.sql
│   ├── 02_functions.sql
│   └── 03_dml.sql
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance + servicios por dominio
│   │   ├── components/     # Componentes reutilizables
│   │   ├── context/        # AuthContext, CartContext
│   │   ├── pages/          # Páginas (dashboard, login, etc.)
│   │   ├── routes/         # AppRouter con ProtectedRoute
│   │   ├── styles/         # Tema MUI (pink primary / orange secondary)
│   │   └── main.jsx        # Entry point
│   ├── vitest.config.js
│   └── package.json
├── docker-compose.yml
├── guia-test.md
└── README.md
```

---

## Módulos implementados

- **Autenticación:** Login por email o teléfono, registro con
  roles diferenciados, tokens JWT (access 60 min / refresh 7 días),
  soft delete de usuarios. Todos los endpoints requieren CAPTCHA
  de Cloudflare Turnstile.

- **Coreografías:** Catálogo con filtros por género, dificultad y profesor.
  Gestión de videos por coreografía. Permisos: CRUD para admin/director/profesor,
  lectura para clientes.

- **Carrito y ventas:** Carrito persistente por usuario, proceso de compra
  en pasos, facturación y acceso a coreografías adquiridas.

- **Dashboard:** Métricas por rol con gráficos ApexCharts.

---

## Convenciones del proyecto

- **Soft delete:** Usuarios y coreografías usan flags `is_active` / `status`,
  no se eliminan físicamente.
- **Modelos `managed = False`:** Django no toca el schema. La BD se gestiona
  con scripts SQL manuales.
- **Nombres mixtos español/inglés:** La BD usa nombres como `coreography`
  (con error tipográfico preservado), `u_name`, `p_number`, `dificulty_level`.
  Al escribir queries raw, revisar `01_ddl.sql`.
- **Sin TypeScript:** El frontend es JSX puro. No agregar configuración de TS.
- **Sin linter configurado:** No hay ruff, eslint ni prettier. Las pruebas
  automatizadas son el único mecanismo de verificación.

---

## Equipo

| Integrante | Rol |
|-----------|-----|
| Santiago Gualguan Pillimue | Scrum Máster |
| Norman Guiliano Sanchez Truque | DevOps |
| Isabela Bermúdez Moreno | Frontend |
| Brandon Lasprilla Aristizábal | Backend |
| Luis Santiago Arenas Hincapié | Backend / Documentador |
