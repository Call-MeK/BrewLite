import EmbeddedPostgres from 'embedded-postgres';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const socket = createServer();
await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve));
const port = socket.address().port;
await new Promise((resolve) => socket.close(resolve));
const testRoot = await realpath(tmpdir());
const databaseDir = await mkdtemp(join(testRoot, 'brewlite-api-test-'));
const password = randomBytes(24).toString('hex');
const database = new EmbeddedPostgres({
  databaseDir,
  port,
  user: 'postgres',
  password,
  persistent: true,
  postgresFlags: ['-h', '127.0.0.1'],
  onLog() {},
  onError(message) {
    if (String(message).includes('FATAL')) console.error(String(message));
  },
});
const env = {
  ...process.env,
  DATABASE_URL: `postgresql://postgres:${password}@127.0.0.1:${port}/brewlite_test?schema=public`,
  JWT_SECRET: randomBytes(32).toString('hex'),
  JWT_EXPIRES_IN: '3600',
  MOCK_PAYMENT_RESULT: 'SUCCEEDED',
};
function run(script, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      env,
      stdio: 'inherit',
      windowsHide: true,
    });
    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`Command exited with ${code}`)),
    );
  });
}
try {
  await database.initialise();
  await database.start();
  await database.createDatabase('brewlite_test');
  await run('node_modules/prisma/build/index.js', ['migrate', 'deploy']);
  await run('prisma/seed.ts', []);
  await run('node_modules/vitest/vitest.mjs', [
    'run',
    '--config',
    'vitest.config.e2e.ts',
  ]);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await database.stop();
  const cleanupTarget = await realpath(databaseDir);
  if (
    dirname(cleanupTarget) === testRoot &&
    basename(cleanupTarget).startsWith('brewlite-api-test-')
  ) {
    // Windows can keep files open briefly after the PostgreSQL process exits.
    await rm(cleanupTarget, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 100,
    });
  } else {
    console.error(
      'Refusing to remove a directory outside the temporary test database.',
    );
    process.exitCode = 1;
  }
}
