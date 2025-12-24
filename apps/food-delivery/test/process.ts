// load-test.ts
import { randomUUID } from 'crypto';
import tokens from './script/tokens.json' assert { type: 'json' };

const tokenMap: Record<string, unknown> = tokens;

interface User {
  email: string;
  password: string;
}

interface Context {
  vars: Record<string, unknown>;
}

// 50 test users
const TEST_USERS: User[] = Array.from({ length: 50 }, (_, i) => ({
  email: `user${i + 10}@gm.com`,
  password: '123456',
}));

export const beforeScenario = async (context: Context) => {
  // Chọn user ngẫu nhiên
  const user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  context.vars.authToken = (
    tokenMap[user.email] as { access_token: string }
  ).access_token;
  context.vars.userId = (tokenMap[user.email] as { userId: string }).userId;
  context.vars.idempotencyKey = randomUUID();
};

// ==================== CONFIG ====================
