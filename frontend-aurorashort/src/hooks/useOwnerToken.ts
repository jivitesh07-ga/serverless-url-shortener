import { useState } from 'react';

const STORAGE_KEY = 'url_shortener_owner_token';

/**
 * Generates (or reuses) a random token that identifies this browser to the backend.
 * This is NOT an authentication credential — there are no user accounts. It's just
 * a way for the backend to associate short URLs with "whoever created them from this
 * browser" so the dashboard and delete actions only affect the visitor's own links.
 */
function readOrCreateOwnerToken(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing && existing.length >= 20) {
    return existing;
  }

  const token =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '')
      : generateFallbackToken();

  localStorage.setItem(STORAGE_KEY, token);
  return token;
}

function generateFallbackToken(): string {
  // Fallback for environments without crypto.randomUUID — still browser-native randomness.
  const bytes = new Uint8Array(24);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function useOwnerToken(): string {
  const [token] = useState<string>(() => readOrCreateOwnerToken());
  return token;
}
