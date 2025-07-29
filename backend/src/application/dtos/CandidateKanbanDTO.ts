/**
 * DTO para la respuesta de candidatos en el Kanban de una posición
 */
export interface CandidateKanbanDTO {
  candidateId: number;
  fullName: string;
  currentInterviewStep: string | null;
  averageScore: number | null;
} 