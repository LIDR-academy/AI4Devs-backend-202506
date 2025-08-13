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

    static async findByCandidate(candidateId: number, positionId: number) {
        const data = await prisma.application.findFirst({
            where: {
                candidateId: candidateId,
                positionId: positionId
            },
            include: {
                candidate: true,
                position: {
                    include: {
                        interviewFlow: {
                            include: {
                                interviewSteps: {
                                    include: {
                                        interviewType: true
                                    }
                                }
                            }
                        }
                    }
                },
                interviewStep: {
                    include: {
                        interviewType: true
                    }
                }
            }
        });
        
        return data; // Retornamos datos raw con relaciones para validaciones
    }

    async updateInterviewStage(newInterviewStepId: number, notes?: string) {
        this.currentInterviewStep = newInterviewStepId;
        if (notes !== undefined) {
            this.notes = notes;
        }

        return await prisma.$transaction(async (tx) => {
            const updated = await tx.application.update({
                where: { id: this.id },
                data: {
                    currentInterviewStep: this.currentInterviewStep,
                    notes: this.notes
                },
                include: {
                    candidate: true,
                    position: true,
                    interviewStep: {
                        include: {
                            interviewType: true
                        }
                    }
                }
            });

            return updated;
        });
    }
}
