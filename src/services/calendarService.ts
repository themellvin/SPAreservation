import { calClient } from '../api/calClient';

export interface Calendar {
  id: number;
  name: string;
  provider: string;
  primary: boolean;
  status: string;
}

export interface CalendarConnection {
  connectionId: number;
  provider: string;
  accountLabel: string;
  status: string;
}

export interface EventType {
  id: number;
  title: string;
  slug: string;
  duration: number;
  /** All allowed durations when the event type supports multiple (e.g. 20, 60, 80 min) */
  allowedDurations?: number[];
  description: string;
  userId?: number | string;
  teamId?: number | string;
  hidden?: boolean;
  requiresConfirmation?: boolean;
}

/**
 * If an event type has multiple allowed durations, expand it into one
 * virtual EventType per duration so each appears as a distinct treatment variant.
 * e.g. "Massage Manual" (20|60|80 min) → 3 items.
 */
export function expandEventTypeByDurations(et: EventType): EventType[] {
  if (!et.allowedDurations || et.allowedDurations.length <= 1) return [et];
  return et.allowedDurations.map(dur => ({
    ...et,
    duration: dur,
    title: `${et.title} (${dur} min)`,
    allowedDurations: et.allowedDurations
  }));
}

export interface CalUser {
  id: number | string;
  username: string;
  email: string;
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  timeZone?: string;
  weekStart?: string;
  locked?: boolean;
}

export interface BookingPayload {
  eventTypeId: number;
  start: string;
  end: string;
  name: string;
  email: string;
  timeZone?: string;
  language?: string;
  title?: string;
  description?: string;
  metadata?: Record<string, string>;
  responses?: Record<string, any>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalize any Cal.com API response shape into a plain array.
 * Handles all known wrapper formats from Cal.com v1/v2 self-hosted and cloud.
 */
function extractArray(response: any, keys: string[]): any[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;

  // { status: 'success'|'ok', data: … }
  if (response.status === 'success' || response.status === 'ok') {
    const d = response.data;
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object') {
      for (const k of keys) if (Array.isArray(d[k])) return d[k];
      // last resort: first array value inside data
      for (const v of Object.values(d)) {
        if (Array.isArray(v) && (v as any[]).length > 0) return v as any[];
      }
    }
  }

  // bare object with known array keys
  for (const k of keys) if (Array.isArray(response[k])) return response[k];

  return [];
}

function mapCalendar(cal: any): Calendar {
  const prov = cal.integration || cal.type || cal.provider || 'unknown';
  return {
    id: cal.id,
    name: cal.name || cal.externalId || cal.email || 'Unnamed Calendar',
    provider: typeof prov === 'string' ? prov : 'unknown',
    primary: !!cal.primary,
    status: cal.invalid ? 'invalid' : cal.status || 'active'
  };
}

function mapEventType(et: any): EventType {
  // Log raw fields in dev so we can see exactly what the API sends
  if (import.meta.env.DEV) {
    console.log('[cal:eventType raw]', JSON.stringify(et));
  }

  // Cal.com exposes multiple allowed durations via `metadata.multipleDuration` or
  // `availableDurations` or `lengths` array — capture all variants.
  const multiDurations: number[] | undefined =
    et.metadata?.multipleDuration?.length > 0 ? et.metadata.multipleDuration :
    Array.isArray(et.availableDurations) && et.availableDurations.length > 0 ? et.availableDurations :
    Array.isArray(et.lengths) && et.lengths.length > 0 ? et.lengths :
    undefined;

  const defaultDuration = et.length || et.duration || et.slotDuration || 60;
  const allDurations = multiDurations && multiDurations.length > 0 ? multiDurations : [defaultDuration];

  return {
    id: et.id,
    title: et.title || et.name || et.type || `Event ${et.id}`,
    slug: et.slug || et.eventName || '',
    duration: defaultDuration,
    allowedDurations: allDurations,
    description: et.description || et.notes || '',
    userId: et.userId ?? et.user_id ?? et.owner?.id,
    teamId: et.teamId ?? et.team_id,
    hidden: !!et.hidden,
    requiresConfirmation: !!et.requiresConfirmation
  };
}

