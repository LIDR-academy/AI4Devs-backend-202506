## IDE usado: Cursor

### prompt 1:

Ejecuta sobre la carpeta backend/prisma estos comandos:

npx prisma generate
npx prisma migrate dev
ts-node seed.ts

De haber algún error, itera hasta que funcione, no me preguntes nada. Considera pasar el .env de la raiz del proyecto a la carpeta backend en caso de ser necesario.

### prompt 2:

Comportate como un experto programador, con avanzados conocimientos en arquitectura de software y desarrollo de APIs. Requiero que me ayudes con una serie de cambios y nuevas funcionalidades que detallaré a continuación:

- En primer lugar, lee el README.md para comprender la estructura del proyecto en contexto.
- Crear dos nuevos endpoints que nos permitirán manipular la lista de candidatos de una aplicación en una interfaz tipo kanban:

    1. GET /positions/:id/candidates: Este endpoint recogerá todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Debe proporcionar la siguiente información básica:

    Nombre completo del candidato (de la tabla candidate).
    current_interview_step: en qué fase del proceso está el candidato (de la tabla application).
    La puntuación media del candidato. Recuerda que cada entrevist (interview) realizada por el candidato tiene un score

    2. PUT /candidates/:id/stage: Este endpoint actualizará la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico.

- Considera aplicar lo siguiente:

    1. Principios SOLID: Aplica los principios SOLID en la medida de lo posible para asegurar un código limpio y mantenible.
    2. Aplica los principios de la arquitectura DDD para reflejar el dominio del negocio.
    3. Aplica el principio DRY para evitar la duplicación de código.
    4. Registro de Consola: Implementa los logs necesarios en la consola para rastrear eventos importantes y el flujo de la aplicación.
    5. Manejo de Excepciones: Atrapa todas las posibles excepciones para garantizar la robustez del código.
    6. Test unitarios correspondientes a los nuevos end-points generados.
    7. Documenta todo el codigo implementado, considera dejar en una carpeta /docs en el backend la documentación de las APIS mencionadas arriba, incluye un ejemplo de como consumirlos

### prompt 3:

El api de actualización de stage esta cambiando la primera aplicación que encuentra en caso de haber más de 1, modifica el segundo end-point para recibir el id de la posición a la cual se le aplicará el cambio del stage. Despues de corroborar su funcionamiento, actualiza la documentación y las pruebas unitarias.