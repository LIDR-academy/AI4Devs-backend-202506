# Plan de Ejecución - Historias de Usuario LTI

## 📋 **Resumen del Proyecto**

Este documento describe el plan de implementación para dos historias de usuario del sistema LTI:
1. **Historia #1**: `GET /positions/:id/candidates` - Obtener candidatos por posición
2. **Historia #2**: `PUT /candidates/:id/stage` - Actualizar etapa del candidato

---

# 🎯 **HISTORIA DE USUARIO #1: GET /positions/:id/candidates**

## **Fase 1: Estructura Inicial** ⏱️ 15 minutos

### **Subtareas Técnicas:**
1. **Crear archivo de rutas**
   - Crear `src/routes/positionRoutes.ts`
   - Definir la estructura básica del router
   - Agregar ruta GET `/:id/candidates`
   - Exportar el router

2. **Crear controlador**
   - Crear `src/presentation/controllers/positionController.ts`
   - Definir función `getCandidatesByPosition`
   - Implementar estructura básica de request/response
   - Agregar validación básica del parámetro ID

3. **Crear servicio**
   - Crear `src/application/services/positionService.ts`
   - Definir función `getCandidatesByPositionId`
   - Implementar estructura básica de la lógica de negocio

4. **Integrar en aplicación principal**
   - Modificar `src/index.ts`
   - Importar y registrar `positionRoutes`
   - Verificar que las rutas se registren correctamente

## **Fase 2: Lógica de Negocio** ⏱️ 20 minutos

### **Subtareas Técnicas:**
1. **Implementar consulta de posición**
   - Agregar verificación de existencia de la posición
   - Implementar consulta con Prisma para obtener posición por ID
   - Manejar caso cuando la posición no existe

2. **Implementar consulta de candidatos**
   - Diseñar consulta para obtener aplicaciones por posición
   - Incluir datos del candidato (nombre, email)
   - Incluir información de la etapa actual (InterviewStep)
   - Obtener fecha de aplicación

3. **Implementar consulta de entrevistas**
   - Agregar consulta para obtener entrevistas por candidato
   - Incluir scores de cada entrevista
   - Relacionar con las aplicaciones obtenidas

## **Fase 3: Cálculos y Transformación de Datos** ⏱️ 15 minutos

### **Subtareas Técnicas:**
1. **Implementar cálculo de averageScore**
   - Calcular promedio de scores para cada candidato
   - Manejar caso de candidatos sin entrevistas (retornar `null`)
   - Implementar lógica de agregación eficiente

2. **Estructurar respuesta**
   - Formatear datos según especificación de la API
   - Concatenar firstName y lastName para fullName
   - Formatear fechas en formato ISO
   - Organizar estructura jerárquica de la respuesta

3. **Optimizar consultas**
   - Revisar uso de `include` para reducir consultas
   - Implementar consultas eficientes con Prisma
   - Evitar consultas N+1

## **Fase 4: Manejo de Errores y Validaciones** ⏱️ 10 minutos

### **Subtareas Técnicas:**
1. **Implementar validaciones de entrada**
   - Validar que el ID sea numérico
   - Validar que el ID sea positivo
   - Retornar error 400 para IDs inválidos

2. **Implementar manejo de errores de negocio**
   - Retornar 404 cuando la posición no existe
   - Manejar errores de base de datos
   - Implementar logging de errores

3. **Estandarizar respuestas de error**
   - Definir estructura consistente de errores
   - Incluir códigos de error específicos
   - Agregar mensajes descriptivos

## **Fase 5: Pruebas Unitarias** ⏱️ 20 minutos

### **Subtareas Técnicas:**
1. **Tests del controlador**
   - Test para validación de parámetros
   - Test para casos exitosos
   - Test para manejo de errores
   - Mock del servicio

2. **Tests del servicio**
   - Test para consultas de base de datos
   - Test para cálculo de averageScore
   - Test para casos edge (sin candidatos, sin entrevistas)
   - Mock de Prisma

3. **Tests de integración**
   - Test end-to-end del endpoint
   - Test con datos reales de base de datos
   - Test de performance básico

---

# 🎯 **HISTORIA DE USUARIO #2: PUT /candidates/:id/stage**

## **Fase 1: Estructura** ⏱️ 10 minutos

### **Subtareas Técnicas:**
1. **Extender rutas existentes**
   - Modificar `src/routes/candidateRoutes.ts`
   - Agregar ruta PUT `/:id/stage`
   - Importar función del controlador

2. **Extender controlador**
   - Modificar `src/presentation/controllers/candidateController.ts`
   - Crear función `updateCandidateStage`
   - Definir estructura de request/response

3. **Extender servicio**
   - Modificar `src/application/services/candidateService.ts`
   - Crear función `updateCandidateStage`
   - Definir lógica básica de actualización

4. **Crear interfaces TypeScript**
   - Crear `src/domain/models/ApplicationStage.ts`
   - Definir `StageUpdateRequest` interface
   - Definir `StageUpdateResponse` interface
   - Definir `InterviewStepInfo` interface

## **Fase 2: Lógica de Actualización** ⏱️ 20 minutos

