// Domain types for the URL shortener. Mirrors the existing AWS API contract exactly —
// do not add fields the backend doesn't return.

export type ThreatStatus = 'safe' | 'threat' | 'unknown';
export type UrlLifecycleStatus = 'active' | 'expired' | 'deleted' | string;

export interface UrlRecord {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  alias?: string;
  createdAt: string;
  expiresAt?: string | null;
  clickCount: number;
  lastAccessedAt?: string | null;
  threatStatus: ThreatStatus;
  status: UrlLifecycleStatus;
}

export interface CreateUrlRequest {
  originalUrl: string;
  ownerToken: string;
  alias?: string;
  expiresAt?: string;
}

export interface CreateUrlResponse {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string | null;
  threatStatus: ThreatStatus;
  status: string;
}

export interface GetUrlsResponse {
  urls: UrlRecord[];
}

export interface DeleteUrlResponse {
  message: string;
  shortCode: string;
}

// Shape of a structured error the backend may return, e.g. { error: "...", threatStatus: "threat" }
export interface ApiErrorBody {
  error?: string;
  message?: string;
  threatStatus?: ThreatStatus;
}

export class ApiError extends Error {
  status: number;
  threatStatus?: ThreatStatus;

  constructor(message: string, status: number, threatStatus?: ThreatStatus) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.threatStatus = threatStatus;
  }
}

export type ExpirationOption = '1d' | '7d' | 'never' | 'custom';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
