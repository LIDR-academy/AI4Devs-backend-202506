# 🎭 Guía de Roles con GitHub Copilot

## 📋 Resumen
Sistema de roles simulados en VS Code con GitHub Copilot para el proyecto AI4Devs-backend. Permite activar diferentes "voces" profesionales según la tarea que necesites realizar.

## 🚀 Configuración Inicial

### 1. Requisitos Previos
- ✅ VS Code con GitHub Copilot instalado
- ✅ GitHub Copilot Chat activo
- ✅ Workspace abierto en AI4Devs-backend-202506

### 2. Configuración Automática
El sistema se configura automáticamente al abrir el workspace. Los archivos ya están ubicados en:
```
.vscode/settings.json          # Configuración de VS Code
.github/copilot-instructions.md # Instrucciones globales
.github/instructions/          # Instrucciones por rol
.github/prompts/              # Plantillas de acción
```

## 👥 Roles Disponibles

### 🎯 Product Owner (po.instructions.md)
**Cuándo usar**: Definir requisitos, user stories, criterios de aceptación
**Especialidad**: Procesos de reclutamiento, kanban de candidatos, métricas de negocio

### 🏗️ Líder Técnico (techlead.instructions.md)
**Cuándo usar**: Decisiones de arquitectura, integración, estándares técnicos
**Especialidad**: Arquitectura hexagonal, APIs REST, optimización de queries

### 💻 Backend Senior (backend-sr.instructions.md)
**Cuándo usar**: Implementación de código, desarrollo de endpoints
**Especialidad**: Node.js, TypeScript, Prisma, Express.js

### 🧪 QA/Tester (qa.instructions.md)
**Cuándo usar**: Testing, validación, casos edge
**Especialidad**: Jest, testing de APIs, integridad de datos

## 🔧 Uso del Sistema

### Método 1: Activar Rol Manualmente
1. Abre Copilot Chat (`Ctrl+Shift+I`)
2. Click en **"Add context"** → **"Instructions"**
3. Selecciona el archivo del rol:
   - `po.instructions.md` → Product Owner
   - `techlead.instructions.md` → Líder Técnico  
   - `backend-sr.instructions.md` → Backend Senior
   - `qa.instructions.md` → QA/Tester
4. Haz tu pregunta con el contexto del rol activo

### Método 2: Usar Plantillas de Acción
1. En Copilot Chat, escribe `/run`
2. Selecciona una plantilla:
   - `po-create-epic.md` → Crear épica y user stories
   - `tl-review-arch.md` → Análisis arquitectural
   - `be-implement-endpoint.md` → Implementar endpoints
   - `qa-create-plan.md` → Plan de testing

### Método 3: Command Palette
1. `Ctrl+Shift+P` → busca **"Chat: Attach Instructions"**
2. Selecciona el rol deseado
3. `Ctrl+Shift+P` → busca **"Chat: Run Prompt"** para plantillas

## 📝 Ejemplos Prácticos

### Ejemplo 1: Como Product Owner
```
[Activar po.instructions.md]
"Necesito definir los requirements para un kanban de candidatos con estos endpoints:
GET /positions/:id/candidates y PUT /candidates/:id/stage"
```

### Ejemplo 2: Como Backend Senior
```
[Activar backend-sr.instructions.md]
"Implementa el endpoint GET /positions/:id/candidates que retorne:
nombre completo, stage actual y puntuación media"
```

### Ejemplo 3: Plantilla Rápida
```
[Usar plantilla be-implement-endpoint.md]
Variables automáticas: ruta="/positions/:id/candidates"
```

## 🎯 Flujo Recomendado para los Endpoints

### Fase 1: Análisis y Planificación
1. **Product Owner** → Definir user stories y criterios
2. **Líder Técnico** → Revisar arquitectura y decisiones técnicas

### Fase 2: Implementación
3. **Backend Senior** → Desarrollar endpoints con tests
4. **QA** → Plan de testing y validación

### Fase 3: Validación
5. **QA** → Ejecutar tests y verificar criterios
6. **Líder Técnico** → Review final y integración

## ⚡ Tips y Trucos

### Cambio Rápido de Rol
- Mantén varios chats abiertos, cada uno con un rol diferente
- Usa nombres descriptivos: "Chat PO", "Chat Backend", etc.

### Combinación de Roles
- Puedes adjuntar múltiples instruction files para perspectivas híbridas
- Ejemplo: PO + QA para criterios de aceptación + testing

### Contexto Persistente
- Las instrucciones globales en `copilot-instructions.md` se aplican siempre
- Cada rol hereda estas reglas base del proyecto

## 🔍 Troubleshooting

### No veo las opciones de Instructions
- Verifica que `"chat.promptFiles": true` esté en settings.json
- Reinicia VS Code tras cambios en configuración

### Los prompts no aparecen
- Confirma que `"chat.instructionsFilesLocations"` apunte a `.github/instructions`
- Verifica que los archivos .md existan en las rutas correctas

### Respuestas genéricas
- Asegúrate de tener el archivo de instructions adjunto
- Revisa que el rol esté claramente definido en tu pregunta

## 📚 Recursos Adicionales

- [Documentación oficial GitHub Copilot](https://docs.github.com/copilot)
- [VS Code Chat API](https://code.visualstudio.com/docs/copilot/copilot-chat)
- Esquema de base de datos: `backend/prisma/schema.prisma`
- Arquitectura actual: `backend/src/` (domain/application/infrastructure/presentation)

---
**Última actualización**: 15 de agosto de 2025
**Versión del sistema**: 1.0
**Proyecto**: AI4Devs-backend-202506
