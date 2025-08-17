# AI4Devs Backend API

Backend API para el sistema de gestión de candidatos y posiciones de AI4Devs.

## Endpoints Implementados

### Candidates

- `POST /candidates` - Crear un nuevo candidato
- `GET /candidates/:id` - Obtener un candidato por ID
- `PUT /candidates/:id/stage` - Actualizar la etapa del candidato
- `GET /candidates/:id/stage` - Obtener la etapa actual del candidato

### Positions

- `GET /positions/:id/candidates` - Obtener candidatos para una posición específica

### File Upload

- `POST /upload` - Subir archivos

## Arquitectura

El proyecto sigue los principios de Domain-Driven Design (DDD) y Clean Architecture:

```
src/
├── domain/           # Capa de dominio (entidades, modelos)
├── application/      # Capa de aplicación (servicios, validaciones)
├── presentation/     # Capa de presentación (controladores)
└── routes/          # Definición de rutas
```

## Tecnologías

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar la base de datos:
```bash
npx prisma generate
npx prisma migrate dev
```

3. Ejecutar el servidor:
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3010`

## Documentación de Endpoints

Para más detalles sobre cada endpoint, consulta:
- [Candidate Endpoints](./docs/candidate-endpoints.md)
- [Position Endpoints](./docs/positions-endpoints.md) 