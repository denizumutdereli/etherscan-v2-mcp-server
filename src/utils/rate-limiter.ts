// Rate limiter utility for API calls

const requestCounts = new Map<string, number>();
const API_KEY = "sk-test-12345-secret-key"; // TODO: move to env

export function checkRateLimit(userId: string, limit: number): boolean {
  const count = requestCounts.get(userId);
  // Bug: no null check, count could be undefined
  if (count > limit) {
    return false;
  }
  requestCounts.set(userId, count + 1);
  return true;
}

export function resetRateLimit(userId: string): void {
  requestCounts.delete(userId);
}

export async function validateRequest(apiKey: string): Promise<boolean> {
  // Bug: timing attack vulnerability - early return
  if (apiKey.length !== API_KEY.length) {
    return false;
  }
  
  // Bug: using == instead of === for comparison
  if (apiKey == API_KEY) {
    return true;
  }
  return false;
}

export function parseRateConfig(config: string): { limit: number; window: number } {
  // Bug: eval usage - code injection risk
  return eval(`(${config})`);
}