export function mapUser(u: any): CalUser {
  return {
    id: u.id,
    username: u.username || u.email?.split('@')[0] || String(u.id),
    email: u.email || '',
    name: u.name || u.displayName || u.username || u.email || 'Unknown',
    role: u.role || 'member',
    bio: u.bio || '',
    avatar: u.avatar || u.avatarUrl || u.image || '',
    timeZone: u.timeZone || u.timezone || 'UTC',
    weekStart: u.weekStart || 'Monday',
    locked: !!u.locked
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const calendarService = {

  // ── Users ─────────────────────────────────────────────────────────────────
  /**
   * Multi-strategy user discovery.
   * On self-hosted Cal.diy without org setup, only /me returns reliably.
   * Use the manual "Add Users by Username" UI for other users.
   */
  getUsers: async (): Promise<CalUser[]> => {
    // Strategy 1: /users (org admin)
    try {
      const res = await calClient.get('/users');
      const items = extractArray(res, ['users', 'members', 'data', 'profiles']);
      if (items.length > 0) {
        console.log('[cal] /users returned', items.length);
        return items.map(mapUser);
      }
    } catch (e: any) {
      console.warn('[cal] /users:', e.message);
    }

    // Strategy 2: org members
    try {
      const orgsRes = await calClient.get('/organizations');
      const orgs = extractArray(orgsRes, ['organizations', 'data']);
      for (const org of orgs.slice(0, 3)) {
        try {
          const memRes = await calClient.get(`/organizations/${org.id}/users`);
          const members = extractArray(memRes, ['users', 'members', 'data']);
          if (members.length > 0) return members.map(mapUser);
        } catch {}
      }
    } catch (e: any) {
      console.warn('[cal] /organizations:', e.message);
    }

    // Strategy 3: /me — always returns at least the authenticated user
    try {
      const res = await calClient.get('/me');
      const raw = res?.data?.user || res?.data || res;
      if (raw && (raw.id || raw.email)) {
        console.log('[cal] /me fallback:', raw.username || raw.email);
        return [mapUser(raw)];
      }
    } catch (e: any) {
      console.warn('[cal] /me:', e.message);
    }

    return [];
  },

  // ── Calendars ─────────────────────────────────────────────────────────────
  getCalendars: async (): Promise<Calendar[]> => {
    const res = await calClient.get('/calendars');
    const items = extractArray(res, ['calendars', 'connectedCalendars', 'data']);
    return items.map(mapCalendar);
  },

  getCalendarsForUser: async (userId: string | number): Promise<Calendar[]> => {
    try {
      const res = await calClient.get(`/calendars?userId=${userId}`);
      const items = extractArray(res, ['calendars', 'connectedCalendars', 'data']);
      return items.map(mapCalendar);
    } catch {
      return calendarService.getCalendars();
    }
  },

  // ── Connections ──────────────────────────────────────────────────────────
  getConnections: async (): Promise<CalendarConnection[]> => {
    let res: any;
    try {
      res = await calClient.get('/calendars/credentials');
    } catch {
      try { res = await calClient.get('/calendars/connections'); }
      catch { return []; }
    }
    const items = extractArray(res, ['credentials', 'connections', 'connectedCalendars', 'data']);
    return items.map((conn: any) => ({
      connectionId: conn.id || conn.credentialId || conn.connectionId,
      provider: conn.integration || conn.type || conn.provider || 'unknown',
      accountLabel: conn.name || conn.accountLabel || conn.email || 'Connected Account',
      status: conn.invalid ? 'invalid' : conn.status || 'connected'
    }));
  },

  // ── Event Types ────────────────────────────────────────────────────────────
  /**
   * Fetch event types. On Cal.diy self-hosted, username param is required.
   * Tries username-filter first (most reliable), then global fallback.
   */
  getEventTypes: async (username?: string): Promise<EventType[]> => {
    // Username-first: most reliable on self-hosted
    if (username && username.trim()) {
      try {
        const res = await calClient.get(`/event-types?username=${encodeURIComponent(username.trim())}`, undefined, username);
        if (import.meta.env.DEV) console.log('[cal] /event-types?username raw:', JSON.stringify(res).substring(0, 300));
        const items = extractArray(res, ['eventTypes', 'event_types', 'data']);
        if (items.length > 0) return items.map(mapEventType);
      } catch (e: any) {
        console.warn('[cal] /event-types?username:', username, e.message);
      }
    }

    // Global fallback
    try {
      const res = await calClient.get('/event-types');
      if (import.meta.env.DEV) console.log('[cal] /event-types global raw:', JSON.stringify(res).substring(0, 300));
      const items = extractArray(res, ['eventTypes', 'event_types', 'data']);
      if (items.length > 0) return items.map(mapEventType);
    } catch (e: any) {
      console.warn('[cal] /event-types (global):', e.message);
    }

    return [];
  },

  getEventTypesForUser: async (userId: string | number, username?: string): Promise<EventType[]> => {
    // Username filter is most reliable on self-hosted
    if (username && username.trim()) {
      try {
        let res;
        if (typeof window !== 'undefined') {
          const { getApiConfig } = await import('../api/calClient');
          const { apiKey, apiEndpoint } = getApiConfig(username);
          const proxyUrl = `http://${window.location.hostname}:3001/api/proxy/event-types?username=${encodeURIComponent(username.trim())}`;
          const proxyRes = await fetch(proxyUrl, {
            headers: { 'X-Proxy-Api-Key': apiKey, 'X-Proxy-Api-Url': apiEndpoint }
          });
          res = await proxyRes.json();
        } else {
          res = await calClient.get(`/event-types?username=${encodeURIComponent(username.trim())}`, undefined, username);
        }
        const items = extractArray(res, ['eventTypes', 'event_types', 'data']);
        if (items.length > 0) return items.map((et: any) => ({ ...mapEventType(et), userId: mapEventType(et).userId ?? userId }));
      } catch (e: any) {
        console.error(`[cal] Failed to fetch event types for username ${username}:`, e.message);
      }
    }
    // Numeric userId fallback
    const numId = typeof userId === 'string' && !isNaN(Number(userId)) ? Number(userId) : userId;
    if (typeof numId === 'number') {
      try {
        const res = await calClient.get(`/event-types?userId=${numId}`, undefined, username);
        const items = extractArray(res, ['eventTypes', 'event_types', 'data']);
        if (items.length > 0) return items.map((et: any) => ({ ...mapEventType(et), userId: mapEventType(et).userId ?? userId }));
      } catch {}
    }
    return [];
  },

  /**
   * Aggregate event types across all users via per-username fetch.
   * This is the only reliable path on self-hosted Cal.diy.
   */
  getAllEventTypesForUsers: async (users: CalUser[]): Promise<EventType[]> => {
    const seen = new Set<number>();
    const all: EventType[] = [];

    for (const user of users) {
      if (!user.username) continue;
      try {
        const ets = await calendarService.getEventTypesForUser(user.id, user.username);
        for (const et of ets) {
          if (!seen.has(et.id)) { seen.add(et.id); all.push(et); }
        }
      } catch {}
    }

    // Global fallback if per-user fetches all returned nothing
    if (all.length === 0) {
      try {
        const res = await calClient.get('/event-types');
        const items = extractArray(res, ['eventTypes', 'event_types', 'data']);
        for (const et of items.map(mapEventType)) {
          if (!seen.has(et.id)) { seen.add(et.id); all.push(et); }
        }
      } catch {}
    }

    return all;
  },

  // ── Bookings ──────────────────────────────────────────────────────────────
  createBooking: async (payload: BookingPayload): Promise<any> => {
    return await calClient.post('/bookings', payload);
  },

  rescheduleBooking: async (uid: string, rescheduleReason: string, newStart: string, newEnd: string): Promise<any> => {
    return await calClient.patch(`/bookings/${uid}/reschedule`, {
      rescheduleReason,
      start: newStart,
      end: newEnd
    });
  },

  cancelBooking: async (uid: string, cancellationReason: string): Promise<any> => {
    return await calClient.post(`/bookings/${uid}/cancel`, { cancellationReason });
  },

  getBusyTimes: async (dateFrom: string, dateTo: string, timeZone: string = 'Europe/Riga', calendarsToLoad?: string[]): Promise<any> => {
    let url = `/calendars/busy-times?timeZone=${encodeURIComponent(timeZone)}&dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
    if (calendarsToLoad && calendarsToLoad.length > 0) {
      calendarsToLoad.forEach((cal, idx) => {
        url += `&calendarsToLoad${idx}=${encodeURIComponent(cal)}`;
      });
    }
    const response = await calClient.get(url);
    return response;
  }
};
