import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
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

export const updateCandidateStage = async (candidateId: number, stageId: number) => {
    try {
        // Verificar que el candidato existe
        const candidate = await Candidate.findOne(candidateId);
        if (!candidate) {
            throw new Error('Candidate not found');
        }

        // Verificar que la etapa existe
        const stage = await prisma.interviewStep.findUnique({
            where: { id: stageId }
        });
        if (!stage) {
            throw new Error('Invalid stage ID');
        }

        // Buscar la aplicación activa del candidato (asumiendo que solo puede tener una aplicación activa por posición)
        const application = await prisma.application.findFirst({
            where: { candidateId },
            orderBy: { applicationDate: 'desc' }
        });

        if (!application) {
            throw new Error('No active application found for this candidate');
        }

        // Actualizar la etapa actual de la aplicación
        const updatedApplication = await prisma.application.update({
            where: { id: application.id },
            data: { currentInterviewStep: stageId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                interviewStep: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return {
            candidate_id: updatedApplication.candidate.id,
            candidate_name: `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`,
            application_id: updatedApplication.id,
            previous_stage: application.currentInterviewStep,
            new_stage: stageId,
            stage_name: updatedApplication.interviewStep.name
        };
    } catch (error) {
        console.error('Error updating candidate stage:', error);
        throw error;
    }
};
