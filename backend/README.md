# Backend ATS - Sistema de Seguimiento de Talento 🚀

Backend para sistema ATS (Applicant Tracking System) con endpoints Kanban para gestión de candidatos.

## 📋 Características

- **Endpoints Kanban ATS**: Gestión de candidatos en proceso
- **Cálculo de puntuaciones**: Promedio automático de entrevistas
- **Validación robusta**: Manejo completo de errores y casos edge
- **Documentación Swagger**: API documentada automáticamente
- **Tests completos**: Cobertura >85% con TDD
- **Arquitectura limpia**: Principios SOLID y patrones de diseño

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── application/
│   │   ├── services/
│   │   │   ├── positionService.ts
│   │   │   ├── candidateService.ts
│   │   │   └── fileUploadService.ts
│   │   └── dtos/
│   │       └── CandidateKanbanDTO.ts
│   ├── presentation/
│   │   └── controllers/
│   │       ├── positionController.ts
│   │       └── candidateController.ts
│   ├── routes/
│   │   ├── positionRoutes.ts
│   │   └── candidateRoutes.ts
│   └── index.ts
├── __tests__/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── positionService.test.ts
│   │   │   └── candidateService.test.ts
│   │   └── controllers/
│   │       ├── positionController.test.ts
│   │       └── candidateController.test.ts
│   ├── integration/
│   │   ├── positionRoutes.test.ts
│   │   └── candidateRoutes.test.ts
│   └── __mocks__/
│       ├── prisma.ts
│       └── data/
│           ├── candidates.ts
│           ├── positions.ts
│           └── applications.ts
├── prisma/
│   └── schema.prisma
├── docs/
│   └── swagger.json
└── package.json
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js >= 16
- PostgreSQL
- Docker (opcional)

### Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Poblar base de datos (opcional)
npm run prisma:seed
```

### Variables de Entorno

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
PORT=3010
NODE_ENV=development
```

## 🏃‍♂️ Ejecución

### Desarrollo

```bash
# Modo desarrollo con hot reload
npm run dev

# O compilar y ejecutar
npm run build
npm start
```

### Producción

```bash
# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Solo tests unitarios
npm run test:unit

# Solo tests de integración
npm run test:integration
```

### Cobertura de Tests

El proyecto mantiene una cobertura de tests superior al **85%** cubriendo:

- ✅ **User Story 1**: Visualización de candidatos en Kanban
- ✅ **User Story 2**: Actualización de etapa del candidato
- ✅ **User Story 3**: Cálculo de puntuación media
- ✅ **User Story 4**: Validación y manejo de errores
- ✅ **User Story 5**: Documentación y pruebas

#### Revisar el Reporte de Cobertura HTML

Cada vez que ejecutas:

```bash
npm run test:coverage
```

Jest genera un reporte de cobertura en la carpeta `backend/coverage/lcov-report/index.html`.

**Pasos para revisar el reporte HTML:**

1. Ejecuta los tests con cobertura:
   ```bash
   npm run test:coverage
   ```
2. Abre el archivo `backend/coverage/lcov-report/index.html` en tu navegador preferido.
3. Explora la cobertura por archivo, función, línea y rama. Los archivos en rojo o amarillo indican áreas a mejorar.

**Interpretación:**
- **Statements**: Porcentaje de líneas ejecutadas.
- **Branches**: Porcentaje de ramas de control (if/else, switch) ejecutadas.
- **Functions**: Porcentaje de funciones ejecutadas.
- **Lines**: Porcentaje de líneas ejecutadas.

**Recomendaciones:**
- Si la cobertura baja del 85%, revisa el reporte HTML para identificar archivos o líneas no cubiertas y agrega tests específicos.
- Mantén la cobertura alta para asegurar calidad y evitar regresiones.

### Estructura de Tests

```
__tests__/
├── unit/                    # Tests unitarios
│   ├── services/           # Tests de servicios
│   └── controllers/        # Tests de controladores
├── integration/            # Tests de integración
│   ├── positionRoutes.test.ts
│   └── candidateRoutes.test.ts
└── __mocks__/             # Mocks y datos de prueba
    ├── prisma.ts
    └── data/
```

## 📚 API Endpoints

### Endpoints Kanban ATS

#### 1. GET /positions/:id/candidates
Obtiene la lista de candidatos en proceso para una posición específica.

**Parámetros:**
- `id` (number): ID de la posición

**Request:**
```bash
curl -X GET http://localhost:3010/positions/1/candidates
```

**Response:**
```json
[
  {
    "candidateId": 1,
    "fullName": "Juan Pérez",
    "currentInterviewStep": "Entrevista Técnica",
    "averageScore": 7.5
  }
]
```

---
#### 2. PUT /candidates/:id/stage
Actualiza la etapa del proceso de entrevista para un candidato específico.

**Parámetros:**
- `id` (number): ID del candidato

