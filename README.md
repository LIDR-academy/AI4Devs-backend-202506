# AI4Devs Backend 202506 - Sistema de Candidatos Kanban

## 📋 Descripción del Proyecto

Este proyecto implementa un sistema de gestión de candidatos tipo Kanban para el backend de AI4Devs. Se han desarrollado dos endpoints principales para manipular la lista de candidatos y gestionar sus fases de entrevista.

## 🎯 Endpoints Implementados

### 1. GET /positions/:id/candidates
**Descripción**: Lista todos los candidatos en proceso para una posición específica.

**Parámetros**:
- `id` (path parameter): ID de la posición

**Respuesta**:
```json
[
  {
    "full_name": "Juan García López",
    "current_interview_step": "Phone Screen",
    "average_score": 4.5
  },
  {
    "full_name": "Ana Ruiz Díaz",
    "current_interview_step": "Onsite",
    "average_score": 3.7
  }
]
```

### 2. PUT /candidates/:id/stage
**Descripción**: Actualiza la fase (etapa) actual del proceso de entrevista del candidato.

**Parámetros**:
- `id` (path parameter): ID del candidato
- `stage_id` (body): ID de la nueva etapa de entrevista

**Body**:
```json
{
  "stage_id": 2
}
```

**Respuesta**:
```json
{
  "candidate_id": 12,
  "updated_stage": "Onsite",
  "status": "success"
}
```

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas
```
backend/
├── src/
│   ├── routes/              # Definición de rutas
│   ├── presentation/        # Controladores HTTP
│   ├── application/         # Lógica de negocio
│   └── domain/             # Modelos de datos
├── prisma/                 # Esquema de base de datos
└── prompts/                # Documentación de prompts
```

### Patrones de Implementación
- **Separación de responsabilidades**: routes → controllers → services → models
- **Uso de Prisma Client** para acceso a datos
- **Manejo de errores** con try-catch
- **Validación de datos** en services
- **Respuestas JSON** estructuradas

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn
- PostgreSQL (para base de datos)

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd AI4Devs-backend-202506/backend

# Instalar dependencias
npm install

# Configurar base de datos
npx prisma generate
npx prisma db push

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm run build
npm start
```

### Testing con Postman
1. **GET /positions/:id/candidates**
   - Método: `GET`
   - URL: `http://localhost:3010/positions/1/candidates`

2. **PUT /candidates/:id/stage**
   - Método: `PUT`
   - URL: `http://localhost:3010/candidates/1/stage`
   - Headers: `Content-Type: application/json`
   - Body: `{"stage_id": 2}`

## 📊 Base de Datos

### Tablas Principales
- **Candidate**: Información de candidatos (firstName, lastName)
- **Application**: Aplicaciones a posiciones (currentInterviewStep)
- **Interview**: Entrevistas con scores
- **Position**: Posiciones de trabajo
- **InterviewStep**: Pasos del proceso de entrevista

### Relaciones
- `Position` → `Application` (por positionId)
- `Application` → `Candidate` (por candidateId)
- `Application` → `InterviewStep` (por currentInterviewStep)
- `Application` → `Interview` (por applicationId)

## 🔧 Desarrollo

### Scripts Disponibles
- `npm run dev`: Ejecutar en modo desarrollo
- `npm run build`: Compilar TypeScript
- `npm start`: Ejecutar versión compilada
- `npm test`: Ejecutar tests

### Estructura de Código
- **Services**: Lógica de negocio en `src/application/services/`
- **Controllers**: Manejo de peticiones HTTP en `src/presentation/controllers/`
- **Routes**: Definición de rutas en `src/routes/`
- **Models**: Modelos de datos en `src/domain/models/`

## 📝 Documentación

### Archivos de Documentación
- `ENDPOINTS_IMPLEMENTADOS.md`: Documentación detallada de endpoints
- `RESULTADOS_PRUEBAS.md`: Resultados de testing y validación
- `prompts/prompts-iniciales.md`: Prompts utilizados en el desarrollo

### Códigos de Estado HTTP
- `200`: Éxito
- `400`: Error de validación (ID inválido, datos faltantes)
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## 🐛 Problemas Conocidos y Soluciones

### Problema: Error de TypeScript/ts-node
**Síntoma**: Error de compatibilidad entre versiones
**Solución**: Usar `npm run build` y `npm start` en lugar de `npm run dev`

### Problema: Validación de IDs inválidos
**Síntoma**: IDs no numéricos devuelven 404 en lugar de 400
**Impacto**: Bajo - no afecta funcionalidad principal
**Estado**: Documentado para futuras mejoras

## 🎉 Estado del Proyecto

### ✅ Completado
- [x] Implementación de endpoints GET y PUT
- [x] Arquitectura limpia siguiendo patrones del proyecto
- [x] Validaciones básicas de parámetros
- [x] Manejo de errores con códigos HTTP apropiados
- [x] Documentación completa
- [x] Testing con Postman
- [x] Integración con base de datos Prisma

### 📋 Próximas Mejoras
- [ ] Implementar validación robusta de parámetros
- [ ] Añadir tests unitarios
- [ ] Mejorar manejo de IDs inválidos
- [ ] Implementar autenticación y autorización

## 👨‍💻 Autor

**ENO** - AI4Devs Backend 202506

## 📄 Licencia

Este proyecto es parte del curso AI4Devs Backend 202506.
