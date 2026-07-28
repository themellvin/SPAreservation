import { calClient } from '../api/calClient';

export interface AvailabilitySlot {
  time: string;
  duration?: number;
}

export interface Schedule {
  id: number;
  name: string;
  isDefault: boolean;
}

export const availabilityService = {
  getSchedules: async (): Promise<Schedule[]> => {
    const response = await calClient.get('/atoms/schedules');
    if (response && response.status === 'success' && Array.isArray(response.data)) {
      return response.data.map((s: any) => ({
        id: s.id,
        name: s.name || 'Default Schedule',
        isDefault: !!s.isDefault
      }));
    }
    return [];
  },

  /**
   * Fetch available slots for an event type on a specific date.
   *
   * Cal.com V2 self-hosted API formats:
   *   1. { status:"success", data: { slots: { "2026-07-22": [{time, duration}, ...] } } }
   *   2. { slots: { "2026-07-22": [{time, duration}, ...] } }
   *   3. [{ time: "..." }]
   *
   * Queries both by numeric eventTypeId AND by eventTypeSlug + username for complete compatibility.
   */
  getSlotsForEventSlug: async (
    eventSlugOrId: string | number,
    date: string,
    username?: string,
    durationMinutes?: number,
    eventSlug?: string
  ): Promise<AvailabilitySlot[]> => {
    const timezone = 'Europe/Riga';
    const startStr = `${date}T00:00:00Z`;
    const endStr   = `${date}T23:59:59Z`;

    const parseSlotsFromResponse = (response: any): AvailabilitySlot[] => {
      const data = response?.data ?? response;
      if (!data) return [];

      if (import.meta.env.DEV) console.log('[cal:slots raw response]', JSON.stringify(data).substring(0, 300));

      // 1. Direct array of slots: [{ time, duration }, ...] or [{ start, end }, ...]
      if (Array.isArray(data)) {
        return data.map((s: any) => ({ time: s.time || s.start || s.startTime || String(s), duration: s.duration || s.length }));
      }

      // 2. Dictionary keyed by date string: { slots: { "2026-07-22": [{ time, ... }] } } or { "2026-07-22": [...] }
      const slotsDict = data.slots || (data.data && data.data.slots) || (typeof data === 'object' ? data : null);
      if (slotsDict && typeof slotsDict === 'object' && !Array.isArray(slotsDict)) {
        const targetMap = slotsDict.slots && typeof slotsDict.slots === 'object' && !Array.isArray(slotsDict.slots) ? slotsDict.slots : slotsDict;
        const allSlots: AvailabilitySlot[] = [];

        for (const key of Object.keys(targetMap)) {
          const item = targetMap[key];
          if (Array.isArray(item)) {
            item.forEach((s: any) => {
              allSlots.push({ time: s.time || s.start || s.startTime || String(s), duration: s.duration || s.length });
            });
          }
        }
        if (allSlots.length > 0) return allSlots;
      }

      // 3. Nested slots array: { slots: [...] } or { data: [...] }
      if (Array.isArray(data?.slots)) {
        return (data.slots as any[]).map((s: any) => ({ time: s.time || s.start || s.startTime || String(s), duration: s.duration || s.length }));
      }

      return [];
    };

    const durParam = durationMinutes ? `&duration=${durationMinutes}` : '';

    const executeSlotQuery = async (params: string): Promise<AvailabilitySlot[]> => {
      // Cal.com v2 official endpoint is /slots/available
      const endpoints = [`/slots/available?${params}`];
      for (const ep of endpoints) {
        try {
          // Use proxy to inject the correct API key based on username
          const proxyHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
          let proxyUrl = `http://${proxyHost}:3001/api/proxy${ep}`;
          const proxyRes = await fetch(proxyUrl);
          if (!proxyRes.ok) {
            throw new Error(`HTTP ${proxyRes.status}`);
          }
          const response = { data: await proxyRes.json() };
          
          const slots = parseSlotsFromResponse(response);
          if (slots.length > 0) return slots;
        } catch (err: any) {
          // If HTTP 404, try next endpoint variant silently
          if (err?.status !== 404 && import.meta.env.DEV) {
            console.warn(`[availabilityService] ${ep} error:`, err.message);
          }
        }
      }
      return [];
    };

    const slugToUse = eventSlug || (isNaN(Number(eventSlugOrId)) ? String(eventSlugOrId) : '');

    // Strategy 1: /slots/available with startTime/endTime & username + eventTypeSlug (Cal.com v2 standard)
    if (username && slugToUse) {
      const q = `startTime=${encodeURIComponent(startStr)}&endTime=${encodeURIComponent(endStr)}&timeZone=${encodeURIComponent(timezone)}&username=${encodeURIComponent(username)}&eventTypeSlug=${encodeURIComponent(slugToUse)}${durParam}`;
      const slots = await executeSlotQuery(q);
      if (slots.length > 0) return slots;
    }

    // Strategy 2: /slots with start/end & username + eventTypeSlug (legacy/self-hosted v2)
    if (username && slugToUse) {
      const q = `start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(endStr)}&timeZone=${encodeURIComponent(timezone)}&username=${encodeURIComponent(username)}&eventTypeSlug=${encodeURIComponent(slugToUse)}${durParam}`;
      const slots = await executeSlotQuery(q);
      if (slots.length > 0) return slots;
    }

    // Strategy 3: /slots/available with eventTypeId
    if (!isNaN(Number(eventSlugOrId)) && String(eventSlugOrId).trim() !== '') {
      const q1 = `startTime=${encodeURIComponent(startStr)}&endTime=${encodeURIComponent(endStr)}&timeZone=${encodeURIComponent(timezone)}&eventTypeId=${eventSlugOrId}${durParam}`;
      const slots1 = await executeSlotQuery(q1);
      if (slots1.length > 0) return slots1;

      const q2 = `start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(endStr)}&timeZone=${encodeURIComponent(timezone)}&eventTypeId=${eventSlugOrId}${durParam}`;
      const slots2 = await executeSlotQuery(q2);
      if (slots2.length > 0) return slots2;
    }

    // Strategy 4: General username availability query
    if (username) {
      const q = `start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(endStr)}&timeZone=${encodeURIComponent(timezone)}&username=${encodeURIComponent(username)}${durParam}`;
      const slots = await executeSlotQuery(q);
      if (slots.length > 0) return slots;
    }

    return [];
  }
};
