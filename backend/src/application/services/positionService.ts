import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type CandidateInProcess = {
  full_name: string;
  current_interview_step: number;
  average_score: number | null;
};

export const getCandidatesByPosition = async (positionId: number): Promise<CandidateInProcess[]> => {
  const position = await prisma.position.findUnique({
    where: { id: positionId },
    select: { id: true }
  });

  if (!position) {
    const error: any = new Error('Position not found');
    error.status = 404;
    throw error;
  }

  const applications = await prisma.application.findMany({
    where: { positionId },
    select: {
      currentInterviewStep: true,
      candidate: { select: { firstName: true, lastName: true } },
      interviews: { select: { score: true } }
    }
  });

  return applications.map(app => {
    const scores = app.interviews
      .map(i => i.score)
      .filter((s): s is number => typeof s === 'number');
    const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    return {
      full_name: `${app.candidate.firstName} ${app.candidate.lastName}`,
      current_interview_step: app.currentInterviewStep,
      average_score: average
    };
  });
};


