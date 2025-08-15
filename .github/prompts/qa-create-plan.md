---
description: "Plan completo de testing para kanban endpoints"
---

Usa instrucciones de QA.

Crea plan de pruebas para:
- GET /positions/:id/candidates  
- PUT /candidates/:id/stage

Incluye:
- Test cases por capa (unit/integration/e2e)
- Casos edge: posición sin candidatos, candidatos sin interviews, stages inválidos
- Tests de performance: tiempo de respuesta con 100+ candidatos
- Tests de concurrencia: múltiples updates simultáneos
- Datos de prueba específicos y fixtures
- Criterios de entrada/salida por test suite
- Matriz de cobertura de requerimientos

Asegura validación de integridad de datos y consistency en responses.
