IDE: Cursor
Agent: claude-4-sonnet

### prompt-1: Configuración Completa del Entorno LTI
**Role**: Eres un DevOps Senior con experiencia en Node.js, React, PostgreSQL y Docker. Tu objetivo es establecer un entorno de desarrollo robusto y verificado.

**Context & Situation**
Proyecto full-stack LTI (Learning Technology Interoperability) para gestión de candidatos usando:
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL containerizado con Docker
- **Testing**: Jest + Supertest

**Primary Task**
Configurar completamente el entorno de desarrollo con verificación paso a paso, implementando:

1. **Environment Setup** (Prerequisitos y validación)
2. **Database Infrastructure** (PostgreSQL + Docker)
3. **Backend Configuration** (Node.js + Prisma)
4. **Frontend Setup** (React + Vite)
5. **Integration Testing** (End-to-end verification)

**Critical Success Criteria**
- ✅ Backend operativo en http://localhost:3010
- ✅ Frontend operativo en http://localhost:3000  
- ✅ PostgreSQL conectado y esquema aplicado
- ✅ Endpoints API respondiendo correctamente
- ✅ Tests unitarios pasando
- ✅ Logging y debugging configurado

**Step-by-Step Execution Framework**

```bash
# PHASE 1: Prerequisites Validation
# Verificar herramientas requeridas antes de comenzar
node --version    # >= 18.0.0
npm --version     # >= 8.0.0
docker --version  # >= 20.0.0
git --version     # >= 2.0.0

# PHASE 2: Database Infrastructure
docker-compose up -d
docker ps | grep postgres  # Verificar container activo
docker-compose logs db     # Revisar logs por errores

# PHASE 3: Backend Setup with Validation
cd backend
npm install
npm run build
npx prisma generate
npx prisma db push         # Aplicar schema sin migraciones
npm test                   # Ejecutar tests como validación
npm start &                # Iniciar en background

# PHASE 4: Frontend Setup with Validation  
cd ../frontend
npm install
npm run build
npm run dev &              # Iniciar en background

# PHASE 5: Integration Verification
curl -X GET http://localhost:3010/ 
curl -X GET http://localhost:3010/candidates
```

**Database Connection Details**
```env
DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"
HOST=localhost
PORT=5432
DB_USER=LTIdbUser
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_NAME=LTIdb
```

**Troubleshooting Protocols**
- **Puerto ocupado**: `pkill -f "node.*3010"` antes de reiniciar
- **Container issues**: `docker-compose down -v && docker-compose up -d`
- **Prisma connection**: Verificar con `npx prisma db pull`
- **Dependency conflicts**: `rm -rf node_modules package-lock.json && npm install`

**Final Verification Checklist**
Ejecuta estos comandos para validar configuración completa:
```bash
# System Health Check
netstat -tulpn | grep -E "(3000|3010|5432)"
curl -s http://localhost:3010/health || echo "Backend health check failed"
curl -s http://localhost:3000 | grep -q "LTI" || echo "Frontend not responding"

# Database Connectivity
npx prisma db pull > /dev/null && echo "DB connected ✅" || echo "DB connection failed ❌"

# API Endpoints Test
curl -X POST http://localhost:3010/candidates \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}'
```

**Success Metrics**
- Tiempo de setup completo: < 15 minutos
- Todos los servicios respondiendo en < 2 segundos
- Zero errores en logs de inicio
- Tests unitarios: 100% passing rate

### prompt-2: Historia de Usuario GET /positions/:id/candidates - Análisis Técnico Avanzado

**Role**: Eres un Product Owner Senior con expertise en ATS (Applicant Tracking Systems) y arquitectura API REST. Tu especialidad es transformar requerimientos vagos en especificaciones técnicas precisas y accionables.

**Context & Business Domain**
Sistema LTI para gestión de candidatos con estos actores:
- **Reclutadores**: Necesitan ver progreso de candidatos por posición
- **Managers**: Requieren métricas de evaluación consolidadas  
- **Administradores**: Necesitan trazabilidad completa del proceso

**Current User Story (Incomplete)**
```
GET /positions/:id/candidates
Endpoint que recoge candidatos en proceso para una posición específica.
Incluye: nombre, etapa actual, puntuación promedio.
```

**Analysis Framework - Apply SMART Criteria**
Analiza el requerimiento usando este framework de pensamiento:

1. **Specific**: ¿Qué datos exactos necesita el usuario?
2. **Measurable**: ¿Cómo se mide el éxito de la funcionalidad?
3. **Achievable**: ¿Es técnicamente viable con la arquitectura actual?
4. **Relevant**: ¿Resuelve un problema real de negocio?
5. **Time-bound**: ¿Cuáles son las implicaciones de performance?

**Required Technical Specification Sections**

#### 📋 **Business Context & User Journey**
- Define el **contexto de uso** específico (¿cuándo y por qué se usa?)
- Describe el **user journey** completo desde login hasta acción
- Especifica **volume patterns** esperados (requests/day, concurrent users)

#### 📝 **Functional Specification**
- **Mermaid sequence diagram** con todos los actores y sistemas
- **Step-by-step flow** con validaciones y transformaciones
- **Business rules** específicas (ej: filtros, ordenamiento, permisos)
- **Edge cases** identificados (candidatos sin entrevistas, posiciones inactivas)

#### 🔧 **Technical API Contract**
- **Request specification** completa con ejemplos
- **Response schema** con tipos de datos exactos y validaciones
- **Error handling** exhaustivo con códigos HTTP específicos
- **Performance requirements** (response time, pagination limits)

#### 🏗️ **Implementation Blueprint**
- **Database query strategy** con performance considerations
- **Caching strategy** si aplica
- **File architecture** específica (rutas, controllers, services, tests)
- **Security considerations** (authorization, input validation)

#### ✅ **Acceptance Criteria Matrix**
Define criterios usando este formato:
```
GIVEN [contexto específico]
WHEN [acción del usuario]  
THEN [resultado esperado]
AND [validación adicional]
```

**Critical Design Decisions to Address**
- **averageScore calculation**: ¿null vs 0 vs "N/A" para candidatos sin entrevistas?
- **Data pagination**: ¿Incluir desde el inicio o implementar lazy loading?
- **Real-time vs cached data**: ¿Qué tan fresh deben ser los datos?
- **Sorting strategy**: ¿Por fecha de aplicación, score, o etapa?

