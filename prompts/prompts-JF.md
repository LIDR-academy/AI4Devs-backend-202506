# ?? Bitacora de Prompts para ejercicio creando endpoints de LTI

## ?? Prompt 1: Creacion de Endpoint GET

**Herramienta:** Gemini
**Modelo:** 2.5 Flash

**Instrucciones:**
Ayudame a crear un prompt para GitHub Copilot, con las siguientes tareas:

  * Leer el proyecto y el archivo `readme.md` para ponerse en contexto del codigo fuente del proyecto.
  * Que se coloque en el rol de un experto desarrollador de API.
  * Que utilice buenas practicas de desarrollo backend como DDD, SOLID, DRY y patrones de diseno.
  * Crear un ENDPOINT GET `/positions/id/candidates`.
  * Este endpoint recogera todos los candidatos en proceso para una determinada posicion, es decir, todas las aplicaciones para un determinado `positionID`.
  * Debe proporcionar la siguiente informacion basica:
      - Nombre completo del candidato (de la tabla `candidate`).
      - `current_interview_step`: en que fase del proceso esta el candidato (de la tabla `application`).
      - La puntuacion media del candidato.
  * Recuerda que cada entrevista (`interview`) realizada por el candidato tiene un `score`.
  * Si tiene alguna duda pregunta.

## ??? Prompt 2: Actualizacion de Paquetes y Dependencias

**Herramienta:** Visual Studio Code y Github Copilot modo agente
**Modelo:** Claude Sonnet 3.5

**Instrucciones:**
Ayudame a actualizar los paquetes del proyecto y eliminar errores de dependencias para poder ejecutar los comandos `npx prisma generate` y `npx ts-node .\prisma\seed.ts` sin inconvenientes.

## ?? Prompt 3: Diseno e Implementacion de Endpoint GET

**Herramienta:** Visual Studio Code y Github Copilot modo agente
**Modelo:** Claude Sonnet 3.5

**Instrucciones:**
Asume el rol de un experto desarrollador de APIs, con un profundo conocimiento de las mejores practicas de desarrollo backend, incluyendo DDD (Domain-Driven Design), SOLID y DRY, asi como patrones de diseno relevantes.

**Contexto del Proyecto:**

  * Por favor, primero lee y analiza a fondo el codigo fuente completo del proyecto y el archivo `README.md`.
  * Esto te permitira comprender la arquitectura existente, los modelos de datos, las relaciones entre tablas y las convenciones de codificacion.

**Tarea Principal:**

  * Tu tarea es disenar e implementar un nuevo endpoint GET: `/positions/{positionId}/candidates`.

**Funcionalidad del Endpoint:**

  * Este endpoint debe recuperar una lista de todos los candidatos que estan actualmente en proceso para una `positionId` especifica.
  * Es decir, debe listar todas las aplicaciones asociadas a esa posicion.

**Datos a Retornar por Candidato:**
Para cada candidato en la lista, el endpoint debe proporcionar la siguiente informacion basica:

1.  **Nombre Completo del Candidato:** Este dato debe obtenerse de la tabla `candidate`.
2.  **`current_interview_step`:** Indica la fase actual en la que se encuentra el candidato dentro del proceso de entrevista. Este dato debe obtenerse de la tabla `application`.
3.  **Puntuacion Media del Candidato:** Cada entrevista (`interview`) realizada por el candidato tiene una puntuacion (`score`). Debes calcular el promedio de todas las puntuaciones de las entrevistas para cada candidato.

