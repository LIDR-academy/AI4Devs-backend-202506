const NAME_REGEX = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(6|7|9)\d{8}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

//Length validations according to the database schema

const validateName = (name: string) => {
    if (!name || name.length < 2 || name.length > 100 || !NAME_REGEX.test(name)) {
        throw new Error('Invalid name');
    }
};

const validateEmail = (email: string) => {
    if (!email || !EMAIL_REGEX.test(email)) {
        throw new Error('Invalid email');
    }
};

const validatePhone = (phone: string) => {
    if (phone && !PHONE_REGEX.test(phone)) {
        throw new Error('Invalid phone');
    }
};

const validateDate = (date: string) => {
    if (!date || !DATE_REGEX.test(date)) {
        throw new Error('Invalid date');
    }
};

const validateAddress = (address: string) => {
    if (address && address.length > 100) {
        throw new Error('Invalid address');
    }
};

const validateEducation = (education: any) => {
    if (!education.institution || education.institution.length > 100) {
        throw new Error('Invalid institution');
    }

    if (!education.title || education.title.length > 100) {
        throw new Error('Invalid title');
    }

    validateDate(education.startDate);

    if (education.endDate && !DATE_REGEX.test(education.endDate)) {
        throw new Error('Invalid end date');
    }
};

const validateExperience = (experience: any) => {
    if (!experience.company || experience.company.length > 100) {
        throw new Error('Invalid company');
    }

    if (!experience.position || experience.position.length > 100) {
        throw new Error('Invalid position');
    }

    if (experience.description && experience.description.length > 200) {
        throw new Error('Invalid description');
    }

    validateDate(experience.startDate);

    if (experience.endDate && !DATE_REGEX.test(experience.endDate)) {
        throw new Error('Invalid end date');
    }
};

const validateCV = (cv: any) => {
    if (typeof cv !== 'object' || !cv.filePath || typeof cv.filePath !== 'string' || !cv.fileType || typeof cv.fileType !== 'string') {
        throw new Error('Invalid CV data');
    }
};

export const validateCandidateData = (data: any) => {
    if (data.id) {
        // If id is provided, we are editing an existing candidate, so fields are not mandatory
        return;
    }

    validateName(data.firstName); 
    validateName(data.lastName); 
    validateEmail(data.email);
    validatePhone(data.phone);
    validateAddress(data.address);

    if (data.educations) {
        for (const education of data.educations) {
            validateEducation(education);
        }
    }

    if (data.workExperiences) {
        for (const experience of data.workExperiences) {
            validateExperience(experience);
        }
    }

    if (data.cv && Object.keys(data.cv).length > 0) {
        validateCV(data.cv);
    }
};

// Validaciones específicas para actualización de etapa de candidato
const validatePositiveInteger = (value: any, fieldName: string) => {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`Invalid ${fieldName}: must be a positive integer`);
    }
};

const validateNotesLength = (notes: string) => {
    if (notes && notes.length > 500) {
        throw new Error('Notes field cannot exceed 500 characters');
    }
};

export const validateStageUpdateData = (data: any) => {
    // Validar que el body contiene los campos requeridos
    if (!data || typeof data !== 'object') {
        throw new Error('Request body must be a valid JSON object');
    }

    // newInterviewStepId es requerido
    if (data.newInterviewStepId === undefined || data.newInterviewStepId === null) {
        throw new Error('newInterviewStepId is required');
    }
    validatePositiveInteger(data.newInterviewStepId, 'newInterviewStepId');

    // positionId es requerido
    if (data.positionId === undefined || data.positionId === null) {
        throw new Error('positionId is required');
    }
    validatePositiveInteger(data.positionId, 'positionId');

    // notes es opcional pero debe validarse si se proporciona
    if (data.notes !== undefined && data.notes !== null) {
        if (typeof data.notes !== 'string') {
            throw new Error('Notes must be a string');
        }
        validateNotesLength(data.notes);
    }

    // Validar que no hay campos adicionales no permitidos
    const allowedFields = ['newInterviewStepId', 'positionId', 'notes'];
    const extraFields = Object.keys(data).filter(key => !allowedFields.includes(key));
    
    if (extraFields.length > 0) {
        throw new Error(`Unexpected fields in request: ${extraFields.join(', ')}`);
    }
};

export const validateCandidateId = (candidateId: any): number => {
    const id = parseInt(candidateId);
    
    if (isNaN(id)) {
        throw new Error('Invalid candidate ID format: must be a number');
    }
    
    if (id <= 0) {
        throw new Error('Invalid candidate ID: must be a positive number');
    }
    
    return id;
};