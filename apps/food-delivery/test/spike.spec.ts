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
    { duration: 30, arrivalRate: 2, name: 'Stress: High Traffic' },
    { duration: 10, arrivalRate: 50, name: 'Sustain high traffic' },
    { duration: 30, arrivalRate: 2, name: 'Ramp-down: Recover' },
  ],
  processor: './process.ts',
};

// ==================== SCENARIOS ====================
export const scenarios = [
  {
    name: 'User browsing and ordering',
    beforeScenario: 'beforeScenario',
    before: '',
    flow: [
      {
        get: {
          url: '/api/restaurants',
          headers: { Authorization: '{{ authToken }}' },
          afterResponse: 'randomRestaurant', // chỉ là string
        },
      },
      {
        get: {
          url: '/api/restaurants/{{ restaurantId }}',
          headers: { Authorization: '{{ authToken }}' },
        },
      },
      {
        get: {
          url: '/api/restaurants/{{ restaurantId }}/menu',
          headers: { Authorization: '{{ authToken }}' },
          afterResponse: 'randomMenuItem', // chỉ là string
        },
      },
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
                quantity: Math.floor(Math.random() * 3) + 10,
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
