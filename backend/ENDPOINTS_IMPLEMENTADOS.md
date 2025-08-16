# Endpoints Implementados - Sistema de Candidatos Kanban

## Descripción General

Se han implementado dos endpoints para manipular la lista de candidatos de una aplicación tipo kanban en el backend, siguiendo la arquitectura y convenciones del repositorio.

## Endpoints Disponibles

### 1. GET /positions/:id/candidates

**Descripción:** Lista todos los candidatos en proceso para una posición específica, devolviendo información consolidada por candidato.

**Parámetros:**
- `id` (path parameter): ID de la posición

**Respuesta:**
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

**Códigos de Estado:**
- `200`: Éxito
- `400`: ID de posición inválido
- `404`: Posición no encontrada
- `500`: Error interno del servidor

**Ejemplo de Uso:**
```bash
curl -X GET http://localhost:3010/positions/1/candidates
```

### 2. PUT /candidates/:id/stage

**Descripción:** Actualiza la fase (etapa) actual del proceso de entrevista del candidato indicado.

**Parámetros:**
- `id` (path parameter): ID del candidato
- `stage_id` (body): ID de la nueva etapa de entrevista

**Body de la Petición:**
```json
{
  "stage_id": 2
}
```

**Respuesta:**
```json
{
  "candidate_id": 12,
  "updated_stage": "Onsite",
  "status": "success"
}
```

**Códigos de Estado:**
- `200`: Éxito
- `400`: ID de candidato o stage_id inválido
- `404`: Candidato, etapa de entrevista o aplicación no encontrada
- `500`: Error interno del servidor

**Ejemplo de Uso:**
```bash
curl -X PUT http://localhost:3010/candidates/12/stage \
  -H "Content-Type: application/json" \
  -d '{"stage_id": 2}'
```

## Estructura de Archivos Implementados

### Servicios (Lógica de Negocio)
- `src/application/services/positionService.ts`: Contiene la lógica de negocio para ambos endpoints

### Controladores (Manejo de Peticiones HTTP)
- `src/presentation/controllers/positionController.ts`: Controladores para manejar las peticiones HTTP

### Rutas
- `src/routes/positionRoutes.ts`: Definición de rutas para posiciones
- `src/routes/candidateRoutes.ts`: Actualizado para incluir el endpoint de actualización de etapa

### Documentación
- `prompts/prompts-iniciales.md`: Prompts utilizados para la implementación
- `ENDPOINTS_IMPLEMENTADOS.md`: Esta documentación

## Razonamiento de Implementación

### GET /positions/:id/candidates

**Razonamiento:**
1. **Datos necesarios:** Aplicaciones de la posición, información del candidato, etapa actual, y puntuaciones de entrevistas
2. **Tablas involucradas:** `position`, `application`, `candidate`, `interviewStep`, `interview`
3. **Vinculación de entidades:** 
   - `position` → `application` (por positionId)
   - `application` → `candidate` (por candidateId)
   - `application` → `interviewStep` (por currentInterviewStep)
   - `application` → `interview` (por applicationId)
4. **Validaciones:** Existencia de la posición, formato válido del ID
5. **Cálculos:** Promedio de puntuaciones de entrevistas por candidato

### PUT /candidates/:id/stage

**Razonamiento:**
1. **Datos necesarios:** Candidato, nueva etapa de entrevista, aplicación activa
2. **Tablas involucradas:** `candidate`, `interviewStep`, `application`
3. **Vinculación de entidades:**
   - `candidate` → `application` (por candidateId)
   - `application` → `interviewStep` (por currentInterviewStep)
4. **Validaciones:** Existencia del candidato, existencia de la etapa, existencia de aplicación activa
5. **Operaciones:** Actualización del campo `currentInterviewStep` en la aplicación

## Características Técnicas

- **Arquitectura:** Sigue el patrón de separación de responsabilidades (routes → controllers → services → models)
- **Base de Datos:** Utiliza Prisma Client para acceso a datos
- **Validaciones:** Validación de parámetros y existencia de entidades
- **Manejo de Errores:** Respuestas HTTP apropiadas con códigos de estado y mensajes descriptivos
- **Documentación:** Código bien documentado en español con comentarios explicativos

## Instalación y Uso

1. **Instalar dependencias:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar base de datos:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Ejecutar el servidor:**
   ```bash
   npm run dev
   ```

4. **Probar endpoints:**
   - El servidor estará disponible en `http://localhost:3010`
   - Usar los ejemplos de curl proporcionados arriba

## Notas Importantes

- Los endpoints siguen las convenciones RESTful
- Se incluye manejo completo de errores con códigos HTTP apropiados
- La puntuación media se redondea a 1 decimal para mejor legibilidad
- Se valida la existencia de todas las entidades antes de realizar operaciones
- El código está documentado en español siguiendo las preferencias del usuario
