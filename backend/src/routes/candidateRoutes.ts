import { Router } from 'express';
import { addCandidate, getCandidateById, updateCandidateStage } from '../presentation/controllers/candidateController';

const router = Router();

router.post('/', async (req, res) => {
  try {
    // console.log(req.body); //Just in case you want to inspect the request body
    const result = await addCandidate(req.body);
    res.status(201).send(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send({ message: error.message });
    } else {
      res.status(500).send({ message: "An unexpected error occurred" });
    }
  }
});

router.get('/:id', getCandidateById);

/**
 * PUT /candidates/:id/stage
 * 
 * Actualiza la etapa actual del proceso de entrevista para un candidato específico.
 * 
 * @param {number} id - ID del candidato (parámetro de ruta)
 * @body {Object} stageData - Datos de la nueva etapa
 * @body {number} stageData.newInterviewStepId - ID de la nueva etapa de entrevista
 * @body {number} stageData.positionId - ID de la posición
 * @body {string} [stageData.notes] - Notas adicionales (opcional)
 * 
 * @returns {200} Actualización exitosa con datos del candidato
 * @returns {400} Datos de entrada inválidos
 * @returns {404} Candidato o aplicación no encontrado
 * @returns {409} Transición de etapa no permitida
 * @returns {422} Etapa no pertenece al flujo de la posición
 * @returns {500} Error interno del servidor
 * 
 * @example
 * PUT /candidates/1/stage
 * Content-Type: application/json
 * {
 *   "newInterviewStepId": 3,
 *   "positionId": 1,
 *   "notes": "Candidate successfully passed technical interview"
 * }
 */
router.put('/:id/stage', updateCandidateStage);

export default router;
