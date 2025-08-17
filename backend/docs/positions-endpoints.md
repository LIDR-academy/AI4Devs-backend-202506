# Positions Endpoints

## GET /positions/:id/candidates

Obtiene todos los candidatos en proceso para una posición específica.

### Parámetros de URL

- `id` (number, requerido): ID de la posición

### Respuesta Exitosa

**Código:** 200 OK

```json
{
  "message": "Candidates retrieved successfully",
  "data": [
    {
      "candidateId": 1,
      "fullName": "Juan Pérez García",
      "currentInterviewStep": "Entrevista Técnica",
      "averageScore": 8.5
    },
    {
      "candidateId": 2,
      "fullName": "María López Sánchez",
      "currentInterviewStep": "Entrevista Final",
      "averageScore": 9.2
    }
  ],
  "count": 2
}
```

### Respuestas de Error

**Código:** 400 Bad Request
```json
{
  "error": "Invalid position ID format",
  "message": "Position ID must be a valid number"
}
```

**Código:** 404 Not Found
```json
{
  "error": "Position not found",
  "message": "The specified position does not exist"
}
```

**Código:** 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

### Campos de Respuesta

- `candidateId`: ID único del candidato
- `fullName`: Nombre completo del candidato (firstName + lastName)
- `currentInterviewStep`: Nombre de la fase actual del proceso de entrevista
- `averageScore`: Puntuación media de todas las entrevistas del candidato (null si no hay entrevistas)

### Ejemplo de Uso

```bash
curl -X GET http://localhost:3010/positions/1/candidates
``` 