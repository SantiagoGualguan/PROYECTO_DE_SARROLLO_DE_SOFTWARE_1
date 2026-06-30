# Guía de ejecución de tests — DanceLearn Academy

## Requisitos

- Docker y Docker Compose instalados.
- Los contenedores deben estar funcionando:

```sh
docker compose up --build -d
```

---

## Backend (Django — 142 tests)

Los tests del backend se ejecutan dentro del contenedor `backend` usando `manage.py test`.  
No requieren base de datos real porque usan `SimpleTestCase` + mocking (los modelos usan `managed = False`).

### Todos los tests del backend

```sh
docker compose exec backend python manage.py test
```

### Por app

```sh
docker compose exec backend python manage.py test apps.users       # 102 tests
docker compose exec backend python manage.py test apps.choreographies  # 22 tests
docker compose exec backend python manage.py test apps.sales       # 11 tests
docker compose exec backend python manage.py test apps.cart        # 3 tests
docker compose exec backend python manage.py test apps.dashboard   # 3 tests
docker compose exec backend python manage.py test database         # 1 test (SQL files, se salta si no están en el contenedor)
```

### Por archivo de test

```sh
docker compose exec backend python manage.py test apps.users.tests.test_api
docker compose exec backend python manage.py test apps.users.tests.test_helpers
docker compose exec backend python manage.py test apps.users.tests.test_permissions
docker compose exec backend python manage.py test apps.users.tests.test_serializers
docker compose exec backend python manage.py test apps.choreographies.tests.test_api
docker compose exec backend python manage.py test apps.choreographies.tests.test_serializers
docker compose exec backend python manage.py test apps.choreographies.tests.test_filters
docker compose exec backend python manage.py test apps.sales.tests.test_api
docker compose exec backend python manage.py test apps.sales.tests.test_models
docker compose exec backend python manage.py test apps.cart.tests.test_api
docker compose exec backend python manage.py test apps.dashboard.tests.test_api
docker compose exec backend python manage.py test database.tests.test_sql
```

### Tests específicos (clase o método)

```sh
# Clase específica
docker compose exec backend python manage.py test apps.users.tests.test_api.AuthLoginTest

# Método específico
docker compose exec backend python manage.py test apps.users.tests.test_api.AuthLoginTest.test_login_success_client
```

### Salida detallada

Agregar `--verbosity=2` para ver el nombre de cada test que se ejecuta:

```sh
docker compose exec backend python manage.py test --verbosity=2
```

---

## Frontend (Vitest — 28 tests)

Los tests del frontend se ejecutan dentro del contenedor `frontend`.

### Todos los tests del frontend

```sh
docker compose exec frontend npm test
```

### Modo watch (reejecución automática al cambiar archivos)

```sh
docker compose exec frontend npm run test:watch
```

### Tests de un archivo específico

```sh
docker compose exec frontend npx vitest run src/__tests__/api/authService.test.js
docker compose exec frontend npx vitest run src/__tests__/api/userService.test.js
docker compose exec frontend npx vitest run src/__tests__/api/axios.test.js
docker compose exec frontend npx vitest run src/__tests__/context/AuthContext.test.jsx
docker compose exec frontend npx vitest run src/__tests__/context/CartContext.test.jsx
```

### Salida detallada

```sh
docker compose exec frontend npx vitest run --reporter=verbose
```

---

## Resumen de tests

| Capa        | Tests | Archivos |
|-------------|-------|----------|
| Backend     | 142   | 12       |
| Frontend    | 28    | 5        |
| **Total**   | **170** | **17** |

### Estructura de archivos de test

```
backend/
├── apps/
│   ├── users/tests/
│   │   ├── test_helpers.py      — Funciones puras
│   │   ├── test_serializers.py  — Serializers (RegisterSerializer, etc.)
│   │   ├── test_permissions.py  — Permisos RBAC
│   │   └── test_api.py          — Endpoints (auth, usuarios internos, perfil)
│   ├── choreographies/tests/
│   │   ├── test_api.py          — CRUD coreografías y videos
│   │   ├── test_serializers.py  — CoreographySerializer, VideoSerializer
│   │   └── test_filters.py      — CoreographyFilter
│   ├── cart/tests/
│   │   └── test_api.py          — NotImplementedError (esqueleto)
│   ├── sales/tests/
│   │   ├── test_api.py          — NotImplementedError (esqueleto)
│   │   └── test_models.py       — Purchase, UserCoreography, Bill
│   └── dashboard/tests/
│       └── test_api.py          — NotImplementedError (esqueleto)
└── database/tests/
    └── test_sql.py              — Validación de archivos SQL

frontend/src/__tests__/
├── api/
│   ├── axios.test.js            — Instancia Axios e interceptores
│   ├── authService.test.js      — Llamadas a /auth/*
│   └── userService.test.js      — Llamadas a /users/*
└── context/
    ├── AuthContext.test.jsx      — Estado de autenticación
    └── CartContext.test.jsx      — Estado del carrito
```

---

## Notas importantes

- Los tests del backend no requieren PostgreSQL porque usan `SimpleTestCase` + `unittest.mock`.  
  Los modelos usan `managed = False`, por lo que Django no necesita crear tablas.
- Los tests SQL (`database/tests/test_sql.py`) se saltan automáticamente si los archivos `.sql` no están accesibles dentro del contenedor.
- Los tests del frontend usan `jsdom` como entorno simulado del navegador.
- No existe un linter ni typecheck configurado en el proyecto; los tests son el único mecanismo de verificación automatizada.
