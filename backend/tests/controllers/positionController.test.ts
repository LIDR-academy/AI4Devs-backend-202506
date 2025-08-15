import request from 'supertest';
import { app } from '../../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Position Controller Integration Tests', () => {
  let testPositionId: number;
  let testCandidateId: number;
  let testApplicationId: number;
  let testCompany: any;
  let testInterviewFlow: any;
  let newStageId: number;

  beforeAll(async () => {
    // Setup test data
    // Create a test company
    testCompany = await prisma.company.create({
      data: {
        name: 'Test Company Kanban'
      }
    });

    // Create a test interview flow
    testInterviewFlow = await prisma.interviewFlow.create({
      data: {
        description: 'Test Flow for Kanban'
      }
    });

    // Create interview type
    const testInterviewType = await prisma.interviewType.create({
      data: {
        name: 'Technical',
        description: 'Technical Interview'
      }
    });

    // Create interview steps
    const step1 = await prisma.interviewStep.create({
      data: {
        name: 'Initial Screening',
        orderIndex: 1,
        interviewFlowId: testInterviewFlow.id,
        interviewTypeId: testInterviewType.id
      }
    });

    const step2 = await prisma.interviewStep.create({
      data: {
        name: 'Technical Interview',
        orderIndex: 2,
        interviewFlowId: testInterviewFlow.id,
        interviewTypeId: testInterviewType.id
      }
    });

    // Create a test position
    const testPosition = await prisma.position.create({
      data: {
        title: 'Test Senior Developer',
        description: 'Test position for kanban',
        status: 'Published',
        location: 'Remote',
        jobDescription: 'Test job description',
        companyId: testCompany.id,
        interviewFlowId: testInterviewFlow.id
      }
    });
    testPositionId = testPosition.id;

    // Create a test candidate
    const testCandidate = await prisma.candidate.create({
      data: {
        firstName: 'Test',
        lastName: 'Candidate',
        email: 'test.candidate.kanban@test.com',
        phone: '+1234567890',
        address: 'Test Address'
      }
    });
    testCandidateId = testCandidate.id;

    // Create an application
    const testApplication = await prisma.application.create({
      data: {
        positionId: testPositionId,
        candidateId: testCandidateId,
        applicationDate: new Date(),
        currentInterviewStep: step1.id,
        notes: 'Test application for kanban'
      }
    });
    testApplicationId = testApplication.id;

    // Create some interviews with scores
    await prisma.interview.create({
      data: {
        applicationId: testApplicationId,
        interviewStepId: step1.id,
        employeeId: 1, // Assuming there's an employee with ID 1
        interviewDate: new Date(),
        result: 'Passed',
        score: 85,
        notes: 'Good performance'
      }
    });

    await prisma.interview.create({
      data: {
        applicationId: testApplicationId,
        interviewStepId: step1.id,
        employeeId: 1,
        interviewDate: new Date(),
        result: 'Passed',
        score: 90,
        notes: 'Excellent performance'
      }
    });

    // Initialize newStageId for stage update tests
    newStageId = step2.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.interview.deleteMany({
      where: { applicationId: testApplicationId }
    });
    
    await prisma.application.deleteMany({
      where: { id: testApplicationId }
    });
    
    await prisma.candidate.deleteMany({
      where: { id: testCandidateId }
    });
    
    await prisma.position.deleteMany({
      where: { id: testPositionId }
    });
    
    await prisma.interviewStep.deleteMany({
      where: { interviewFlowId: { in: [testInterviewFlow.id] } }
    });
    
    await prisma.interviewFlow.deleteMany({
      where: { description: 'Test Flow for Kanban' }
    });
    
    await prisma.interviewType.deleteMany({
      where: { name: 'Technical' }
    });
    
    await prisma.company.deleteMany({
      where: { name: 'Test Company Kanban' }
    });

    await prisma.$disconnect();
  });

  describe('GET /positions/:id/candidates', () => {
    it('should return candidates for existing position', async () => {
      const response = await request(app)
        .get(`/positions/${testPositionId}/candidates`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const candidate = response.body.data[0];
      expect(candidate).toHaveProperty('id');
      expect(candidate).toHaveProperty('fullName');
      expect(candidate).toHaveProperty('currentInterviewStep');
      expect(candidate).toHaveProperty('averageScore');
      expect(candidate).toHaveProperty('applicationDate');
      
      expect(candidate.fullName).toBe('Test Candidate');
      expect(candidate.averageScore).toBe(87.5); // (85 + 90) / 2
      
      expect(response.body.meta).toHaveProperty('positionId');
      expect(response.body.meta).toHaveProperty('totalCandidates');
      expect(response.body.meta.positionId).toBe(testPositionId);
    });

    it('should return 404 for non-existent position', async () => {
      const response = await request(app)
        .get('/positions/99999/candidates')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('POS_001');
    });

    it('should return 400 for invalid position ID', async () => {
      const response = await request(app)
        .get('/positions/invalid/candidates')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_POSITION_ID');
    });

    it('should return empty array for position with no candidates', async () => {
      // Create a position without candidates
      const emptyPosition = await prisma.position.create({
        data: {
          title: 'Empty Position',
          description: 'Position with no candidates',
          status: 'Published',
          location: 'Remote',
          jobDescription: 'Empty job',
          companyId: testCompany.id,
          interviewFlowId: testInterviewFlow.id
        }
      });

      const response = await request(app)
        .get(`/positions/${emptyPosition.id}/candidates`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.totalCandidates).toBe(0);

      // Cleanup
      await prisma.position.delete({ where: { id: emptyPosition.id } });
    });
  });

  describe('PUT /candidates/:id/stage', () => {
    beforeAll(async () => {
      // Get the second stage ID for testing updates
      const stages = await prisma.interviewStep.findMany({
        where: { interviewFlowId: testInterviewFlow.id },
        orderBy: { orderIndex: 'asc' }
      });
      newStageId = stages[1].id; // Second stage
    });

    it('should update candidate stage successfully', async () => {
      const updateData = {
        newStageId: newStageId,
        notes: 'Moved to technical interview stage'
      };

      const response = await request(app)
        .put(`/candidates/${testCandidateId}/stage`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.candidateId).toBe(testCandidateId);
      expect(response.body.data.newStage).toBe('Technical Interview');
      expect(response.body.data.previousStage).toBe('Initial Screening');
      expect(response.body.message).toContain('movido exitosamente');

      // Verify the update in database
      const updatedApplication = await prisma.application.findFirst({
        where: { candidateId: testCandidateId }
      });
      expect(updatedApplication?.currentInterviewStep).toBe(newStageId);
    });

    it('should return 404 for non-existent candidate', async () => {
      const updateData = {
        newStageId: newStageId
      };

      const response = await request(app)
        .put('/candidates/99999/stage')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CAN_001');
    });

    it('should return 400 for invalid candidate ID', async () => {
      const updateData = {
        newStageId: newStageId
      };

      const response = await request(app)
        .put('/candidates/invalid/stage')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CANDIDATE_ID');
    });

    it('should return 400 for missing newStageId', async () => {
      const updateData = {
        notes: 'Missing stage ID'
      };

      const response = await request(app)
        .put(`/candidates/${testCandidateId}/stage`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PAYLOAD');
    });

    it('should return 400 for invalid stage ID for candidate', async () => {
      const updateData = {
        newStageId: 99999 // Non-existent stage
      };

      const response = await request(app)
        .put(`/candidates/${testCandidateId}/stage`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('STG_001');
    });
  });

  describe('Performance Tests', () => {
    it('should respond within 500ms for GET candidates', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get(`/positions/${testPositionId}/candidates`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500);
    });

    it('should respond within 200ms for PUT stage update', async () => {
      const startTime = Date.now();
      
      await request(app)
        .put(`/candidates/${testCandidateId}/stage`)
        .send({ newStageId: newStageId })
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200);
    });
  });
});
