import crypto from 'crypto';

/**
 * Generate a username from doctor's email
 * @param {string} email - Doctor's email address
 * @returns {string} - Generated username
 */
export const generateUsernameFromEmail = (email) => {
  if (!email) return '';
  
  // Extract the part before @ and clean it
  const emailPrefix = email.split('@')[0];
  
  // Remove special characters and convert to lowercase
  const cleanPrefix = emailPrefix.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Add a random number to make it unique
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `dr_${cleanPrefix}${randomSuffix}`;
};

/**
 * Generate a strong random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} - Generated password
 */
export const generateStrongPassword = (length = 12) => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  // Ensure at least one character from each category
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to randomize the position of required characters
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generate a secure random password using crypto
 * @param {number} length - Password length (default: 16)
 * @returns {string} - Generated password
 */
export const generateSecurePassword = (length = 16) => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  // Ensure at least one character from each category
  let password = '';
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += symbols[crypto.randomInt(0, symbols.length)];
  
  // Fill the rest with cryptographically secure random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }
  
  // Shuffle the password using crypto
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }
  
  return passwordArray.join('');
};