**Performance & Scale Considerations**
- ¿Cuántos candidatos por posición esperamos (10, 100, 1000+)?
- ¿Necesitamos paginación desde la implementación inicial?
- ¿Qué indices de base de datos son críticos?
- ¿Cacheable por cuánto tiempo?

**Quality Gates**
La historia debe cumplir:
- ✅ **Implementable en < 4 horas** por developer senior
- ✅ **Testeable end-to-end** con datos sintéticos
- ✅ **Performance < 500ms** con 1000 candidatos
- ✅ **Zero ambiguities** en requerimientos
- ✅ **Backward compatible** con arquitectura existente

**Output Format Requirements**
Estructura la historia mejorada en **markdown** con:
- Headers numerados para fácil referencia
- Code blocks para ejemplos JSON
- Mermaid diagrams embebidos
- Checkboxes para acceptance criteria
- Tables para error codes y status

**Example Quality Benchmark**
Una historia bien definida permite que cualquier developer:
1. Estime tiempo de implementación con ±20% accuracy
2. Identifique todas las dependencias técnicas
3. Escriba tests antes de implementar
4. Implemente sin necesidad de clarificaciones adicionales

### prompt-3: Plan de Ejecución Backend - Metodología Técnica Avanzada

**Role**: Eres un Tech Lead Senior con 10+ años de experiencia en arquitectura Node.js y gestión de equipos de desarrollo. Tu especialidad es crear planes de implementación detallados que minimizan riesgos y maximizan la velocidad de entrega.

**Context & Constraint Analysis**
- **Codebase actual**: TypeScript + Express + Prisma + PostgreSQL
- **Team skill level**: Senior developers familiar con el stack
- **Quality requirements**: 95%+ test coverage, <500ms response time
- **Timeline expectations**: Entrega incremental con value delivery

**Planning Methodology - STAR Framework**
Aplica este enfoque estructurado:
- **S**ituation: Analiza el estado actual del codebase
- **T**ask: Descompón en micro-tareas específicas
- **A**ction: Define acciones concretas con criterios de completitud
- **R**esult: Especifica outcomes medibles para cada fase

**Phase Structure Requirements**

Para cada fase, DEBES incluir:

#### 🎯 **Phase Definition Template**
```
## Fase X: [Nombre Descriptivo]
**Duration**: [Tiempo estimado] 
**Dependencies**: [Qué debe estar completado antes]
**Risk Level**: [Alto/Medio/Bajo]
**Deliverables**: [Qué se entrega específicamente]

### Pre-requisites Checklist
- [ ] [Prerequisito 1]
- [ ] [Prerequisito 2]

### Micro-Tasks (15-30 min cada una)
1. **[Task Name]** 
   - Action: [Acción específica]
   - File: [Archivo exacto a modificar]
   - Validation: [Cómo verificar que está completo]
   - Tests: [Qué tests correr para validar]

### Definition of Done
- [ ] [Criterio 1]
- [ ] [Criterio 2]

### Rollback Strategy
- [Plan B si esta fase falla]
```

**Implementation Phases Framework**

#### Phase 1: **Foundation & Routing Infrastructure**
- Tiempo estimado: 15-20 min
- Risk: Bajo (setup básico)
- Foco: Estructura de archivos y routing básico

#### Phase 2: **Data Access Layer** 
- Tiempo estimado: 25-30 min
- Risk: Medio (queries complejas)
- Foco: Prisma queries eficientes, joins optimizados

#### Phase 3: **Business Logic & Calculations**
- Tiempo estimado: 20-25 min  
- Risk: Medio (lógica de averageScore)
- Foco: Cálculos, transformaciones, edge cases

#### Phase 4: **Error Handling & Resilience**
- Tiempo estimado: 15-20 min
- Risk: Bajo (patterns establecidos)
- Foco: Validaciones, error responses, logging

#### Phase 5: **Testing & Quality Assurance**
- Tiempo estimado: 30-35 min
- Risk: Bajo (testing patterns conocidos)
- Foco: Unit tests, integration tests, coverage

**Advanced Planning Considerations**

#### 🔍 **Performance Impact Analysis**
Para cada fase, analiza:
- Database query efficiency (N+1 problems)
- Memory usage implications  
- Response time budgets
- Caching opportunities

#### 🛡️ **Risk Mitigation Strategies**
- **Technical risks**: Dependency conflicts, performance bottlenecks
- **Business risks**: Data inconsistency, incorrect calculations
- **Quality risks**: Insufficient test coverage, edge cases missed

#### 📊 **Success Metrics Definition**
- **Code quality**: ESLint score, TypeScript strict mode compliance
- **Performance**: Response time <500ms, memory usage <100MB
- **Testing**: >95% coverage, all edge cases covered
- **Documentation**: API documentation complete, README updated

#### 🔄 **Continuous Integration Checkpoints**
Después de cada fase:
```bash
# Quality Gates Validation
npm run lint           # Code quality check
npm run type-check     # TypeScript validation  
npm test              # All tests pass
npm run build         # Compilation success
curl [endpoint-test]  # Functional verification
```

**Dependencies Mapping**
Crear un dependency graph que muestre:
- Cross-phase dependencies
- External system dependencies  
- Database schema dependencies
- Test data dependencies

**Team Coordination Protocol**
- **Kick-off**: Review plan, clarify assumptions
- **Phase reviews**: 5-min checkpoint after each phase
- **Blockers escalation**: >30min stuck = escalate immediately
- **Documentation**: Update plan with actual times vs estimates

**Output Requirements**
El plan debe ser **ejecutable**, meaning:
- Cualquier senior dev puede seguirlo independently
- Cada task tiene clear success criteria
- Rollback procedures están definidos
- Quality gates son automated donde sea posible
- Timeline es realistic basado en team velocity

**Plan Quality Checklist**
- [ ] Todas las fases tienen tiempo estimado
- [ ] Dependencies están claramente mapeadas  
- [ ] Criterios de completitud son específicos
- [ ] Risk mitigation está definido
- [ ] Success metrics son medibles
- [ ] Rollback strategy está documentado

### prompt-4: Implementación Fase 1 - Desarrollo con Calidad de Producción

**Role**: Eres un Backend Senior Developer con especialización en Node.js/TypeScript y arquitectura limpia. Tu reputación se basa en entregar código production-ready que es mantenible, testeable y performante.

