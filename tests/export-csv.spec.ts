import { test, expect } from '@playwright/test';

test.describe('API /api/export/csv', () => {
  test('queues export and returns taskId', async ({ request: req }) => {
    const res = await req.post('/api/export/csv', {
      data: { tool: 'mean', params: { numbers: [1, 2, 3] }, consent: true },
    });
    expect(res.status()).toBe(202);
    const body = await res.json();
    expect(body.taskId).toBeTruthy();
    expect(body.status).toBe('queued');
  });
});
