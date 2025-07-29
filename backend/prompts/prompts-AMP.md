# Historial de Prompts 📑

## Modelo 🤖

- **LLM:** GPT-4 (OpenAI)
- **Versión:** 2024-06

---

## Categorías 🏷️

- **Análisis de Requerimientos** 🔍
- **Historias de Usuario** 📖
- **Gestión de Tickets** 🎫
- **Diseño Técnico** 🏗️
- **Desarrollo Backend** 👨‍💻
- **Documentación** 📄
- **Testing y Cobertura** 🧪
- **DevOps y Troubleshooting** 🛠️
- **Gestión de Roles** 👥
- **Mejoras y Refactorización** 🔄

---

## Estadísticas 📊

| Métrica                        | Valor |
|-------------------------------|-------|
| Total de Prompts              | 21    |
| Categoría más frecuente        | Desarrollo Backend 👨‍💻 (9) |
| Prompt más largo               | Prompt 4 (Diseño Técnico) |
| Prompt con mayor dificultad    | Prompt 4, Prompt 11, Prompt 19 |
| Roles distintos involucrados   | 4     |
| Prompts con múltiples roles    | 8     |
| Prompts de testing             | 7     |
| Prompts de documentación       | 6     |
| Prompts de análisis            | 5     |
| Prompts de troubleshooting     | 4     |

### Prompts por Categoría

| Categoría                  | # Prompts |
|---------------------------|-----------|
| Desarrollo Backend 👨‍💻    | 9         |
| Testing y Cobertura 🧪     | 7         |
| Documentación 📄           | 6         |
| Análisis de Requerimientos 🔍 | 5     |
| Diseño Técnico 🏗️         | 3         |
| Gestión de Tickets 🎫      | 3         |
| DevOps y Troubleshooting 🛠️ | 4      |
| Historias de Usuario 📖    | 2         |
| Mejoras y Refactorización 🔄 | 2      |
| Gestión de Roles 👥        | 1         |

### Roles Utilizados

- Product Owner 👩‍💼
- Líder Técnico 🧑‍💻
- Desarrollador Backend Senior 👨🏻‍💻
- QA/Tester 🧪

---

## Prompts de usuario 📝👤

**Nota:** Para un mejor trabajo y organización del contexto de cada prompt, se generaron archivos markdown en la carpeta `.docs`. 

- **`init.md`:**
Documentación base de los endpoints Kanban ATS, incluyendo análisis funcional, ejemplos de request/response, ciclo de vida del software y referencias.

- **`UserStories.md`:**
Historias de usuario detalladas, con criterios de aceptación, tareas, notas adicionales y relaciones entre historias.

- **`Tickets.md`:**
Tickets de trabajo técnicos, estructurados para sprint planning, con descripciones, criterios de aceptación, detalles técnicos, referencias y estimaciones.

- **`Development.md`:**
Análisis técnico y diseño detallado de los endpoints, aplicando buenas prácticas, principios SOLID/DRY, patrones de diseño, seguridad y ejemplos de especificación Swagger/OpenAPI.

- **`TDD.md`:**
Estrategia TDD para los endpoints Kanban ATS: incluye estructura de tests (unitarios, integración, mocks), criterios de aceptación cubiertos, buenas prácticas (Red-Green-Refactor, mocking, cobertura >85%), y comandos para ejecutar y revisar cobertura. Garantiza calidad y cumplimiento de User Stories.

***Estos archivos no fueron versionados ya que no es el scope del ejercicio.***

### **Prompt 1:** 
`Análisis de Requerimientos 🔍` `Desarrollo Backend 👨‍💻` `Documentación 📄`

Eres un Product Owner experimentado en sistemas ATS.

@/backend  Tu misión es crear dos nuevos endpoints que nos permitirán manipular la lista de candidatos de una aplicación en una interfaz tipo kanban.

Endpoints:

1. GET /positions/:id/candidates
Este endpoint recogerá todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Debe proporcionar la siguiente información básica:

