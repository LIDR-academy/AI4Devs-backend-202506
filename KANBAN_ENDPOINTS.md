# 📋 Nuevos Endpoints para Kanban de Candidatos

## 🚀 Endpoints Implementados

### 1. **GET /positions/:id/candidates**

**Descripción:** Obtiene todos los candidatos en proceso para una posición específica, ideal para interfaces tipo kanban.

**URL:** `GET http://localhost:3010/positions/{positionId}/candidates`

**Parámetros:**

- `id` (path parameter): ID de la posición

**Respuesta exitosa (200):**

```json
[
  {
    "candidateId": 1,
    "applicationId": 1,
    "fullName": "John Doe",
    "currentInterviewStep": {
      "id": 2,
      "name": "Technical Interview",
      "orderIndex": 2
    },
    "averageScore": 4.5,
    "applicationDate": "2024-05-28T08:27:02.000Z"
  },
  {
    "candidateId": 2,
    "applicationId": 3,
    "fullName": "Jane Smith",
    "currentInterviewStep": {
      "id": 1,
      "name": "Initial Screening",
      "orderIndex": 1
    },
    "averageScore": null,
    "applicationDate": "2024-05-28T08:27:02.000Z"
  }
]
```

**Casos de error:**

- `400`: ID de posición inválido
- `404`: Posición no encontrada
- `500`: Error interno del servidor

---

### 2. **PUT /candidates/:id/stage**

**Descripción:** Actualiza la etapa del proceso de entrevista de un candidato específico.

**URL:** `PUT http://localhost:3010/candidates/{candidateId}/stage`

**Parámetros:**

- `id` (path parameter): ID del candidato

**Body de la petición:**

```json
{
  "currentInterviewStep": 3
}
```

**Respuesta exitosa (200):**

```json
{
  "message": "Candidate stage updated successfully",
  "data": {
    "applicationId": 1,
    "candidateId": 1,
    "fullName": "John Doe",
    "currentInterviewStep": {
      "id": 3,
      "name": "Manager Interview",
      "orderIndex": 3
    },
    "position": {
      "id": 1,
      "title": "Software Engineer"
    },
    "applicationDate": "2024-05-28T08:27:02.000Z"
  }
}
```

**Casos de error:**

- `400`: ID de candidato inválido o currentInterviewStep faltante/inválido
- `404`: Candidato no encontrado, paso de entrevista no encontrado, o sin aplicaciones
- `500`: Error interno del servidor

---

## 🔧 Funcionalidades Implementadas

### **Características del primer endpoint:**

✅ **Obtiene candidatos por posición** - Filtra aplicaciones por positionId
✅ **Información completa** - Nombre completo, etapa actual, puntuación promedio
✅ **Cálculo de puntuación media** - Promedio de todas las entrevistas realizadas
✅ **Manejo de casos edge** - Candidatos sin entrevistas (averageScore: null)
✅ **Validaciones** - Verificación de existencia de posición
✅ **Respuesta estructurada** - Formato ideal para interfaces kanban

### **Características del segundo endpoint:**

✅ **Actualización de etapa** - Modifica currentInterviewStep en la aplicación
✅ **Validaciones robustas** - Verifica candidato, paso de entrevista y aplicación
✅ **Respuesta detallada** - Incluye información actualizada del candidato
✅ **Manejo de errores** - Códigos HTTP apropiados para cada caso
✅ **Busca aplicación más reciente** - En caso de múltiples aplicaciones del mismo candidato

---

## 🧪 Ejemplos de Uso

### **Obtener candidatos de una posición:**

```bash
curl -X GET "http://localhost:3010/positions/1/candidates" \
  -H "Content-Type: application/json"
```

### **Mover candidato a siguiente etapa:**

```bash
curl -X PUT "http://localhost:3010/candidates/1/stage" \
  -H "Content-Type: application/json" \
  -d '{
    "currentInterviewStep": 3
  }'
```

---

## 🏗️ Arquitectura Implementada

### **Capa de Aplicación:**

- `positionService.ts` - Lógica de negocio para posiciones
- `candidateService.ts` - Método `updateCandidateStage` agregado

### **Capa de Dominio:**

- `Position.ts` - Método `getCandidatesWithDetails` agregado
- `Candidate.ts` - Método `updateApplicationStage` agregado

### **Capa de Presentación:**

- `positionController.ts` - Controlador para candidatos por posición
- `candidateController.ts` - Método `updateCandidateStageController` agregado

### **Capa de Rutas:**

- `positionRoutes.ts` - Nuevas rutas para posiciones
- `candidateRoutes.ts` - Ruta PUT agregada
- `index.ts` - Registro de rutas de posiciones

---

## 📊 Datos de Prueba Disponibles

Basado en el seed data existente, puedes probar con:

**Posiciones disponibles:**

- ID 1: "Software Engineer"
- ID 2: "Data Scientist"

**Candidatos con aplicaciones:**

- ID 1: John Doe (aplicaciones a posiciones 1 y 2)
- ID 2: Jane Smith (aplicación a posición 1)
- ID 3: Carlos García (aplicación a posición 1)

**Pasos de entrevista disponibles:**

- ID 1: "Initial Screening" (orderIndex: 1)
- ID 2: "Technical Interview" (orderIndex: 2)
- ID 3: "Manager Interview" (orderIndex: 3)

---

## ✅ Estado de la Implementación

**✅ Completamente implementado:**

- Ambos endpoints funcionando
- Validaciones completas
- Manejo de errores robusto
- Respuestas estructuradas
- Documentación API actualizada

**🚀 Listo para usar:**

- Interfaz kanban puede consumir estos endpoints
- Drag & drop para mover candidatos entre etapas
- Vista de candidatos por posición con puntuaciones

---

Los endpoints están completamente implementados y listos para ser utilizados en una interfaz kanban para gestión de candidatos. ¡Todo el código sigue las mejores prácticas y la arquitectura DDD establecida en el proyecto!