**Consideraciones Adicionales:**

  * Aplica los principios de **DDD** para asegurar que el diseno del endpoint y las entidades involucradas reflejen el dominio del negocio.
  * Aplica los principios **SOLID** en la implementacion del codigo, buscando alta cohesion y bajo acoplamiento.
  * Aplica el principio **DRY** (Don't Repeat Yourself) para evitar la duplicacion de codigo.
  * Utiliza patrones de diseno apropiados (ej. Repositorio, Servicio, DTOs) para estructurar la solucion de manera limpia y mantenible.
  * Asegurate de que la logica de acceso a datos sea eficiente y evite problemas de N+1.
  * Considera la gestion de errores y las respuestas HTTP adecuadas (ej. 200 OK, 404 Not Found si la posicion no existe, 500 Internal Server Error).
  * Proporciona cualquier clase de modelo, servicio, controlador o repositorio que sea necesaria para implementar esta funcionalidad.

**Preguntas/Dudas:**

  * Si durante el proceso de analisis o implementacion tienes alguna duda sobre la estructura de la base de datos, la relacion entre tablas (`candidate`, `application`, `interview`, `position`), o cualquier otra parte del contexto del proyecto, por favor, hazla.

## ?? Prompt 4: Solucion de Errores de `positionService.ts` y `tsconfig.json`

**Herramienta:** Visual Studio Code y Github Copilot modo agente
**Modelo:** Claude Sonnet 3.5

**Instrucciones:**
Visual Code me indica 9 problemas, ayudame a solucionarlos sin afectar la funcionalidad que ya existe:

  * `Module '"@prisma/client"' has no exported member 'Application'.` en `positionService.ts`.
  * Varios parametros con tipo `implicitly has an 'any' type` en `positionService.ts`.
  * `Cannot find type definition file` para `estree`, `json-schema` y `multer` en `tsconfig.json`.

## ?? Prompt 5: Segunda Revision de Errores

**Herramienta:** Visual Studio Code y Github Copilot modo agente
**Modelo:** Claude Sonnet 3.5

**Instrucciones:**
Luego de las correcciones aplicadas, me genera otros 3, por favor, corrige y revisa de nuevo todo el backend para determinar si existen otros errores, para corregir:

  * `Cannot find type definition file for 'estree'` en `tsconfig.json`.
  * `Cannot find type definition file for 'json-schema'` en `tsconfig.json`.
  * `Cannot find type definition file for 'multer'` en `tsconfig.json`.

## ??? Prompt 6: Solucion de Errores `PrismaClient`

**Herramienta:** Visual Studio Code y Github Copilot modo agente
**Modelo:** Claude Sonnet 3.5

**Instrucciones:**
Luego de las correcciones aplicadas, me genera otros 2, por favor, corrige y revisa de nuevo todo el backend para determinar si existen otros errores, para corregir:

  * `'PrismaClient' only refers to a type, but is being used as a value here` en `positionService.ts`.
  * `'PrismaClient' only refers to a type, but is being used as a value here` en `index.ts`.

## ?? Prompt 7: Correccion de Error de Inicio del Servidor

**Herramienta:** Visual Studio Code y Github Copilot modo agente
**Modelo:** Claude Sonnet 3.5

**Instrucciones:**
Ahora al ejecutar el comando "npm start" en el backend me genera error. Favor corrige el error y revisa todo el codigo del backend para posibles errores como este, y de igual forma resuelve:
El error es:

```
\backend\dist\domain\models\Education.js:13
const prisma = new client_1.PrismaClient();

ReferenceError: client_1 is not defined
    at Object.<anonymous> (\backend\dist\domain\models\Education.js:13:16)
```

## ?? Prompt 8: Implementacion de Endpoint PUT

**Herramienta:** Visual Studio Code y Github Copilot modo agente
**Modelo:** Claude Sonnet 3.5

**Instrucciones:**
Ahora con el contexto de los errores, las mejoras implementadas y el nuevo endpoint, continua en el rol de un experto desarrollador de APIs, con un profundo conocimiento de las mejores practicas de desarrollo backend, incluyendo DDD (Domain-Driven Design), SOLID y DRY, asi como patrones de diseno relevantes.

**Tarea Principal:**

  * Tu tarea es disenar e implementar un nuevo endpoint PUT: `/candidates/{candidateId}/stage`.

**Funcionalidad del Endpoint:**

  * Este endpoint actualizara la etapa del candidato identificado con `candidateId`.
  * Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato especifico, a la etapa siguiente.

**Preguntas/Dudas:**

  * Si durante el proceso de analisis o implementacion tienes alguna duda sobre la estructura de la base de datos, la relacion entre tablas (`candidate`, `application`, `interview`, `position`), o cualquier otra parte del contexto del proyecto, por favor, hazla.

## ?? Prompt 9: Correccion de Errores del Nuevo Endpoint

**Herramienta:** Visual Studio Code y Github Copilot modo agente
**Modelo:** Claude Sonnet 3.5

**Instrucciones:**
Luego del nuevo endpoint Visual Code genera los siguientes errores, por favor, corrige y comprueba que se hayan resuelto y que no vuelvan a ocurrir:

  * `Parameter 'step' implicitly has an 'any' type` en `candidateStageService.ts`.
  * `Property 'PrismaClientInitializationError' does not exist on type 'typeof Prisma'` en `Candidate.ts`.

## ?? Prompt 10: Generacion de Prompt para Pruebas Unitarias

**Herramienta:** Gemini
**Modelo:** 2.5 Flash

**Instrucciones:**
Ahora genera otro prompt para que realice las pruebas unitarias con Jest de los endpoints creados, que se asegure de utilizar casos extremos, orden en mockservices y se asegure de aplicarlo correctamente y me genere los comandos para ejecutar las pruebas.

## ? Prompt 11: Implementacion de Pruebas Unitarias con Jest

**Herramienta:** Visual Studio Code y Github Copilot modo agente
**Modelo:** Claude Sonnet 3.5

**Instrucciones:**
Asume el rol de un experto en pruebas unitarias utilizando Jest, con un enfoque en la calidad del codigo, la cobertura de pruebas y la robustez.

**Contexto del Endpoint a Probar:**
Recuerda los endpoints que implementaste previamente:

  * `GET /positions/{positionId}/candidates`
  * `PUT /candidates/{candidateId}/stage`
  * `GET /candidates/{candidateId}/stage`

**Tarea Principal:**

  * Tu tarea es escribir pruebas unitarias completas para el endpoint mencionado, utilizando Jest. Debes asegurarte de cubrir los siguientes aspectos:

**Casos de Prueba (Incluyendo Extremos):**

1.  **Exito:**
      * Verificar que el endpoint devuelve un codigo de estado **200 OK** y la estructura de datos esperada.
      * Probar con multiples escenarios que devuelvan o procesen bien la informacion.
      * Asegurar que los datos retornados coinciden con los datos "mockeados" (por ejemplo: nombre completo, `current_interview_step`, puntuacion media).
2.  **Casos limite:**
      * Utiliza casos limite para comprobar que los endpoints responden de acuerdo a lo esperado (por ejemplo: `string` cuando se espera `number`, valor negativo si los IDs son siempre positivos, etc. y verificar la respuesta adecuada, ej. 400 Bad Request si la validacion es a nivel de controlador).
      * Verificar que el endpoint devuelve un codigo de estado **404 Not Found** cuando la `positionId` proporcionada no existe en el sistema.
      * Verifica que el endpoint devuelve valores nulos o vacios (`[]`) cuando corresponda no obtener informacion.
3.  **Errores Internos del Servidor:**
      * Simular un error en alguna de las dependencias (ej. error en la base de datos, error al calcular la media) para asegurar que el endpoint devuelve un codigo de estado **500 Internal Server Error** y un mensaje de error apropiado.

**Organizacion de Mocks y Dependencias:**

  * Utiliza **mocks bien estructurados y organizados** para todas las dependencias del endpoint (repositorios, servicios de base de datos, etc.).
  * Asegurate de que los mocks sean **claros, explicitos y faciles de entender**. Define el comportamiento esperado para cada metodo "mockeado".
  * Prioriza el **orden en los `mockServices`** para que las pruebas sean deterministas y faciles de seguir.

**Generacion de Comandos:**

  * Una vez que las pruebas esten generadas, proporciona los **comandos de terminal necesarios para ejecutar las pruebas unitarias** utilizando Jest.

**Preguntas/Dudas:**

  * Si tienes alguna duda sobre la estructura de los archivos de prueba, la forma de mockear una dependencia especifica o cualquier otro detalle, por favor, pregunta.