- Nombre completo del candidato (de la tabla candidate).
current_interview_step: en qué fase del proceso está el candidato (de la tabla application).
- La puntuación media del candidato. Recuerda que cada entrevist (interview) realizada por el candidato tiene un score

2. PUT /candidates/:id/stage
Este endpoint actualizará la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico.

Guarda esta misma información en @init.md luego enriquece la informacion con todo lo necesario para usarlo como base en todas las fases del ciclo de vida del SW: analisis, diseño, desarrollo, tests, etc.

Apoyate en el esquema de datos @schema.prisma 
Revisa el contexto general del proyecto en @README.md 

### **Prompt 2:** 
`Historias de Usuario 📖` `Análisis de Requerimientos 🔍`
analiza @init.md y genera la maxima cantidad de historias de usuario.

Ejemplos de User Story

Desarrollo de Productos:"Como gerente de producto, quiero una manera en que los miembros del equipo puedan entender cómo las tareas individuales contribuyen a los objetivos, para que puedan priorizar mejor su trabajo."

Experiencia del Cliente:"Como cliente recurrente, espero que mi información quede guardada para crear una experiencia de pago más fluida, para que pueda completar mis compras de manera rápida y sencilla."

Aplicación Móvil:"Como usuario frecuente de la aplicación, quiero una forma de simplificar la información relevante de la manera más rápida posible, para poder acceder a la información que necesito de manera eficiente."

Las historias deben tener la siguiente estructura:

Formato estándar: "Como [tipo de usuario], quiero [realizar una acción] para [obtener un beneficio]".

Descripción: Una descripción concisa y en lenguaje natural de la funcionalidad que el usuario desea.

Criterios de Aceptación: Condiciones específicas que deben cumplirse para considerar la User Story como "terminada", éstos deberian de seguir un formato similar a “Dado que” [contexto inicial], "cuando” [acción realizada], “entonces” [resultado esperado].

Notas adicionales: Notas que puedan ayudar al desarrollo de la historia

Tareas: Lista de tareas y subtareas para que esta historia pueda ser completada

guiate por el siguiente ejemplo de estructura:

Título de la Historia de Usuario:

Como [rol del usuario], quiero [acción que desea realizar el usuario], para que [beneficio que espera obtener el usuario]. Criterios de Aceptación:

[Detalle específico de funcionalidad] [Detalle específico de funcionalidad] [Detalle específico de funcionalidad] Notas Adicionales:

[Cualquier consideración adicional] Historias de Usuario Relacionadas:

[Relaciones con otras historias de usuario] documenta todo en @UserStories.md aplicando buenas practicas agiles

### **Prompt 3:** 
`Gestión de Tickets 🎫` `Documentación 📄`
analiza @UserStories.md  genera los Tickets de trabajo correspondientes. Aterrízalos técnicamente, tal y como se hace en las sprint planning.

Apoyate en @init.md @UserStories.md 

documenta todo en @Tickets.md 

el formato de redaccion para el ticket de trabajo debe ser el siguiente:

Título Claro y Conciso: Un resumen breve que refleje la esencia de la tarea. Debe ser lo suficientemente descriptivo para que cualquier miembro del equipo entienda rápidamente de qué se trata el ticket.

Descripción Detallada: Propósito: Explicación de por qué es necesaria la tarea y qué problema resuelve. Detalles Específicos: Información adicional sobre requerimientos específicos, restricciones, o condiciones necesarias para la realización de la tarea.

Criterios de Aceptación: Expectativas Claras: Lista detallada de condiciones que deben cumplirse para que el trabajo en el ticket se considere completado. Pruebas de Validación: Pasos o pruebas específicas que se deben realizar para verificar que la tarea se ha completado correctamente.

Prioridad: Una clasificación de la importancia y la urgencia de la tarea, lo cual ayuda a determinar el orden en que deben ser abordadas las tareas dentro del backlog.

Estimación de Esfuerzo: Puntos de Historia o Tiempo Estimado: Una evaluación del tiempo o esfuerzo que se espera que tome completar el ticket. Esto es esencial para la planificación y gestión del tiempo del equipo.

