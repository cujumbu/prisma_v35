import { PrismaClient } from '@prisma/client';

class MockPrismaClient {
  private data: any = {
    claim: [],
    user: []
  };

  claim = {
    create: async (args: any) => {
      const newClaim = { id: Date.now().toString(), ...args.data };
      this.data.claim.push(newClaim);
      return newClaim;
    },
    findFirst: async (args: any) => {
      return this.data.claim.find((claim: any) => 
        claim.orderNumber === args.where.orderNumber && 
        claim.email === args.where.email
      );
    },
    findMany: async () => {
      return this.data.claim;
    },
    update: async (args: any) => {
      const index = this.data.claim.findIndex((claim: any) => claim.id === args.where.id);
      if (index !== -1) {
        this.data.claim[index] = { ...this.data.claim[index], ...args.data };
        return this.data.claim[index];
      }
      throw new Error('Claim not found');
    }
  };

  user = {
    findUnique: async (args: any) => {
      return this.data.user.find((user: any) => user.email === args.where.email);
    }
  };
}

const mockPrismaClient = new MockPrismaClient();

export default process.env.NODE_ENV === 'development' 
  ? mockPrismaClient as unknown as PrismaClient
  : new PrismaClient();