**Development Philosophy**
- **TDD-First**: Tests antes que implementación
- **Clean Architecture**: Separación clara de responsabilidades
- **SOLID Principles**: Código extensible y mantenible
- **Zero-Bug Policy**: Cada línea debe funcionar correctamente

**Implementation Context**
- **Codebase**: LTI ATS system con TypeScript + Express + Prisma
- **Phase**: Estructura inicial (Foundation & Routing Infrastructure)
- **Quality Bar**: Production-ready code, not prototype
- **Timeline**: Implementación enfocada pero sin prisa

**Execution Protocol - Follow IODR Pattern**

#### 🎯 **I**ntention Declaration
Para cada archivo que vas a crear/modificar:
1. **Purpose**: ¿Por qué existe este archivo?
2. **Responsibility**: ¿Qué función específica cumple?
3. **Dependencies**: ¿De qué otros módulos depende?
4. **Interface**: ¿Qué API expone?

#### 🔧 **O**utput Generation
Para cada implementación:
- Escribe código **TypeScript strict mode compliant**
- Incluye **JSDoc comments** para funciones públicas
- Aplica **consistent naming conventions**
- Implementa **proper error handling**

#### 📋 **D**ocumentation & Explanation
Para cada cambio:
```markdown
## Archivo: [path/to/file.ts]
**Propósito**: [Una línea explicando por qué existe]
**Cambios clave**: 
- [Cambio 1 con justificación]
- [Cambio 2 con justificación]
**Arquitectura**: [Cómo se integra con el resto del sistema]
```

#### ✅ **R**eview & Validation
Para cada archivo implementado:
```bash
# Code Quality Validation
npx tsc --noEmit           # TypeScript compilation check
npm run lint              # ESLint validation
npm run format           # Prettier formatting

# Functional Validation  
npm run build            # Build success
npm start               # Server starts without errors
curl [test-endpoint]    # Basic connectivity test
```

**Implementation Standards**

#### 🎨 **Code Style Requirements**
- **Function length**: Max 25 lines per function
- **Complexity**: Max cyclomatic complexity of 5
- **Type safety**: No `any` types, full type annotations
- **Error handling**: Every external call wrapped in try-catch
- **Naming**: Descriptive names, no abbreviations

#### 🏗️ **Architecture Patterns**
- **Controllers**: Only HTTP concerns (request/response)
- **Services**: Business logic, no HTTP awareness
- **Models**: Type definitions, no business logic
- **Routes**: Route definitions, minimal logic

#### 🧪 **Testing Strategy**
Para esta fase, incluye:
- **Smoke tests**: Endpoints responden correctamente
- **Structure tests**: Archivos se importan sin errores
- **Type tests**: TypeScript compilation succeed

**Quality Gates - Must Pass Before Approval**

#### ✅ **Functional Requirements**
- [ ] Server inicia sin errores
- [ ] Rutas registradas correctamente
- [ ] TypeScript compilation exitosa
- [ ] No warnings en eslint
- [ ] Imports/exports funcionan correctamente

#### ✅ **Non-Functional Requirements**  
- [ ] Startup time < 3 segundos
- [ ] Memory usage < 50MB en idle
- [ ] No console.error en logs de inicio
- [ ] Código sigue convenciones del proyecto

#### ✅ **Code Quality Gates**
- [ ] Todas las funciones tienen tipos explícitos
- [ ] Error handling implementado
- [ ] No código duplicado
- [ ] Naming es consistent y descriptivo

**Implementation Verification Protocol**

Después de cada archivo implementado, ejecuta:
```bash
# Immediate Verification
npm run type-check        # TypeScript validation
npm run lint:fix         # Auto-fix linting issues  
npm run test:structure   # Test imports work

# Integration Verification  
npm run build           # Full compilation
npm start              # Server startup test
npm run test:smoke     # Basic functionality
```

**Error Prevention Checklist**

Antes de considerar la fase completa:
- [ ] **Path conflicts**: Nuevas rutas no conflictan con existentes
- [ ] **Import cycles**: No circular dependencies
- [ ] **Type exports**: Todas las interfaces necesarias están exportadas
- [ ] **Route registration**: Routes están registradas en app principal
- [ ] **Middleware order**: Middleware se aplica en orden correcto

**Progressive Implementation Strategy**

1. **Start minimal**: Implementa la versión más simple que funcione
2. **Verify incrementally**: Test después de cada archivo
3. **Refactor confidently**: Mejora step-by-step con tests
4. **Document decisions**: Explica trade-offs técnicos

**Communication Protocol**

Al finalizar la fase, proporciona:
- **Summary**: Qué se implementó y por qué
- **Next phase readiness**: Qué está listo para la siguiente fase
- **Technical debt**: Qué se puede mejorar posteriormente
- **Blockers identified**: Qué podría complicar fases siguientes

**Success Definition**
La Fase 1 está completa cuando:
- Un developer junior puede entender el código
- Las próximas fases tienen foundation sólida
- Zero technical debt introducido
- Production deployment es viable

### prompt-5: Historia de Usuario PUT /candidates/:id/stage - Análisis de Mutaciones de Estado

**Role**: Eres un Senior Product Analyst especializado en sistemas de workflows y state machines. Tu expertise está en diseñar operaciones de mutación de estado que son atómicas, consistentes, y auditables en sistemas ATS enterprise.

**Context & Business Criticality**
En sistemas ATS, las transiciones de etapa son **business-critical operations** porque:
- **Compliance**: Auditorías de EEOC requieren trazabilidad completa
- **Business continuity**: Errores pueden perder candidatos calificados
- **User experience**: Reclutadores necesitan operaciones confiables y rápidas
- **Data integrity**: Estado inconsistente genera reportes incorrectos

**Current User Story (Incomplete)**
```
PUT /candidates/:id/stage  
Endpoint para actualizar etapa de candidato en proceso de entrevista.
Modifica current_interview_step en tabla application.
```

**State Mutation Analysis Framework**

#### 🔄 **State Transition Rules**
Define estas reglas de negocio:
- **Valid transitions**: ¿Qué cambios de etapa son permitidos?
- **Bi-directional flow**: ¿Se puede regresar a etapas anteriores?
- **Skip validation**: ¿Se pueden saltar etapas intermedias?
- **Terminal states**: ¿Cuáles son las etapas finales?

#### 🔒 **Atomicity & Consistency Requirements**
- **Transactional boundaries**: ¿Qué se debe actualizar en la misma transacción?
- **Concurrency control**: ¿Cómo manejar updates simultáneos?
- **Rollback scenarios**: ¿Cuándo y cómo hacer rollback?
- **Audit trail**: ¿Qué cambios deben ser logged?

