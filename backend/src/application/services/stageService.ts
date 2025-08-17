import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type UpdatedApplicationStage = {
  applicationId: number;
  candidateId: number;
  positionId: number;
  currentInterviewStep: number;
};

export const setCandidateStage = async (
  candidateId: number,
  positionId: number,
  toStepId: number
): Promise<UpdatedApplicationStage> => {
  const application = await prisma.application.findFirst({
    where: { candidateId, positionId },
    select: {
      id: true,
      positionId: true,
      candidateId: true,
      position: { select: { interviewFlowId: true } }
    }
  });

  if (!application) {
    const error: any = new Error('Application not found for candidate and position');
    error.status = 404;
    throw error;
  }

  const step = await prisma.interviewStep.findUnique({
    where: { id: toStepId },
    select: { id: true, interviewFlowId: true }
  });

  if (!step) {
    const error: any = new Error('Interview step not found');
    error.status = 400;
    throw error;
  }

  if (step.interviewFlowId !== application.position.interviewFlowId) {
    const error: any = new Error("Step does not belong to the position's interview flow");
    error.status = 400;
    throw error;
  }

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: { currentInterviewStep: toStepId },
    select: { id: true, candidateId: true, positionId: true, currentInterviewStep: true }
  });

  return {
    applicationId: updated.id,
    candidateId: updated.candidateId,
    positionId: updated.positionId,
    currentInterviewStep: updated.currentInterviewStep
  };
};


