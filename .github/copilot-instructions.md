# AI4Devs Backend - Copilot Instructions

## Stack Tecnológico
- Backend: Node.js + Express.js + TypeScript
- ORM: Prisma con PostgreSQL
- Testing: Jest + Supertest
- Arquitectura: Hexagonal (Domain, Application, Infrastructure, Presentation)

## Estándares de Código
- TypeScript estricto con tipos explícitos
- Estructura de carpetas: domain/models, application/services, infrastructure/database, presentation/controllers
- Controladores en presentation/controllers siguiendo patrón existente
- Servicios en application/services
- Repositorios en infrastructure/database

## Testing
- Cobertura >80% en lógica de negocio
- Tests unitarios para services y use cases
- Tests de integración para controllers
- Mocks para dependencias externas

## Base de Datos
- Relaciones: Candidate -> Application -> Interview -> InterviewStep
- Usar Prisma para queries complejas
- Optimizar queries con includes/selects apropiados

## Seguridad
- Validar inputs con middlewares
- Manejo de errores consistente
- No exponer información sensible en responses

## Commits
- Conventional Commits: feat/fix/docs/test/refactor
