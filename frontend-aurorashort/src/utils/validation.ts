const ALIAS_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function validateLongUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter a URL to shorten.';
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return 'Enter a valid URL, including https://';
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'Only http:// and https:// URLs are supported.';
  }
  return null;
}

export function validateAlias(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null; // optional field
  if (trimmed.length < 3 || trimmed.length > 50) {
    return 'Alias must be 3–50 characters.';
  }
  if (!ALIAS_PATTERN.test(trimmed)) {
    return 'Use only letters, numbers, hyphens, and underscores.';
  }
  return null;
}

export function validateCustomExpiration(value: string): string | null {
  if (!value) return 'Choose a date and time.';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Enter a valid date and time.';
  if (date.getTime() <= Date.now()) {
    return 'Expiration must be in the future.';
  }
  return null;
}
