import { Router } from 'express';
import { 
    getCandidatesByPositionController, 
    updateCandidateStageController 
} from '../presentation/controllers/positionController';

const router = Router();

/**
 * GET /positions/:id/candidates
 * Obtiene todos los candidatos en proceso para una posición específica
 */
router.get('/:id/candidates', (req, res, next) => {
    console.log('🔍 Ruta GET /positions/:id/candidates alcanzada');
    console.log('   Parámetros:', req.params);
    console.log('   ID recibido:', req.params.id);
    console.log('   Tipo de ID:', typeof req.params.id);
    next();
}, getCandidatesByPositionController);

export default router;
