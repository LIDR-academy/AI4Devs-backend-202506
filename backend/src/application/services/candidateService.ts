import { Candidate } from '../../domain/models/Candidate';
import { Application } from '../../domain/models/Application';
import { validateCandidateData } from '../validator';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';

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

interface StageUpdateData {
    newInterviewStepId: number;
    positionId: number;
    notes?: string;
}

interface StageTransitionResult {
    candidateId: number;
    fullName: string;
    previousStep: {
        stepId: number;
        stepName: string;
        orderIndex: number;
    };
    currentStep: {
        stepId: number;
        stepName: string;
        orderIndex: number;
    };
    positionId: number;
    positionTitle: string;
    updatedAt: Date;
}

const validateStageTransition = (currentOrderIndex: number, newOrderIndex: number): boolean => {
    // Solo se puede avanzar a la siguiente etapa
    return newOrderIndex === currentOrderIndex + 1;
};

export const updateInterviewStage = async (
    candidateId: number,
    stageData: StageUpdateData
): Promise<StageTransitionResult> => {
    try {
        // 1. Usar el modelo Application para obtener la información necesaria
        const currentApplicationData = await Application.findByCandidate(candidateId, stageData.positionId);

        if (!currentApplicationData) {
            throw new Error('Candidate application not found for the specified position');
        }

        // 2. Verificar que la nueva etapa pertenece al flujo de la posición
        const newStep = currentApplicationData.position.interviewFlow.interviewSteps.find(
            (step: any) => step.id === stageData.newInterviewStepId
        );

        if (!newStep) {
            throw new Error('New interview step does not belong to position interview flow');
        }

        // 3. Validar que la transición es permitida (solo avanzar una etapa) - LÓGICA DE NEGOCIO DEL SERVICIO
        const currentOrderIndex = currentApplicationData.interviewStep.orderIndex;
        const newOrderIndex = newStep.orderIndex;

        if (!validateStageTransition(currentOrderIndex, newOrderIndex)) {
            if (newOrderIndex <= currentOrderIndex) {
                throw new Error('Backward stage transitions are not allowed');
            } else {
                throw new Error('Cannot skip interview stages - only sequential progression allowed');
            }
        }

        // 4. Crear instancia del modelo y actualizar - DELEGANDO AL MODELO
        const application = new Application(currentApplicationData);
        const updatedApplication = await application.updateInterviewStage(
            stageData.newInterviewStepId, 
            stageData.notes
        );

        // 5. Log de auditoría - RESPONSABILIDAD DEL SERVICIO
        console.log(`[AUDIT] Stage transition for candidate ${candidateId}: ${currentApplicationData.interviewStep.name} (${currentOrderIndex}) → ${newStep.name} (${newOrderIndex})`);

        // 6. Preparar respuesta con información detallada - LÓGICA DE COORDINACIÓN
        const result: StageTransitionResult = {
            candidateId: candidateId,
            fullName: `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`,
            previousStep: {
                stepId: currentApplicationData.interviewStep.id,
                stepName: currentApplicationData.interviewStep.name,
                orderIndex: currentOrderIndex
            },
            currentStep: {
                stepId: newStep.id,
                stepName: newStep.name,
                orderIndex: newOrderIndex
            },
            positionId: stageData.positionId,
            positionTitle: updatedApplication.position.title,
            updatedAt: new Date()
        };

        return result;

    } catch (error: any) {
        // Manejo específico de errores de negocio
        if (error.message.includes('not found') || 
            error.message.includes('does not belong') ||
            error.message.includes('not allowed') ||
            error.message.includes('skip interview')) {
            throw error; // Re-lanzar errores de validación de negocio
        }
        
        // Manejo de errores de Prisma
        if (error.code === 'P2025') {
            throw new Error('Candidate or application not found');
        }
        
        console.error('Error updating interview stage:', error);
        throw new Error('Internal error updating interview stage');
    }
};
