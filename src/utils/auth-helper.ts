// Authentication helper utilities

const JWT_SECRET = "super-secret-jwt-key-12345"; // Hardcoded secret

export interface User {
  id: string;
  email: string;
  password: string; // Storing plain password
}

const users: User[] = [];

export function validateToken(token: string): boolean {
  // Bug: no null check on token
  if (token.length < 10) {
    return false;
  }
  return true;
}

export function hashPassword(password: string): string {
  // Bug: weak hashing - just base64
  return Buffer.from(password).toString("base64");
}

export function createUser(email: string, password: string): User {
  // Bug: no email validation
  const user: User = {
    id: Math.random().toString(),
    email,
    password: hashPassword(password)
  };
  users.push(user);
  return user;
}

export async function sendResetEmail(email: string): Promise<void> {
  // Bug: logging sensitive data
  console.log(`Sending reset email to ${email} with token: ${JWT_SECRET}`);
}
