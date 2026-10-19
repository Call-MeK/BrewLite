import { ExecutionContext } from '@nestjs/common';
import { SignJWT } from 'jose';
import { PrismaService } from '../database/prisma.service.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';

const userId = '00000000-0000-4000-8000-000000000001';
const secret = 'test-secret-with-at-least-32-bytes-long';

function contextFor(authorization?: string) {
  const request: {
    headers: { authorization?: string };
    user?: { id: string };
  } = { headers: { authorization } };
  return {
    request,
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext,
  };
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', secret);
    vi.stubEnv('JWT_EXPIRES_IN', '3600');
    guard = new AuthGuard(new AuthService({} as PrismaService));
  });
  afterEach(() => vi.unstubAllEnvs());

  it('attaches only the verified JWT user id', async () => {
    const token = await new SignJWT({ email: 'ignored@example.com' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuer('brewlite')
      .setAudience('brewlite-web')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(secret));
    const { context, request } = contextFor(`Bearer ${token}`);
    expect(await guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ id: userId });
  });

  it.each([undefined, '', 'Basic credentials', 'Bearer invalid', 'Bearer a b'])(
    'rejects missing or malformed authentication: %s',
    async (header) => {
      const { context, request } = contextFor(header);
      await expect(guard.canActivate(context)).rejects.toMatchObject({
        response: { statusCode: 401, code: 'UNAUTHORIZED' },
      });
      expect(request.user).toBeUndefined();
    },
  );

  it.each([
    'signature',
    'expired',
    'issuer',
    'audience',
    'subject',
    'missing-expiry',
    'algorithm',
  ])('rejects invalid JWT %s', async (kind) => {
    let jwt = new SignJWT({})
      .setProtectedHeader({ alg: kind === 'algorithm' ? 'HS384' : 'HS256' })
      .setSubject(kind === 'subject' ? 'invalid-user-id' : userId)
      .setIssuer(kind === 'issuer' ? 'another-service' : 'brewlite')
      .setAudience(kind === 'audience' ? 'another-app' : 'brewlite-web')
      .setIssuedAt();
    if (kind !== 'missing-expiry')
      jwt = jwt.setExpirationTime(kind === 'expired' ? '0s' : '1h');
    const token = await jwt.sign(
      new TextEncoder().encode(
        kind === 'signature'
          ? 'different-secret-with-at-least-32-bytes'
          : secret,
      ),
    );
    const { context } = contextFor(`Bearer ${token}`);
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { statusCode: 401, code: 'UNAUTHORIZED' },
    });
  });
});