#### 🛡️ **Security & Authorization Matrix**
- **User permissions**: ¿Quién puede cambiar etapas?
- **Candidate consent**: ¿Se requiere notificación al candidato?
- **Manager approval**: ¿Alguna transición requiere aprobación?
- **Rate limiting**: ¿Límites en frecuencia de cambios?

**Advanced Specification Requirements**

#### 📋 **Business Context Deep-Dive**
- **User personas**: Reclutador, Manager, Admin - diferentes permisos
- **Business scenarios**: Promoción, rechazo, pausa, reactivación
- **Integration points**: Email notifications, calendar updates, reporting
- **Compliance requirements**: GDPR, EEOC, SOX logging

#### 📝 **Functional Specification - State Machine Approach**
Diseña como state machine con:
- **States**: Cada interview step como estado
- **Transitions**: Cambios válidos entre estados
- **Guards**: Condiciones que permiten/bloquean transiciones
- **Side effects**: Acciones que se ejecutan en cada transición

#### 🔧 **Technical API Contract - Production Grade**
```typescript
// Request Schema
interface StageUpdateRequest {
  newStage: string;
  notes?: string;
  reason?: 'promotion' | 'rejection' | 'manual_override';
  scheduledAt?: ISO8601String;  // Para cambios programados
}

// Response Schema  
interface StageUpdateResponse {
  candidateId: number;
  previousStage: StageInfo;
  currentStage: StageInfo;
  transitionMetadata: TransitionAudit;
  nextPossibleStages: StageInfo[];
}
```

#### 🏗️ **Data Consistency Strategy**
- **Optimistic locking**: Version fields para prevenir overwrites
- **Event sourcing**: Log de todos los cambios de estado
- **Eventual consistency**: Propagación a sistemas downstream
- **Backup strategies**: Point-in-time recovery de estados

**Critical Design Decisions - Impact Analysis**

#### ⚖️ **Response Design Decision**
- **Option A**: Return full candidate data (heavier, más info)
- **Option B**: Return transition summary (lighter, focused)
- **Option C**: Return async job ID (for heavy operations)
- **Recommendation**: [Require analysis and justification]

#### 🎯 **Error Handling Strategy**  
- **Validation errors**: Client can fix (400 series)
- **Business rule violations**: Need business context (422)
- **Concurrency conflicts**: Retry with latest data (409)
- **System failures**: Retry-safe operations (500 series)

#### 📊 **Performance Requirements**
- **Response time**: < 200ms para 95th percentile
- **Throughput**: 100 req/sec por recruiter activo
- **Batch operations**: Support para cambios masivos
- **Database load**: Minimize lock time en updates

**Quality Assurance Framework**

#### 🧪 **Testing Strategy - Comprehensive**
```gherkin
Feature: Candidate Stage Update
  
Scenario: Valid stage progression
  Given candidate is in "Phone Screen" 
  When I update to "Technical Interview"
  Then stage should change successfully
  And audit log should record transition
  And next stages should be available

Scenario: Invalid stage transition  
  Given candidate is in "Phone Screen"
  When I try to update to "Final Offer"
  Then request should fail with 422
  And current stage should remain unchanged
```

#### 🔍 **Edge Cases Matrix**
- **Concurrent updates**: Two recruiters change same candidate
- **Invalid stages**: Stage doesn't exist in interview flow
- **Orphaned applications**: Candidate without active application
- **System downtime**: Partial failures during update
- **Data corruption**: Invalid current_interview_step values

#### 📈 **Success Metrics Definition**
- **Functional success**: All valid transitions work correctly
- **Performance success**: <200ms response time, >99.9% uptime
- **Business success**: Zero data inconsistencies, full audit trail
- **User success**: Intuitive error messages, clear next actions

**Implementation Constraints & Considerations**

#### 🔧 **Database Schema Impact**
- Does `application.current_interview_step` need indexing?
- Should we add `updated_at` timestamp tracking?
- Do we need `previous_stage` field for quick rollback?
- How do we handle soft-deleted candidates?

#### 🌐 **API Design Patterns**
- **Idempotency**: Same request multiple times = same result
- **Versioning**: API version strategy for future changes
- **Rate limiting**: Prevent abuse and system overload
- **Caching**: Response caching strategy if applicable

**Documentation Standards - Enterprise Level**

#### 📚 **Specification Completeness Checklist**
- [ ] All business rules documented with examples
- [ ] Error scenarios with specific response codes
- [ ] Performance requirements with measurable criteria
- [ ] Security implications clearly stated
- [ ] Database migration requirements specified
- [ ] Monitoring and alerting requirements defined

**Output Quality Gates**
The enhanced user story must enable:
- **Zero-ambiguity implementation**: No developer questions needed
- **Complete test coverage**: All scenarios testable
- **Production readiness**: Security, performance, monitoring covered
- **Future extensibility**: Easy to add new stages/rules
- **Regulatory compliance**: Audit trail and data protection built-in

### prompt-6: Plan de Implementación PUT - Architecture for State Mutations

**Role**: Eres un Tech Lead especialista en state management systems y operaciones críticas de base de datos. Tu expertise está en diseñar implementaciones que garanticen atomicidad, consistencia y auditabilidad en operaciones de mutación de estado business-critical.

**Context & Technical Complexity**
Esta implementación es **higher-risk** que la anterior porque:
- **State mutations**: Cambios de estado son irreversibles y auditables
- **Concurrency**: Multiple users pueden modificar el mismo candidato
- **Data integrity**: Inconsistencias afectan business decisions críticos
- **Transactional complexity**: Updates deben ser atomic y rollback-safe

**Strategic Planning Framework - RACI + Risk Matrix**

#### 🎯 **Implementation Strategy**
- **Approach**: Transactional-first con rollback guarantees
- **Pattern**: Command pattern con event logging
- **Testing**: Test-driven development con integration coverage
- **Quality**: Zero-tolerance para data inconsistencies

#### 🔄 **State Machine Implementation Phases**

**Phase 1: Infrastructure & Type Safety** (15-20 min)
- **Risk Level**: Low - Foundation setup
- **Focus**: Routes, interfaces, strict typing
- **Validation Gate**: TypeScript compilation + route registration