### **Subtareas Técnicas:**
1. **Implementar verificación de candidato**
   - Consultar candidato por ID
   - Verificar existencia en base de datos
   - Obtener datos básicos (nombre, ID)

2. **Implementar búsqueda de aplicación activa**
   - Consultar aplicación más reciente del candidato
   - Incluir información de posición y etapa actual
   - Manejar caso sin aplicaciones activas

3. **Implementar actualización atómica**
   - Actualizar `current_interview_step` en la aplicación
   - Actualizar campo `notes` si se proporciona
   - Usar transacción para atomicidad

4. **Estructurar respuesta completa**
   - Incluir información del candidato
   - Incluir etapa anterior y nueva
   - Incluir timestamp de actualización
   - Formatear según especificación

## **Fase 3: Validaciones** ⏱️ 15 minutos

### **Subtareas Técnicas:**
1. **Validaciones de entrada en controlador**
   - Validar ID del candidato (numérico, positivo)
   - Validar presencia de `newStage` en el body
   - Validar longitud máxima de `notes` (500 chars)
   - Retornar errores 400 apropiados

2. **Validaciones de negocio en servicio**
   - Verificar que la nueva etapa existe en el flujo
   - Consultar InterviewStep por nombre y flujo
   - Validar que corresponde a la posición aplicada
   - Lanzar errores específicos de negocio

3. **Manejo de casos edge**
   - Candidatos con múltiples aplicaciones
   - Preservar notas anteriores si no se proporcionan nuevas
   - Manejar etapas con caracteres especiales

## **Fase 4: Pruebas Unitarias** ⏱️ 25 minutos

### **Subtareas Técnicas:**
1. **Tests del controlador**
   - Test validación de parámetros (14 casos)
   - Test casos exitosos (con y sin notas)
   - Test manejo de errores de negocio
   - Test casos edge (notas de 500 chars exactos)

2. **Tests del servicio**
   - Test verificación de candidato
   - Test validaciones de negocio
   - Test actualización atómica
   - Test casos edge y límites

3. **Tests de integración**
   - Test end-to-end exitosos (18 casos)
   - Test validaciones de entrada
   - Test casos de error
   - Test consistencia de datos
   - Test performance y escalabilidad

---

# 📊 **Resumen de Tiempos Estimados**

## **Historia #1 - GET /positions/:id/candidates**
| Fase | Tiempo | Descripción |
|------|--------|-------------|
| Fase 1 | 15 min | Estructura Inicial |
| Fase 2 | 20 min | Lógica de Negocio |
| Fase 3 | 15 min | Cálculos y Transformación |
| Fase 4 | 10 min | Manejo de Errores |
| Fase 5 | 20 min | Pruebas Unitarias |
| **Total** | **80 min** | **1h 20m** |

## **Historia #2 - PUT /candidates/:id/stage**
| Fase | Tiempo | Descripción |
|------|--------|-------------|
| Fase 1 | 10 min | Estructura |
| Fase 2 | 20 min | Lógica de Actualización |
| Fase 3 | 15 min | Validaciones |
| Fase 4 | 25 min | Pruebas Unitarias |
| **Total** | **70 min** | **1h 10m** |

## **Tiempo Total del Proyecto: 2h 30m**

---

# 🏗️ **Arquitectura y Patrones**

## **Patrón de Capas Implementado**
```
📁 src/
├── 🌐 presentation/controllers/     # Capa de Presentación
├── 🏢 application/services/         # Capa de Aplicación  
├── 🏛️ domain/models/               # Capa de Dominio
└── 📊 infrastructure/              # Capa de Infraestructura (Prisma)
```

## **Principios Aplicados**
- **Separación de Responsabilidades**: Cada capa tiene una responsabilidad específica
- **Inversión de Dependencias**: Las capas superiores no dependen de implementaciones
- **Single Responsibility**: Cada función tiene una única responsabilidad
- **Error Handling Consistente**: Manejo uniforme de errores en toda la aplicación

## **Tecnologías Utilizadas**
- **Backend**: Node.js + Express + TypeScript
- **ORM**: Prisma Client
- **Base de Datos**: PostgreSQL
- **Testing**: Jest + Supertest
- **Validación**: Validaciones custom en controladores

---

# ✅ **Estado de Implementación**

## **Historia #1: GET /positions/:id/candidates**
- ✅ **Completada al 100%**
- ✅ Todas las fases implementadas
- ✅ Tests pasando (7/7 controlador, 3/3 integración)
- ✅ Funcionalidad verificada en producción

## **Historia #2: PUT /candidates/:id/stage**
- ✅ **Completada al 100%**
- ✅ Todas las fases implementadas
- ✅ Tests pasando (14/14 controlador, 18/18 integración)
- ✅ Funcionalidad verificada en producción

---

# 🚀 **Próximos Pasos Recomendados**

1. **Documentación API**: Generar documentación Swagger/OpenAPI
2. **Monitoreo**: Implementar métricas y logging avanzado
3. **Seguridad**: Agregar autenticación y autorización
4. **Performance**: Implementar cachéado y optimizaciones
5. **Escalabilidad**: Considerar paginación para endpoints con muchos resultados

---

*Documento generado automáticamente - Plan de Ejecución LTI v1.0*
