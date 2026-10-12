import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ENV } from './env';
import { mockPrisma } from './mockPrisma';

declare global {
  // eslint-disable-next-line no-var
  var prisma: any;
}

const isDatabaseConfigured = Boolean(ENV.DATABASE_URL && ENV.DATABASE_URL.trim().length > 0);

let clientInstance: any;

if (isDatabaseConfigured) {
  try {
    const pool = new Pool({
      connectionString: ENV.DATABASE_URL,
      ssl: ENV.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    });
    const adapter = new PrismaPg(pool);
    const realPrisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    clientInstance = new Proxy(realPrisma, {
      get(target: any, prop: string | symbol) {
        const orig = target[prop];
        if (typeof orig === 'object' && orig !== null) {
          return new Proxy(orig, {
            get(modelTarget: any, modelProp: string | symbol) {
              const origMethod = modelTarget[modelProp];
              if (typeof origMethod === 'function') {
                return async (...args: any[]) => {
                  try {
                    return await origMethod.apply(modelTarget, args);
                  } catch (err: any) {
                    if (
                      err?.code === 'ECONNREFUSED' ||
                      err?.message?.includes('ECONNREFUSED') ||
                      err?.message?.includes("Can't reach database server")
                    ) {
                      console.warn(`[Prisma DB fallback] ${String(prop)}.${String(modelProp)} using mock database.`);
                      const mockModel = (mockPrisma as any)[prop];
                      if (mockModel && typeof mockModel[modelProp] === 'function') {
                        return await mockModel[modelProp](...args);
                      }
                    }
                    throw err;
                  }
                };
              }
              return origMethod;
            },
          });
        }
        return orig;
      },
    });
  } catch {
    clientInstance = mockPrisma;
  }
} else {
  console.log('⚡ [SchoolMate Database] Running in Mock In-Memory Database Mode');
  console.log('   - Driver account: 0771234567 / password123 (Nimal Fernando)');
  console.log('   - Parent account: 0774456677 / password123 (Saman Perera)');
  clientInstance = mockPrisma;
}

export const prisma = global.prisma || clientInstance;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
