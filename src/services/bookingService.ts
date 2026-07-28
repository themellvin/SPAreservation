import { calClient, getApiConfig } from '../api/calClient';

export interface Booking {
  id: string;
  title: string;
  status: string;
  start: string;
  end: string;
  durationMinutes?: number;
  attendeeName: string;
  attendeeEmail: string;
  specialistId?: string;
  specialistLabel?: string;
  eventTypeId?: number;
  eventSlug?: string;
  notes?: string;
  cancellationReason?: string;
}

export const bookingService = {
  getBookings: async (userIds?: (number|string)[]): Promise<Booking[]> => {
    let allRawBookings: any[] = [];
    
    const proxyHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const proxyUrl = `http://${proxyHost}:3001/api/proxy/bookings`;
    const statuses = ['upcoming', 'unconfirmed', 'recurring', 'past', 'cancelled'];
    let promises: Promise<any>[] = [];

    if (userIds && userIds.length > 0) {
      // Include the default (admin) user by adding an empty username fetch, plus each specific user
      const targets = ['', ...userIds];
      for (const targetUser of targets) {
        // Since userIds actually contains usernames from App.tsx, we can use targetUser as the username.
        const tUserStr = targetUser ? targetUser.toString() : undefined;
        const config = await Promise.resolve(getApiConfig(tUserStr));
        const userParam = targetUser ? `&username=${encodeURIComponent(tUserStr || '')}` : '';
        promises.push(
          fetch(`${proxyUrl}?limit=100${userParam}&_t=${Date.now()}`, {
            headers: {
              'x-proxy-api-url': config.bookingsEndpoint,
              'x-proxy-api-key': config.apiKey
            }
          }).then(res => res.json())
        );
      }
    } else {
      const config = await Promise.resolve(getApiConfig());
      promises.push(
        fetch(`${proxyUrl}?limit=100&_t=${Date.now()}`, {
          headers: {
            'x-proxy-api-url': config.bookingsEndpoint,
            'x-proxy-api-key': config.apiKey
          }
        }).then(res => res.json())
      );
    }

    const responses = await Promise.allSettled(promises);
    responses.forEach(r => {
      if (r.status === 'fulfilled') {
        const raw = r.value?.data ?? r.value;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.bookings) ? raw.bookings : []);
        allRawBookings = [...allRawBookings, ...list];
      }
    });

    // Deduplicate by ID just in case
    const uniqueBookings = Array.from(new Map(allRawBookings.map(b => [b.uid || b.id?.toString() || String(Math.random()), b])).values());

    return uniqueBookings.map((b: any) => {
      // Return the raw booking object so App.tsx can extract hosts, attendees, and metadata properly!
      return b;
    });
  },

  createBooking: async (bookingData: {
    start: string;
    name: string;
    email: string;
    phone?: string;
    notes?: string;
    eventSlug?: string;
    eventTypeId?: number;
    specialist?: string;
    /** Cal.com username of the specialist (host) */
    username?: string;
    treatment?: string;
    room?: string;
    price?: string;
    duration?: string;
    /** Override duration in minutes for multi-duration event types */
    durationMinutes?: number;
  }): Promise<Booking> => {
    // V1 API Payload for robust multi-duration support
    const durationMin = bookingData.durationMinutes || 60;
    const startMs = new Date(bookingData.start).getTime();
    // For V1, the 'end' time MUST be explicit to enforce the duration length requested
    const endIso = new Date(startMs + durationMin * 60000).toISOString();

    const v2Payload: any = {
      start: bookingData.start,
      attendee: {
        name: bookingData.name,
        email: bookingData.email,
        timeZone: 'Europe/Riga',
        language: 'en'
      },
      metadata: {
        treatment: bookingData.treatment || '',
        specialist: bookingData.specialist || '',
        room: bookingData.room || '',
        price: bookingData.price || ''
      }
    };

    if (bookingData.eventTypeId && !isNaN(Number(bookingData.eventTypeId))) {
      v2Payload.eventTypeId = Number(bookingData.eventTypeId);
    } else if (bookingData.eventSlug) {
      v2Payload.eventTypeSlug = bookingData.eventSlug;
    }
    
    // ALWAYS pass username if provided, to ensure it routes to the correct specialist
    // even if eventTypeId is missing or defaults.
    if (bookingData.username) {
      v2Payload.username = bookingData.username;
    }

    if (bookingData.durationMinutes) {
      v2Payload.lengthInMinutes = bookingData.durationMinutes;
    } else {
      v2Payload.lengthInMinutes = 60;
    }

    if (bookingData.notes) {
      v2Payload.metadata.notes = bookingData.notes;
      v2Payload.responses = { notes: bookingData.notes };
    }
    if (bookingData.phone) {
      v2Payload.attendee.phoneNumber = bookingData.phone;
    }

    let response: any = null;
    try {
      const { apiKey, bookingsEndpoint } = (await import('../api/calClient')).getApiConfig(bookingData.username);
      const proxyHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      let proxyUrl = `http://${proxyHost}:3001/api/proxy/bookings`;
      if (bookingData.username) {
        proxyUrl += `?username=${encodeURIComponent(bookingData.username)}`;
      }
      
      const makeRequest = async (payload: any) => {
        const proxyRes = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Proxy-Api-Key': apiKey,
            'X-Proxy-Api-Url': bookingsEndpoint
          },
          body: JSON.stringify(payload)
        });
        if (!proxyRes.ok) {
          let errMsg = `HTTP ${proxyRes.status}`;
          try {
            const j = await proxyRes.json();
            errMsg = j.error?.message || j.message || j.error || errMsg;
          } catch {}
          throw new Error(errMsg);
        }
        return await proxyRes.json();
      };

      const attemptRequest = async (payload: any, attempt = 1): Promise<any> => {
        try {
          return await makeRequest(payload);
        } catch (err: any) {
          const msg = err.message || '';
          if (attempt < 3) {
            let retry = false;
            if (msg.includes('responses') && msg.includes('should not exist')) {
              console.warn('Cal.com rejected responses object, retrying without it...');
              delete payload.responses;
              retry = true;
            }
            if (msg.includes('lengthInMinutes') && (msg.includes('multiple possible lengths') || msg.includes("remove the 'lengthInMinutes' field"))) {
              console.warn('Cal.com rejected lengthInMinutes, retrying without it...');
              delete payload.lengthInMinutes;
              retry = true;
            }
            if (retry) {
              return await attemptRequest(payload, attempt + 1);
            }
          }
          throw err;
        }
      };

      response = await attemptRequest(v2Payload);

    } catch (err: any) {
      console.error('Cal.com create booking failed via proxy:', err.message);
      throw err.message || err;
    }
    const b = response?.data ?? response;
    if (!b || (!b.uid && !b.id)) {
      throw new Error('Cal.com API returned no booking data');
    }

    // Parse returned duration (and subtract 10 minutes if we use the same display rules)
    const start = b.start || bookingData.start;
    const end = b.end || '';
    let returnedDuration: number | undefined;
    if (start && end) {
      const ms = new Date(end).getTime() - new Date(start).getTime();
      if (ms > 0) returnedDuration = Math.max(0, Math.round(ms / 60000) - 10);
    }

    return {
      id: b.uid || b.id?.toString(),
      title: b.title || bookingData.treatment || 'Spa Treatment',
      status: b.status || 'accepted',
      start,
      end,
      durationMinutes: returnedDuration || durationMin,
      attendeeName: b.attendees?.[0]?.name || bookingData.name,
      attendeeEmail: b.attendees?.[0]?.email || bookingData.email,
      specialistLabel: b.hosts?.[0]?.name || bookingData.specialist || '',
      eventSlug: b.eventSlug || bookingData.eventSlug || '',
      notes: typeof b.responses?.notes === 'object' ? (b.responses?.notes?.value || '') : (b.responses?.notes || bookingData.notes || '')
    };
  },
  cancelBooking: async (bookingUid: string, reason: string, username?: string): Promise<any> => {
    const isMock = bookingUid.startsWith('ra') || /^\d+$/.test(bookingUid);
    if (isMock) {
      console.log('Skipping API cancellation for offline mock booking:', bookingUid);
      return { status: 'success' };
    }
    const { apiKey, bookingsEndpoint } = (await import('../api/calClient')).getApiConfig(username);
    const proxyHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    let proxyUrl = `http://${proxyHost}:3001/api/proxy/bookings/${bookingUid}/cancel`;
    if (username) proxyUrl += `?username=${encodeURIComponent(username)}`;
    const proxyRes = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Api-Key': apiKey,
        'X-Proxy-Api-Url': bookingsEndpoint
      },
      body: JSON.stringify({ cancellationReason: reason })
    });
    if (!proxyRes.ok) throw new Error(`HTTP ${proxyRes.status}`);
    return await proxyRes.json();
  },

  rescheduleBooking: async (bookingUid: string, rescheduleData: { start: string; notes?: string }, username?: string): Promise<any> => {
    const isMock = bookingUid.startsWith('ra') || /^\d+$/.test(bookingUid);
    if (isMock) {
      console.log('Skipping API reschedule for offline mock booking:', bookingUid);
      return { status: 'success', data: { uid: bookingUid } };
    }
    const { apiKey, bookingsEndpoint } = (await import('../api/calClient')).getApiConfig(username);
    const proxyHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    let proxyUrl = `http://${proxyHost}:3001/api/proxy/bookings/${bookingUid}/reschedule`;
    if (username) proxyUrl += `?username=${encodeURIComponent(username)}`;
    const proxyRes = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxy-Api-Key': apiKey,
        'X-Proxy-Api-Url': bookingsEndpoint
      },
      body: JSON.stringify({ 
        start: rescheduleData.start
      })
    });
    if (!proxyRes.ok) {
      let errMsg = `HTTP ${proxyRes.status}`;
      try {
        const j = await proxyRes.json();
        errMsg = j.error?.message || j.message || j.error || errMsg;
      } catch {}
      throw new Error(errMsg);
    }
    return await proxyRes.json();
  },

  getBooking: async (bookingUid: string): Promise<any> => {
    return await calClient.get(`/bookings/${bookingUid}`);
  },

  confirmBooking: async (bookingUid: string): Promise<any> => {
    const isMock = bookingUid.startsWith('ra') || /^\d+$/.test(bookingUid);
    if (isMock) { console.log('Skipping API confirm for offline:', bookingUid); return { status: 'success' }; }
    return await calClient.post(`/bookings/${bookingUid}/confirm`);
  },

  markBookingAbsent: async (bookingUid: string, attendeeEmail: string): Promise<any> => {
    const isMock = bookingUid.startsWith('ra') || /^\d+$/.test(bookingUid);
    if (isMock) { console.log('Skipping API mark-absent for offline:', bookingUid); return { status: 'success' }; }
    return await calClient.post(`/bookings/${bookingUid}/mark-absent`, {
      host: false,
      attendees: [{ email: attendeeEmail, absent: true }]
    });
  },

  reassignBooking: async (bookingUid: string, userId: string | number, reason?: string): Promise<any> => {
    const isMock = bookingUid.startsWith('ra') || /^\d+$/.test(bookingUid);
    if (isMock) { console.log('Skipping API reassign for offline:', bookingUid); return { status: 'success' }; }
    return await calClient.post(`/bookings/${bookingUid}/reassign/${userId}`, {
      reason: reason || 'Reassigned to another specialist roster slot'
    });
  },

  /**
   * Fetch available slots for a given event type on a date.
   * Leverages availabilityService to query Cal.com API live.
   */
  getAvailableSlots: async (
    eventTypeId: number | string,
    startDate: string,
    endDate?: string,
    timeZone: string = 'Europe/Riga',
    username?: string,
    durationMinutes?: number,
    eventSlug?: string
  ): Promise<Array<{ time: string; duration?: number }>> => {
    const { availabilityService } = await import('./availabilityService');
    return await availabilityService.getSlotsForEventSlug(eventTypeId, startDate, username, durationMinutes, eventSlug);
  }
};