**Phase 2: Transactional Update Logic** (25-35 min)  
- **Risk Level**: High - Core business logic
- **Focus**: Atomic updates, rollback strategies, optimistic locking
- **Validation Gate**: Database consistency tests + transaction rollback tests

**Phase 3: Business Rules & Validation** (20-30 min)
- **Risk Level**: Medium - Business logic complexity  
- **Focus**: Stage transition rules, candidate validation, error handling
- **Validation Gate**: Business rule tests + edge case coverage

**Phase 4: Comprehensive Testing** (35-45 min)
- **Risk Level**: Low - Quality assurance
- **Focus**: Unit tests, integration tests, concurrency tests
- **Validation Gate**: >95% coverage + performance benchmarks

**Advanced Planning Requirements**

#### 🏗️ **Architecture Decision Records (ADRs)**
Para cada fase, documenta:
```markdown
## ADR-XXX: [Decision Title]
**Status**: Proposed/Accepted/Superseded
**Context**: [Why this decision is needed]
**Decision**: [What we decided]
**Consequences**: [Trade-offs and implications]
**Alternatives**: [What other options were considered]
```

#### 🔒 **Transactional Safety Protocol**
```typescript
// Transaction Pattern to Follow
async function updateCandidateStage(id, data) {
  return await db.transaction(async (tx) => {
    // 1. Acquire optimistic lock
    // 2. Validate current state
    // 3. Apply business rules
    // 4. Update with audit logging
    // 5. Return consistent state
  });
}
```

#### 🧪 **Test-Driven Development Strategy**
Para cada fase:
1. **Red**: Write failing test for expected behavior
2. **Green**: Implement minimal code to pass test
3. **Refactor**: Improve code while keeping tests green
4. **Validate**: Ensure no regressions introduced

**Risk Mitigation & Contingency Planning**

#### ⚠️ **High-Risk Areas Identified**
- **Database deadlocks**: Multiple concurrent updates
- **Race conditions**: Optimistic locking failures
- **Partial failures**: Network/system interruptions during transactions
- **Data corruption**: Invalid state transitions persisted

#### 🛡️ **Mitigation Strategies**
- **Database locks**: Row-level locking with timeout
- **Idempotency**: Same request = same result
- **Circuit breakers**: Fail-fast for downstream issues
- **Monitoring**: Real-time alerts for anomalies

#### 📊 **Performance Benchmarks**
- **Response time**: <200ms for 95th percentile
- **Throughput**: Handle 50 concurrent updates/second
- **Database connection**: Pool utilization <80%
- **Memory usage**: No memory leaks during load

**Implementation Phases - Detailed Breakdown**

#### 🏗️ **Phase 1: Type-Safe Infrastructure**
```
Prerequisites:
- [ ] Understanding of existing candidate routes
- [ ] Database schema review completed
- [ ] Interface design approved

Micro-tasks (5-7 tasks, 2-3 min each):
1. Create/extend route definition
2. Define TypeScript interfaces
3. Add request/response type definitions
4. Implement basic controller skeleton
5. Register route in main application
6. Add basic error handling structure
7. Validate compilation and routing

Quality Gates:
- [ ] No TypeScript compilation errors
- [ ] Route accessible via HTTP
- [ ] Request/response types strictly defined
```

#### 🔄 **Phase 2: Atomic Transaction Logic**
```
Prerequisites:
- [ ] Phase 1 completely validated
- [ ] Database transaction patterns reviewed
- [ ] Optimistic locking strategy defined

Micro-tasks (8-10 tasks, 3-4 min each):
1. Implement candidate existence check
2. Add application lookup with locking
3. Validate stage transition rules
4. Implement atomic update logic
5. Add audit trail logging
6. Handle optimistic lock failures
7. Implement rollback scenarios
8. Add transaction timeout handling

Quality Gates:
- [ ] All database operations are transactional
- [ ] Optimistic locking prevents race conditions
- [ ] Rollback scenarios tested
- [ ] Audit trail captures all changes
```

#### ✅ **Phase 3: Business Rule Validation**
```
Prerequisites:
- [ ] Phase 2 transaction logic validated
- [ ] Business rules documented
- [ ] Error response format standardized

Micro-tasks (6-8 tasks, 2-4 min each):
1. Add input parameter validation
2. Implement stage transition validation
3. Add candidate status checks
4. Implement business rule engine
5. Add comprehensive error responses
6. Handle edge cases (orphaned records)
7. Add request sanitization

Quality Gates:
- [ ] All business rules enforced
- [ ] Input validation comprehensive
- [ ] Error messages user-friendly
- [ ] Edge cases handled gracefully
```

#### 🧪 **Phase 4: Production-Ready Testing**
```
Prerequisites:
- [ ] All previous phases validated
- [ ] Test data prepared
- [ ] Performance testing environment ready

Test Categories (12-15 tests, 2-3 min each):
1. Unit tests for each function
2. Integration tests for full flow
3. Concurrency tests for race conditions
4. Performance tests for response time
5. Error scenario tests
6. Edge case tests
7. Rollback scenario tests
8. Data consistency tests

Quality Gates:
- [ ] >95% code coverage achieved
- [ ] All concurrency scenarios tested
- [ ] Performance benchmarks met
- [ ] No data integrity issues found
```

**Continuous Quality Monitoring**

#### 📈 **Real-time Quality Metrics**
```bash
# After each micro-task
npm run test:unit         # Unit test coverage
npm run test:integration  # Integration test pass rate
npm run lint             # Code quality score
npm run type-check       # Type safety validation

# After each phase
npm run test:performance  # Response time validation
npm run test:concurrency  # Race condition testing
npm run test:stress      # System behavior under load
```

#### 🔍 **Quality Gates Dashboard**
```
Phase 1: Infrastructure ✅
├─ TypeScript compilation: PASS
├─ Route registration: PASS  
├─ Basic connectivity: PASS
└─ Code quality: PASS

Phase 2: Transaction Logic [IN PROGRESS]
├─ Atomic updates: PENDING
├─ Rollback scenarios: PENDING
├─ Optimistic locking: PENDING
└─ Audit logging: PENDING
```

**Delivery & Communication Protocol**

#### 📋 **Phase Completion Criteria**
Each phase is complete when:
- All micro-tasks validated individually
- Integration tests pass end-to-end
- Performance benchmarks met
- Code review completed
- Documentation updated

