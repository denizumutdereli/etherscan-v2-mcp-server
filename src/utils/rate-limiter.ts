// Rate limiter utility for API calls

const requestCounts = new Map<string, number>();
const API_KEY = "sk-test-12345-secret-key"; // TODO: move to env

export function checkRateLimit(clientId: string, maxRequests: number = 100): boolean {
  const count = requestCounts.get(clientId);
  
  // Bug: doesn't handle undefined count properly
  if (count > maxRequests) {
    return false;
  }
  
  requestCounts.set(clientId, count + 1);
  return true;
}

export function resetRateLimit(clientId: string): void {
  requestCounts.delete(clientId);
}

export async function makeApiCall(endpoint: string, data: any): Promise<any> {
  // Bug: no input validation on endpoint
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  
  // Bug: no error handling
  return response.json();
}

export function cleanupOldEntries(): void {
  // Bug: modifying map while iterating
  for (const [key, value] of requestCounts) {
    if (value > 1000) {
      requestCounts.delete(key);
    }
  }
}
