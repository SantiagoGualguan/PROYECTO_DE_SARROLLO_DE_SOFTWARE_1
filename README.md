# DanceLearn Academy (esqueleto)

Plataforma web de aprendizaje de baile en línea que conecta instructores 
con clientes para la compra y reproducción de coreografías.

Desarrollado por el Grupo 6 — Desarrollo de Software I  
Universidad del Valle · Cali, Colombia · 2026

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TailwindCSS + ApexCharts |
| Backend | Python 3.11 + Django 4.2 + Django REST Framework |
| Base de datos | PostgreSQL 15 con funciones PL/pgSQL |
| Autenticación | JWT (djangorestframework-simplejwt) |
| Contenedores | Docker + Docker Compose |
| Despliegue | Vercel (frontend) · Render (backend) · Supabase (BD) |

---

## Arquitectura

El sistema adopta una arquitectura de tres capas desacoplada donde 
el frontend y el backend se comunican exclusivamente a través de 
una API REST.

- **Capa de datos:** PostgreSQL con schema DDL definido manualmente.
  Las tablas son gestionadas con `managed = False` en Django.
  Las transacciones críticas (registro, compra, carrito) se ejecutan 
  mediante funciones PL/pgSQL atómicas llamadas con `cursor.execute()`.

- **Capa de negocio:** Django REST Framework expone endpoints REST 
  con autenticación JWT, control de acceso por rol (RBAC) y 
  serializers con validaciones condicionales.

- **Capa de presentación:** React 18 con Context API para estado 
  global de autenticación y carrito. Rutas protegidas por rol 
  (admin, director, instructor, cliente).

---

## Módulos implementados

- **Autenticación:** Login por email o teléfono, registro con 
  roles diferenciados, tokens JWT (access 60 min / refresh 7 días), 
  soft delete de usuarios.

- **Coreografías:** Catálogo con filtros por género y dificultad, 
  gestión de videos por coreografía, dashboard de instructor.

- **Carrito y ventas:** Carrito persistente, proceso de compra en 
  4 pasos, facturación y acceso a coreografías adquiridas.

- **Dashboard:** Métricas por rol con gráficos ApexCharts.

---

## Configuración local

**Requisitos:** Git, Docker Desktop

```bash
git clone https://github.com/SantiagoGualguan/PROYECTO_DE_SARROLLO_DE_SOFTWARE_1.git
cd PROYECTO_DE_SARROLLO_DE_SOFTWARE_1
cp .env.example .env
# Completar el .env con las credenciales del equipo
docker compose up --build
```

En una segunda terminal:
```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| API REST | http://localhost:8000/api/ |
| Admin Django | http://localhost:8000/admin/ |

---

## Equipo

| Integrante | Rol |
|-----------|-----|
| Santiago Gualguan Pillimue | Scrum Máster |
| Norman Guiliano Sanchez Truque | DevOps |
| Isabela Bermúdez Moreno | Frontend |
| Brandon Lasprilla Aristizábal | Backend |
| Luis Santiago Arenas Hincapié | Backend / Documentador |
| Jhonatan David Castaño Calero | Documentador |
Este repositorio contiene **solo estructura base** (archivos, carpetas, modelos con campos, endpoints declarados y componentes React con TODOs), sin lógica de negocio ni datos de prueba.

