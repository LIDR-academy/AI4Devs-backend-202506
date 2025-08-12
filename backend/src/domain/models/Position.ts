import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Position {
    id?: number;
    companyId: number;
    interviewFlowId: number;
    title: string;
    description: string;
    status: string;
    isVisible: boolean;
    location: string;
    jobDescription: string;
    requirements?: string;
    responsibilities?: string;
    salaryMin?: number;
    salaryMax?: number;
    employmentType?: string;
    benefits?: string;
    companyDescription?: string;
    applicationDeadline?: Date;
    contactInfo?: string;

    constructor(data: any) {
        this.id = data.id;
        this.companyId = data.companyId;
        this.interviewFlowId = data.interviewFlowId;
        this.title = data.title;
        this.description = data.description;
        this.status = data.status ?? 'Draft';
        this.isVisible = data.isVisible ?? false;
        this.location = data.location;
        this.jobDescription = data.jobDescription;
        this.requirements = data.requirements;
        this.responsibilities = data.responsibilities;
        this.salaryMin = data.salaryMin;
        this.salaryMax = data.salaryMax;
        this.employmentType = data.employmentType;
        this.benefits = data.benefits;
        this.companyDescription = data.companyDescription;
        this.applicationDeadline = data.applicationDeadline ? new Date(data.applicationDeadline) : undefined;
        this.contactInfo = data.contactInfo;
    }

    async save() {
        const positionData: any = {
            companyId: this.companyId,
            interviewFlowId: this.interviewFlowId,
            title: this.title,
            description: this.description,
            status: this.status,
            isVisible: this.isVisible,
            location: this.location,
            jobDescription: this.jobDescription,
            requirements: this.requirements,
            responsibilities: this.responsibilities,
            salaryMin: this.salaryMin,
            salaryMax: this.salaryMax,
            employmentType: this.employmentType,
            benefits: this.benefits,
            companyDescription: this.companyDescription,
            applicationDeadline: this.applicationDeadline,
            contactInfo: this.contactInfo,
        };

        if (this.id) {
            return await prisma.position.update({
                where: { id: this.id },
                data: positionData,
            });
        } else {
            return await prisma.position.create({
                data: positionData,
            });
        }
    }

    static async findOne(id: number): Promise<Position | null> {
        const data = await prisma.position.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new Position(data);
    }

    static async findActivePositions(page: number = 1, limit: number = 10): Promise<{
        positions: Position[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const skip = (page - 1) * limit;
        
        // Obtener total de posiciones activas
        const total = await prisma.position.count({
            where: {
                status: 'Open',
                isVisible: true
            }
        });

        // Obtener posiciones activas con paginación
        const positionsData = await prisma.position.findMany({
            where: {
                status: 'Open',
                isVisible: true
            },
            include: {
                company: {
                    select: {
                        name: true
                    }
                }
            },
            skip: skip,
            take: limit,
            orderBy: {
                id: 'desc'
            }
        });

        const positions = positionsData.map(data => new Position(data));
        const totalPages = Math.ceil(total / limit);

        return {
            positions,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    /**
     * Obtiene los datos completos del Kanban para una posición específica
     * @param positionId - ID de la posición
     * @returns Datos del Kanban incluyendo posición, columnas y candidatos
     */
    static async getKanbanData(positionId: number): Promise<{
        position: {
            id: number;
            title: string;
            company: { name: string };
        };
        columns: Array<{
            id: number | 'application';
            name: string;
            orderIndex: number;
            candidates: Array<{
                applicationId: number;
                candidateId: number;
                candidateName: string;
                firstName: string;
                lastName: string;
                averageScore: number;
                lastInterviewDate?: Date;
            }>;
        }>;
    }> {
        // 1. Obtener información básica de la posición
        const positionData = await prisma.position.findUnique({
            where: { id: positionId },
            include: {
                company: {
                    select: { name: true }
                },
                interviewFlow: {
                    include: {
                        interviewSteps: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    }
                }
            }
        });

        if (!positionData) {
            throw new Error('Posición no encontrada');
        }

        // 2. Obtener todas las aplicaciones con candidatos y sus entrevistas
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
                        interviewStep: true
                    },
                    orderBy: { interviewDate: 'desc' }
                }
            }
        });

        // 3. Crear columna "Revisión" (siempre primera)
        const applicationColumn = {
            id: 'application' as const,
            name: 'Revisión',
            orderIndex: 0,
            candidates: [] as any[]
        };

        // 4. Crear columnas dinámicas basadas en InterviewSteps
        const interviewColumns = positionData.interviewFlow?.interviewSteps.map(step => ({
            id: step.id,
            name: step.name,
            orderIndex: step.orderIndex + 1, // +1 porque "Aplicación" es orden 0
            candidates: [] as any[]
        })) || [];

        const allColumns = [applicationColumn, ...interviewColumns];

        // 5. Procesar cada aplicación y ubicar candidatos en columnas
        for (const app of applications) {
            // Calcular score promedio
            const scores = app.interviews
                .filter(interview => interview.score !== null)
                .map(interview => interview.score as number);
            const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

            // Determinar la última entrevista (más reciente)
            const lastInterview = app.interviews.length > 0 ? app.interviews[0] : null;

            const candidateData = {
                applicationId: app.id!,
                candidateId: app.candidate.id,
                candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
                firstName: app.candidate.firstName,
                lastName: app.candidate.lastName,
                averageScore: Math.round(averageScore * 10) / 10, // Redondear a 1 decimal
                lastInterviewDate: lastInterview?.interviewDate
            };

            // Ubicar candidato en la columna correspondiente
            if (!lastInterview) {
                // Candidato sin entrevistas va a "Revisión"
                applicationColumn.candidates.push(candidateData);
            } else {
                // Candidato va a la columna de su última entrevista
                const targetColumn = interviewColumns.find(col => col.id === lastInterview.interviewStepId);
                if (targetColumn) {
                    targetColumn.candidates.push(candidateData);
                } else {
                    // Fallback: si no encuentra la columna, va a "Revisión"
                    applicationColumn.candidates.push(candidateData);
                }
            }
        }

        return {
            position: {
                id: positionData.id,
                title: positionData.title,
                company: { name: positionData.company.name }
            },
            columns: allColumns
        };
    }

    /**
     * Valida que una posición tenga InterviewFlow e InterviewSteps configurados
     * @param positionId - ID de la posición a validar
     * @returns true si tiene configuración válida, false en caso contrario
     */
    static async validateInterviewFlow(positionId: number): Promise<boolean> {
        const position = await prisma.position.findUnique({
            where: { id: positionId },
            include: {
                interviewFlow: {
                    include: {
                        interviewSteps: true
                    }
                }
            }
        });

        if (!position) {
            return false;
        }

        // Verificar que tenga InterviewFlow y al menos un InterviewStep
        return !!(position.interviewFlowId && 
                 position.interviewFlow && 
                 position.interviewFlow.interviewSteps && 
                 position.interviewFlow.interviewSteps.length > 0);
    }
}

