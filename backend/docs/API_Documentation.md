# API Documentation - LTI Talent Tracking System

## Descripción General

Esta documentación describe los endpoints de la API del sistema de seguimiento de talento de LTI. La API está construida siguiendo principios RESTful y utiliza Express.js con TypeScript.

## Base URL

```
http://localhost:3010
```

## Autenticación

Actualmente la API no requiere autenticación, pero se recomienda implementar un sistema de autenticación para producción.

## Endpoints

### 1. Obtener Candidatos para una Posición

**Endpoint:** `GET /positions/:id/candidates`

**Descripción:** Obtiene todos los candidatos en proceso para una posición específica, incluyendo información sobre su etapa actual en el proceso de entrevista y puntuación media.

**Parámetros de URL:**
- `id` (number, requerido): ID de la posición

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "currentInterviewStep": "Initial Screening",
      "averageScore": 8.5,
      "applicationId": 1,
      "positionId": 1
    },
    {
      "id": 2,
      "fullName": "Jane Smith",
      "currentInterviewStep": "Technical Interview",
      "averageScore": 7.0,
      "applicationId": 2,
      "positionId": 1
    }
  ],
  "count": 2,
  "positionId": 1
}
```

**Respuesta de Error (400 - ID Inválido):**
```json
{
  "error": "Invalid position ID",
  "message": "Position ID must be a positive integer"
}
```

**Respuesta de Error (404 - Posición No Encontrada):**
```json
{
  "error": "Position not found",
  "message": "Position with ID 999 not found"
}
```

**Respuesta de Error (500 - Error Interno):**
```json
{
  "error": "Internal server error",
  "message": "An error occurred while retrieving candidates for the position"
}
```

**Ejemplo de Uso con cURL:**
```bash
curl -X GET "http://localhost:3010/positions/1/candidates" \
  -H "Content-Type: application/json"
```

**Ejemplo de Uso con JavaScript (Fetch):**
```javascript
const response = await fetch('http://localhost:3010/positions/1/candidates', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

### 2. Actualizar Etapa del Candidato

**Endpoint:** `PUT /positions/:positionId/candidate/:id/stage`

**Descripción:** Actualiza la etapa del candidato en el proceso de entrevista para una posición específica, permitiendo mover candidatos entre diferentes fases del proceso de selección.

**Parámetros de URL:**
- `positionId` (number, requerido): ID de la posición
- `id` (number, requerido): ID del candidato

**Nota:** Esta ruta ahora incluye la posición en la URL para ser más específica y evitar ambigüedades cuando un candidato tiene múltiples aplicaciones.

**Cuerpo de la Solicitud:**
```json
{
  "newInterviewStepId": 2
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Candidate stage updated successfully",
  "data": {
    "candidateId": 1,
    "candidateName": "John Doe",
    "positionTitle": "Software Engineer",
    "previousStage": "Initial Screening",
    "newStage": "Technical Interview",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Respuesta de Error (400 - ID de Posición Inválido):**
```json
{
  "error": "Invalid position ID",
  "message": "Position ID must be a positive integer"
}
```

**Respuesta de Error (400 - ID de Candidato Inválido):**
```json
{
  "error": "Invalid candidate ID",
  "message": "Candidate ID must be a positive integer"
}
```

**Respuesta de Error (400 - ID de Etapa Inválido):**
```json
{
  "error": "Invalid interview step ID",
  "message": "newInterviewStepId must be a positive integer"
}
```

**Respuesta de Error (404 - Posición No Encontrada):**
```json
{
  "error": "Resource not found",
  "message": "Position with ID 999 not found"
}
```

**Respuesta de Error (404 - Candidato No Encontrado):**
```json
{
  "error": "Resource not found",
  "message": "Candidate with ID 999 not found"
}
```

**Respuesta de Error (400 - Sin Aplicación Encontrada):**
```json
{
  "error": "No active application",
  "message": "No application found for candidate 1 in position 999"
}
```

**Ejemplo de Uso con cURL:**
```bash
curl -X PUT "http://localhost:3010/positions/1/candidate/1/stage" \
  -H "Content-Type: application/json" \
  -d '{
    "newInterviewStepId": 2
  }'
