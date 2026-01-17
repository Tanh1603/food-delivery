import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { Config } from 'artillery';

// ==================== CONFIG ====================
export const config: Config = {
  target: process.env.API_URL || 'http://localhost:3000',
  http: {
    maxSockets: 10,
  },
  phases: [
    { duration: 10, arrivalRate: 5, name: 'Ramp-up: Low Traffic' },
    { duration: 10, arrivalRate: 20, name: 'Steady: Moderate Traffic' },
    { duration: 10, arrivalRate: 5, name: 'Ramp-down: Low Traffic' },
  ],
  processor: './process.ts',
};

// ==================== SCENARIOS ====================
export const scenarios = [
  {
    name: 'User browsing and ordering',
    beforeScenario: 'fixedMenuItemAndRestaurant',
    before: '',
    flow: [
      {
        post: {
          url: '/api/orders',
          headers: { Authorization: '{{ authToken }}' },
          json: {
            restaurantId: '{{ restaurantId }}',
            userId: '{{ userId }}',
            phone: '0900000000',
            deliveryAddress: '123 Random St',
            idempotencyKey: '{{ idempotencyKey }}',
            items: [
              {
                menuItemId: '{{ menuItemId }}',
                quantity: 10,
              },
            ],
          },
          capture: [{ json: '$.data.id', as: 'orderId' }],
        },
      },
      {
        get: {
          url: '/api/orders/{{ orderId }}',
          headers: { Authorization: '{{ authToken }}' },
        },
      },
    ],
  },
];
