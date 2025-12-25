import dotenv from 'dotenv';

dotenv.config({
  path: '../.env',
});

import { Config } from 'artillery';
// ==================== CONFIG ====================
export const config: Config = {
  target: process.env.API_URL || 'http://localhost:8080',
  http: {
    timeout: 120000, // 2 phút, để request lâu bị nghẽn vẫn đợi
  },
  phases: [
    // ramp-up từ thấp → cao
    { duration: 60, arrivalRate: 2, name: 'Ramp-up: Low Traffic' },
    { duration: 60, arrivalRate: 5, name: 'Ramp-up: Moderate Traffic' },
    { duration: 120, arrivalRate: 10, name: 'Ramp-up: High Traffic' },
    { duration: 60, arrivalRate: 5, name: 'Ramp-down: Moderate Traffic' },
    { duration: 60, arrivalRate: 2, name: 'Ramp-down: Low Traffic' },
    // { duration: 2, arrivalRate: 2, name: 'Ramp-down: Low Traffic' },
  ],
  processor: './process.ts',
  plugins: { expect: {} },
};

// ==================== SCENARIOS ====================
export const scenarios = [
  {
    name: 'Browse Restaurants with Auth',
    beforeScenario: 'beforeScenario',
    flow: [
      {
        get: {
          url: '/api/restaurants',
          headers: { Authorization: 'Bearer {{ authToken }}' },
          capture: [{ json: '$.data[0].id', as: 'restaurantId' }],
        },
      },
      {
        get: {
          url: '/api/restaurants/{{ restaurantId }}',
          headers: { Authorization: 'Bearer {{ authToken }}' },
        },
      },
      {
        get: {
          url: '/api/restaurants/{{ restaurantId }}/menu',
          headers: { Authorization: 'Bearer {{ authToken }}' },
          capture: [{ json: '$.data[0].id', as: 'menuItemId' }],
        },
      },

      {
        post: {
          url: '/api/orders',
          headers: { Authorization: 'Bearer {{ authToken }}' },
          json: {
            restaurantId: '{{ restaurantId }}',
            userId: '{{ userId }}',
            phone: '0900000000',
            deliveryAddress: '123 Test St',
            idempotencyKey: '{{ idempotencyKey }}',
            items: [{ menuItemId: '{{ menuItemId }}', quantity: 1 }],
          },
          capture: [{ json: '$.data.id', as: 'orderId' }],
        },
      },

      {
        get: {
          url: '/api/orders/{{ orderId }}',
          headers: { Authorization: 'Bearer {{ authToken }}' },
        },
      },
    ],
  },
];
