import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InterviewStep {
    id?: number;
    interviewFlowId: number;
    interviewTypeId: number;
    name: string;
    orderIndex: number;

    constructor(data: any) {
        this.id = data.id;
        this.interviewFlowId = data.interviewFlowId;
        this.interviewTypeId = data.interviewTypeId;
        this.name = data.name;
        this.orderIndex = data.orderIndex;
    }

    async save() {
        const interviewStepData: any = {
            interviewFlowId: this.interviewFlowId,
            interviewTypeId: this.interviewTypeId,
            name: this.name,
            orderIndex: this.orderIndex,
        };

        if (this.id) {
            return await prisma.interviewStep.update({
                where: { id: this.id },
                data: interviewStepData,
            });
        } else {
            return await prisma.interviewStep.create({
                data: interviewStepData,
            });
        }
    }

    static async findOne(id: number): Promise<InterviewStep | null> {
        const data = await prisma.interviewStep.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new InterviewStep(data);
    }

    /**
     * Encuentra todos los InterviewSteps de un InterviewFlow específico
     * @param interviewFlowId - ID del InterviewFlow
     * @returns Array de InterviewSteps ordenados por orderIndex
     */
    static async findByInterviewFlow(interviewFlowId: number): Promise<InterviewStep[]> {
        const stepsData = await prisma.interviewStep.findMany({
            where: { interviewFlowId: interviewFlowId },
            orderBy: { orderIndex: 'asc' },
            include: {
                interviewType: {
                    select: {
                        name: true,
                        description: true
                    }
                }
            }
        });

        return stepsData.map(data => new InterviewStep(data));
    }

    /**
     * Valida que existan InterviewSteps para un InterviewFlow
     * @param interviewFlowId - ID del InterviewFlow
     * @returns true si existen pasos, false en caso contrario
     */
    static async hasStepsForFlow(interviewFlowId: number): Promise<boolean> {
        const count = await prisma.interviewStep.count({
            where: { interviewFlowId: interviewFlowId }
        });
        return count > 0;
    }
}

