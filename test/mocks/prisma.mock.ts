import type { PrismaService } from '../../src/prisma';

export type MockPrismaService = {
  movie: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

export const createMockPrismaService = (): MockPrismaService => ({
  movie: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

export const mockPrismaService = createMockPrismaService();
