---
description: "Implementar endpoints completos de kanban"
---

Usa instrucciones de Backend Senior.

Implementa completamente:

**GET /positions/:id/candidates**: 
- Controller, service, queries Prisma
- Response con: fullName, current_interview_step, averageScore
- Query optimizada con includes
- Manejo de posición inexistente

**PUT /candidates/:id/stage**:
- Validación de candidateId y nuevo stage
- Update de current_interview_step en tabla application
- Response apropiado

Incluye:
- Tests Jest unitarios e integración
- Tipado TypeScript completo
- Error handling robusto
- Logs informativos
