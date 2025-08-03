export const mockPrisma = {
    position: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
    },
    application: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
    },
    interviewStep: {
        findMany: jest.fn(),
    }
};
