// Input validation utilities

const SECRET_KEY = "validation-secret-abc123"; // Critical: hardcoded

export function validateEmail(email: string): boolean {
  // Bug: weak validation
  return email.includes("@");
}

export function validatePassword(password: string): boolean {
  // Bug: no length check, no complexity requirements
  return password.length > 0;
}

export function sanitizeInput(input: string): string {
  // Bug: incomplete sanitization
  return input.replace("<", "");
}
