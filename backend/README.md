# Backend – ATS Kanban API 🚦

## Descripción
Este backend es parte de un sistema ATS (Applicant Tracking System) y expone una API RESTful desarrollada en Node.js + Express + TypeScript, usando Prisma como ORM y PostgreSQL como base de datos. Incluye endpoints para manipular candidatos en una interfaz tipo kanban.

---

## Estructura de Carpetas

- `src/`
  - `application/` – Servicios, lógica de negocio y DTOs
  - `domain/models/` – Modelos de dominio (TypeScript)
  - `presentation/controllers/` – Controladores de endpoints
  - `routes/` – Definición de rutas Express
- `prisma/` – Esquema y migraciones de base de datos
- `docs/` – Documentación Swagger/OpenAPI

---

## Instalación y Configuración

1. Instala las dependencias:
   ```sh
   npm install
   ```
2. Configura la base de datos en `prisma/schema.prisma` y ejecuta las migraciones:
   ```sh
   npx prisma migrate dev
   npx prisma generate
   ```
3. Inicia el servidor:
   ```sh
   npm run start
   ```

---

## Endpoints Principales (Kanban ATS)

### 1. Obtener candidatos en proceso para una posición
- **GET** `/positions/:id/candidates`
- Devuelve: Nombre completo, etapa actual y puntuación media de cada candidato.

### 2. Actualizar la etapa de un candidato
- **PUT** `/candidates/:id/stage`
- Body: `{ "currentInterviewStep": <número de etapa> }`
- Devuelve: Estado actualizado del candidato.

Consulta la documentación completa y prueba los endpoints en:
- [http://localhost:3010/api-docs](http://localhost:3010/api-docs)

---

## Buenas Prácticas
- Código modular y tipado (TypeScript)
- Principios SOLID y DRY
- Manejo centralizado de errores
- Validación exhaustiva de parámetros y body
- Documentación OpenAPI/Swagger siempre actualizada
- Pruebas unitarias e integración recomendadas

---

## Comandos Útiles
- `npm run start` – Inicia el servidor en modo producción
- `npm run dev` – Inicia el servidor en modo desarrollo (con nodemon)
- `npx prisma migrate dev` – Ejecuta migraciones de base de datos
- `npx prisma studio` – Interfaz visual para la base de datos
- `npx tsc --noEmit` – Verifica errores de compilación TypeScript

---

## Dependencias Clave
- express
- typescript
- prisma / @prisma/client
- swagger-ui-express
- cors

---

## Contacto y Contribución
Para dudas, sugerencias o contribuciones, contacta al equipo de desarrollo o abre un issue en el repositorio principal. 