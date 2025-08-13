import { Request, Response } from 'express';

type ApplicationItem = {
  id: number;
  currentInterviewStep: number;
  candidate: { id: number; firstName: string; lastName: string };
  interviews: { score: number | null }[];
};

export const getCandidatesByPositionId = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const positionId = Number(rawId);

    if (!rawId || isNaN(positionId) || positionId <= 0) {
      return res.status(400).json({ message: 'Invalid position id' });
    }

    const position = await req.prisma.position.findUnique({
      where: { id: positionId },
      select: { id: true },
    });

    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }

    const applications = await req.prisma.application.findMany({
      where: { positionId },
      select: {
        id: true,
        currentInterviewStep: true,
        candidate: { select: { id: true, firstName: true, lastName: true } },
        interviews: { select: { score: true } },
      },
      orderBy: { id: 'asc' },
    }) as unknown as ApplicationItem[];

    const data = applications.map((app: ApplicationItem) => {
      const scores: number[] = app.interviews
        .map((i: { score: number | null }) => i.score)
        .filter((s: number | null): s is number => typeof s === 'number');
      const average: number | null = scores.length > 0
        ? Number((scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length).toFixed(2))
        : null;

      return {
        application_id: app.id,
        candidate_id: app.candidate.id,
        full_name: `${app.candidate.firstName} ${app.candidate.lastName}`.trim(),
        current_interview_step: app.currentInterviewStep,
        average_score: average,
      };
    });

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}; 