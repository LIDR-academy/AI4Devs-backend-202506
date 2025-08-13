# 🛠️ Herramientas Utilizadas

* IDE: CursorAI
* Modelo: Claude Sonnet 4

# 🚀 Desarrollo del Ejercicio

## 1. Configuración de entorno local de desarrollo

1. Levanté backend
2. Ejecuté migraciones de base de datos 
3. Cree carpeta [documentation](../documentation)
4. Cree carpeta y archivo [prompts](prompts-jpm.md)

## Prompts

### Prompt #1: Mejora de Historia de Usuario #1: Obtener todos los candidatos en curso de una posición 

```markdown
#### Variables
- `{HISTORIA_ORIGINAL}`: GET /positions/:id/candidates
Este endpoint recogerá todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Debe proporcionar la siguiente información básica:

Nombre completo del candidato (de la tabla candidate).
current_interview_step: en qué fase del proceso está el candidato (de la tabla application).
La puntuación media del candidato. Recuerda que cada entrevist (interview) realizada por el candidato tiene un score

- `{STACK_TECNOLOGICO}`: Utiliza el contexto que ta tienes en @README.md y @CLAUDE.md 

Eres un experto en producto y análisis técnico. A esta historia de usuario le falta detalle técnico y específico para permitir al desarrollador ser totalmente autónomo a la hora de completarla.

### Historia de Usuario Original:
{HISTORIA_ORIGINAL}

### Contexto Técnico:
- **Stack tecnológico**: {STACK_TECNOLOGICO}

### Análisis y Mejora Requerida:

Por favor entiende la necesidad y proporciona una **historia mejorada** que sea más clara, específica y concisa acorde a las mejores prácticas de producto, incluyendo:

#### 📝 **Descripción Funcional Completa**
- Diagrama de secuencia del requerimiento funcional en formato mermaid
- Funcionalidad detallada paso a paso
- Flujo de usuario específico
- Criterios de aceptación claros y medibles

#### 🔧 **Especificaciones Técnicas**
- Lista exhaustiva de campos a tocar
- Estructura y URL de los endpoints necesarios
- Ficheros específicos a modificar acorde a la arquitectura
- Modelos de datos afectados

#### ✅ **Criterios de Aceptación**
- Pasos específicos para considerar la tarea completada
- Casos de prueba básicos a verificar
- Validaciones funcionales requeridas

#### 📚 **Impacto en Documentación y Testing**
- Documentación técnica a actualizar
- Tests unitarios necesarios
- Tests de integración recomendados (solo si ya el proyecto cuenta con test de integración)

### Formato de Respuesta:
1. Devuelve la historia mejorada en **formato markdown** con estructura clara y secciones bien definidas.
2. Si el usuario está de acuerdo con tu plan, debes agregarlo en @documentation/user-stories.md 
```

### Prompt #2: Agregar historia de usuario #1 a user-stories.md

```markdown
Perfecto, agrega entonces esta historia de usuario en @documentation/user-stories.md
```

### Prompt #3: Mejora de Historia de Usuario #2: Actualizar la etapa del candidato

```markdown
#### Variables
- `{HISTORIA_ORIGINAL}`: PUT /candidates/:id/stage
Este endpoint actualizará la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico.

- `{STACK_TECNOLOGICO}`: Utiliza el contexto que ta tienes en @README.md y @CLAUDE.md 

Eres un experto en producto y análisis técnico. A esta historia de usuario le falta detalle técnico y específico para permitir al desarrollador ser totalmente autónomo a la hora de completarla.

### Historia de Usuario Original:
{HISTORIA_ORIGINAL}

### Contexto Técnico:
- **Stack tecnológico**: {STACK_TECNOLOGICO}

### Análisis y Mejora Requerida:

Por favor entiende la necesidad y proporciona una **historia mejorada** que sea más clara, específica y concisa acorde a las mejores prácticas de producto, incluyendo:

#### 📝 **Descripción Funcional Completa**
- Diagrama de secuencia del requerimiento funcional en formato mermaid
- Funcionalidad detallada paso a paso
- Flujo de usuario específico
- Criterios de aceptación claros y medibles

#### 🔧 **Especificaciones Técnicas**
- Lista exhaustiva de campos a tocar
- Estructura y URL de los endpoints necesarios
- Ficheros específicos a modificar acorde a la arquitectura
- Modelos de datos afectados

#### ✅ **Criterios de Aceptación**
- Pasos específicos para considerar la tarea completada
- Casos de prueba básicos a verificar
- Validaciones funcionales requeridas

#### 📚 **Impacto en Documentación y Testing**
- Documentación técnica a actualizar
- Tests unitarios necesarios
- Tests de integración recomendados (solo si ya el proyecto cuenta con test de integración)

### Formato de Respuesta:
1. Devuelve la historia mejorada en **formato markdown** con estructura clara y secciones bien definidas.
2. Si el usuario está de acuerdo con tu plan, debes agregarlo en @documentation/user-stories.md 
```

### Prompt #4: Agregar historia de usuario #2 a user-stories.md

```markdown
Está perfecto, por favor anexa esta segunda historia de usuario a @documentation/user-stories.md
```

### Prompt #5: Definición de plan de trabajo de la historia de usuario #1

```markdown
Crea un plan de trabajo detallado para la ejecución de la primera historia de usuario definida dentro de @documentation/user-stories.md. No ejecutes nada, ni escribas código. Si estoy conforme con el resultado, documentaremos el plan de trabajo definido con etapas y subtareas dentro de @documentation/execution-plan.md
```

