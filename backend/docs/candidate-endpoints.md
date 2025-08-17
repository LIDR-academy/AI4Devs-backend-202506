# Candidate Endpoints

## PUT /candidates/:id/stage

Actualiza la etapa del proceso de entrevista en la que se encuentra un candidato específico.

### Parámetros de URL

- `id` (number, requerido): ID del candidato

### Body de la Petición

```json
{
  "interviewStepId": 2,
  "notes": "Candidato aprobado para la siguiente fase"
}
```

### Campos del Body

- `interviewStepId` (number, requerido): ID de la nueva etapa de entrevista
- `notes` (string, opcional): Notas adicionales sobre el cambio de etapa

### Respuesta Exitosa

**Código:** 200 OK

```json
{
  "message": "Candidate stage updated successfully",
  "data": {
    "candidateId": 1,
    "candidateName": "Juan Pérez García",
    "currentStage": {
      "id": 2,
      "name": "Entrevista Técnica",
      "orderIndex": 2
    },
    "notes": "Candidato aprobado para la siguiente fase",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Respuestas de Error

**Código:** 400 Bad Request
```json
{
  "error": "Invalid candidate ID format",
  "message": "Candidate ID must be a valid number"
}
```

**Código:** 400 Bad Request
```json
{
  "error": "Missing request body",
  "message": "Request body is required with interviewStepId"
}
```

**Código:** 400 Bad Request
```json
{
  "error": "Validation error",
  "message": "Invalid interview step ID"
}
```

**Código:** 404 Not Found
```json
{
  "error": "Candidate not found",
  "message": "The specified candidate does not exist"
}
```

**Código:** 404 Not Found
```json
{
  "error": "Interview step not found",
  "message": "The specified interview step does not exist"
}
```

**Código:** 404 Not Found
```json
{
  "error": "No active application",
  "message": "This candidate has no active application"
}
```

## GET /candidates/:id/stage

Obtiene la etapa actual del proceso de entrevista en la que se encuentra un candidato específico.

### Parámetros de URL

- `id` (number, requerido): ID del candidato

### Respuesta Exitosa

**Código:** 200 OK

```json
{
  "message": "Candidate current stage retrieved successfully",
  "data": {
    "candidateId": 1,
    "candidateName": "Juan Pérez García",
    "currentStage": {
      "id": 2,
      "name": "Entrevista Técnica",
      "orderIndex": 2
    },
    "position": {
      "id": 1,
      "title": "Desarrollador Full Stack"
    },
    "notes": "Candidato aprobado para la siguiente fase"
  }
}
```

### Respuestas de Error

**Código:** 400 Bad Request
```json
{
  "error": "Invalid candidate ID format",
  "message": "Candidate ID must be a valid number"
}
```

**Código:** 404 Not Found
```json
{
  "error": "Candidate not found",
  "message": "The specified candidate does not exist"
}
```

**Código:** 404 Not Found
```json
{
  "error": "No active application",
  "message": "This candidate has no active application"
}
```

### Ejemplos de Uso

#### Actualizar etapa del candidato
```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{
    "interviewStepId": 2,
    "notes": "Candidato aprobado para la siguiente fase"
  }'
```

#### Obtener etapa actual del candidato
```bash
curl -X GET http://localhost:3010/candidates/1/stage
``` 