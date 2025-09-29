// Email and password validation utilities

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isStrongPassword(password) {
  if (!password || typeof password !== 'string') return false;
  
  // At least 8 characters, contains numbers and special characters
  const minLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return minLength && hasNumber && hasSpecialChar;
}