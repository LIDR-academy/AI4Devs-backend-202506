import { PrismaClient } from '@prisma/client';
import { monitoringService } from './monitoringService';
import { cacheService, Cached, CachedWithTags } from './cacheService';

const prisma = new PrismaClient();

export interface RecruitmentMetrics {
  totalCandidates: number;
  newCandidates: number;
  activeApplications: number;
  averageTimeToHire: number;
  conversionRate: number;
  topSources: Array<{ source: string; count: number }>;
  stageDistribution: Record<string, number>;
}

export interface PipelineAnalytics {
  totalApplications: number;
  stageDistribution: Record<string, number>;
  averageTimeInStage: Record<string, number>;
  conversionRates: Record<string, number>;
  bottleneckStages: string[];
  throughput: number;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  activeUsers: number;
  systemHealth: {
    cpu: number;
    memory: number;
    database: number;
  };
}

export interface BusinessIntelligence {
  trends: Array<{ metric: string; value: number; change: number }>;
  predictions: Array<{ metric: string; predictedValue: number; confidence: number }>;
  insights: string[];
  recommendations: string[];
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  @Cached(300000) // 5 minutes
  async getRecruitmentMetrics(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<RecruitmentMetrics> {
    const { startDate, endDate } = this.getTimeRange(timeRange);

    const [
      totalCandidates,
      newCandidates,
      activeApplications,
      stageDistribution
    ] = await Promise.all([
      this.getTotalCandidates(),
      this.getNewCandidates(startDate, endDate),
      this.getActiveApplications(),
      this.getStageDistribution()
    ]);

    const averageTimeToHire = await this.calculateAverageTimeToHire(startDate, endDate);
    const conversionRate = await this.calculateConversionRate(startDate, endDate);
    const topSources = await this.getTopSources(startDate, endDate);

    return {
      totalCandidates,
      newCandidates,
      activeApplications,
      averageTimeToHire,
      conversionRate,
      topSources,
      stageDistribution
    };
  }

  @Cached(300000)
  async getPipelineAnalytics(positionId?: number): Promise<PipelineAnalytics> {
    const applications = await this.getApplicationsForAnalytics(positionId);
    
    const stageDistribution = this.calculateStageDistribution(applications);
    const averageTimeInStage = this.calculateAverageTimeInStage(applications);
    const conversionRates = this.calculateConversionRates(applications);
    const bottleneckStages = this.identifyBottlenecks(averageTimeInStage);
    const throughput = this.calculateThroughput(applications);

    return {
      totalApplications: applications.length,
      stageDistribution,
      averageTimeInStage,
      conversionRates,
      bottleneckStages,
      throughput
    };
  }

  @Cached(300000)
  async getPerformanceMetrics(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<PerformanceMetrics> {
    const systemPerformance = monitoringService.getPerformanceAnalytics(timeRange);
    const systemHealth = await this.getSystemHealth();

    return {
      averageResponseTime: systemPerformance.averageResponseTime,
      requestsPerSecond: systemPerformance.requestsPerSecond,
      errorRate: systemPerformance.errorRate,
      activeUsers: await this.getActiveUsers(),
      systemHealth
    };
  }

  @Cached(600000) // 10 minutes
  async getBusinessIntelligence(): Promise<BusinessIntelligence> {
    const trends = await this.calculateTrends();
    const predictions = await this.generatePredictions();
    const insights = await this.generateInsights();
    const recommendations = await this.generateRecommendations();

    return {
      trends,
      predictions,
      insights,
      recommendations
    };
  }

  @Cached(60000) // 1 minute
  async getDashboardData(): Promise<any> {
    const [
      recruitmentMetrics,
      pipelineAnalytics,
      performanceMetrics,
      businessIntelligence
    ] = await Promise.all([
      this.getRecruitmentMetrics('30d'),
      this.getPipelineAnalytics(),
      this.getPerformanceMetrics('30d'),
      this.getBusinessIntelligence()
    ]);

    return {
      recruitment: recruitmentMetrics,
      pipeline: pipelineAnalytics,
      performance: performanceMetrics,
      intelligence: businessIntelligence,
      lastUpdated: new Date().toISOString()
    };
  }

  @Cached(300000)
  async exportAnalytics(startDate: Date, endDate: Date, format: 'json' | 'csv' = 'json'): Promise<any> {
    const data = await this.getAnalyticsForExport(startDate, endDate);
    
    if (format === 'csv') {
      return this.convertToCSV(data);
    }
    
    return data;
  }

  // Private helper methods
  private getTimeRange(timeRange: '7d' | '30d' | '90d'): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }
    
    return { startDate, endDate };
  }

  private async getTotalCandidates(): Promise<number> {
    return await prisma.candidate.count();
  }