Asignación: Quién o qué equipo será responsable de completar la tarea. Esto asegura que todos los involucrados entiendan quién está a cargo de cada parte del proyecto.

Etiquetas o Tags: Categorización: Etiquetas que ayudan a clasificar el ticket por tipo (bug, mejora, tarea, etc.), por características del producto (UI, backend, etc.), o por sprint/versión.

Comentarios y Notas: Colaboración: Espacio para que los miembros del equipo agreguen información relevante, hagan preguntas, o proporcionen actualizaciones sobre el progreso de la tarea.

Enlaces o Referencias: Documentación Relacionada: Enlaces a documentos, diseños, especificaciones o tickets relacionados que proporcionen contexto adicional o información necesaria para la ejecución de la tarea.

Historial de Cambios: Rastreo de Modificaciones: Un registro de todos los cambios realizados en el ticket, incluyendo actualizaciones de estado, reasignaciones y modificaciones en los detalles o prioridades.

aqui tienes un ejemplo de ticket de trabajo bien estructurado:

Título: Implementación de Autenticación de Dos Factores (2FA)

Descripción: Añadir autenticación de dos factores para mejorar la seguridad del login de usuarios. Debe soportar aplicaciones de autenticación como Authenticator y mensajes SMS.

Criterios de Aceptación:

Los usuarios pueden seleccionar 2FA desde su perfil. Soporte para Google Authenticator y SMS. Los usuarios deben confirmar el dispositivo 2FA durante la configuración. Prioridad: Alta

Estimación: 8 puntos de historia

Asignado a: Equipo de Backend

Etiquetas: Seguridad, Backend, Sprint 10

Comentarios: Verificar la compatibilidad con la base de usuarios internacionales para el envío de SMS.

Enlaces: Documento de Especificación de Requerimientos de Seguridad

Historial de Cambios:

01/10/2023: Creado por [nombre] 05/10/2023: Prioridad actualizada a Alta por [nombre]

### **Prompt 4:** 
`Diseño Técnico 🏗️` `Desarrollo Backend 👨‍💻` `Documentación 📄`
Eres un Lider tecnico senior, experto en implementacion de sistemas ATS

debes realizar el análisis técnico y el diseño de los endpoints. apoyate en @init.md @Tickets.md @UserStories.md 

documenta todo en @Development.md 

asegurate de usar buenas practicas de desarrollo, utiliza principios SOLID/DRY, aplica patrones de factorizacion segun corresponda, buenas practicas de seguridad, patrones de diseño

todo debe estar comentado con descripciones relevantes para que cualquier persona del equipo lo puede entender facilmente sin ambiguedades. implementa swagger/openAPI para documentar los endpoints

guiate por el esquema @schema.prisma 

### **Prompt 5:**
analiza @Development.md y actualiza los tickets @Tickets.md para que los desarrolladores tenga todo el contexto y el detalle tecnico para la implementacion

### **Prompt 6:** 
`Gestión de Tickets 🎫` `Diseño Técnico 🏗️`
eres un desarrollador backend senior

debes desarrollar los @Tickets.md y guiarte por el lineamiento tecnico @Development.md 

tienes ma contexto en @README.md @init.md @UserStories.md 

asegurate en todo momento de usar buenas practicas y comentar todo el codigo

genera el codigo y estructura de carpetas automaticamente

### **Prompt 7:** 
`Desarrollo Backend 👨‍💻` `Documentación 📄`
continua con la integración de rutas y generación de documentación Swagger

### **Prompt 8:** 
`Desarrollo Backend 👨‍💻` `Mejoras y Refactorización 🔄`
corrige los errores de compilación @Image

### **Prompt 9:** 
`DevOps y Troubleshooting 🛠️` `Documentación 📄`
actualiza @README.md con todo lo necesario para no cometer los mismos errores al levantar el backend

### **Prompt 10:** 
`Testing y Cobertura 🧪` `Documentación 📄`
@README.md agrega ejemplos de request y response, tambien agrega ejemplos de curl para ejecutar. agrega instrucciones para ejecutar los tests

