# Historial de Prompts 📑

## Modelo 🤖

- **LLM:** GPT-4 (OpenAI)
- **Versión:** 2024-06

---

## Categorías 🏷️


## Estadísticas 📊

## Roles 👥

En los prompts se utilizaron los siguientes roles enfocados en personas experimentadas en ATS:

- Product Owner 👩‍💼
- Líder Técnico 🧑‍💻
- Desarrollador Backend Senior 👨🏻‍💻

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
(Archivo vacío, reservado para futuras estrategias o ejemplos de desarrollo guiado por pruebas).

***Estos archivos no fueron versionados ya que no es el scope del ejercicio.***

**Prompt 1:**

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

**Prompt 2:**
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

**Prompt 3:**
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

**Prompt 4:**
Eres un Lider tecnico senior, experto en implementacion de sistemas ATS

debes realizar el análisis técnico y el diseño de los endpoints. apoyate en @init.md @Tickets.md @UserStories.md 

documenta todo en @Development.md 

asegurate de usar buenas practicas de desarrollo, utiliza principios SOLID/DRY, aplica patrones de factorizacion segun corresponda, buenas practicas de seguridad, patrones de diseño

todo debe estar comentado con descripciones relevantes para que cualquier persona del equipo lo puede entender facilmente sin ambiguedades. implementa swagger/openAPI para documentar los endpoints

guiate por el esquema @schema.prisma 

**Prompt 4:**
analiza @Development.md y actualiza los tickets @Tickets.md para que los desarrolladores tenga todo el contexto y el detalle tecnico para la implementacion

**Prompt 5:**
eres un desarrollador backend senior

debes desarrollar los @Tickets.md y guiarte por el lineamiento tecnico @Development.md 

tienes ma contexto en @README.md @init.md @UserStories.md 

asegurate en todo momento de usar buenas practicas y comentar todo el codigo

genera el codigo y estructura de carpetas automaticamente

**Prompt 6:**
continua con la integración de rutas y generación de documentación Swagger

**Prompt 7:**
corrige los errores de compilación @Image

**Prompt 8:**

---

## Conslusiones 🏁