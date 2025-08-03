import { Router } from 'express';
import { PositionController } from '../presentation/controllers/positionController';

const router = Router();
const positionController = new PositionController();

// Get candidates by position
router.get('/:positionId/candidates', (req, res) => 
    positionController.getCandidatesByPosition(req, res)
);

export default router;
