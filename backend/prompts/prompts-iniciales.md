# Prompts Iniciales - Endpoints de Candidatos

## Prompt Principal

```
Crea dos endpoints para manipular la lista de candidatos de una aplicación tipo kanban en el backend. El objetivo es permitir obtener información consolidada de los candidatos para una posición concreta y actualizar su fase de entrevistas. Sigue la convención y estructura del repositorio.  

Tu tarea incluye:
- Implementar en la carpeta `/backend` los endpoints y su lógica:
  - `GET /positions/:id/candidates`: lista todos los candidatos en proceso para una posición, devolviendo por candidato:
    - nombre completo (de la tabla `candidate`)
    - current_interview_step (de la tabla `application`)
    - puntuación media (score promedio de todas sus entrevistas de la tabla `interview`)
  - `PUT /candidates/:id/stage`: actualiza la fase (etapa) actual del proceso de entrevista del candidato indicado.
- Añadir tus prompts iniciales en un fichero `prompts-iniciales.md` en la carpeta `prompts`.

Antes de comenzar cada endpoint, razona internamente los siguientes pasos:
- Qué datos necesitas leer y de qué tablas.
- Cómo vincular las entidades (por ejemplo, application, candidate, interview).
- Qué validaciones y comprobaciones son necesarias.
Solo tras planificar, genera la implementación solicitada.

Sigue estos pasos:
1. Completa la lógica en la carpeta `/backend` siguiendo la estructura del repositorio.
2. Añade un archivo `prompts-iniciales.md` en la carpeta `prompts` con los prompts usados.
3. Crea una nueva rama llamada `backend-ENO`.
4. Realiza commit de tus cambios.
5. Haz push de la rama.
6. Abre un pull request.
7. Si hay problemas técnicos con el PR, puedes mandar el proyecto comprimido por email a dago@lidr.es.

**Formato de entrega:**
- Código fuente con endpoints, controladores y rutas en `/backend`
- Fichero `prompts-iniciales.md` en `/prompts` con los prompts empleados

---

## Ejemplo de razonamiento y formato de salida esperado para cada endpoint:

### Ejemplo para GET /positions/:id/candidates

**Razonamiento (siempre antes del resultado):**
- Necesito recuperar todas las aplicaciones asociadas a la posición indicada (`positionID`).
- Por cada application, obtengo el `candidateID`.
- Busco el nombre completo del candidato (reuniendo nombre y apellidos de la tabla `candidate`).
- Para cada application, identifico el campo `current_interview_step`.
- Calculo la media de `score` de las entrevistas (`interview`) para ese application/candidate.
- Estructuro la respuesta con los tres datos requeridos por candidato.

**Respuesta esperada (tipo JSON):**
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
(En un caso real, la lista puede tener más elementos.)

---

### Ejemplo para PUT /candidates/:id/stage

**Razonamiento (siempre antes del resultado):**
- Localizo la application activa del candidate con el ID indicado.
- Verifico que el candidato existe y tiene una application en proceso.
- Actualizo el campo `current_interview_step` en esa application.
- Devuelvo confirmación de éxito (y/o la nueva etapa).

**Respuesta esperada (tipo JSON):**
{
  "candidate_id": 12,
  "updated_stage": "Onsite",
  "status": "success"
}

---

Incluye razonamiento siempre antes de mostrar los resultados. Mantén la respuesta en formato JSON, sin código embebido.

**IMPORTANTE:**
- Razonamiento previo SIEMPRE antes de resultados.
- Resultados SIEMPRE en formato JSON y al final.
- Usa los nombres de campos como indicados.
- Incluye ambos endpoints según se indica.
- Agrega los prompts iniciales empleados en prompts-iniciales.md.
- Si tienes dudas, consulta el grupo de whatsapp.

---

**Recordatorio importante:**
Para cada endpoint, presenta primero el razonamiento paso a paso antes de la respuesta. Todos los resultados deben ser entregados en formato JSON estructurado. Añade tus prompts iniciales en prompts-iniciales.md dentro de la carpeta prompts.
```

## Análisis de la Estructura del Proyecto

### Estructura de Carpetas Identificada:
- `/backend/src/routes/` - Definición de rutas
- `/backend/src/presentation/controllers/` - Controladores
- `/backend/src/application/services/` - Lógica de negocio
- `/backend/src/domain/models/` - Modelos de datos
- `/backend/prisma/` - Esquema de base de datos

### Tablas Relevantes Identificadas:
- `Candidate` - Información de candidatos (firstName, lastName)
- `Application` - Aplicaciones a posiciones (currentInterviewStep)
- `Interview` - Entrevistas con scores
- `Position` - Posiciones de trabajo
- `InterviewStep` - Pasos del proceso de entrevista

### Patrones de Implementación Identificados:
- Uso de Prisma Client para acceso a datos
- Separación de responsabilidades (routes → controllers → services → models)
- Manejo de errores con try-catch
- Validación de datos en services
- Respuestas JSON estructuradas
