import { test, expect } from '@playwright/test';

test.describe('API /api/mean', () => {
  test('returns correct mean for valid input', async ({ request: req }) => {
    const res = await req.post('/api/mean', {
      data: { numbers: [1, 2, 3, 4], precision: 2 },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.mean).toBeCloseTo(2.5, 2);
    expect(body.count).toBe(4);
  });

  test('returns INVALID_INPUT for empty input', async ({ request: req }) => {
    const res = await req.post('/api/mean', { data: { numbers: [] } });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error_code).toBe('INVALID_INPUT');
  });
});
