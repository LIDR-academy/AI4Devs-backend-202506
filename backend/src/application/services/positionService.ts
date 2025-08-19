import { Position } from '../../domain/models/Position';

export const findPositionById = async (id: number) => {
    try {
        const position = await Position.findOne(id);
        return position;
    } catch (error) {
        console.error('Error al buscar la posición:', error);
        throw new Error('Error al recuperar la posición');
    }
};

export const getCandidatesByPosition = async (positionId: number) => {
    try {
        const position = await Position.findOne(positionId);
        if (!position) {
            throw new Error('Position not found');
        }

        const candidates = await Position.getCandidatesWithDetails(positionId);
        return candidates;
    } catch (error) {
        console.error('Error al obtener candidatos de la posición:', error);
        throw error;
    }
};
