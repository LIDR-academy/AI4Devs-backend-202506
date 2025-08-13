# Desarrollo de Endpoints para Sistema Kanban de Candidatos

## Resumen del Proyecto

Este documento contiene la secuencia de prompts y respuestas para la implementación de dos endpoints críticos en un sistema de seguimiento de candidatos con interfaz tipo kanban.

---

## PROMPT 1: Implementación del Primer Endpoint

### Objetivo
Actúa como un experto en desarrollo de software especializado en backend con +10 años de experiencia. Tu misión en este ejercicio es crear dos nuevos endpoints que nos permitirán manipular la lista de candidatos de una aplicación en una interfaz tipo kanban.

### Especificación del Primer Endpoint
**GET** `/positions/:id/candidates`

Este endpoint recogerá todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado `positionID`.

### Información Requerida
Debe proporcionar la siguiente información básica:
- **Nombre completo del candidato** (de la tabla `candidate`)
- **`current_interview_step`**: en qué fase del proceso está el candidato (de la tabla `application`)
- **La puntuación media del candidato**: recuerda que cada entrevista (`interview`) realizada por el candidato tiene un `score`

### Notas de Implementación
- Haremos este primero y luego me ayudarás con el segundo endpoint
- No olvides utilizar las mejores prácticas de desarrollo para APIs
- Tomar en cuenta temas de seguridad como OWASP

---

## PROMPT 2: Validación del Endpoint

### Situación
Antes de continuar, probé manualmente el endpoint y me devuelve el siguiente error en la consola del navegador. ¿Puedes validar si hay algún inconveniente?

---

## PROMPT 3: Diagnóstico del Problema

### Pregunta
¿Pudiste encontrar el problema?

---

## PROMPT 4: Implementación del Segundo Endpoint

### Objetivo
Listo, ya funciona. Ahora pasemos al endpoint número 2 que debe realizar lo siguiente:

**PUT** `/candidates/:id/stage`

### Funcionalidad
Este endpoint actualizará la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico.

---

## PROMPT 5: Pruebas del Endpoint

### Solicitud
Pruébalo por favor.

## PROMPT 6: Documentación

### Solicitud
antes de continuar con una nueva funcionalidad, por favor convierte mi archivo @prompts-JDP.md en formato markdown siguiendo las mejores practicas y estandares de este formato para entregar un trabajo profesional pero sin cambiar el contenido de mi archivo

---

## Notas de Desarrollo

### Estado del Proyecto
- ✅ Primer endpoint implementado y funcionando
- ✅ Segundo endpoint implementado y funcionando
- 🔄 Pendiente: nuevas funcionalidades

### Tecnologías Utilizadas
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Arquitectura**: Clean Architecture (Domain, Application, Presentation layers)
- **Seguridad**: Validaciones OWASP, manejo de errores, CORS configurado

### Estructura de Archivos Modificados
```
backend/
├── src/
│   ├── presentation/controllers/
│   │   ├── candidateController.ts
│   │   └── positionController.ts
│   ├── application/services/
│   │   └── candidateService.ts
│   └── routes/
│       ├── candidateRoutes.ts
│       └── positionRoutes.ts
├── api-spec.yaml
└── package.json
```

---

*Documento generado durante el desarrollo del sistema de seguimiento de candidatos LTI*