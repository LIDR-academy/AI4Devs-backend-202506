import { Router } from 'express';
import { addCandidateController, getCandidateById, updateCandidateStage } from '../presentation/controllers/candidateController';

export function createCandidateRouter(controllers: {
  addCandidateController: typeof addCandidateController,
  getCandidateById: typeof getCandidateById,
  updateCandidateStage: typeof updateCandidateStage
}) {
  const router = Router();
  router.post('/', controllers.addCandidateController);
  router.get('/:id', controllers.getCandidateById);
  router.put('/:id/stage', controllers.updateCandidateStage);
  return router;
}

const router = createCandidateRouter({ addCandidateController, getCandidateById, updateCandidateStage });
export default router;
