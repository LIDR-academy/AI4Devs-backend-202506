export interface CandidateStageDTO {
    candidateId: number;
    currentStage: {
        id: number;
        name: string;
    };
    previousStage: {
        id: number;
        name: string;
    } | null;
    nextStage: {
        id: number;
        name: string;
    } | null;
    updatedAt: Date;
}
