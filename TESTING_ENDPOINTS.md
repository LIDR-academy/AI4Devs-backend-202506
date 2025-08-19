# 🧪 Pruebas de Endpoints Kanban

## 📋 Comandos de Prueba con curl

### **1. Verificar que el servidor está funcionando**

```bash
curl -X GET "http://localhost:3010/" \
  -H "Content-Type: application/json"
```

**Respuesta esperada:** `Hola LTI!`

---

### **2. Obtener candidatos de una posición (GET /positions/:id/candidates)**

#### Obtener candidatos de la posición 1:

```bash
curl -X GET "http://localhost:3010/positions/1/candidates" \
  -H "Content-Type: application/json"
```

#### Obtener candidatos de la posición 2:

```bash
curl -X GET "http://localhost:3010/positions/2/candidates" \
  -H "Content-Type: application/json"
```

**Respuesta esperada:**

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
    "averageScore": 5.0,
    "applicationDate": "2024-05-28T08:27:02.000Z"
  }
]
```

---

### **3. Actualizar etapa de candidato (PUT /candidates/:id/stage)**

#### Mover candidato 1 a etapa 3 (Manager Interview):

```bash
curl -X PUT "http://localhost:3010/candidates/1/stage" \
  -H "Content-Type: application/json" \
  -d '{
    "currentInterviewStep": 3
  }'
```

#### Mover candidato 2 a etapa 2 (Technical Interview):

```bash
curl -X PUT "http://localhost:3010/candidates/2/stage" \
  -H "Content-Type: application/json" \
  -d '{
    "currentInterviewStep": 2
  }'
```

**Respuesta esperada:**

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

---

### **4. Obtener información de un candidato específico**

```bash
curl -X GET "http://localhost:3010/candidates/1" \
  -H "Content-Type: application/json"
```

---

## 🚀 Pruebas con PowerShell (Windows)

### **Obtener candidatos de posición:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3010/positions/1/candidates" -Method GET -ContentType "application/json"
```

### **Actualizar etapa de candidato:**

```powershell
$body = @{
    currentInterviewStep = 3
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3010/candidates/1/stage" -Method PUT -Body $body -ContentType "application/json"
```

---

## 📊 Datos de Prueba Disponibles

### **Posiciones:**

- **ID 1:** Software Engineer
- **ID 2:** Data Scientist

### **Candidatos:**

- **ID 1:** John Doe (aplicó a posiciones 1 y 2)
- **ID 2:** Jane Smith (aplicó a posición 1)
- **ID 3:** Carlos García (aplicó a posición 1)

### **Pasos de Entrevista:**

- **ID 1:** Initial Screening (orderIndex: 1)
- **ID 2:** Technical Interview (orderIndex: 2)
- **ID 3:** Manager Interview (orderIndex: 3)

---

## ✅ Validaciones a Probar

### **Casos de éxito:**

1. ✅ Obtener candidatos de posición existente
2. ✅ Actualizar etapa de candidato existente
3. ✅ Candidatos con y sin puntuaciones

### **Casos de error:**

1. ❌ Posición inexistente (404)
2. ❌ Candidato inexistente (404)
3. ❌ Etapa de entrevista inexistente (400)
4. ❌ ID inválido (400)

### **Ejemplos de errores:**

#### Posición inexistente:

```bash
curl -X GET "http://localhost:3010/positions/999/candidates"
```

**Respuesta:** 404 - Position not found

#### Candidato inexistente:

```bash
curl -X PUT "http://localhost:3010/candidates/999/stage" \
  -H "Content-Type: application/json" \
  -d '{"currentInterviewStep": 2}'
```

**Respuesta:** 404 - Candidate not found

#### Etapa inexistente:

```bash
curl -X PUT "http://localhost:3010/candidates/1/stage" \
  -H "Content-Type: application/json" \
  -d '{"currentInterviewStep": 999}'
```

**Respuesta:** 400 - Interview step not found

---

## 🎯 Flujo de Prueba Completo

1. **Iniciar servidor:** `npm run dev`
2. **Verificar candidatos iniciales:** GET `/positions/1/candidates`
3. **Mover candidato a siguiente etapa:** PUT `/candidates/1/stage`
4. **Verificar cambio:** GET `/positions/1/candidates` (verificar nueva etapa)
5. **Probar casos de error:** IDs inexistentes

---

¡Los endpoints están listos y funcionando! 🚀
