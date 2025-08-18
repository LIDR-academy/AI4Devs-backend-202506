import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import { Application } from '../../domain/models/Application';
import { InterviewStep } from '../../domain/models/InterviewStep';
import { Position } from '../../domain/models/Position';
import { StageUpdateRequest, StageUpdateResponse } from '../../domain/models/ApplicationStage';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addCandidate = async (candidateData: any) => {
    try {
        validateCandidateData(candidateData); // Validar los datos del candidato
    } catch (error: any) {
        throw new Error(error);
    }

    const candidate = new Candidate(candidateData); // Crear una instancia del modelo Candidate
    try {
        const savedCandidate = await candidate.save(); // Guardar el candidato en la base de datos
        const candidateId = savedCandidate.id; // Obtener el ID del candidato guardado

        // Guardar la educación del candidato
        if (candidateData.educations) {
            for (const education of candidateData.educations) {
                const educationModel = new Education(education);
                educationModel.candidateId = candidateId;
                await educationModel.save();
                candidate.education.push(educationModel);
            }
        }

        // Guardar la experiencia laboral del candidato
        if (candidateData.workExperiences) {
            for (const experience of candidateData.workExperiences) {
                const experienceModel = new WorkExperience(experience);
                experienceModel.candidateId = candidateId;
                await experienceModel.save();
                candidate.workExperience.push(experienceModel);
            }
        }

        // Guardar los archivos de CV
        if (candidateData.cv && Object.keys(candidateData.cv).length > 0) {
            const resumeModel = new Resume(candidateData.cv);
            resumeModel.candidateId = candidateId;
            await resumeModel.save();
            candidate.resumes.push(resumeModel);
        }
        return savedCandidate;
    } catch (error: any) {
        if (error.code === 'P2002') {
            // Unique constraint failed on the fields: (`email`)
            throw new Error('The email already exists in the database');
        } else {
            throw error;
        }
    }
};

export const findCandidateById = async (id: number): Promise<Candidate | null> => {
    try {
        const candidate = await Candidate.findOne(id); // Cambio aquí: pasar directamente el id
        return candidate;
    } catch (error) {
        console.error('Error al buscar el candidato:', error);
        throw new Error('Error al recuperar el candidato');
    }
};

/**
 * Actualiza la etapa del proceso de entrevista de un candidato
 * @param candidateId - ID del candidato
 * @param stageUpdateData - Datos de la nueva etapa
 * @returns Información de la actualización o null si el candidato no existe
 */
export const updateCandidateStage = async (
    candidateId: number, 
    stageUpdateData: StageUpdateRequest
): Promise<StageUpdateResponse | null> => {
    try {
        // Paso 1: Verificar que el candidato existe
        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
            select: { id: true, firstName: true, lastName: true }
        });

        if (!candidate) {
            return null; // Candidato no existe
        }

        // Paso 2: Obtener la aplicación más reciente del candidato
        const activeApplication = await prisma.application.findFirst({
            where: { candidateId: candidateId },
            orderBy: { applicationDate: 'desc' },
            include: {
                position: {
                    select: { 
                        id: true, 
                        title: true, 
                        interviewFlowId: true 
                    }
                },
                interviewStep: {
                    select: {
                        id: true,
                        name: true,
                        orderIndex: true
                    }
                }
            }
        });

        if (!activeApplication) {
            throw new Error('NO_ACTIVE_APPLICATION');
        }

        // Paso 3: Validar que la nueva etapa sea válida para el flujo de la posición
        const newInterviewStep = await prisma.interviewStep.findFirst({
            where: {
                name: stageUpdateData.newStage,
                interviewFlowId: activeApplication.position.interviewFlowId
            },
            select: {
                id: true,
                name: true,
                orderIndex: true
            }
        });

        if (!newInterviewStep) {
            throw new Error('INVALID_STAGE');
        }

        // Paso 4: Realizar la actualización atómica
        const updatedApplication = await prisma.application.update({
            where: { id: activeApplication.id },
            data: {
                currentInterviewStep: newInterviewStep.id,
                notes: stageUpdateData.notes || activeApplication.notes
            },
            include: {
                position: {
                    select: { title: true }
                }
            }
        });

        // Paso 5: Estructurar la respuesta
        const response: StageUpdateResponse = {
            candidateId: candidate.id,
            applicationId: updatedApplication.id,
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            positionTitle: updatedApplication.position.title,
            previousStage: {
                id: activeApplication.interviewStep.id,
                name: activeApplication.interviewStep.name,
                orderIndex: activeApplication.interviewStep.orderIndex
            },
            currentStage: {
                id: newInterviewStep.id,
                name: newInterviewStep.name,
                orderIndex: newInterviewStep.orderIndex
            },
            updatedAt: new Date().toISOString(),
            notes: stageUpdateData.notes
        };

        return response;

    } catch (error: any) {
        console.error('Error en updateCandidateStage:', error);
        
        // Re-lanzar errores específicos de negocio
        if (error.message === 'NO_ACTIVE_APPLICATION' || error.message === 'INVALID_STAGE') {
            throw error;
        }
        
        // Para otros errores, lanzar error genérico
        throw new Error('Error al actualizar la etapa del candidato');
    }
};
