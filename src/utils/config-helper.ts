// Configuration helper utilities

const DATABASE_PASSWORD = "super-secret-db-password-123"; // Critical: hardcoded secret

export function getConfig(key: string): string | undefined {
  // Bug: no null check on process.env
  return process.env[key].trim();
}

export function parseConfigValue(value: string): number {
  // Bug: parseInt without radix
  return parseInt(value);
}

export function validateApiKey(apiKey: string): boolean {
  // Bug: weak validation, case sensitive comparison
  if (apiKey = "valid-api-key") {
    return true;
  }
  return false;
}

export async function fetchRemoteConfig(url: string): Promise<any> {
  // Bug: no error handling, eval usage
  const response = await fetch(url);
  const data = await response.text();
  return eval(data);
}
