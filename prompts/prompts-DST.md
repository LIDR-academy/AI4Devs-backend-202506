# Prompts y Respuestas - Desarrollo de APIs DST

## Prompt 1
@info.md considera la información en el archivo info.md como la estructura del proyecto.

Eres un expero desarollador backend, mecesito crear dos nuevas APIs, primero partiremos con una API para listar los candidatos de una aplicación en una interfaz tipo kanban.

Lo que se requiere es lo siguiente:
GET /positions/:id/candidates
Este endpoint recogerá todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Debe proporcionar la siguiente información básica:

Nombre completo del candidato (de la tabla candidate).
current_interview_step: en qué fase del proceso está el candidato (de la tabla application).
La puntuación media del candidato. Recuerda que cada entrevist (interview) realizada por el candidato tiene un score

Si tienes alguna duda preguntame antes de generar el código.

**Respuesta:**
¡Perfecto! Antes de generar el código, tengo algunas preguntas para asegurarme de que la API cumpla exactamente con tus necesidades:

1. ¿La puntuación media del candidato debe calcularse solo con las entrevistas completadas, o también se incluyen entrevistas en curso o pendientes?
2. ¿Hay algún filtro adicional que deba aplicarse a los candidatos? Por ejemplo, ¿solo los que están “en proceso” (no rechazados ni contratados)?
3. ¿Qué estructura deseas para la respuesta? Por ejemplo, ¿un array de objetos con las propiedades: nombre, current_interview_step, average_score?
4. ¿Hay algún requerimiento de paginación o se deben devolver todos los candidatos de la posición?
5. ¿El endpoint debe estar autenticado o protegido de alguna manera?

Con estas respuestas podré generar el código de la API de manera precisa y alineada a tus expectativas.

---

## Prompt 2
1.- Solo las entrvistas completadas.
2.- No hya filtros adicionales
3.- Si, debería ser un array de objetos
4.- Retorna todos lo candidatos, sin paginación

---

## Prompt 3
- Debería ser el nombre del paso
- Incluye el id y el nombre del candidato

---

## Prompt 4
Funciona correctamente.
Ahora vamos con el siguiente API:

PUT /candidates/:id/stage
Este endpoint actualizará la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico.

igual que antes, no escribas código hasta aclarar todas las dudas.

**Respuesta:**
¡Perfecto! Antes de escribir el código, te hago algunas preguntas para asegurarme de que el endpoint cumpla exactamente con lo que necesitas:

1. ¿El parámetro :id corresponde al id del candidato o al id de la aplicación (application)? (Recuerda que un candidato puede tener varias aplicaciones/posiciones).
2. ¿El nuevo “stage” (etapa) se enviará en el body como el id del InterviewStep, o como nombre/texto?
3. ¿Debemos validar que el nuevo stage exista y pertenezca al flujo de entrevistas de la posición correspondiente?
4. ¿Qué respuesta esperas? ¿Solo un mensaje de éxito, o el objeto actualizado?
5. ¿Hay alguna restricción de seguridad/autenticación para este endpoint?

Con estas respuestas, podré diseñar el endpoint exactamente como lo necesitas.

---

## Prompt 5
1.- Debería ser la aplicación.
2.- Se debe enviar en el body como Id
3.- Si, se debería validar.
4.- Que retorne le objeto actualizado.
5.- No hay restricciones de seguridad

---

## Prompt 6
- No, solo los campos de la tabla application
- Solo currentInterviewStep

---

## Prompt 7
¡Perfecto! El endpoint quedará así:

- PUT /candidates/:applicationId/stage
- Body: { "stageId": <nuevo_id_de_stage> }
- Actualiza solo el campo currentInterviewStep de la tabla Application.
- Valida que el stageId pertenezca al flujo de entrevistas de la posición de la aplicación.
- Retorna el objeto Application actualizado (solo sus campos).
- No hay restricciones de seguridad.

Voy a proceder a implementar el endpoint siguiendo estas especificaciones. ¿Listo para que lo genere?

---

## Prompt 8
Si
