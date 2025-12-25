// generate-tokens.ts
import fs from 'fs';

interface User {
  id: string;
  email: string;
  password: string;
}

const TEST_USERS: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: `user${i + 10}`,
  email: `user${i + 10}@gm.com`,
  password: '123456',
}));

const API_URL = process.env.API_URL || 'http://localhost:8080';

async function main() {
  const tokens: Record<string, { access_token: string; userId: string }> = {};

  for (const user of TEST_USERS) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
    });

    if (!res.ok) {
      console.error(`Login failed: ${user.email}`);
      continue;
    }

    const data = await res.json();
    tokens[user.email] = {
      access_token: data.access_token,
      userId: data.user.id,
    };
    console.log(`Token generated for ${user.email}`);
  }

  fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
  console.log('All tokens saved to tokens.json');
}

main();
