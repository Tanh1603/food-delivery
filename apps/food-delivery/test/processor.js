module.exports = {
  // Before each scenario
  beforeScenario: function (context, events, done) {
    // Set target URL from environment or default
    context.vars.target = process.env.TARGET_URL || 'http://localhost';
    return done();
  },

  // After each request
  afterResponse: function (requestParams, response, context, events, done) {
    // Log slow requests
    const duration = response.timings.phases.firstByte;
    if (duration > 1000) {
      console.log(`⚠️  Slow request: ${requestParams.url} took ${duration}ms`);
    }

    // Track errors
    if (response.statusCode >= 500) {
      console.log(
        `❌ Error: ${requestParams.url} returned ${response.statusCode}`,
      );
    }

    return done();
  },

  // Custom function to generate random data
  generateRandomOrder: function (context, events, done) {
    context.vars.orderData = {
      restaurant_id: Math.floor(Math.random() * 20) + 1,
      user_email: `user${Math.floor(Math.random() * 1000)}@test.com`,
      items: [
        {
          menu_item_id: Math.floor(Math.random() * 50) + 1,
          quantity: Math.floor(Math.random() * 3) + 1,
        },
      ],
    };
    return done();
  },
};
