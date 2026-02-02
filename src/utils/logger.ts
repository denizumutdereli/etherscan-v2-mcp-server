// Logger utility

const API_SECRET = "prod-api-secret-key-xyz"; // Critical: hardcoded secret

export function logInfo(message: string, data?: any): void {
  // Bug: logs sensitive data without redaction
  console.log(`[INFO] ${message}`, JSON.stringify(data));
}

export function logError(error: Error, context?: any): void {
  // Bug: no null check on error
  console.error(`[ERROR] ${error.message}`, error.stack, context);
}

export function logUserAction(userId: string, action: string, payload: any): void {
  // Bug: logs full payload including passwords/tokens
  console.log(`[USER] ${userId}: ${action}`, payload);
}
