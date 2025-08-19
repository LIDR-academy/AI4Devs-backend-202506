import { PrismaClient, Prisma } from '@prisma/client';
import { Education } from './Education';
import { WorkExperience } from './WorkExperience';
import { Resume } from './Resume';
import { Application } from './Application';

const prisma = new PrismaClient();

export class Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education: Education[];
  workExperience: WorkExperience[];
  resumes: Resume[];
  applications: Application[];

  constructor(data: any) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.education = data.education || [];
    this.workExperience = data.workExperience || [];
    this.resumes = data.resumes || [];
    this.applications = data.applications || [];
  }

  async save() {
    const candidateData: any = {};

    // Solo añadir al objeto candidateData los campos que no son undefined
    if (this.firstName !== undefined) candidateData.firstName = this.firstName;
    if (this.lastName !== undefined) candidateData.lastName = this.lastName;
    if (this.email !== undefined) candidateData.email = this.email;
    if (this.phone !== undefined) candidateData.phone = this.phone;
    if (this.address !== undefined) candidateData.address = this.address;

    // Añadir educations si hay alguna para añadir
    if (this.education.length > 0) {
      candidateData.educations = {
        create: this.education.map((edu) => ({
          institution: edu.institution,
          title: edu.title,
          startDate: edu.startDate,
          endDate: edu.endDate,
        })),
      };
    }

    // Añadir workExperiences si hay alguna para añadir
    if (this.workExperience.length > 0) {
      candidateData.workExperiences = {
        create: this.workExperience.map((exp) => ({
          company: exp.company,
          position: exp.position,
          description: exp.description,
          startDate: exp.startDate,
          endDate: exp.endDate,
        })),
      };
    }

    // Añadir resumes si hay alguno para añadir
    if (this.resumes.length > 0) {
      candidateData.resumes = {
        create: this.resumes.map((resume) => ({
          filePath: resume.filePath,
          fileType: resume.fileType,
        })),
      };
    }

    // Añadir applications si hay alguna para añadir
    if (this.applications.length > 0) {
      candidateData.applications = {
        create: this.applications.map((app) => ({
          positionId: app.positionId,
          candidateId: app.candidateId,
          applicationDate: app.applicationDate,
          currentInterviewStep: app.currentInterviewStep,
          notes: app.notes,
        })),
      };
    }

    if (this.id) {
      // Actualizar un candidato existente
      try {
        return await prisma.candidate.update({
          where: { id: this.id },
          data: candidateData,
        });
      } catch (error: any) {
        console.log(error);
        if (error.code === 'P1001') {
          // Database connection error
          throw new Error(
            'No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.',
          );
        } else if (error.code === 'P2025') {
          // Record not found error
          throw new Error(
            'No se pudo encontrar el registro del candidato con el ID proporcionado.',
          );
        } else {
          throw error;
        }
      }
    } else {
      // Crear un nuevo candidato
      try {
        const result = await prisma.candidate.create({
          data: candidateData,
        });
        return result;
      } catch (error: any) {
        if (error.code === 'P1001') {
          // Database connection error
          throw new Error(
            'No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.',
          );
        } else {
          throw error;
        }
      }
    }
  }

  static async findOne(id: number): Promise<Candidate | null> {
    const data = await prisma.candidate.findUnique({
      where: { id: id },
      include: {
        educations: true,
        workExperiences: true,
        resumes: true,
        applications: {
          include: {
            position: {
              select: {
                id: true,
                title: true,
              },
            },
            interviews: {
              select: {
                interviewDate: true,
                interviewStep: {
                  select: {
                    name: true,
                  },
                },
                notes: true,
                score: true,
              },
            },
          },
        },
      },
    });
    if (!data) return null;
    return new Candidate(data);
  }

  static async updateApplicationStage(
    candidateId: number,
    newInterviewStepId: number,
  ) {
    // Primero verificar que el candidato existe
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Verificar que el interview step existe
    const interviewStep = await prisma.interviewStep.findUnique({
      where: { id: newInterviewStepId },
    });

    if (!interviewStep) {
      throw new Error('Interview step not found');
    }

    // Buscar la aplicación más reciente del candidato para actualizar
    const application = await prisma.application.findFirst({
      where: { candidateId: candidateId },
      orderBy: { applicationDate: 'desc' },
    });

    if (!application) {
      throw new Error('No application found for this candidate');
    }

    // Actualizar la aplicación con el nuevo paso de entrevista
    const updatedApplication = await prisma.application.update({
      where: { id: application.id },
      data: { currentInterviewStep: newInterviewStepId },
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
        position: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return {
      applicationId: updatedApplication.id,
      candidateId: updatedApplication.candidateId,
      fullName: `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`,
      currentInterviewStep: {
        id: updatedApplication.interviewStep.id,
        name: updatedApplication.interviewStep.name,
        orderIndex: updatedApplication.interviewStep.orderIndex,
      },
      position: {
        id: updatedApplication.position.id,
        title: updatedApplication.position.title,
      },
      applicationDate: updatedApplication.applicationDate,
    };
  }
}
