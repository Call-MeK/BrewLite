import { PrismaService } from '../database/prisma.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('reports ready after the database responds', async () => {
    const database = {
      $queryRaw: async () => [{ '?column?': 1 }],
    } as unknown as PrismaService;
    expect(await new HealthController(database).getHealth()).toEqual({
      status: 'ok',
      database: 'up',
    });
  });

  it('reports 503 with no connection secrets when the database is unavailable', async () => {
    const database = {
      $queryRaw: async () => {
        throw new Error('postgres://private:secret@db');
      },
    } as unknown as PrismaService;
    await expect(
      new HealthController(database).getHealth(),
    ).rejects.toMatchObject({
      status: 503,
      response: { status: 'error', database: 'down' },
    });
  });
});
