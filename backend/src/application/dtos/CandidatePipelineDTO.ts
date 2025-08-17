export interface CandidatePipelineDTO {
  id: number;
  fullName: string;
  email: string;
  currentInterviewStep: string;
  averageScore: number;
  applicationId: number;
  positionId: number;
  appliedDate: Date;
  lastUpdated: Date;
}

export interface CandidatePipelineResponse {
  success: boolean;
  data: CandidatePipelineDTO[];
  message?: string;
  timestamp?: string;
}

export interface UpdateCandidateStageDTO {
  newStage: string;
  positionId: number;
  notes?: string;
}