#### 🗣️ **Stakeholder Communication**
- **After each phase**: Progress update with quality metrics
- **Blockers identified**: Immediate escalation with proposed solutions
- **Timeline deviations**: Impact analysis and mitigation plans
- **Quality concerns**: Root cause analysis and prevention measures

**Success Definition**
Implementation is successful when:
- Zero data corruption or inconsistency issues
- Performance meets or exceeds requirements
- Full test coverage with realistic scenarios
- Production deployment ready without modifications
- Future maintenance developers can understand and extend

### prompt-7: Implementación PUT Fase 1 - Critical State Mutation Development

**Role**: Eres un Staff-level Backend Engineer especializado en sistemas transaccionales de alta disponibilidad. Tu experiencia incluye sistemas financieros, healthcare, y otros dominios donde data corruption tiene consecuencias serias. En este contexto, eres responsable de implementar operaciones de mutación de estado que deben ser 100% confiables.

**Mission-Critical Context**
Esta implementación maneja **candidate state transitions** que son:
- **Business-critical**: Errores afectan hiring decisions
- **Legally-sensitive**: Auditorías de compliance requieren trazabilidad
- **Performance-critical**: Reclutadores necesitan respuesta inmediata
- **Concurrency-sensitive**: Multiple users modifican mismo candidate

**Enterprise Development Standards**

#### 🎯 **SOLID + DDD Principles**
- **Single Responsibility**: Each function does one thing perfectly
- **Open/Closed**: Extensible for new stage types without modification
- **Liskov Substitution**: Interfaces are consistently implementable
- **Interface Segregation**: Focused interfaces, no god objects
- **Dependency Inversion**: Business logic doesn't depend on infrastructure

#### 🔒 **Security-First Development**
```typescript
// Security Checklist for Every Function
// ✅ Input validation (prevent injection)
// ✅ Output sanitization (prevent XSS)
// ✅ Authentication verification (verify user)
// ✅ Authorization checks (verify permissions)
// ✅ Audit logging (track all changes)
```

#### 📊 **Performance-First Development**
- **Response time budget**: <200ms end-to-end
- **Memory allocation**: Minimal object creation in hot path
- **Database queries**: Optimized with proper indexes
- **Connection pooling**: Efficient resource utilization

**Implementation Protocol - Zero-Defect Methodology**

#### 🔄 **Test-Driven Development (Mandatory)**
```typescript
// TDD Cycle for Every Function
describe('updateCandidateStage', () => {
  it('should update candidate stage successfully', async () => {
    // 1. ARRANGE: Setup test data
    // 2. ACT: Call function under test
    // 3. ASSERT: Verify expected behavior
    // 4. CLEANUP: Reset state
  });
});
```

#### 🏗️ **Architecture Patterns to Follow**

```typescript
// Controller Pattern (HTTP Layer)
export async function updateCandidateStage(req: Request, res: Response) {
  // ONLY: Parse request, validate input, call service, format response
  // NEVER: Business logic, database access, complex calculations
}

// Service Pattern (Business Layer)
export async function candidateStageService(id: number, data: StageUpdate) {
  // ONLY: Business logic, orchestration, transaction management
  // NEVER: HTTP concerns, direct database access
}

// Repository Pattern (Data Layer)
export async function updateCandidateStageRepo(tx: Transaction, id: number) {
  // ONLY: Database operations, data transformation
  // NEVER: Business logic, HTTP concerns
}
```

#### ✅ **Code Quality Standards (Non-Negotiable)**

```typescript
// Type Safety Requirements
interface StageUpdateRequest {
  newStage: string;           // Required: New stage name
  notes?: string;            // Optional: Additional notes
  reason?: TransitionReason; // Optional: Why the change
}

// Error Handling Requirements  
try {
  const result = await updateStage(id, data);
  return success(result);
} catch (error) {
  logger.error('Stage update failed', { candidateId: id, error });
  if (error instanceof ValidationError) return badRequest(error.message);
  if (error instanceof NotFoundError) return notFound(error.message);
  return internalServerError('Update failed');
}

// Performance Requirements
const startTime = performance.now();
const result = await operation();
const duration = performance.now() - startTime;
if (duration > 100) logger.warn('Slow operation detected', { duration });
```

**Implementation Verification Protocol**

#### 🧪 **Multi-Layer Testing Strategy**
```bash
# Unit Tests (Fast feedback loop)
npm run test:unit -- --watch
npm run test:coverage -- --threshold=95

# Integration Tests (Full flow)
npm run test:integration -- --verbose
npm run test:database -- --reset-db

# Contract Tests (API compliance)
npm run test:api -- --generate-docs
npm run test:schema -- --strict

# Performance Tests (Non-functional)
npm run test:load -- --concurrent=50
npm run test:memory -- --leak-detection
```

#### 🔍 **Code Review Checklist (Self-Review)**
```markdown
## Security Review
- [ ] All inputs validated against schema
- [ ] SQL injection prevention implemented
- [ ] Sensitive data not logged
- [ ] Error messages don't leak internal details

## Performance Review
- [ ] Database queries optimized (explain plan reviewed)
- [ ] No N+1 query problems
- [ ] Memory allocations minimized
- [ ] Connection pooling used correctly

## Reliability Review
- [ ] All error scenarios handled
- [ ] Transactions properly scoped
- [ ] Rollback scenarios tested
- [ ] Concurrency issues prevented

## Maintainability Review
- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] Function names describe behavior
- [ ] No magic numbers or strings
```

**Risk Mitigation & Failure Modes**

#### ⚠️ **Anticipated Failure Modes**
1. **Concurrency conflicts**: Two recruiters update same candidate
2. **Invalid stage transitions**: Business rule violations
3. **Database connection issues**: Network or DB failures
4. **Partial updates**: System crashes mid-transaction

#### 🛡️ **Prevention Strategies**
```typescript
// Optimistic Locking Pattern
const candidate = await findCandidateWithVersion(id);
await updateWithVersionCheck(id, data, candidate.version);

// Circuit Breaker Pattern  
const dbHealth = await circuitBreaker.exec(() => db.ping());
if (!dbHealth.isHealthy) throw new ServiceUnavailableError();

// Retry Pattern with Exponential Backoff
const result = await retry(
  () => updateCandidate(id, data),
  { attempts: 3, backoff: 'exponential' }
);
```

**Development Environment Setup**

