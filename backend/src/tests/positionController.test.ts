import { PositionController } from '../presentation/controllers/positionController';
import { PositionService } from '../application/services/positionService';

// Mock del PositionService
const mockPositionService = {
  getCandidatesForPosition: jest.fn(),
  updateCandidateStage: jest.fn(),
} as any;

describe('PositionController', () => {
  let positionController: PositionController;

  beforeEach(() => {
    jest.clearAllMocks();
    positionController = new PositionController(mockPositionService);
  });

  describe('getCandidatesForPosition', () => {
    it('should successfully get candidates for a valid position', async () => {
      // Arrange
      const positionId = 1;
      const mockCandidates = [
        {
          id: 1,
          fullName: 'John Doe',
          currentInterviewStep: 'Initial Screening',
          averageScore: 8.5,
          applicationId: 1,
          positionId: 1
        }
      ];

      mockPositionService.getCandidatesForPosition.mockResolvedValue(mockCandidates);

      const req = {
        params: { id: positionId.toString() }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      // Act
      await positionController.getCandidatesForPosition(req, res);

      // Assert
      expect(mockPositionService.getCandidatesForPosition).toHaveBeenCalledWith(positionId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCandidates,
        count: mockCandidates.length,
        positionId: positionId
      });
    });

    it('should return 400 for invalid position ID', async () => {
      // Arrange
      const req = {
        params: { id: 'invalid' }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      // Act
      await positionController.getCandidatesForPosition(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid position ID',
        message: 'Position ID must be a positive integer'
      });
    });

    it('should return 400 for negative position ID', async () => {
      // Arrange
      const req = {
        params: { id: '-1' }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      // Act
      await positionController.getCandidatesForPosition(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid position ID',
        message: 'Position ID must be a positive integer'
      });
    });

    it('should return 404 when position not found', async () => {
      // Arrange
      const positionId = 999;
      const req = {
        params: { id: positionId.toString() }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      mockPositionService.getCandidatesForPosition.mockRejectedValue(
        new Error('Position with ID 999 not found')
      );

      // Act
      await positionController.getCandidatesForPosition(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Position not found',
        message: 'Position with ID 999 not found'
      });
    });

    it('should return 500 for database connection errors', async () => {
      // Arrange
      const positionId = 1;
      const req = {
        params: { id: positionId.toString() }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      mockPositionService.getCandidatesForPosition.mockRejectedValue(
        new Error('Database connection error')
      );

      // Act
      await positionController.getCandidatesForPosition(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'An error occurred while retrieving candidates for the position'
      });
    });
  });

  describe('updateCandidateStage', () => {
    it('should successfully update candidate stage', async () => {
      // Arrange
      const candidateId = 1;
      const newInterviewStepId = 2;
      const positionId = 1;
      
      const mockResult = {
        message: 'Candidate stage updated successfully',
        data: {
          candidateId: 1,
          candidateName: 'John Doe',
          positionTitle: 'Software Engineer',
          previousStage: 'Initial Screening',
          newStage: 'Technical Interview',
          updatedAt: new Date()
        }
      };

      mockPositionService.updateCandidateStage.mockResolvedValue(mockResult);

      const req = {
        params: { positionId: positionId.toString(), id: candidateId.toString() },
        body: { newInterviewStepId }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      // Act
      await positionController.updateCandidateStage(req, res);

      // Assert
      expect(mockPositionService.updateCandidateStage).toHaveBeenCalledWith(candidateId, newInterviewStepId, positionId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
    });

    it('should return 400 for invalid position ID', async () => {
      // Arrange
      const req = {
        params: { positionId: 'invalid', id: '1' },
        body: { newInterviewStepId: 2 }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      // Act
      await positionController.updateCandidateStage(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid position ID',
        message: 'Position ID must be a positive integer'
      });
    });

    it('should return 400 for invalid candidate ID', async () => {
      // Arrange
      const req = {
        params: { positionId: '1', id: 'invalid' },
        body: { newInterviewStepId: 2 }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      // Act
      await positionController.updateCandidateStage(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid candidate ID',
        message: 'Candidate ID must be a positive integer'
      });
    });

    it('should return 400 for invalid interview step ID', async () => {
      // Arrange
      const req = {
        params: { positionId: '1', id: '1' },
        body: { newInterviewStepId: 'invalid' }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      // Act
      await positionController.updateCandidateStage(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid interview step ID',
        message: 'newInterviewStepId must be a positive integer'
      });
    });

    it('should return 400 for missing interview step ID', async () => {
      // Arrange
      const req = {
        params: { positionId: '1', id: '1' },
        body: {}
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      // Act
      await positionController.updateCandidateStage(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid interview step ID',
        message: 'newInterviewStepId must be a positive integer'
      });
    });

    it('should return 404 when candidate not found', async () => {
      // Arrange
      const req = {
        params: { positionId: '1', id: '999' },
        body: { newInterviewStepId: 2 }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      mockPositionService.updateCandidateStage.mockRejectedValue(
        new Error('Candidate with ID 999 not found')
      );

      // Act
      await positionController.updateCandidateStage(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Resource not found',
        message: 'Candidate with ID 999 not found'
      });
    });

    it('should return 400 when no application found', async () => {
      // Arrange
      const req = {
        params: { positionId: '999', id: '1' },
        body: { newInterviewStepId: 2 }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      mockPositionService.updateCandidateStage.mockRejectedValue(
        new Error('No application found for candidate 1 in position 999')
      );

      // Act
      await positionController.updateCandidateStage(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No active application',
        message: 'No application found for candidate 1 in position 999'
      });
    });

    it('should return 500 for other errors', async () => {
      // Arrange
      const req = {
        params: { positionId: '1', id: '1' },
        body: { newInterviewStepId: 2 }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      mockPositionService.updateCandidateStage.mockRejectedValue(
        new Error('Unexpected database error')
      );

      // Act
      await positionController.updateCandidateStage(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'An error occurred while updating the candidate stage'
      });
    });
  });
});
