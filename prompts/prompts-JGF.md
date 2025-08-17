Modelo usado: modo agente de Cursor (Auto)

# Prompt 1: Generación del endpoint GET

Actúa como un desarrollador senior backend experto en Node.JS. Quiero que implementes un nuevo endpoint en el backend de este proyecto:

GET /positions/:id/candidates

Este endpoint recogerá todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Debe proporcionar la siguiente información básica:

    Nombre completo del candidato (de la tabla candidate).
    current_interview_step: en qué fase del proceso está el candidato (de la tabla application).
    La puntuación media del candidato. Recuerda que cada entrevist (interview) realizada por el candidato tiene un score

Recuerda seguir buenas prácticas de backend, DDD y principios SOLID y DRY.

# Prompt 2: Generación del endpoint PUT
Quiero que añadas ahora otro endpoint

PUT /candidates/:id/stage

Este endpoint actualizará la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico.