// ==================== CONFIG ====================
export const config = {
  target: process.env.API_URL || 'http://localhost:3000',
  http: {
    timeout: 120000, // 2 phút, để request lâu bị nghẽn vẫn đợi
  },
  phases: [
    // ramp-up từ thấp → cao
    { duration: 120, arrivalRate: 20 }, // 10 req/s trong 1 phút
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
