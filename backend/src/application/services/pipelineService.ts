import { PrismaClient } from '@prisma/client';
import { CandidatePipelineDTO, CandidatePipelineResponse } from '../dtos/CandidatePipelineDTO';

export class PipelineService {
  private static prisma = new PrismaClient();

  /**
   * Get all candidates in the pipeline for a given position
   */
  static async getCandidatesForPosition(positionId: number): Promise<CandidatePipelineDTO[]> {
    try {
      const applications = await this.prisma.application.findMany({
        where: {
          positionId: positionId
        },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          interviews: {
            select: {
              id: true,
              score: true
            }
          }
        }
      });

      if (!applications || applications.length === 0) {
        throw new Error(`No applications found for position ${positionId}`);
      }

      const candidates: CandidatePipelineDTO[] = applications.map(app => {
        // Calculate average score from interviews
        const totalScore = app.interviews.reduce((sum, interview) => sum + (interview.score || 0), 0);
        const averageScore = app.interviews.length > 0 ? totalScore / app.interviews.length : 0;

        return {
          id: app.candidate.id,
          fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
          email: app.candidate.email,
          currentInterviewStep: this.getStageName(app.currentInterviewStep),
          averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
          applicationId: app.id,
          positionId: app.positionId,
          appliedDate: app.applicationDate,
          lastUpdated: app.applicationDate // Using applicationDate as lastUpdated since updatedAt doesn't exist
        };
      });

      return candidates;
    } catch (error) {
      console.error('Error in getCandidatesForPosition:', error);
      throw error;
    }
  }

  /**
   * Update the stage of a candidate in the pipeline
   */
  static async updateCandidateStage(candidateId: number, newStage: string): Promise<CandidatePipelineDTO> {
    try {
      // Find the application for this candidate
      const application = await this.prisma.application.findFirst({
        where: {
          candidateId: candidateId
        },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          interviews: {
            select: {
              id: true,
              score: true
            }
          }
        }
      });

      if (!application) {
        throw new Error(`Application not found for candidate ${candidateId}`);
      }

      // Convert stage name to stage number
      const stageNumber = this.getStageNumber(newStage);

      // Update the application with the new stage
      const updatedApplication = await this.prisma.application.update({
        where: {
          id: application.id
        },
        data: {
          currentInterviewStep: stageNumber
        },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          interviews: {
            select: {
              id: true,
              score: true
            }
          }
        }
      });

      // Calculate average score
      const totalScore = updatedApplication.interviews.reduce((sum, interview) => sum + (interview.score || 0), 0);
      const averageScore = updatedApplication.interviews.length > 0 ? totalScore / updatedApplication.interviews.length : 0;

      return {
        id: updatedApplication.candidate.id,
        fullName: `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`,
        email: updatedApplication.candidate.email,
        currentInterviewStep: this.getStageName(updatedApplication.currentInterviewStep),
        averageScore: Math.round(averageScore * 100) / 100,
        applicationId: updatedApplication.id,
        positionId: updatedApplication.positionId,
        appliedDate: updatedApplication.applicationDate,
        lastUpdated: updatedApplication.applicationDate
      };
    } catch (error) {
      console.error('Error in updateCandidateStage:', error);
      throw error;
    }
  }

  /**
   * Get available interview steps for a position
   */
  static async getInterviewStepsForPosition(positionId: number): Promise<string[]> {
    try {
      // In a real application, these steps might come from a configuration table
      // For now, we'll return a standard set of interview steps
      const standardSteps = [
        'Initial Review',
        'Phone Screen',
        'Technical Interview',
        'Final Interview',
        'Offer',
        'Hired',
        'Rejected'
      ];

      return standardSteps;
    } catch (error) {
      console.error('Error in getInterviewStepsForPosition:', error);
      throw error;
    }
  }

  /**
   * Get candidate by ID
   */
  static async getCandidateById(candidateId: number): Promise<CandidatePipelineDTO | null> {
    try {
      const application = await this.prisma.application.findFirst({
        where: {
          candidateId: candidateId
        },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          interviews: {
            select: {
              id: true,
              score: true
            }
          }
        }
      });

      if (!application) {
        return null;
      }

      // Calculate average score
      const totalScore = application.interviews.reduce((sum, interview) => sum + (interview.score || 0), 0);
      const averageScore = application.interviews.length > 0 ? totalScore / application.interviews.length : 0;

      return {
        id: application.candidate.id,
        fullName: `${application.candidate.firstName} ${application.candidate.lastName}`,
        email: application.candidate.email,
        currentInterviewStep: this.getStageName(application.currentInterviewStep),
        averageScore: Math.round(averageScore * 100) / 100,
        applicationId: application.id,
        positionId: application.positionId,
        appliedDate: application.applicationDate,
        lastUpdated: application.applicationDate
      };
    } catch (error) {
      console.error('Error in getCandidateById:', error);
      throw error;
    }
  }

  /**
   * Get pipeline analytics
   */
  static async getPipelineAnalytics(positionId?: number, timeRange: string = '30d'): Promise<any> {
    try {
      const timeRangeMap = {
        '7d': 7,
        '30d': 30,
        '90d': 90
      };

      const days = timeRangeMap[timeRange as keyof typeof timeRangeMap] || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const whereClause: any = {
        applicationDate: {
          gte: startDate
        }
      };

      if (positionId) {
        whereClause.positionId = positionId;
      }

      const applications = await this.prisma.application.findMany({
        where: whereClause,
        include: {
          candidate: true,
          interviews: true
        }
      });

      // Calculate analytics
      const totalApplications = applications.length;
      const stageDistribution = applications.reduce((acc, app) => {
        const stage = this.getStageName(app.currentInterviewStep);
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const averageTimeInStage = this.calculateAverageTimeInStage(applications);
      const conversionRates = this.calculateConversionRates(applications);

      return {
        totalApplications,
        stageDistribution,
        averageTimeInStage,
        conversionRates,
        timeRange,
        positionId,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getPipelineAnalytics:', error);
      throw error;
    }
  }

  /**
   * Convert stage number to stage name
   */
  private static getStageName(stageNumber: number): string {
    const stageMap: Record<number, string> = {
      1: 'Initial Review',
      2: 'Phone Screen',
      3: 'Technical Interview',
      4: 'Final Interview',
      5: 'Offer',
      6: 'Hired',
      7: 'Rejected'
    };
    return stageMap[stageNumber] || 'Unknown Stage';
  }

  /**
   * Convert stage name to stage number
   */
  private static getStageNumber(stageName: string): number {
    const stageMap: Record<string, number> = {
      'Initial Review': 1,
      'Phone Screen': 2,
      'Technical Interview': 3,
      'Final Interview': 4,
      'Offer': 5,
      'Hired': 6,
      'Rejected': 7
    };
    return stageMap[stageName] || 1;
  }

  /**
   * Calculate average time in each stage
   */
  private static calculateAverageTimeInStage(applications: any[]): Record<string, number> {
    const stageTimes: Record<string, number[]> = {};

    applications.forEach(app => {
      const stage = this.getStageName(app.currentInterviewStep);
      const timeInStage = (new Date().getTime() - new Date(app.applicationDate).getTime()) / (1000 * 60 * 60 * 24); // Days
      
      if (!stageTimes[stage]) {
        stageTimes[stage] = [];
      }
      stageTimes[stage].push(timeInStage);
    });

    const averages: Record<string, number> = {};
    Object.keys(stageTimes).forEach(stage => {
      const times = stageTimes[stage];
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      averages[stage] = Math.round(average * 100) / 100;
    });

    return averages;
  }

  /**
   * Calculate conversion rates between stages
   */
  private static calculateConversionRates(applications: any[]): Record<string, number> {
    const stages = ['Initial Review', 'Phone Screen', 'Technical Interview', 'Final Interview', 'Offer', 'Hired'];
    const rates: Record<string, number> = {};

    for (let i = 0; i < stages.length - 1; i++) {
      const currentStage = stages[i];
      const nextStage = stages[i + 1];

      const inCurrentStage = applications.filter(app => 
        this.getStageName(app.currentInterviewStep) === currentStage
      ).length;

      const movedToNextStage = applications.filter(app => 
        this.getStageName(app.currentInterviewStep) === nextStage
      ).length;

      const rate = inCurrentStage > 0 ? (movedToNextStage / inCurrentStage) * 100 : 0;
      rates[`${currentStage} → ${nextStage}`] = Math.round(rate * 100) / 100;
    }

    return rates;
  }
}
