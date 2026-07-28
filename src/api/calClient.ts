export interface CalApiError {
  status: number;
  message: string;
  type?: string;
}

export class CalClientError extends Error {
  status: number;
  type?: string;
  constructor(status: number, message: string, type?: string) {
    super(message);
    this.name = 'CalClientError';
    this.status = status;
    this.type = type;
  }
}

/**
 * Extract the bare origin (https://host) from whatever the user typed as endpoint.
 * Handles: https://host, https://host/api, https://host/api/v2, https://host/v2, etc.
 * Uses the URL constructor which is bulletproof — no regex fragility.
 */
function extractOrigin(endpoint: string): string {
  const cleaned = endpoint.trim().replace(/\/+$/, '');
  try {
    return new URL(cleaned).origin;
  } catch {
    // If URL constructor fails (e.g. no protocol), try with https://
    try {
      return new URL(`https://${cleaned}`).origin;
    } catch {
      return cleaned;
    }
  }
}

export const getApiConfig = (targetUsername?: string) => {
  const globalKey = localStorage.getItem('sb_calcom_api_key') || '';
  let apiKey = globalKey;
  
  if (targetUsername) {
    try {
      const savedKeys = localStorage.getItem('sb_calcom_api_keys');
      if (savedKeys) {
        const keysMap = JSON.parse(savedKeys);
        if (keysMap[targetUsername]) {
          apiKey = keysMap[targetUsername];
        } else {
          // Look up specialist ID since keys are now stored by therapist_id to prevent UI resets
          const specId = localStorage.getItem('sb_spec_sheet_id') || '1EX8EBboc87ZMFfhSkEf27EA_EkQPDEMpiXgjSELWAZA';
          const specsStr = localStorage.getItem(`sb_real_specialists_list_${specId}`) || localStorage.getItem('sb_offline_specialists_list');
          if (specsStr) {
            const specs = JSON.parse(specsStr);
            const spec = specs.find((s: any) => s.calUsername === targetUsername || s.therapist_name?.toLowerCase() === targetUsername.toLowerCase());
            if (spec && keysMap[spec.therapist_id]) {
              apiKey = keysMap[spec.therapist_id];
            }
          }
        }
      }
    } catch {}
  }

  let rawEndpoint = localStorage.getItem('sb_calcom_api_endpoint') || 'https://calcom.run.place';
  if (rawEndpoint.includes('api.cal.com')) {
    rawEndpoint = 'https://calcom.run.place';
  }
  const rawBookingsEndpoint = localStorage.getItem('sb_calcom_bookings_endpoint') || '';

  // Always build from bare origin + /api/v2 — works no matter what the user typed
  const origin = extractOrigin(rawEndpoint);
  let apiEndpoint = `${origin}/api/v2`;

  // Force HTTPS for calcom.run.place
  if (apiEndpoint.toLowerCase().includes('calcom.run.place')) {
    apiEndpoint = apiEndpoint.replace(/^http:\/\//i, 'https://');
  }
  // Force HTTPS when page is served over HTTPS (mixed-content block prevention)
  if (typeof window !== 'undefined' && window.location?.protocol === 'https:') {
    apiEndpoint = apiEndpoint.replace(/^http:\/\//i, 'https://');
  }

  // Bookings endpoint: if user set a separate one, use it; otherwise fall back to main /api/v2
  let bookingsEndpoint = rawBookingsEndpoint.trim()
    ? rawBookingsEndpoint.trim().replace(/\/+$/, '')
    : apiEndpoint;

  // FORCE V2: The server returns 404 for /v1 and /api/v1, V2 is the only active API route
  if (bookingsEndpoint.includes('/v1')) {
    bookingsEndpoint = bookingsEndpoint.replace(/\/api\/v1|\/v1/g, '/api/v2');
  }

  return {
    apiKey: apiKey.trim(),
    apiEndpoint,
    bookingsEndpoint
  };
};

export const calRequest = async (path: string, options: RequestInit & { targetUsername?: string } = {}): Promise<any> => {
  const { apiKey, apiEndpoint } = getApiConfig(options.targetUsername);

  const relativePath = path.startsWith('/') ? path : `/${path}`;
  
  // Build fallback URL list: primary (/api/v2/slots), fallback (/api/v1/slots or /api/slots)
  const primaryUrl = `${apiEndpoint}${relativePath}`;
  const origin = extractOrigin(apiEndpoint);
  const fallbackUrl = relativePath.startsWith('/slots')
    ? `${origin}/api/slots${relativePath.replace('/slots', '')}`
    : `${origin}/api${relativePath}`;

  const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
  // Cal.com API versioning:
  //   2024-08-13 — required for bookings (create, reschedule, cancel)
  //   2024-06-14 — for event types, slots, calendars, users etc.
  const isBookingsPath = relativePath.startsWith('/bookings') || relativePath.includes('/bookings/');
  const calApiVersion = (isBookingsPath || relativePath.includes('reschedule')) ? '2024-08-13' : '2024-06-14';
  const headers = {
    'Authorization': authHeader,
    'Content-Type': 'application/json',
    'cal-api-version': calApiVersion,
    ...(options.headers || {})
  };

  const urlsToTry = [primaryUrl, fallbackUrl];
  let lastError: any = null;

  for (const url of urlsToTry) {
    try {
      if (import.meta.env.DEV) {
        console.log(`[calClient] ${options.method || 'GET'} ${url}`);
      }
      const response = await fetch(url, { ...options, headers });

      if (response.ok) {
        if (response.status === 204) return null;
        return await response.json();
      }

      let errMsg = `HTTP ${response.status}: ${response.statusText}`;
      let errType = '';
      try {
        const errJson = await response.json();
        errMsg = errJson?.error?.message || errJson?.message || errMsg;
        errType = errJson?.error?.type || errJson?.type || '';
      } catch {}
      lastError = new CalClientError(response.status, errMsg, errType);
      
      // If 404 on primary v2 endpoint, silently try fallback v1/v2 endpoint
      if (response.status === 404 && url === primaryUrl && urlsToTry.length > 1) {
        continue;
      }
      break;
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new CalClientError(500, 'Request failed');
};

/**
 * calBookingsRequest — uses the bookings-specific endpoint (may differ from users/event-types endpoint).
 */
export const calBookingsRequest = async (path: string, options: RequestInit = {}): Promise<any> => {
  const { apiKey, bookingsEndpoint } = getApiConfig();

  const relativePath = path.startsWith('/') ? path : `/${path}`;
  const url = `${bookingsEndpoint}${relativePath}`;

  const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
  const calApiVersion2 = (relativePath.includes('bookings') || relativePath.includes('reschedule')) ? '2024-08-13' : '2024-06-14';

  const headers = {
    'Authorization': authHeader,
    'Content-Type': 'application/json',
    'cal-api-version': calApiVersion2,
    ...(options.headers || {})
  };

  if (import.meta.env.DEV) {
    console.log(`[calClient:bookings] ${options.method || 'GET'} ${url}`);
  }

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const j = await response.json();
        errMsg = j?.error?.message || j?.message || errMsg;
      } catch {}
      throw new CalClientError(response.status, errMsg);
    }
    if (response.status === 204) return null;
    return await response.json();
  } catch (err: any) {
    if (err instanceof CalClientError) throw err;
    throw new CalClientError(500, err.message || 'Network / server error occurred');
  }
};

export const calClient = {
  get: (path: string, headers?: Record<string, string>, targetUsername?: string) => calRequest(path, { method: 'GET', headers, targetUsername }),
  post: (path: string, body?: any, headers?: Record<string, string>, targetUsername?: string) => calRequest(path, {
    method: 'POST',
    headers,
    targetUsername,
    body: body ? JSON.stringify(body) : undefined
  }),
  patch: (path: string, body?: any, headers?: Record<string, string>, targetUsername?: string) => calRequest(path, {
    method: 'PATCH',
    headers,
    targetUsername,
    body: body ? JSON.stringify(body) : undefined
  })
};

/** Helper to get the computed API base URL (for display in UI) */
export const getCalApiBaseUrl = (): string => getApiConfig().apiEndpoint;
export const getCalBookingsUrl = (): string => getApiConfig().bookingsEndpoint;
