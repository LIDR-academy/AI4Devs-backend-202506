### 1) Prompt
Como experto en desarrollador de software en backend, se requiere crear 2 endpoints.

Se debe crear dos nuevos endpoints que nos permitirán manipular la lista de candidatos de una aplicación en una interfaz tipo kanban.
Primero te entrego el primer endpoint, ya que termines este endpoint te entrego el segundo.
@backend/
Tienes alguna pregunta?

#### Respuesta
Buscaré cómo está estructurado el backend actual (modelos, servicios, controladores y rutas de candidatos) para asegurar que los nuevos endpoints se integren coherentemente. Luego te confirmo dudas puntuales del primer endpoint.

---

### 2) Prompt
no

#### Respuesta
Voy a revisar rápidamente `fileUploadService.ts` y algunos modelos claves (`InterviewStep.ts`, `Position.ts`) para asegurar el patrón de implementación y construir el endpoint 1 (listar tablero Kanban) con Prisma y Express, registrando nuevas rutas. Luego crearé los archivos necesarios y haré los edits.

---

### 3) Prompt
1. Endpoint:
GET /positions/:id/candidates
Este endpoint recogerá todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Debe proporcionar la siguiente información básica:

Nombre completo del candidato (de la tabla candidate).
current_interview_step: en qué fase del proceso está el candidato (de la tabla application).
La puntuación media del candidato. Recuerda que cada entrevist (interview) realizada por el candidato tiene un score

#### Respuesta
Tengo claro el requerimiento del Endpoint 1. Implementaré un GET que devuelva, para una `position`, la lista de candidatos en proceso con su nombre completo, el paso actual del proceso y el promedio de score de sus entrevistas en esa aplicación.

Edits propuestos (resumen):
- Nuevo servicio `backend/src/application/services/positionService.ts`
- Nuevo controlador `backend/src/presentation/controllers/positionController.ts`
- Nueva ruta `backend/src/routes/positionRoutes.ts`
- Registrar rutas en `backend/src/index.ts`

Prueba rápida:
- GET `http://localhost:3010/positions/1/candidates`
- Respuesta esperada:
```json
[
  {
    "full_name": "Jane Doe",
    "current_interview_step": 2,
    "average_score": 4.5
  }
]
```

¿Procedo a aplicar estos edits? Luego de confirmar, paso al Endpoint 2.

---

### 4) Prompt
implemente el primer endpoint en el backend

#### Respuesta
Voy a revisar los scripts disponibles y reabrir `backend/src/index.ts` para asegurar cómo registraré la nueva ruta antes de aplicar los cambios. Luego crearé los nuevos archivos de servicio, controlador y ruta y actualizaré `index.ts`.

Tras aplicar los cambios y validar lints:
- Endpoint implementado: GET `/positions/:id/candidates`
- Integra servicio, controlador y ruta; registrado en `backend/src/index.ts`.
- Cálculos: nombre completo, `current_interview_step`, promedio de `score` por aplicación.
- Sin errores de linter. Aún no ejecutado por falta de `npm` en la shell.

Cómo probar local:
- Entra a `backend`, instala dependencias y levanta:
  - `npm install`
  - `npm run dev`
- Prueba: `GET http://localhost:3010/positions/1/candidates`

---

### 5) Prompt
2. Endpoint:
PUT /candidates/:id/stage
Este endpoint actualizará la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico.

#### Respuesta
Crearé el servicio para actualizar la etapa, añadiré el controlador y registraré la ruta PUT en `candidateRoutes.ts`. Luego verificaré lints en los archivos tocados.

Resultado implementado:
- PUT `/candidates/:id/stage`
- Body requerido: `{ "positionId": number, "toStepId": number }`
- Valida que exista la `application` para el `candidateId` y `positionId`, y que `toStepId` pertenezca al `interviewFlow` de la `position`.
- Respuesta 200:
```json
{
  "applicationId": 123,
  "candidateId": 45,
  "positionId": 67,
  "currentInterviewStep": 3
}
```
- Errores: 400 (inputs inválidos o step ajeno al flow), 404 (application no encontrada).

Cómo probar:
- PUT `http://localhost:3010/candidates/5/stage`
- Body JSON:
```json
{ "positionId": 67, "toStepId": 3 }
```


