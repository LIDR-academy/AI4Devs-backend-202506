import { Position } from '../../domain/models/Position';

export interface CandidateWithScore {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  applicationDate: Date;
  currentStep: string;
  averageScore: number | null;
}

export interface PositionCandidatesResponse {
  positionId: number;
  positionTitle: string;
  totalCandidates: number;
  candidates: CandidateWithScore[];
}

export const getCandidatesByPosition = async (positionId: number): Promise<PositionCandidatesResponse> => {
  try {
    if (!positionId || positionId <= 0) {
      throw new Error('Invalid position ID provided');
    }

    const result = await Position.getCandidatesByPosition(positionId);
    return result;

  } catch (error: any) {
    if (error.message === 'Position not found' || error.message === 'Invalid position ID provided') {
      throw error;
    }
    console.error('Error retrieving candidates for position:', error);
    throw new Error('Error retrieving position candidates');
  }
};