### Prompt #6: Corrección, plan de trabajo de historia de usuario #1

```markdown
No quiero implementar cambios de frontend, solo backend  
```

### Prompt #7: Guardar plan de tranajo de historia de usuario #1

```markdown
Así está mejor. Listo, por favor agrega el plan te trabajo de la primera historia de usuario en @documentation/execution-plan.md
```

### Prompt #8: Ejecutar plan de trabajo de historia de usuario #1

```markdown
Toma el plan de trabajo de la historia de usuario #1 en @documentation/execution-plan.md e inicia con la ejecución de la Fase 1. No pases a la siguiente fase, hasta que yo apruebe paso a paso, la ejecución de actividades de desarrollo. 
```

### Prompt #9: Iteraciones para ejecución de las fases del plan de trabajo de la historia de usuario #1

```markdown
Conjunto de iteraciones para ejecución de todas las fases. Ejemplo: 

- Ejecuta la fase #1
- Ejecuta la fase #2
- Corrección y feedback...
- Ejecuta la fase #3
```

### Prompt #9: Consignar resultado de revisión de criterios de aceptación del plan de trabajo de la historia de usuario #1

```markdown
Puedes agregar los resultados de la fase 5 con las tablas de los casos de pruebas y rendimiento en el archivo de ejecución de plan de trabajo? @documentation/execution-plan.md
```

### Prompt #10: Documentación de la base de datos

```markdown
Actúa como un documentador técnico experto en bases de datos.

Añade la información recolectada hasta el momento en @README.md y @CLAUDE.md. Crea documentación completa de la base de datos de este proyecto y guárdala en el archivo: @documentation/database.md

La documentación debe incluir:

## Estructura del documento:
1. **Información General**
   - Tipo de base de datos y versión
   - ORM utilizado
   - Dependencias relacionadas

2. **Configuración por Entornos**
   - Development
   - Test  
   - Production
   - Variables de entorno necesarias

3. **Esquema General**
   - Número total de tablas
   - Tabla de entidades de negocio con columnas: Nombre - Descripción - Categoría. Ejemplo:

      | Nombre              | Descripción                          | Categoría                        |
      |---------------------|--------------------------------------|----------------------------------|
      | `orders`            | Información principal de las órdenes | Entidades de Orden Principal     |
      | `orderfinalproducts`| Productos finales de la orden        | Gestión de Productos y Precios   |
      | `payment`           | Información de pagos                 | Sistema de Pagos y Transacciones |

4. **Vista**
   - Vista en formato mermaid del modelo de datos 

Crea el archivo con esta información de forma clara y organizada, usando formato Markdown apropiado.
```

### Prompt #11: Definición de plan de trabajo de la historia de usuario #2

```markdown
Crea un plan de trabajo detallado para la ejecución de la segunda historia de usuario definida dentro de @documentation/user-stories.md. No ejecutes nada, ni escribas código. Si estoy conforme con el resultado, documentaremos el plan de trabajo definido con etapas y subtareas dentro de @documentation/execution-plan.md
```

### Prompt #12: Corrección del plan de trabajo propuesto para la historia de usuario #2

```markdown
a la Fase 6: Documentación y Finalización  agrégale una subtarea para actualizar, al finalizar todas las implementaciones de la segunda historia de usuario. El resultado de la ejecución de pruebas tal como está en la sección: ## 📋 RESULTADOS DE EJECUCIÓN DE PRUEBAS - Historia de Usuario #001: GET /positions/:id/candidates de @documentation/execution-plan.md
```

### Prompt #13: Guardar plan de tranajo de historia de usuario #2

```markdown
Por favor agrega el plan te trabajo de la segunda historia de usuario en @documentation/execution-plan.md
```

### Prompt #14: Ejecutar plan de trabajo de historia de usuario #2

```markdown
Toma el plan de trabajo de la historia de usuario #2 en @documentation/execution-plan.md e inicia con la ejecución de la Fase 1. No pases a la siguiente fase, hasta que yo apruebe paso a paso, la ejecución de actividades de desarrollo. 
```

### Prompt #15: Iteraciones para ejecución de las fases del plan de trabajo de la historia de usuario #2

```markdown
Conjunto de iteraciones para ejecución de todas las fases. Ejemplo: 

- Ejecuta la fase #1
- Ejecuta la fase #2
- Corrección y feedback...
- Ejecuta la fase #3
```

### Prompt #16: Prompt para corrección de pruebas de aceptación erradas debido a datos de prueba inconsitentes parte #1

```markdown
parece que hay un problemac on los datos de prueba y por eso la confusión. Mir ala tabla 
  interviewStep\
  | id # | interviewFlowId # | interviewTypeId # | name A              | orderIndex # |
  | ---- | ----------------- | ----------------- | ------------------- | ------------ |
  | 1    | 1                 | 1                 | Initial Screening   | 1            |
  | 2    | 1                 | 2                 | Technical Interview | 2            |
  | 3    | 1                 | 3                 | Manager Interview   | 2            |
```

### Prompt #16: Prompt para corrección de pruebas de aceptación erradas debido a datos de prueba inconsitentes parte #2

```markdown
Acabo de editar el registro orderIndex = 3 para la etapa 3, puedes retomar la prueba anterior
```