// Datos mock para aplicaciones en tests
import { mockCandidates } from './candidates';

export const mockApplications = [
  {
    id: 1,
    positionId: 1,
    candidateId: 1,
    currentInterviewStep: 2,
    applicationDate: new Date('2024-01-01'),
    notes: 'Candidato prometedor',
    candidate: mockCandidates[0],
    interviews: [
      { id: 1, score: 8, interviewDate: new Date('2024-01-15') },
      { id: 2, score: 7, interviewDate: new Date('2024-01-20') }
    ],
    interviewStep: {
      id: 2,
      name: 'Entrevista Técnica',
      orderIndex: 2
    }
  },
  {
    id: 2,
    positionId: 1,
    candidateId: 2,
    currentInterviewStep: 1,
    applicationDate: new Date('2024-01-02'),
    notes: 'En proceso de evaluación',
    candidate: mockCandidates[1],
    interviews: [],
    interviewStep: {
      id: 1,
      name: 'HR',
      orderIndex: 1
    }
  },
  {
    id: 3,
    positionId: 1,
    candidateId: 3,
    currentInterviewStep: 3,
    applicationDate: new Date('2024-01-03'),
    notes: 'Candidato avanzado',
    candidate: mockCandidates[2],
    interviews: [
      { id: 3, score: 9, interviewDate: new Date('2024-01-25') },
      { id: 4, score: 8, interviewDate: new Date('2024-01-30') },
      { id: 5, score: 9, interviewDate: new Date('2024-02-05') }
    ],
    interviewStep: {
      id: 3,
      name: 'Entrevista Final',
      orderIndex: 3
    }
  }
];

export const mockApplication = mockApplications[0]; 