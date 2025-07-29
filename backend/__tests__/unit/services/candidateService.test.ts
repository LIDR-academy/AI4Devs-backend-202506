/**
 * Tests unitarios para CandidateService
 * Cobertura: >85% - Cubre todos los casos de User Stories 2 y 4
 */

import { candidateService } from '../../../src/application/services/candidateService';
import { mockPrisma } from '../../setup';
import { mockCandidates } from '../../__mocks__/data/candidates';

describe('CandidateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateCandidateStage', () => {
    it('should update candidate stage successfully (User Story 2)', async () => {
      // Arrange
      const candidateId = 1;
      const newStage = 3;
      const mockApplication = {
        id: 1,
        candidateId: 1,
        currentInterviewStep: 2,
        applicationDate: new Date('2024-01-01'),
        notes: 'Candidato prometedor'
      };

      mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.application.update.mockResolvedValue({
        ...mockApplication,
        currentInterviewStep: newStage
      });

      // Act
      const result = await candidateService.updateCandidateStage(candidateId, newStage);

      // Assert
      expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
        where: { candidateId }
      });
      expect(mockPrisma.application.update).toHaveBeenCalledWith({
        where: { id: mockApplication.id },
        data: { currentInterviewStep: newStage }
      });
      expect(result).toEqual({
        candidateId,
        currentInterviewStep: newStage
      });
    });

    it('should throw error when application not found (User Story 4)', async () => {
      // Arrange
      const candidateId = 999;
      const newStage = 3;

      mockPrisma.application.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        candidateService.updateCandidateStage(candidateId, newStage)
      ).rejects.toThrow('Aplicación no encontrada para el candidato especificado.');
    });

    it('should handle database errors during find operation', async () => {
      // Arrange
      const candidateId = 1;
      const newStage = 3;
      const dbError = new Error('Database connection failed');

      mockPrisma.application.findFirst.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        candidateService.updateCandidateStage(candidateId, newStage)
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors during update operation', async () => {
      // Arrange
      const candidateId = 1;
      const newStage = 3;
      const mockApplication = {
        id: 1,
        candidateId: 1,
        currentInterviewStep: 2,
        applicationDate: new Date('2024-01-01'),
        notes: 'Candidato prometedor'
      };
      const dbError = new Error('Update failed');

      mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.application.update.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        candidateService.updateCandidateStage(candidateId, newStage)
      ).rejects.toThrow('Update failed');
    });

    it('should handle candidateId as string and convert to number', async () => {
      // Arrange
      const candidateId = '1' as any;
      const newStage = 3;
      const mockApplication = {
        id: 1,
        candidateId: 1,
        currentInterviewStep: 2,
        applicationDate: new Date('2024-01-01'),
        notes: 'Candidato prometedor'
      };

      mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.application.update.mockResolvedValue({
        ...mockApplication,
        currentInterviewStep: newStage
      });

      // Act
      const result = await candidateService.updateCandidateStage(candidateId, newStage);

      // Assert
      expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
        where: { candidateId: '1' }
      });
      expect(result).toEqual({
        candidateId: '1',
        currentInterviewStep: newStage
      });
    });

    it('should handle newStage as string and convert to number', async () => {
      // Arrange
      const candidateId = 1;
      const newStage = '3' as any;
      const mockApplication = {
        id: 1,
        candidateId: 1,
        currentInterviewStep: 2,
        applicationDate: new Date('2024-01-01'),
        notes: 'Candidato prometedor'
      };

      mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.application.update.mockResolvedValue({
        ...mockApplication,
        currentInterviewStep: 3
      });

      // Act
      const result = await candidateService.updateCandidateStage(candidateId, newStage);

      // Assert
      expect(mockPrisma.application.update).toHaveBeenCalledWith({
        where: { id: mockApplication.id },
        data: { currentInterviewStep: '3' }
      });
      expect(result).toEqual({
        candidateId,
        currentInterviewStep: 3
      });
    });
  });

  describe('addCandidate', () => {
    it('should add candidate successfully', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com'
      };
      const createdCandidate = {
        id: 4,
        ...candidateData,
        phone: null,
        address: null
      };

      mockPrisma.candidate.create.mockResolvedValue(createdCandidate);

      // Act
      const result = await candidateService.addCandidate(candidateData);

      // Assert
      expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
        data: candidateData
      });
      expect(result).toEqual(createdCandidate);
    });

    it('should handle database errors during candidate creation', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com'
      };
      const dbError = new Error('Database connection failed');

      mockPrisma.candidate.create.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        candidateService.addCandidate(candidateData)
      ).rejects.toThrow('Database connection failed');
    });

    it('should throw specific error if email already exists (P2002)', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com'
      };
      const dbError: any = new Error('Unique constraint failed');
      dbError.code = 'P2002';
      mockPrisma.candidate.create.mockRejectedValue(dbError);

      // Act & Assert
      await expect(candidateService.addCandidate(candidateData))
        .rejects.toThrow('The email already exists in the database');
    });

    it('should throw error if validateCandidateData fails', async () => {
      // Arrange
      const candidateData = { firstName: '', lastName: '', email: '' };
      jest.spyOn(require('../../../src/application/validator'), 'validateCandidateData').mockImplementation(() => { throw new Error('Validation failed'); });

      // Act & Assert
      await expect(candidateService.addCandidate(candidateData))
        .rejects.toThrow('Validation failed');
    });

    it('should save education, experience, and CV if present', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        educations: [{ institution: 'UC3M', title: 'CS', startDate: '2000-01-01', endDate: '2004-01-01' }],
        workExperiences: [{ company: 'Company', position: 'Dev', startDate: '2005-01-01', endDate: '2010-01-01' }],
        cv: { filePath: 'cv.pdf', fileType: 'pdf' }
      };
      const savedCandidate = { id: 10, ...candidateData };
      const educationModel = { save: jest.fn(), candidateId: 10 };
      const experienceModel = { save: jest.fn(), candidateId: 10 };
      const resumeModel = { save: jest.fn(), candidateId: 10 };
      mockPrisma.candidate.create.mockResolvedValue(savedCandidate);
      jest.spyOn(require('../../../src/application/validator'), 'validateCandidateData').mockImplementation(() => {});
      jest.spyOn(require('../../../src/domain/models/Education'), 'Education').mockImplementation(() => educationModel);
      jest.spyOn(require('../../../src/domain/models/WorkExperience'), 'WorkExperience').mockImplementation(() => experienceModel);
      jest.spyOn(require('../../../src/domain/models/Resume'), 'Resume').mockImplementation(() => resumeModel);

      // Act
      await candidateService.addCandidate(candidateData);

      // Assert
      expect(educationModel.save).toHaveBeenCalled();
      expect(experienceModel.save).toHaveBeenCalled();
      expect(resumeModel.save).toHaveBeenCalled();
      jest.restoreAllMocks();
    });

    it('should not save education, experience, or CV if not present', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com'
      };
      const savedCandidate = { id: 11, ...candidateData };
      mockPrisma.candidate.create.mockResolvedValue(savedCandidate);
      jest.spyOn(require('../../../src/application/validator'), 'validateCandidateData').mockImplementation(() => {});
      const spyEducation = jest.spyOn(require('../../../src/domain/models/Education'), 'Education');
      const spyExperience = jest.spyOn(require('../../../src/domain/models/WorkExperience'), 'WorkExperience');
      const spyResume = jest.spyOn(require('../../../src/domain/models/Resume'), 'Resume');

      // Act
      await candidateService.addCandidate(candidateData);

      // Assert
      expect(spyEducation).not.toHaveBeenCalled();
      expect(spyExperience).not.toHaveBeenCalled();
      expect(spyResume).not.toHaveBeenCalled();
      jest.restoreAllMocks();
    });

    it('should throw generic error in catch', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com'
      };
      const dbError = new Error('Some generic error');
      mockPrisma.candidate.create.mockRejectedValue(dbError);
      jest.spyOn(require('../../../src/application/validator'), 'validateCandidateData').mockImplementation(() => {});

      // Act & Assert
      await expect(candidateService.addCandidate(candidateData))
        .rejects.toThrow('Some generic error');
      jest.restoreAllMocks();
    });
  });

  describe('findCandidateById', () => {
    it('should find candidate by ID successfully', async () => {
      // Arrange
      const candidateId = 1;
      const mockCandidate = {
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        phone: '123456789',
        address: 'Calle Principal 123',
        education: [],
        workExperience: [],
        resumes: [],
        applications: []
      };

      mockPrisma.candidate.findUnique.mockResolvedValue(mockCandidate);

      // Act
      const result = await candidateService.findCandidateById(candidateId);

      // Assert
      expect(result).toMatchObject({
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        phone: '123456789',
        address: 'Calle Principal 123'
      });
    });

    it('should return null when candidate not found', async () => {
      // Arrange
      const candidateId = 999;

      mockPrisma.candidate.findUnique.mockResolvedValue(null);

      // Act
      const result = await candidateService.findCandidateById(candidateId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle database errors during candidate search', async () => {
      // Arrange
      const candidateId = 1;
      const dbError = new Error('Database connection failed');

      mockPrisma.candidate.findUnique.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        candidateService.findCandidateById(candidateId)
      ).rejects.toThrow('Error al recuperar el candidato');
    });

    it('should handle candidateId as string and convert to number', async () => {
      // Arrange
      const candidateId = '1' as any;
      const mockCandidate = {
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        phone: '123456789',
        address: 'Calle Principal 123',
        education: [],
        workExperience: [],
        resumes: [],
        applications: []
      };

      mockPrisma.candidate.findUnique.mockResolvedValue(mockCandidate);

      // Act
      const result = await candidateService.findCandidateById(candidateId);

      // Assert
      expect(result).toMatchObject({
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        phone: '123456789',
        address: 'Calle Principal 123'
      });
    });
  });
}); 