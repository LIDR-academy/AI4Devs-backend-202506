// Configuración global para tests
process.env.NODE_ENV = 'test';

// Mock de Prisma Client
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

// Mock del constructor de PrismaClient y error de inicialización
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  Prisma: {
    PrismaClientInitializationError: class extends Error {}
  }
}));

// Exportar mock para uso en tests
export { mockPrisma }; 