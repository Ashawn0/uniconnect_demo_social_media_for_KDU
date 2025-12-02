// Application constants

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
} as const;

export const AUTH = {
  SESSION_MAX_AGE: 30 * 24 * 60 * 60 * 1000, // 30 days
  BCRYPT_ROUNDS: 10,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 10, // requests per window
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const REACTIONS = {
  TYPES: ['like', 'love', 'fire', 'lightbulb', 'thinking'] as const,
} as const;
