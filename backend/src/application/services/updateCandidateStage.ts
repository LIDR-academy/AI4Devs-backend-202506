import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Actualiza la etapa (currentInterviewStep) de la postulación activa de un candidato.
 * @param candidateId ID del candidato
 * @param interviewStepId Nuevo ID de la etapa (InterviewStep)
 * @param applicationId (opcional) ID de la postulación específica. Si no se provee, se actualiza la más reciente.
 */
export const updateCandidateStage = async (
  candidateId: number,
  interviewStepId: number,
  applicationId?: number
) => {
  // Buscar la postulación activa (o la más reciente) del candidato
  let application;
  if (applicationId) {
    application = await prisma.application.findUnique({
      where: { id: applicationId, candidateId },
    });
  } else {
    application = await prisma.application.findFirst({
      where: { candidateId },
      orderBy: { applicationDate: 'desc' },
    });
  }
  if (!application) return null;

  // Actualizar la etapa
  const updated = await prisma.application.update({
    where: { id: application.id },
    data: { currentInterviewStep: interviewStepId },
  });
  return updated;
};
