import * as supertest from 'supertest';

import app from './server';

describe('orders.controller', () => {
  it('should return 401 unuathorized access', async () => {
    process.env.API_KEY = 'test';
    const request = supertest(app);
    const response = await request.post('/orders/1');
    expect(response.status).toBe(401);
  });

  it('should return 422 validation error', async () => {
    process.env.API_KEY = 'test';
    const request = supertest(app);
    const response = await request.post('/orders/1').set('x-api-key', 'test');
    expect(response.status).toBe(422);
  });

  it('should return 200 success', async () => {
    process.env.API_KEY = 'test';
    const request = supertest(app);
    const response = await request
      .post('/orders/1')
      .set('x-api-key', 'test')
      .send({
        OrderId: '1',
        TotalPrice: 0,
        OrderLines: [
          {
            ItemId: '1',
            Quantity: 2,
            PricePerItem: 1,
            TotalPrice: 1,
          },
          {
            ItemId: '1',
            Quantity: 2,
            PricePerItem: 1,
            TotalPrice: 1,
          },
          {
            ItemId: '1',
            Quantity: 2,
            PricePerItem: 1,
            TotalPrice: 1,
          },
          {
            ItemId: '1',
            Quantity: 2,
            PricePerItem: 1,
            TotalPrice: 1,
          },
          {
            ItemId: '1',
            Quantity: 2,
            PricePerItem: 1,
            TotalPrice: 1,
          },
        ],
      });
    console.log(response.body)
    expect(response.status).toBe(200);
  });
});
