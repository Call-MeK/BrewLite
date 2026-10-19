import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CredentialsDto } from './credentials.dto.js';

describe('CredentialsDto', () => {
  it('normalizes the email while retaining the exact password', async () => {
    const result = plainToInstance(CredentialsDto, {
      email: ' A@EXAMPLE.COM ',
      password: ' password ',
    });
    expect(await validate(result)).toEqual([]);
    expect(result.email).toBe('a@example.com');
    expect(result.password).toBe(' password ');
  });

  it.each([
    { email: 'invalid', password: 'password123' },
    { email: 123, password: 'password123' },
    { email: 'a@example.com', password: 'short' },
    { email: 'a@example.com', password: 'x'.repeat(73) },
    { email: 'a@example.com', password: 12345678 },
    {},
  ])('rejects invalid credentials %#', async (input) => {
    expect(
      (await validate(plainToInstance(CredentialsDto, input))).length,
    ).toBeGreaterThan(0);
  });
});
