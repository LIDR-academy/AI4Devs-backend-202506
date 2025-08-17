import { body, param, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// OWASP A03:2021 - Injection Prevention
export const validateResults = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
        value: err.type === 'field' ? err.value : undefined
      }))
    });
  }
  next();
};

// Candidate pipeline validation
export const candidatePipelineValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Position ID must be a positive integer')
    .toInt(),
  validateResults
];

// Update candidate stage validation
export const updateCandidateStageValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Candidate ID must be a positive integer')
    .toInt(),
  body('positionId')
    .isInt({ min: 1 })
    .withMessage('Position ID must be a positive integer')
    .toInt(),
  body('currentInterviewStep')
    .isInt({ min: 1 })
    .withMessage('Interview step must be a positive integer')
    .toInt(),
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 0, max: 1000 })
    .withMessage('Notes must be a string with maximum 1000 characters')
    .escape(), // Prevent XSS
  validateResults
];

// Interview steps validation
export const interviewStepsValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Position ID must be a positive integer')
    .toInt(),
  validateResults
];

// Candidate creation validation (existing endpoint enhancement)
export const candidateCreationValidation = [
  body('firstName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/)
    .withMessage('First name can only contain letters and spaces')
    .escape(),
  body('lastName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/)
    .withMessage('Last name can only contain letters and spaces')
    .escape(),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
  body('phone')
    .optional()
    .isString()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Phone number must contain only digits, spaces, hyphens, and parentheses')
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone number must be between 7 and 20 characters'),
  body('address')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Address must not exceed 100 characters')
    .escape(),
  body('educations')
    .optional()
    .isArray()
    .withMessage('Educations must be an array'),
  body('educations.*.institution')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Institution name must not exceed 100 characters')
    .escape(),
  body('educations.*.title')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 250 })
    .withMessage('Education title must not exceed 250 characters')
    .escape(),
  body('educations.*.startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('educations.*.endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('workExperiences')
    .optional()
    .isArray()
    .withMessage('Work experiences must be an array'),
  body('workExperiences.*.company')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must not exceed 100 characters')
    .escape(),
  body('workExperiences.*.position')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position must not exceed 100 characters')
    .escape(),
  body('workExperiences.*.description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
    .escape(),
  body('workExperiences.*.startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('workExperiences.*.endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  validateResults
];

// File upload validation
export const fileUploadValidation = [
  body('file')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('File is required');
      }
      
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error('Only PDF and DOCX files are allowed');
      }
      
      if (req.file.size > maxSize) {
        throw new Error('File size must not exceed 5MB');
      }
      
      return true;
    }),
  validateResults
];

// Generic ID validation for any route with :id parameter
export const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
    .toInt(),
  validateResults
];

// Search and filter validation
export const searchValidation = [
  body('query')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .escape(),
  body('filters')
    .optional()
    .isObject()
    .withMessage('Filters must be an object'),
  body('filters.positionId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Position ID filter must be a positive integer')
    .toInt(),
  body('filters.stage')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Stage filter must be a positive integer')
    .toInt(),
  body('filters.minScore')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Minimum score must be between 0 and 100')
    .toFloat(),
  body('filters.maxScore')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Maximum score must be between 0 and 100')
    .toFloat(),
  validateResults
];

// Pagination validation
export const paginationValidation = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  body('sortBy')
    .optional()
    .isString()
    .isIn(['id', 'firstName', 'lastName', 'email', 'applicationDate', 'averageScore'])
    .withMessage('Invalid sort field'),
  body('sortOrder')
    .optional()
    .isString()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),
  validateResults
];

// Sanitization helper function
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// Custom validation for date ranges
export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

// Export all validation chains
export const validationChains = {
  candidatePipeline: candidatePipelineValidation,
  updateCandidateStage: updateCandidateStageValidation,
  interviewSteps: interviewStepsValidation,
  candidateCreation: candidateCreationValidation,
  fileUpload: fileUploadValidation,
  id: idValidation,
  search: searchValidation,
  pagination: paginationValidation
};