  private async getNewCandidates(startDate: Date, endDate: Date): Promise<number> {
    return await prisma.application.count({
      where: {
        applicationDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async getActiveApplications(): Promise<number> {
    return await prisma.application.count({
      where: {
        currentInterviewStep: {
          not: 6 // Not hired
        }
      }
    });
  }

  private async getStageDistribution(): Promise<Record<string, number>> {
    const applications = await prisma.application.groupBy({
      by: ['currentInterviewStep'],
      _count: {
        currentInterviewStep: true
      }
    });

    const distribution: Record<string, number> = {};
    applications.forEach(app => {
      const stageName = this.getStageName(app.currentInterviewStep);
      distribution[stageName] = app._count.currentInterviewStep;
    });

    return distribution;
  }

  private async calculateAverageTimeToHire(startDate: Date, endDate: Date): Promise<number> {
    const hiredApplications = await prisma.application.findMany({
      where: {
        currentInterviewStep: 6, // Hired
        applicationDate: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        applicationDate: true
      }
    });

    if (hiredApplications.length === 0) return 0;

    const totalDays = hiredApplications.reduce((sum, app) => {
      const days = (endDate.getTime() - app.applicationDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);

    return Math.round(totalDays / hiredApplications.length);
  }

  private async calculateConversionRate(startDate: Date, endDate: Date): Promise<number> {
    const [totalApplications, hiredApplications] = await Promise.all([
      prisma.application.count({
        where: {
          applicationDate: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.application.count({
        where: {
          currentInterviewStep: 6, // Hired
          applicationDate: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    ]);

    return totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0;
  }

  private async getTopSources(startDate: Date, endDate: Date): Promise<Array<{ source: string; count: number }>> {
    // This would typically query a source tracking table
    // For now, return mock data
    return [
      { source: 'LinkedIn', count: 45 },
      { source: 'Indeed', count: 32 },
      { source: 'Company Website', count: 28 },
      { source: 'Referral', count: 15 }
    ];
  }

  private async getApplicationsForAnalytics(positionId?: number): Promise<any[]> {
    const whereClause: any = {};
    if (positionId) {
      whereClause.positionId = positionId;
    }

    return await prisma.application.findMany({
      where: whereClause,
      include: {
        candidate: true,
        interviews: true
      }
    });
  }

  private calculateStageDistribution(applications: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    applications.forEach(app => {
      const stageName = this.getStageName(app.currentInterviewStep);
      distribution[stageName] = (distribution[stageName] || 0) + 1;
    });

    return distribution;
  }

  private calculateAverageTimeInStage(applications: any[]): Record<string, number> {
    const stageTimes: Record<string, number[]> = {};

    applications.forEach(app => {
      const stageName = this.getStageName(app.currentInterviewStep);
      const timeInStage = (new Date().getTime() - app.applicationDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (!stageTimes[stageName]) {
        stageTimes[stageName] = [];
      }
      stageTimes[stageName].push(timeInStage);
    });

    const averages: Record<string, number> = {};
    Object.keys(stageTimes).forEach(stage => {
      const times = stageTimes[stage];
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      averages[stage] = Math.round(average * 100) / 100;
    });

    return averages;
  }

  private calculateConversionRates(applications: any[]): Record<string, number> {
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

  private identifyBottlenecks(averageTimeInStage: Record<string, number>): string[] {
    const threshold = 7; // 7 days
    return Object.entries(averageTimeInStage)
      .filter(([, time]) => time > threshold)
      .map(([stage]) => stage);
  }

  private calculateThroughput(applications: any[]): number {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentApplications = applications.filter(app => 
      app.applicationDate >= last30Days
    );

    return recentApplications.length;
  }

  private async getSystemHealth(): Promise<{ cpu: number; memory: number; database: number }> {
    // This would typically query system metrics
    // For now, return mock data
    return {
      cpu: 45,
      memory: 62,
      database: 78
    };
  }

  private async getActiveUsers(): Promise<number> {
    // This would typically query user activity logs
    // For now, return mock data
    return 25;
  }

  private async calculateTrends(): Promise<Array<{ metric: string; value: number; change: number }>> {
    // This would typically calculate trends over time
    // For now, return mock data
    return [
      { metric: 'Applications', value: 150, change: 12.5 },
      { metric: 'Hires', value: 8, change: -5.2 },
      { metric: 'Time to Hire', value: 18, change: -8.3 }
    ];
  }

  private async generatePredictions(): Promise<Array<{ metric: string; predictedValue: number; confidence: number }>> {
    // This would typically use ML models for predictions
    // For now, return mock data
    return [
      { metric: 'Next Month Applications', predictedValue: 165, confidence: 0.85 },
      { metric: 'Next Month Hires', predictedValue: 10, confidence: 0.72 },
      { metric: 'Q2 Conversion Rate', predictedValue: 15.2, confidence: 0.68 }
    ];
  }

  private async generateInsights(): Promise<string[]> {
    return [
      'Phone screen stage has the highest drop-off rate (45%)',
      'Technical interviews take 3.2 days longer than industry average',
      'LinkedIn campaigns show 23% higher conversion than other sources'
    ];
  }

  private async generateRecommendations(): Promise<string[]> {
    return [
      'Implement automated scheduling for technical interviews',
      'Add more detailed feedback forms for phone screens',
      'Increase LinkedIn advertising budget by 15%'
    ];
  }

  private async getAnalyticsForExport(startDate: Date, endDate: Date): Promise<any> {
    const applications = await prisma.application.findMany({
      where: {
        applicationDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        candidate: true,
        interviews: true
      }
    });

    return applications.map(app => ({
      candidateId: app.candidateId,
      candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      applicationDate: app.applicationDate,
      currentStage: this.getStageName(app.currentInterviewStep),
      interviewCount: app.interviews.length,
      averageScore: app.interviews.length > 0 
        ? app.interviews.reduce((sum, int) => sum + (int.score || 0), 0) / app.interviews.length 
        : 0
    }));
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ];
    
    return csvRows.join('\n');
  }

  private getStageName(stageNumber: number): string {
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
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();
