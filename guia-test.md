# Guia de ejecucion de tests — DanceLearn Academy

## Requisitos

- Docker y Docker Compose instalados.
- Los contenedores deben estar funcionando:

```sh
docker compose up --build -d
```

- **E2E**: Requiere Playwright instalado (`npm install -D @playwright/test` en la raiz) y los contenedores corriendo.

---

## Backend (Django — 222 tests)

Los tests del backend se ejecutan dentro del contenedor `backend` usando `manage.py test`.
No requieren base de datos real porque usan `SimpleTestCase` + mocking (los modelos usan `managed = False`).

### Todos los tests del backend

```sh
docker compose exec backend python manage.py test
```

### Por app

```sh
docker compose exec backend python manage.py test apps.users            # 90 tests
docker compose exec backend python manage.py test apps.choreographies   # 22 tests
docker compose exec backend python manage.py test apps.sales            # 11 tests
docker compose exec backend python manage.py test apps.cart             # 40 tests
docker compose exec backend python manage.py test apps.dashboard        # 44 tests
docker compose exec backend python manage.py test database              # 1 test (SQL files, se salta si no estan en el contenedor)
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
docker compose exec backend python manage.py test apps.cart.tests.test_permissions
docker compose exec backend python manage.py test apps.cart.tests.test_serializers
docker compose exec backend python manage.py test apps.dashboard.tests.test_api
docker compose exec backend python manage.py test apps.dashboard.tests.test_permissions
docker compose exec backend python manage.py test apps.dashboard.tests.test_serializers
docker compose exec backend python manage.py test database.tests.test_sql
```

### Tests especificos (clase o metodo)

```sh
# Clase especifica
docker compose exec backend python manage.py test apps.users.tests.test_api.AuthLoginTest

# Metodo especifico
docker compose exec backend python manage.py test apps.users.tests.test_api.AuthLoginTest.test_login_success_client
```

### Salida detallada

Agregar `--verbosity=2` para ver el nombre de cada test que se ejecuta:

```sh
docker compose exec backend python manage.py test --verbosity=2
```

---

## Frontend (Vitest — 68 tests)

Los tests del frontend se ejecutan dentro del contenedor `frontend`.

### Todos los tests del frontend

```sh
docker compose exec frontend npm test
```

### Modo watch (reejecucion automatica al cambiar archivos)

```sh
docker compose exec frontend npm run test:watch
```

### Tests de un archivo especifico

```sh
docker compose exec frontend npx vitest run src/__tests__/api/axios.test.js
docker compose exec frontend npx vitest run src/__tests__/api/authService.test.js
docker compose exec frontend npx vitest run src/__tests__/api/userService.test.js
docker compose exec frontend npx vitest run src/__tests__/api/cartService.test.js
docker compose exec frontend npx vitest run src/__tests__/api/choreographyService.test.js
docker compose exec frontend npx vitest run src/__tests__/api/salesService.test.js
docker compose exec frontend npx vitest run src/__tests__/api/dashboardService.test.js
docker compose exec frontend npx vitest run src/__tests__/context/AuthContext.test.jsx
docker compose exec frontend npx vitest run src/__tests__/context/CartContext.test.jsx
```

### Salida detallada

```sh
docker compose exec frontend npx vitest run --reporter=verbose
```

---

## E2E (Playwright — 27 tests)

Los tests E2E validan flujos de usuario completos contra los servicios corriendo.

### Requisitos E2E

```sh
# Instalar Playwright (solo una vez)
npm install -D @playwright/test
npx playwright install chromium
```

### Configuracion