### **Prompt 11:** 
`Testing y Cobertura 🧪` `Desarrollo Backend 👨‍💻`
actualiza @TDD.md y agrega todo lo necesario para generar las instrucciones que sirvan de guia apra crear los tests unitarios. asegurate de cubrir todo lo esperado en @UserStories.md 

### **Prompt 12:** 
`Testing y Cobertura 🧪`
ejecuta los test para verificar que funcionen correctamente

### **Prompt 13:** 
`Testing y Cobertura 🧪` `DevOps y Troubleshooting 🛠️`
@Image antes de seguir con los tests revisa todos los errores de compilacion

### **Prompt 14:** 
`Testing y Cobertura 🧪` `Desarrollo Backend 👨‍💻`
continua corrigiendo los tests restantes para completar la cobertura del 85%. no preguntas mas hasta conseguirlo.

### **Prompt 15:** 
`Testing y Cobertura 🧪` `Documentación 📄`
utiliza jacocoreports o algo similar para mejorar la visual del coverage

### **Prompt 16:** 
`Testing y Cobertura 🧪` `Desarrollo Backend 👨‍💻`
El reporte indica que la cobertura de los tests unitarios es menos del 85%. Genera mas tests para mejorar la cobertura. codifica todo primero y luego ejecuta los test y comprueba cobertura

### **Prompt 17:** 
`Testing y Cobertura 🧪` `Mejoras y Refactorización 🔄`
excluye los models de la cobertura. genera tests para los servicios con menor cobertura.

### **Prompt 18:** 
`Testing y Cobertura 🧪` `Desarrollo Backend 👨‍💻`
actualiza @README.md con todo lo referente a los test cobertura y como revisar el reporte html

### **Prompt 19:** 
`Documentación 📄` `Testing y Cobertura 🧪` `DevOps y Troubleshooting 🛠️`
documenta con swagger todos los endpoints del backend

### **Prompt 20:** 
`Documentación 📄`
actualiza @README.md y agrega ejemplos de request/response y curl para todos los endpoints del backend

### **Prompt 21:** 
`Gestión de Roles 👥` `Documentación 📄`
analiza todos los prompts @prompts-AMP.md define categorias relevantes y agrega el listado en la seccion categorias, cada categoria debe tener asignado un emoji unico. Luego agrega la categoria en formato etiqueta en cada prompt, por ejemplo `categoria1 🏷️` `categoria2 🏷️` . un prompt puede tener asignado un maximo de 3 categorias relevantes. Luego agrega estadisticas en la seccion correspondiente apoyandote en tablas markdown, agrega informacion relevante de prompts mas usados, cuales generaron mayor dificultar o problemas, cuantos roles distintos se usaron en todo el proceso, etc. finalmente actualiza la seccion conclusiones detallando los puntos importantes de todo el proceso de trabajo

---

## Conslusiones 🏁

Durante el proceso se cubrieron todas las fases del ciclo de vida del software para un sistema ATS Kanban, desde el análisis de requerimientos hasta la documentación y pruebas automatizadas. Se identificaron los siguientes puntos clave:

- La categorización de prompts permitió visualizar la diversidad de actividades y roles involucrados.
- El mayor reto técnico fue la integración de buenas prácticas de diseño y testing, especialmente en prompts de diseño técnico y cobertura.
- La colaboración entre roles (Product Owner, Líder Técnico, Backend, QA) fue esencial para lograr una solución robusta y bien documentada.
- La generación de documentación y ejemplos claros (curl, request/response) facilitó la validación y el onboarding de nuevos miembros.
- El enfoque en testing y cobertura (>85%) garantizó calidad y mantenibilidad.
- La automatización y el troubleshooting documentado redujeron el tiempo de resolución de problemas.

Este proceso puede servir como referencia para futuros desarrollos de sistemas ATS o proyectos con requerimientos similares, asegurando trazabilidad, calidad y colaboración efectiva.