#### 🔧 **Pre-Implementation Checklist**
```bash
# Environment Validation
npm run check:dependencies    # Verify all deps installed
npm run check:database       # DB connectivity test
npm run check:types         # TypeScript compilation
npm run check:linting       # Code quality baseline

# Development Tools Setup
npm run dev:watch           # Hot reload development
npm run test:watch         # Continuous testing
npm run lint:watch         # Real-time linting
npm run type:watch         # Type checking
```

#### 📊 **Real-time Quality Monitoring**
```bash
# Quality Dashboard (run in separate terminal)
npm run dashboard:quality   # Code coverage, performance, errors

# Development Metrics
- Build time: <10 seconds
- Test execution: <30 seconds  
- Hot reload: <2 seconds
- Type checking: <5 seconds
```

**Implementation Communication Protocol**

#### 📋 **Progress Reporting Template**
```markdown
## Fase 1 Progress Report

### ✅ Completed Tasks
- [Task name]: [Brief description of what was implemented]
- [Status]: PASS/FAIL + validation results

### 🔧 Technical Decisions Made
- [Decision]: [Rationale and trade-offs]
- [Pattern used]: [Why this pattern was chosen]

### 🚨 Issues & Blockers
- [Issue]: [Description + proposed solution]
- [Blocker]: [What's preventing progress]

### 📈 Quality Metrics
- Test coverage: X%
- Build success: PASS/FAIL
- Performance: <Xms response time
- Memory usage: <XMB

### 🔄 Next Phase Readiness
- [What's ready for next phase]
- [Dependencies that need completion]
- [Potential risks identified]
```

#### 🎯 **Success Criteria (Must All Pass)**
```bash
# Functional Validation
✅ Route responds correctly to valid requests
✅ Error handling works for all identified scenarios  
✅ TypeScript compilation succeeds without warnings
✅ All tests pass with >95% coverage

# Performance Validation  
✅ Response time <200ms for typical requests
✅ Memory usage stable during operation
✅ No memory leaks detected in extended testing
✅ Database queries optimized (explain plan reviewed)

# Security Validation
✅ Input validation prevents injection attacks
✅ Error responses don't leak sensitive information
✅ Audit logging captures all relevant events
✅ Authentication/authorization properly implemented

# Production Readiness
✅ Code follows established patterns and conventions
✅ Documentation updated for new functionality
✅ Monitoring/alerting configured for new endpoints
✅ Rollback procedure documented and tested
```

**Final Implementation Quality Gates**

The implementation is ready for next phase when:
- **Zero known bugs**: All tests pass, no TODO comments
- **Performance validated**: Meets or exceeds requirements
- **Security reviewed**: No identified vulnerabilities
- **Documentation complete**: Future developers can understand and extend
- **Monitoring ready**: Observability for production debugging

**Escalation Triggers**
Escalate immediately if:
- Implementation taking >150% of estimated time
- Fundamental architecture assumptions proven incorrect
- Security vulnerabilities discovered that can't be easily mitigated
- Performance requirements cannot be met with current approach

### prompt-8: Documentación de Arquitectura Empresarial - Sistema ATS de Clase Mundial

**Role**: Eres un Principal Solutions Architect con 15+ años diseñando sistemas ATS enterprise para Fortune 500. Tu especialidad es crear documentación técnica que sirve múltiples audiencias: C-level executives, engineering teams, DevOps, compliance, y nuevos desarrolladores. Tu documentación es el gold standard que otros arquitectos usan como referencia.

**Strategic Context & Stakeholder Analysis**

#### 🎯 **Multi-Audience Documentation Strategy**
Tu documentación debe servir a:
- **C-Level**: Business value, ROI, compliance, escalabilidad
- **Engineering Teams**: Arquitectura técnica, patterns, best practices
- **DevOps/SRE**: Deployment, monitoring, troubleshooting, disaster recovery
- **Product Teams**: Capabilities, limitations, integration points
- **Compliance/Legal**: Security, audit trails, data governance
- **New Developers**: Onboarding, development workflow, code standards

#### 🏢 **Enterprise ATS Domain Expertise**
Demuestra deep knowledge de:
- **Talent Acquisition Workflows**: Sourcing → Screening → Assessment → Offer → Onboarding
- **Compliance Requirements**: EEOC, GDPR, SOX, OFCCP regulations
- **Integration Ecosystem**: HRIS, Background Check, Video Interview, Assessment platforms
- **Scale Considerations**: 10K+ candidates/month, 100+ concurrent recruiters
- **Business Metrics**: Time-to-hire, Cost-per-hire, Quality-of-hire, Diversity metrics

**Documentation Architecture - Information Architecture Principles**

#### 📋 **Executive Summary Framework**
```markdown
## Executive Summary (C-Level Friendly)
- **Business Problem Solved**: [One sentence value proposition]
- **ROI Metrics**: [Quantifiable business impact]
- **Technical Investment**: [Infrastructure and development costs]
- **Risk Mitigation**: [Compliance, security, business continuity]
- **Competitive Advantage**: [Differentiation factors]
```

#### 🏗️ **Technical Architecture Deep-Dive**
```markdown
## System Architecture
### High-Level Overview
- [Mermaid diagram showing all system components]
- [Data flow diagrams for critical business processes]
- [Integration architecture with external systems]

### Scalability & Performance 
- [Current capacity and projected growth]
- [Performance benchmarks and SLAs]
- [Bottleneck identification and mitigation strategies]

### Security Architecture
- [Zero-trust security model implementation]
- [Data encryption at rest and in transit]
- [Access control and audit trail systems]
```

#### 🔧 **Operational Excellence Guide**
```markdown
## Production Operations
### Deployment Strategy
- [Blue-green deployment process]
- [Rollback procedures and disaster recovery]
- [Environment promotion pipeline]

### Monitoring & Observability
- [Key business and technical metrics]
- [Alerting thresholds and escalation procedures]
- [Log aggregation and analysis strategies]

### Troubleshooting Runbooks
- [Common issues and resolution procedures]
- [Performance tuning guidelines]
- [Database maintenance and optimization]
```

**Advanced Technical Specifications**

#### 🗂️ **Folder Structure - Domain-Driven Design**
Organize by business domain, not technical layer:
```
src/
├── 🏢 recruitment/          # Core business domain
│   ├── candidates/         # Candidate management
│   ├── positions/          # Job posting management  
│   ├── interviews/         # Interview scheduling/scoring
│   └── applications/       # Application lifecycle
├── 📊 analytics/           # Reporting and metrics
├── 🔐 security/           # Authentication/authorization
├── 🔗 integrations/       # External system connectors
└── 📱 shared/             # Common utilities and types
```

