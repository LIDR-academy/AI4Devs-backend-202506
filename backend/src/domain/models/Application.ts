import { PrismaClient } from '@prisma/client';
import { Interview } from './Interview';

const prisma = new PrismaClient();

export class Application {
    id?: number;
    positionId: number;
    candidateId: number;
    applicationDate: Date;
    currentInterviewStep: number;
    notes?: string;
    interviews: Interview[]; // Added this line

    constructor(data: any) {
        this.id = data.id;
        this.positionId = data.positionId;
        this.candidateId = data.candidateId;
        this.applicationDate = new Date(data.applicationDate);
        this.currentInterviewStep = data.currentInterviewStep;
        this.notes = data.notes;
        this.interviews = data.interviews || []; // Added this line
    }

    async save() {
        const applicationData: any = {
            positionId: this.positionId,
            candidateId: this.candidateId,
            applicationDate: this.applicationDate,
            currentInterviewStep: this.currentInterviewStep,
            notes: this.notes,
        };

        if (this.id) {
            return await prisma.application.update({
                where: { id: this.id },
                data: applicationData,
            });
        } else {
            return await prisma.application.create({
                data: applicationData,
            });
        }
    }

    static async findOne(id: number): Promise<Application | null> {
        const data = await prisma.application.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new Application(data);
    }

    /**
     * Obtiene todas las aplicaciones de una posición con candidatos y entrevistas
     * @param positionId - ID de la posición
     * @returns Array de aplicaciones con datos de candidatos y entrevistas
     */
    static async getApplicationsWithCandidates(positionId: number): Promise<Array<{
        id: number;
        candidateId: number;
        candidate: {
            id: number;
            firstName: string;
            lastName: string;
        };
        interviews: Array<{
            id: number;
            interviewStepId: number;
            interviewDate: Date;
            score: number | null;
            interviewStep: {
                id: number;
                name: string;
                orderIndex: number;
            };
        }>;
        averageScore: number;
        lastInterviewStepId: number | null;
    }>> {
        const applications = await prisma.application.findMany({
            where: { positionId: positionId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                interviews: {
                    include: {
                        interviewStep: {
                            select: {
                                id: true,
                                name: true,
                                orderIndex: true
                            }
                        }
                    },
                    orderBy: { interviewDate: 'desc' }
                }
            }
        });

        return applications.map(app => {
            // Calcular score promedio
            const scores = app.interviews
                .filter(interview => interview.score !== null)
                .map(interview => interview.score as number);
            
            const averageScore = scores.length > 0 
                ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
                : 0;

            // Obtener última entrevista
            const lastInterview = app.interviews.length > 0 ? app.interviews[0] : null;

            return {
                id: app.id!,
                candidateId: app.candidateId,
                candidate: app.candidate,
                interviews: app.interviews.map(interview => ({
                    id: interview.id!,
                    interviewStepId: interview.interviewStepId,
                    interviewDate: interview.interviewDate,
                    score: interview.score,
                    interviewStep: interview.interviewStep
                })),
                averageScore: averageScore,
                lastInterviewStepId: lastInterview?.interviewStepId || null
            };
        });
    }

    /**
     * Calcula el score promedio de todas las entrevistas de una aplicación
     * @param applicationId - ID de la aplicación
     * @returns Score promedio (0-5)
     */
    static async calculateAverageScore(applicationId: number): Promise<number> {
        const interviews = await prisma.interview.findMany({
            where: { 
                applicationId: applicationId,
                score: { not: null }
            },
            select: { score: true }
        });

        if (interviews.length === 0) {
            return 0;
        }

        const totalScore = interviews.reduce((sum, interview) => sum + (interview.score || 0), 0);
        const average = totalScore / interviews.length;
        
        // Redondear a 1 decimal
        return Math.round(average * 10) / 10;
    }

    /**
     * Obtiene la última entrevista (más reciente) de una aplicación
     * @param applicationId - ID de la aplicación
     * @returns Última entrevista o null si no tiene entrevistas
     */
    static async getLastInterview(applicationId: number): Promise<{
        id: number;
        interviewStepId: number;
        interviewDate: Date;
        score: number | null;
    } | null> {
        const lastInterview = await prisma.interview.findFirst({
            where: { applicationId: applicationId },
            orderBy: { interviewDate: 'desc' },
            select: {
                id: true,
                interviewStepId: true,
                interviewDate: true,
                score: true
            }
        });

        return lastInterview;
    }
}
