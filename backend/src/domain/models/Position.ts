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
    this.applicationDeadline = data.applicationDeadline
      ? new Date(data.applicationDeadline)
      : undefined;
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

  static async getCandidatesWithDetails(positionId: number) {
    const applications = await prisma.application.findMany({
      where: { positionId: positionId },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        interviewStep: {
          select: {
            id: true,
            name: true,
            orderIndex: true,
          },
        },
        interviews: {
          select: {
            score: true,
          },
        },
      },
    });

    return applications.map((app: any) => {
      // Calcular puntuación media
      const scores = app.interviews
        .map((interview: any) => interview.score)
        .filter((score: any) => score !== null && score !== undefined);

      const averageScore =
        scores.length > 0
          ? scores.reduce((sum: number, score: number) => sum + score, 0) /
            scores.length
          : null;

      return {
        candidateId: app.candidate.id,
        applicationId: app.id,
        fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
        currentInterviewStep: {
          id: app.interviewStep.id,
          name: app.interviewStep.name,
          orderIndex: app.interviewStep.orderIndex,
        },
        averageScore: averageScore ? Number(averageScore.toFixed(2)) : null,
        applicationDate: app.applicationDate,
      };
    });
  }
}
