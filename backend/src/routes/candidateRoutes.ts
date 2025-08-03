import { Router } from 'express';
import { addCandidate, getCandidateById } from '../presentation/controllers/candidateController';
import { CandidateStageController } from '../presentation/controllers/candidateStageController';

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

// Initialize the stage controller
const stageController = new CandidateStageController();

// Stage management routes
router.put('/:candidateId/stage', (req, res) => stageController.advanceToNextStage(req, res));
router.get('/:candidateId/stage', (req, res) => stageController.getCurrentStage(req, res));

export default router;
