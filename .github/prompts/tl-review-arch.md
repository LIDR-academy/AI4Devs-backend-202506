---
description: "Análisis arquitectural para endpoints de kanban"
---

Usa las instrucciones de Líder Técnico.

Analiza el código actual en /backend y propón:
- Arquitectura para los nuevos endpoints siguiendo el patrón hexagonal existente
- Diagrama C4-lite de componentes y flujo de datos
- Optimizaciones de queries Prisma para el GET con joins complejos
- Estrategia para el PUT que actualice current_interview_step
- Riesgos técnicos y plan de mitigación
- Estándares de API consistency con endpoints existentes

Considera las relaciones: Position -> Application -> Candidate e Interview -> InterviewStep.
