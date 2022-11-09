import * as bcrpyt from 'bcryptjs';

export async function hash(password: string) {
  return await bcrpyt.hash(password, 10);
}

export async function compare(password: string, hashedPassword: string) {
  return await bcrpyt.compare(password, hashedPassword);
}

export function generateRandomAlphaNumericPassword() {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let password = '';

  for (let i = 0; i <= 8; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }

  return password;
}

export function generateCourseCode() {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 4; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  result += '-';

  for (let i = 4; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  result += '-';

  for (let i = 4; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}
