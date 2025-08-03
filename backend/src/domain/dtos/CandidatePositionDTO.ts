export interface CandidatePositionDTO {
    id: number;
    fullName: string;
    currentInterviewStep: string;
    averageScore: number | null;
}

export interface CandidatePositionResponseDTO {
    positionId: number;
    candidates: CandidatePositionDTO[];
}