#### 🛠️ **Technology Stack - Strategic Justification**
Para each technology, include:
- **Business Justification**: Why this tech serves business needs
- **Alternative Evaluation**: What other options were considered
- **Risk Assessment**: Vendor lock-in, community support, skill availability
- **Future Roadmap**: Evolution and upgrade path

```markdown
### Backend Technology Selection

#### Node.js + TypeScript
**Business Justification**: 
- Unified language stack reduces hiring complexity
- Excellent ecosystem for API development
- Strong performance for I/O intensive ATS operations

**Alternatives Considered**: 
- Java Spring Boot (rejected: higher complexity, slower development)
- Python Django (rejected: performance limitations at scale)
- .NET Core (rejected: Windows hosting requirements)

**Risk Mitigation**:
- TypeScript ensures code quality and maintainability
- LTS version selection provides 3+ year stability
- Strong community and enterprise adoption
```

#### 🏗️ **Architecture Patterns - Enterprise Grade**

```typescript
// Hexagonal Architecture Implementation
interface CandidateRepository {
  findById(id: number): Promise<Candidate>;
  updateStage(id: number, stage: Stage): Promise<void>;
}

// Domain Event Pattern for Audit Trail
class CandidateStageChanged implements DomainEvent {
  constructor(
    public candidateId: number,
    public fromStage: Stage,
    public toStage: Stage,
    public timestamp: Date,
    public userId: number
  ) {}
}

// CQRS Pattern for Complex Queries
interface CandidateQueryService {
  getCandidatesByPosition(positionId: number): Promise<CandidateView[]>;
  getCandidatePipeline(filters: PipelineFilters): Promise<PipelineView>;
}
```

**Enterprise Integration & Compliance**

#### 🔗 **Integration Architecture**
```mermaid
graph TB
    ATS[LTI ATS Core] --> HRIS[Workday/BambooHR]
    ATS --> Background[Sterling/Checkr]
    ATS --> Assessment[Codility/HackerRank]
    ATS --> Video[Zoom/Teams Integration]
    ATS --> Email[SendGrid/AWS SES]
    ATS --> Analytics[Tableau/PowerBI]
    ATS --> Compliance[Audit Trail System]
```

#### 🛡️ **Compliance & Security Framework**
```markdown
### Regulatory Compliance
- **GDPR**: Right to be forgotten, data portability, consent management
- **EEOC**: EEO-1 reporting, adverse impact analysis, accommodation tracking
- **SOX**: Financial controls, audit trails, change management
- **CCPA**: California privacy rights, data disclosure, opt-out mechanisms

### Security Controls
- **Authentication**: Multi-factor authentication, SSO integration
- **Authorization**: Role-based access control, principle of least privilege
- **Data Protection**: AES-256 encryption, TLS 1.3, secure key management
- **Audit Logging**: Immutable audit trail, log integrity verification
```

**Operational Excellence & DevOps**

#### 🚀 **Environment Setup - Production-Ready**
```bash
# Production Environment Checklist
□ Database: PostgreSQL 15+ with read replicas
□ Caching: Redis cluster for session management
□ Load Balancer: AWS ALB with SSL termination
□ Container Platform: Kubernetes with auto-scaling
□ Monitoring: DataDog/New Relic APM integration
□ Backup: Automated daily backups with point-in-time recovery
□ Disaster Recovery: Multi-region deployment capability
□ Security: WAF, DDoS protection, vulnerability scanning
```

#### 📊 **Performance Benchmarks & SLAs**
```markdown
### Service Level Agreements
- **API Response Time**: 95th percentile < 500ms
- **System Availability**: 99.9% uptime (8.76 hours downtime/year)
- **Data Consistency**: Strong consistency for critical operations
- **Backup Recovery**: RTO < 4 hours, RPO < 1 hour

### Capacity Planning
- **Concurrent Users**: 500+ recruiters simultaneously
- **Data Volume**: 1M+ candidates, 10K+ positions
- **Transaction Volume**: 10K+ API calls/minute peak
- **Storage Growth**: 100GB/month data growth rate
```

#### 🔄 **CI/CD Pipeline - Enterprise Grade**
```yaml
# Production Deployment Pipeline
stages:
  - security_scan:     # OWASP ZAP, Snyk vulnerability scanning
  - quality_gates:     # 95%+ test coverage, 0 critical bugs
  - performance_test:  # Load testing with realistic data volumes
  - compliance_check:  # GDPR/EEOC compliance validation
  - canary_deploy:     # 1% traffic, monitor error rates
  - full_deployment:   # Complete rollout with automated rollback
```

**Documentation Quality Standards**

#### 📚 **Information Architecture Excellence**
- **Scannable**: Clear headings, bullet points, visual hierarchy
- **Actionable**: Specific commands, not vague instructions
- **Maintainable**: Version controlled, regular updates, ownership defined
- **Searchable**: Keywords, tags, cross-references for easy navigation
- **Visual**: Diagrams, flowcharts, screenshots where helpful

#### 🎯 **Success Metrics for Documentation**
- **Developer Onboarding**: New team member productive in <2 days
- **Incident Resolution**: 80% of issues resolved without escalation
- **Compliance Audits**: Zero documentation-related audit findings
- **Knowledge Transfer**: Zero single-points-of-failure for system knowledge

**Output Requirements - Enterprise Standards**

#### 📋 **Document Structure Mandate**
1. **Executive Summary** (C-level consumable)
2. **Business Context** (Product/Business stakeholders)
3. **Technical Architecture** (Engineering teams)
4. **Operational Procedures** (DevOps/SRE teams)
5. **Developer Guide** (Implementation teams)
6. **Compliance Documentation** (Legal/Audit teams)

#### 🔍 **Quality Assurance Checklist**
- [ ] All diagrams are current and accurate
- [ ] Commands have been tested on clean environment
- [ ] Business context explains "why" not just "what"
- [ ] Security considerations are comprehensively covered
- [ ] Disaster recovery procedures are documented
- [ ] Performance requirements are quantified
- [ ] Integration points are clearly defined
- [ ] Troubleshooting guides are actionable

**Enterprise Documentation Deliverable**
Create a `@documentation/structure.md` that serves as the **authoritative architectural reference** for the LTI ATS system. This document should be comprehensive enough that a Fortune 500 company could use it to evaluate, deploy, and maintain the system in their enterprise environment.