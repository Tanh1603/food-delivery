import dotenv from 'dotenv';

dotenv.config({
  path: '../.env',
});

// ==================== CONFIG ====================
export const config = {
  target: process.env.API_URL || 'http://localhost:3004',
  http: {
    timeout: 120000, // 2 phút, để request lâu bị nghẽn vẫn đợi
  },
  phases: [
    // ramp-up từ thấp → cao
    { duration: 60, arrivalRate: 5 },
    { duration: 60, arrivalRate: 10 },
    { duration: 60, arrivalRate: 40 },
    { duration: 120, arrivalRate: 80 },
    { duration: 60, arrivalRate: 40 },
    { duration: 60, arrivalRate: 20 },
    { duration: 60, arrivalRate: 5 },
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
        },
      },
    ],
  },
];
