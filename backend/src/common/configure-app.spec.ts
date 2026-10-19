import { Controller, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureApplication } from './configure-app.js';

@Controller('boundary')
class BoundaryController {
  @Post() accept() {
    return { accepted: true };
  }
}

describe('API request parsing errors', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [BoundaryController],
    }).compile();
    app = module.createNestApplication();
    configureApplication(app);
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  it('does not echo raw credentials from malformed JSON', async () => {
    const result = await request(app.getHttpServer())
      .post('/boundary')
      .set('Content-Type', 'application/json')
      .send('password=do-not-echo');
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('VALIDATION_ERROR');
    expect(JSON.stringify(result.body)).not.toContain('do-not-echo');
  });

  it('returns 413 for a JSON body over the Express limit', async () => {
    const result = await request(app.getHttpServer())
      .post('/boundary')
      .send({ value: 'x'.repeat(110000) });
    expect(result.status).toBe(413);
    expect(result.body).toMatchObject({
      statusCode: 413,
      code: 'PAYLOAD_TOO_LARGE',
    });
  });
});