El archivo `e2e/playwright.config.js` apunta por defecto a:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`

Se pueden cambiar con variables de entorno:

```sh
E2E_BASE_URL=http://localhost:5173 E2E_API_URL=http://localhost:8000/api
```

### Todos los tests E2E

```sh
npx playwright test --config=e2e/playwright.config.js
```

### Por archivo

```sh
npx playwright test e2e/tests/landing.spec.js --config=e2e/playwright.config.js
npx playwright test e2e/tests/login.spec.js --config=e2e/playwright.config.js
npx playwright test e2e/tests/register.spec.js --config=e2e/playwright.config.js
npx playwright test e2e/tests/navigation.spec.js --config=e2e/playwright.config.js
npx playwright test e2e/tests/api.spec.js --config=e2e/playwright.config.js
```

### Reporte HTML

```sh
npx playwright show-report e2e/playwright-report
```

### Notas E2E

- Los tests de `api.spec.js` validan endpoints REST directamente (health check, auth flows, permisos).
- Los tests de `landing.spec.js`, `login.spec.js`, `register.spec.js` validan navegacion y renderizado de formularios.
- Los tests de `navigation.spec.js` validan rutas publicas y la pagina 404.
- **Los tests de login/register no completan el flujo real** porque requieren Cloudflare Turnstile CAPTCHA.

---

## Resumen de tests

| Capa        | Tests | Archivos | Framework          |
|-------------|-------|----------|--------------------|
| Backend     | 222   | 16       | Django SimpleTestCase + unittest.mock |
| Frontend    | 68    | 9        | Vitest + Testing Library |
| E2E         | 27    | 5        | Playwright          |
| **Total**   | **317** | **30** |                    |

### Comparativa con version anterior

| Capa        | Antes | Ahora | Cambio    |
|-------------|-------|-------|-----------|
| Backend     | 142   | 222   | +80 tests |
| Frontend    | 28    | 68    | +40 tests |
| E2E         | 0     | 27    | +27 tests |
| **Total**   | **170** | **317** | **+147 tests** |

---

### Estructura de archivos de test

```
backend/
├── apps/
│   ├── users/tests/
│   │   ├── test_helpers.py       — Funciones puras (_split_full_name, etc.)
│   │   ├── test_serializers.py   — Serializers (RegisterSerializer, etc.)
│   │   ├── test_permissions.py   — Permisos RBAC (IsAdmin, IsDirector, etc.)
│   │   └── test_api.py           — Endpoints (auth, usuarios internos, perfil)
│   ├── choreographies/tests/
│   │   ├── test_api.py           — CRUD coreografias y videos
│   │   ├── test_serializers.py   — CoreographySerializer, VideoSerializer
│   │   └── test_filters.py       — CoreographyFilter
│   ├── cart/tests/
│   │   ├── test_api.py           — ShoppingCartView, CartItemListCreateView, CartItemDetailView, _get_active_cart
│   │   ├── test_permissions.py   — IsClientRole, IsCartOwner
│   │   └── test_serializers.py   — ShoppingCartSerializer, CartItemSerializer, AddToCartInputSerializer
│   ├── sales/tests/
│   │   ├── test_api.py           — PurchaseViewSet (list, create, confirm-items/billing/payment, refund)
│   │   └── test_models.py        — Purchase, UserCoreography, Bill
│   └── dashboard/tests/
│       ├── test_api.py           — AdminDashboardView, ProfesorDashboardView, ClienteDashboardView, EMPTY_RESPONSE
│       ├── test_permissions.py   — IsAdminOrDirector, IsProfesor, IsCliente (dashboard)
│       └── test_serializers.py   — AdminDashboardSerializer, ProfesorDashboardSerializer, ClienteDashboardSerializer
└── database/tests/
    └── test_sql.py               — Validacion de archivos SQL (DDL, DML, funciones)

frontend/src/__tests__/
├── api/
│   ├── axios.test.js             — Instancia Axios e interceptores
│   ├── authService.test.js       — Llamadas a /auth/*
│   ├── userService.test.js       — Llamadas a /users/*
│   ├── cartService.test.js       — Llamadas a /cart/*
│   ├── choreographyService.test.js — Llamadas a /choreographies/* y /videos/*
│   ├── salesService.test.js      — Llamadas a /sales/*
│   └── dashboardService.test.js  — Llamadas a /dashboard/*
└── context/
    ├── AuthContext.test.jsx       — Estado de autenticacion (login, logout, localStorage)
    └── CartContext.test.jsx       — Estado del carrito (addItem, removeItem, clearCart, total)

e2e/
├── playwright.config.js          — Configuracion de Playwright
└── tests/
    ├── landing.spec.js           — Landing page: carga, navegacion, branding
    ├── login.spec.js             — Login: formulario, campos, links, navegacion
    ├── register.spec.js          — Register: formulario, campos, navegacion
    ├── navigation.spec.js        — Rutas publicas: catalogo, recuperar clave, 404
    └── api.spec.js               — API: health check, auth flow, permisos (401/400)
```

---

## Tipos de pruebas aplicadas

### Unitarias (Backend)
- **Serializers**: Validacion de campos, tipos de datos, campos requeridos, nested serializers, campos opcionales.
- **Permisos**: RBAC (roles admin, director, profesor, client), autenticacion, usuarios anonimos.
- **Helpers**: Funciones puras de parseo de datos, normalizacion, serializacion.
- **API Views**: Endpoints con mocking de BD (SimpleTestCase + unittest.mock), respuestas HTTP correctas, manejo de errores.

### Unitarias (Frontend)
- **Services**: Verificacion de llamadas HTTP correctas (URL, metodo, parametros) para cada servicio de la API.
- **Context**: Estado inicial, transiciones de estado (login/logout), integracion con localStorage.

### E2E
- **Navegacion**: Carga de paginas publicas, navegacion entre rutas, pagina 404.
- **Formularios**: Renderizado de campos, capacidad de escritura, validacion visual.
- **API endpoints**: Health check, respuestas de autenticacion (401/400), registro de usuarios.

---

## Notas importantes

- Los tests del backend no requieren PostgreSQL porque usan `SimpleTestCase` + `unittest.mock`.
  Los modelos usan `managed = False`, por lo que Django no necesita crear tablas.
- Los tests SQL (`database/tests/test_sql.py`) se saltan automaticamente si los archivos `.sql` no estan accesibles dentro del contenedor.
- Los tests del frontend usan `jsdom` como entorno simulado del navegador.
- Los tests E2E requieren los servicios corriendo (frontend en :5173, backend en :8000).
- **1 test preexistente falla**: `test_login_missing_identifier` (espera 400, recibe 403 debido al middleware de CAPTCHA). No es una regresion de los nuevos tests.
- No existe un linter ni typecheck configurado en el proyecto; los tests son el unico mecanismo de verificacion automatizada.
- **Los tests E2E de login/registro no completan el flujo** porque Cloudflare Turnstile requiere una site key real.