**Request:**
```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"currentInterviewStep": 3}'
```

**Body:**
```json
{
  "currentInterviewStep": 3
}
```

**Response:**
```json
{
  "candidateId": 1,
  "currentInterviewStep": 3
}
```

---
#### 3. POST /candidates
Crea un nuevo candidato.

**Request:**
```bash
curl -X POST http://localhost:3010/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@email.com",
    "phone": "123456789",
    "address": "Calle Principal 123",
    "educations": [
      { "institution": "UC3M", "title": "Computer Science", "startDate": "2006-12-31", "endDate": "2010-12-26" }
    ],
    "workExperiences": [
      { "company": "Coca Cola", "position": "SWE", "description": "", "startDate": "2011-01-01", "endDate": "2013-01-17" }
    ],
    "cv": { "filePath": "uploads/1715760936750-cv.pdf", "fileType": "application/pdf" }
  }'
```

**Response:**
```json
{
  "id": 4,
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@email.com",
  "phone": "123456789",
  "address": "Calle Principal 123",
  "educations": [
    { "institution": "UC3M", "title": "Computer Science", "startDate": "2006-12-31", "endDate": "2010-12-26" }
  ],
  "workExperiences": [
    { "company": "Coca Cola", "position": "SWE", "description": "", "startDate": "2011-01-01", "endDate": "2013-01-17" }
  ],
  "resumes": [
    { "filePath": "uploads/1715760936750-cv.pdf", "fileType": "application/pdf" }
  ],
  "applications": []
}
```

---
#### 4. GET /candidates/:id
Obtiene un candidato por ID.

**Parámetros:**
- `id` (number): ID del candidato

**Request:**
```bash
curl -X GET http://localhost:3010/candidates/1
```

**Response:**
```json
{
  "id": 1,
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@email.com",
  "phone": "123456789",
  "address": "Calle Principal 123",
  "educations": [],
  "workExperiences": [],
  "resumes": [],
  "applications": []
}
```

---
#### 5. POST /upload
Sube un archivo (CV) en formato PDF o DOCX.

**Request:**
```bash
curl -X POST http://localhost:3010/upload \
  -F "file=@/ruta/a/mi-cv.pdf"
```

**Response:**
```json
{
  "filePath": "uploads/1715760936750-cv.pdf",
  "fileType": "application/pdf"
}
```

---

### Endpoints Existentes

#### POST /candidates
Crea un nuevo candidato.

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:3010/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@email.com",
    "phone": "123456789",
    "address": "Calle Principal 123"
  }'
```

#### GET /candidates/:id
Obtiene un candidato por ID.

**Ejemplo con curl:**
```bash
curl -X GET http://localhost:3010/candidates/1
```

## 📖 Documentación API

La documentación completa de la API está disponible en:

- **Swagger UI**: http://localhost:3010/api-docs
- **Especificación OpenAPI**: `docs/swagger.json`

## 🗄️ Base de Datos

### Esquema Principal

```sql
-- Candidatos
Candidate (id, firstName, lastName, email, phone, address)

-- Aplicaciones
Application (id, positionId, candidateId, currentInterviewStep, applicationDate)

-- Entrevistas
Interview (id, applicationId, interviewStepId, employeeId, score, notes)

-- Posiciones
Position (id, companyId, title, description, status)

-- Etapas de Entrevista
InterviewStep (id, name, orderIndex)
```

### Comandos de Base de Datos

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio

# Poblar con datos de ejemplo
npm run prisma:seed
```

## 🔧 Solución de Problemas Comunes

### Error: "Cannot find module 'dist/index.js'"
**Causa:** No se ha compilado el código TypeScript.
**Solución:**
```bash
npm run build
npm start
```

### Error: "Module has no exported member" o conflictos de tipos
**Causa:** Dependencias duplicadas o incompatibles.
**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Cannot find module 'express'" o tipos faltantes
**Causa:** Dependencias de tipos no instaladas.
**Solución:**
```bash
npm install express @types/express swagger-ui-express @types/swagger-ui-express --save
```

### Error de compilación TypeScript
**Causa:** Errores de sintaxis o tipos.
**Solución:**
```bash
npx tsc --noEmit
```

### Error: Tests no ejecutan
**Causa:** Configuración de Jest incorrecta.
**Solución:**
```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
npm test
```

## 📊 Métricas de Calidad

- **Cobertura de Tests**: >85%
- **Líneas de Código**: ~500
- **Endpoints**: 4 principales + 2 auxiliares
- **Tests**: 25+ casos de prueba
- **Documentación**: 100% cubierta

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **AI4Devs Team** - Desarrollo inicial
- **Product Owner** - Especificaciones de requerimientos
- **Technical Lead** - Arquitectura y diseño
- **Backend Developer** - Implementación

---

**Nota:** Este backend está diseñado para trabajar con el frontend React correspondiente y sigue las mejores prácticas de desarrollo de software. 