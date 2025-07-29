// Mock de Prisma Client para tests
const mockPrisma = {
  application: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn()
  },
  candidate: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn()
  },
  interview: {
    findMany: jest.fn(),
    create: jest.fn()
  },
  position: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  },
  interviewStep: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  },
  $connect: jest.fn(),
  $disconnect: jest.fn()
};

// Mock del constructor de PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

export { mockPrisma };
export default mockPrisma; 