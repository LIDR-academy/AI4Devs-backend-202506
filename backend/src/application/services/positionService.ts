import { prisma } from '../../lib/prisma';
import { CandidatePositionDTO, CandidatePositionResponseDTO } from '../../domain/dtos/CandidatePositionDTO';

type ApplicationWithRelations = {
    candidate: {
        id: number;
        firstName: string;
        lastName: string;
    };
    interviewStep: {
        name: string;
    };
    interviews: Array<{
        score: number | null;
    }>;
} & {
    [key: string]: any; // Para permitir propiedades adicionales que Prisma pueda incluir
}

export class PositionService {
    /**
     * Retrieves all candidates for a specific position with their interview progress and average scores
     * @param positionId The ID of the position to get candidates for
     * @returns A promise that resolves to the candidates and their interview information
     */
    async getCandidatesByPosition(positionId: number): Promise<CandidatePositionResponseDTO> {
        // First, verify if the position exists
        const position = await prisma.position.findUnique({
            where: { id: positionId }
        });

        if (!position) {
            throw new Error('Position not found');
        }

        // Get all applications for the position with related data
        const applications = await prisma.application.findMany({
            where: { positionId },
            include: {
                candidate: true,
                interviewStep: true,
                interviews: {
                    select: {
                        score: true
                    }
                }
            }
        });

        // Transform the data into the required format
        const candidates: CandidatePositionDTO[] = applications.map((app: ApplicationWithRelations) => {
            // Calculate average score
            const scores = app.interviews
                .map((interview: { score: number | null }) => interview.score)
                .filter((score: number | null): score is number => score !== null);
            
            const averageScore = scores.length > 0
                ? scores.reduce((acc: number, curr: number) => acc + curr, 0) / scores.length
                : null;

            return {
                id: app.candidate.id,
                fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
                currentInterviewStep: app.interviewStep.name,
                averageScore
            };
        });

        return {
            positionId,
            candidates
        };
    }
}