```

**Ejemplo de Uso con JavaScript (Fetch):**
```javascript
const response = await fetch('http://localhost:3010/positions/1/candidate/1/stage', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    newInterviewStepId: 2
  })
});

const data = await response.json();
console.log(data);
```

## Códigos de Estado HTTP

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Solicitud mal formada o parámetros inválidos
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error interno del servidor

## Estructura de Respuestas

Todas las respuestas exitosas siguen este formato:
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

Todas las respuestas de error siguen este formato:
```json
{
  "error": "Error type",
  "message": "Human readable error message"
}
```

## Logs y Monitoreo

La API registra logs detallados para todas las operaciones, incluyendo:
- Inicio de solicitudes
- Operaciones exitosas
- Errores y excepciones
- Información de debugging

Los logs incluyen timestamps y contexto relevante para facilitar el debugging y monitoreo.

## Consideraciones de Rendimiento

- La API utiliza consultas optimizadas con Prisma ORM
- Se implementa paginación para grandes volúmenes de datos
- Las consultas incluyen solo los campos necesarios
- Se utilizan índices de base de datos para mejorar el rendimiento

## Seguridad

- Validación de entrada en todos los endpoints
- Sanitización de parámetros
- Manejo seguro de errores (no se exponen detalles internos)
- Validación de tipos de datos

## Ejemplos de Integración

### Frontend React
```javascript
import React, { useState, useEffect } from 'react';

const CandidateList = ({ positionId }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(`/positions/${positionId}/candidates`);
        const data = await response.json();
        if (data.success) {
          setCandidates(data.data);
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [positionId]);

  const updateCandidateStage = async (candidateId, newStageId) => {
    try {
      const response = await fetch(`/positions/1/candidate/${candidateId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newInterviewStepId: newStageId })
      });
      
      const data = await response.json();
      if (data.success) {
        // Actualizar la lista de candidatos
        fetchCandidates();
      }
    } catch (error) {
      console.error('Error updating candidate stage:', error);
    }
  };

  if (loading) return <div>Cargando candidatos...</div>;

  return (
    <div>
      <h2>Candidatos para la Posición</h2>
      {candidates.map(candidate => (
        <div key={candidate.id}>
          <h3>{candidate.fullName}</h3>
          <p>Etapa: {candidate.currentInterviewStep}</p>
          <p>Puntuación Media: {candidate.averageScore}</p>
          <button onClick={() => updateCandidateStage(candidate.id, 2)}>
            Mover a Siguiente Etapa
          </button>
        </div>
      ))}
    </div>
  );
};

export default CandidateList;
```

### Backend Node.js
```javascript
const axios = require('axios');

class LTIApiClient {
  constructor(baseURL = 'http://localhost:3010') {
    this.baseURL = baseURL;
  }

  async getCandidatesForPosition(positionId) {
    try {
      const response = await axios.get(`${this.baseURL}/positions/${positionId}/candidates`);
      return response.data;
    } catch (error) {
      console.error('Error getting candidates:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateCandidateStage(candidateId, newInterviewStepId, positionId = 1) {
    try {
      const response = await axios.put(`${this.baseURL}/positions/${positionId}/candidate/${candidateId}/stage`, {
        newInterviewStepId
      });
      return response.data;
    } catch (error) {
      console.error('Error updating candidate stage:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Uso del cliente
const ltiClient = new LTIApiClient();

// Obtener candidatos
ltiClient.getCandidatesForPosition(1)
  .then(data => console.log('Candidatos:', data))
  .catch(error => console.error('Error:', error));

// Actualizar etapa
ltiClient.updateCandidateStage(1, 2, 1)
  .then(data => console.log('Actualizado:', data))
  .catch(error => console.error('Error:', error));
```