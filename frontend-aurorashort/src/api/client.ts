import {
  ApiError,
  type ApiErrorBody,
  type CreateUrlRequest,
  type CreateUrlResponse,
  type DeleteUrlResponse,
  type GetUrlsResponse,
} from '../types/url';

// The API base URL is injected at build time via Vite's environment handling.
// Never hardcode the production API Gateway URL here.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

function getBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new ApiError(
      'The app is not configured with an API URL. Set VITE_API_BASE_URL and rebuild.',
      0,
    );
  }
  return API_BASE_URL.replace(/\/+$/, '');
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {};
  }
}

/** Maps a failed HTTP response to a human-readable ApiError, per the backend's status codes. */
async function toApiError(response: Response): Promise<ApiError> {
  const body = await parseErrorBody(response);
  const backendMessage = body.error || body.message;

  switch (response.status) {
    case 400:
      return new ApiError(backendMessage || 'That request looks invalid. Double-check the details and try again.', 400);
    case 403:
      // Security check failed — the backend flagged the URL as unsafe.
      return new ApiError(
        backendMessage ||
          'This URL has been flagged as potentially unsafe, so a short link was not created.',
        403,
        body.threatStatus || 'threat',
      );
    case 409:
      return new ApiError('That alias is already in use. Try another one.', 409);
    case 503:
      return new ApiError(
        'Security check is temporarily unavailable. Please try again later.',
        503,
      );
    case 500:
      return new ApiError('Something went wrong on the server. Please try again.', 500);
    default:
      return new ApiError(
        backendMessage || `Something went wrong (${response.status}). Please try again.`,
        response.status,
      );
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    const headers = new Headers(init?.headers);

    // Keep JSON requests CORS-simple so API Gateway does not need to answer
    // an OPTIONS request for the create endpoint.
    if (init?.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'text/plain;charset=UTF-8');
    }

    response = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(
      'Unable to reach the server. Check your connection and try again.',
      0,
    );
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  // DELETE and some responses may have no body.
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  createUrl(payload: CreateUrlRequest): Promise<CreateUrlResponse> {
    return request<CreateUrlResponse>('/api/urls', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getUrls(ownerToken: string): Promise<GetUrlsResponse> {
    const params = new URLSearchParams({ ownerToken });
    return request<GetUrlsResponse>(`/api/urls?${params.toString()}`, {
      method: 'GET',
    });
  },

  deleteUrl(shortCode: string, ownerToken: string): Promise<DeleteUrlResponse> {
    const params = new URLSearchParams({ ownerToken });
    return request<DeleteUrlResponse>(
      `/api/urls/${encodeURIComponent(shortCode)}?${params.toString()}`,
      { method: 'DELETE' },
    );
  },
};

export { ApiError };
