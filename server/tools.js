import { tool } from 'ai';
import { z } from 'zod';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const CAL_API_URL = 'https://calcom.run.place/api/v2';

import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const resolveApiKey = (username) => {
  const u = username ? String(username).toLowerCase() : null;
  
  if (global.apiKeysMap && u) {
    if (global.apiKeysMap[u]) return global.apiKeysMap[u];
    // Find case-insensitive match
    const key = Object.keys(global.apiKeysMap).find(k => k.toLowerCase() === u);
    if (key && global.apiKeysMap[key]) return global.apiKeysMap[key];
  }
  
  if (u === 'anna' && process.env.CAL_API_KEY_ANNA) return process.env.CAL_API_KEY_ANNA;
  if (u === 'ingrid' && process.env.CAL_API_KEY_INGRID) return process.env.CAL_API_KEY_INGRID;
  if (u === 'erik' && process.env.CAL_API_KEY_ERIK) return process.env.CAL_API_KEY_ERIK;
  if (u === 'admin' && process.env.CAL_API_KEY_ADMIN) return process.env.CAL_API_KEY_ADMIN;
  return process.env.CAL_API_KEY_ADMIN || process.env.CAL_API_KEY;
};

export const tools = {
  get_event_types: tool({
    description: 'Fetch the available event types (treatments). If the user specifies a specialist, provide the username. If none is specified, omit the username to fetch across all specialists.',
    parameters: z.object({
      username: z.string().optional().describe('The Cal.com username of the specialist (e.g., admin, anna, erik, ingrid). Optional.'),
    }),
    runTool: async ({ username }) => {
      try {
        let usersToFetch = username ? [username] : [];
        if (!username) {
          try {
            const data = fs.readFileSync(join(__dirname, 'specialists.json'), 'utf8');
            usersToFetch = JSON.parse(data).map(s => s.username);
          } catch (e) {
            usersToFetch = ['admin', 'anna', 'ingrid', 'erik'];
          }
        }
        let allEventTypes = [];
        
        for (const u of usersToFetch) {
          try {
            const resolvedKey = resolveApiKey(u);
            const response = await axios.get(`${CAL_API_URL}/event-types?username=${u}`, {
              headers: { 
                'Authorization': `Bearer ${resolvedKey}`,
                'cal-api-version': '2024-06-14' 
              }
            });
            const formatted = response.data.data.map(et => ({
              specialist: u,
              id: et.id,
              title: et.title,
              slug: et.slug,
              length: et.lengthInMinutes,
              description: et.description,
              durationOptions: et.lengthInMinutesOptions || (et.metadata && et.metadata.multipleDuration) || [et.lengthInMinutes]
            })).map(et => {
              const result = {
                specialist: et.specialist,
                id: et.id,
                title: et.title,
                slug: et.slug,
                description: et.description || '',
                durationOptions: et.durationOptions
              };
              if (!et.durationOptions || et.durationOptions.length <= 1) {
                result.length = et.length;
              }
              return result;
            });
            allEventTypes = allEventTypes.concat(formatted);
          } catch (err) {
            console.error(`Failed fetching for ${u}:`, err.message);
          }
        }
        
        // Deduplicate event types by title and aggregate specialists
        const deduplicated = [];
        for (const et of allEventTypes) {
          const existing = deduplicated.find(e => e.title.toLowerCase() === et.title.toLowerCase());
          if (existing) {
            if (!existing.specialists[et.specialist]) {
              existing.specialists[et.specialist] = et.id;
            }
          } else {
            deduplicated.push({
              title: et.title,
              description: et.description,
              slug: et.slug,
              durationOptions: et.durationOptions,
              specialists: { [et.specialist]: et.id }
            });
          }
        }
        
        // Sort by shortest duration first, then shortest title length first
        deduplicated.sort((a, b) => {
          const minDurationA = Math.min(...a.durationOptions);
          const minDurationB = Math.min(...b.durationOptions);
          if (minDurationA !== minDurationB) {
            return minDurationA - minDurationB;
          }
          return a.title.length - b.title.length;
        });
        
        if (deduplicated.length === 0) return { error: 'No event types found.' };
        return deduplicated;
      } catch (err) {
        console.error('API Error fetching event types:', err.message);
        return { error: 'Failed to fetch event types.' };
      }
    }
  }),

  get_availability: tool({
    description: 'Finds available time slots for a specialist on a specific date or date range. You MUST check availability before booking.',
    parameters: z.object({
      eventTypeId: z.number().describe('REQUIRED. The ID of the event type to check availability for (e.g., 13). Must match the specialist in the specialists map.'),
      username: z.string().describe('REQUIRED. The username of the specialist (e.g., "admin", "anna", "ingrid", "erik").'),
      startTime: z.string().describe('REQUIRED. The start date in ISO format (e.g., 2026-07-23T00:00:00Z)'),
      endTime: z.string().describe('REQUIRED. The end date in ISO format (e.g., 2026-07-25T00:00:00Z)'),
      duration: z.number().optional().describe('The chosen duration in minutes (e.g., 60), if the event type has multiple durationOptions.')
    }),
    runTool: async ({ eventTypeId, username, startTime, endTime, duration }) => {
      try {
        if (!eventTypeId || !startTime || !endTime || !username) {
          return { error: 'You MUST provide eventTypeId, username, startTime, and endTime in the tool arguments!' };
        }
        
        let combinedSlots = {};

        const params = {
          eventTypeId,
          username,
          startTime,
          endTime,
          timeZone: 'Europe/Riga'
        };
        if (duration) params.duration = duration;

        try {
          const resolvedKey = resolveApiKey(username);
          const response = await axios.get(`${CAL_API_URL}/slots/available`, {
            params,
            headers: {
              'Authorization': `Bearer ${resolvedKey}`,
              'cal-api-version': '2024-06-14'
            }
          });
          const slotsData = response.data.data ? response.data.data.slots : response.data.slots;
          
          for (const date in slotsData) {
            if (!combinedSlots[date]) combinedSlots[date] = {};
            
            const rigaTimeFormatter = new Intl.DateTimeFormat('en-US', {
              timeZone: 'Europe/Riga',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            
            slotsData[date].forEach(s => {
              const dateObj = new Date(s.time);
              const timeStr = rigaTimeFormatter.format(dateObj);
              if (!combinedSlots[date][timeStr]) combinedSlots[date][timeStr] = [];
              combinedSlots[date][timeStr].push(username);
            });
          }
        } catch(e) { console.error(`Error fetching for ${username}`, e.message); }
        
        let compactResults = "";
        for (const date in combinedSlots) {
          const timesWithSpecs = Object.entries(combinedSlots[date])
            .map(([timeStr, specs]) => `${timeStr} (Specialist: ${specs.join(', ')})`);
          compactResults += `  ${date}: ${timesWithSpecs.join(' | ')}\n`;
        }

        return { 
          availability_summary: compactResults || 'No slots available for the given criteria.',
          system_instruction: 'CRITICAL RULE: DO NOT list all of these slots to the user! Pick a maximum of 3 times to suggest FROM THE EXACT LIST ABOVE. NEVER invent, guess, or hallucinate times that are not explicitly written in the list above! HOWEVER, if the user already explicitly requested a specific time and it is present in this list, DO NOT ask them to confirm again. You MUST immediately call create_booking in your very next response.'
        };
      } catch (error) {
        console.error('API Error fetching availability:', error.message);
        return { error: 'Failed to fetch availability.' };
      }
    }
  }),

  create_booking: tool({
    description: 'Create a booking for the chosen event type, slot, and user details. CRITICAL INSTRUCTION: If you are booking for MULTIPLE people, you MUST write a separate ```json block in your text response for EACH person containing their booking arguments (eventTypeId, start, length, attendee: {name, email, phone}), BEFORE calling this tool.',
    parameters: z.object({
      eventTypeId: z.number().describe('REQUIRED. The ID of the event type to book'),
      username: z.string().describe('REQUIRED. The username of the specialist (e.g., admin, anna, erik, ingrid)'),
      start: z.string().describe('REQUIRED. The start time in ISO format'),
      attendee: z.object({
        name: z.string(),
        email: z.string(),
        phone: z.string().optional()
      }).describe('REQUIRED. Attendee details.'),
      metadata: z.object({
        notes: z.string().optional()
      }).optional(),
      duration: z.number().optional().describe('The duration in minutes, required if the event type has multiple duration options (e.g. 50)')
    }),
    runTool: async (args) => {
      try {
        if (!args.username) return { error: 'You MUST provide the username in the tool arguments!' };
        if (!args.eventTypeId) return { error: 'You MUST provide the eventTypeId in the tool arguments!' };

        const name = args.attendee?.name || args.responses?.name;
        const email = args.attendee?.email || args.responses?.email;
        const phone = args.attendee?.phone || args.responses?.phone;
        
        if (!name || name.toLowerCase().includes('guest') || !email || email.includes('example.com') || !phone) {
          return { error: 'You MUST ask the user for their full name, email address, AND phone number before creating a booking. DO NOT invent or guess these details.' };
        }
        
        const notes = args.metadata?.notes || args.responses?.notes || '';
        
        const phoneStr = JSON.stringify(args);
        const phoneMatch = phoneStr.match(/\b\d{8,15}\b/);
        const fallbackPhone = phoneMatch ? phoneMatch[0] : '37128374659';
        let finalPhone = args.attendee?.phone || args.responses?.phone || fallbackPhone;
        // Strip everything except digits and plus
        finalPhone = finalPhone.replace(/[^\d+]/g, '');
        if (finalPhone && !finalPhone.startsWith('+')) {
          if (finalPhone.length === 8) {
            finalPhone = '+371' + finalPhone;
          } else if (finalPhone.startsWith('371')) {
            finalPhone = '+' + finalPhone;
          } else {
            // Default fallback
            finalPhone = '+' + finalPhone;
          }
        }
        
        const payload = {
          eventTypeId: args.eventTypeId,
          start: args.start,
          timeZone: 'Europe/Riga',
          language: 'en',
          attendee: {
            name: name,
            email: email,
            timeZone: 'Europe/Riga',
            language: 'en',
            phoneNumber: finalPhone
          },
          responses: {
            name: name,
            email: email,
            attendeePhoneNumber: finalPhone
          },
          metadata: {}
        };
        
        if (args.duration) {
          payload.lengthInMinutes = args.duration;
        }
        
        // V2 API forbids 'length', 'end'. Custom fields go in metadata.
        if (notes) payload.metadata.notes = notes;
        
        const resolvedKey = resolveApiKey(args.username);

        let response;
        try {
          response = await axios.post(`${CAL_API_URL}/bookings`, payload, {
            headers: {
              'Authorization': `Bearer ${resolvedKey}`,
              'cal-api-version': '2024-06-14'
            }
          });
        } catch (error) {
          const errMsg = error.response?.data?.error?.message || error.response?.data?.message || '';
          if (errMsg.includes('responses should not exist') || errMsg.includes('responses property is wrong')) {
            delete payload.responses;
            response = await axios.post(`${CAL_API_URL}/bookings`, payload, {
              headers: {
                'Authorization': `Bearer ${resolvedKey}`,
                'cal-api-version': '2024-06-14'
              }
            });
          } else if (errMsg.includes('no_available_users_found_error')) {
            // WORKAROUND FOR CAL.COM BUG: API sometimes throws 500 error but creates the booking anyway!
            try {
              const checkRes = await axios.get(`${CAL_API_URL}/bookings`, {
                headers: {
                  'Authorization': `Bearer ${resolvedKey}`,
                  'cal-api-version': '2024-06-14'
                }
              });
              const bookings = checkRes.data?.data?.bookings || [];
              const found = bookings.find(b => b.startTime === args.start && b.attendees.some(a => a.email === email));
              if (found) {
                console.log('WORKAROUND: Booking was actually created despite error!', found.id);
                return { 
                  status: 'success', 
                  message: 'Booking successfully created despite API error.',
                  bookingId: found.id,
                  startTime: found.startTime
                };
              }
            } catch(e) {}
            throw error;
          } else {
            throw error;
          }
        }
        return response.data.data || response.data;
      } catch (err) {
        if (err.response?.data?.error?.details?.errors) {
          console.error('Booking failed details:', JSON.stringify(err.response.data.error.details.errors, null, 2));
        } else {
          console.error('Booking failed:', err.response?.data || err.message);
        }
        return { error: 'Failed to create booking: Check slot availability' };
      }
    },
  }),

  get_bookings: tool({
    description: 'Fetch all bookings. Use this to find the bookingUid when you need to cancel or reschedule a booking. You MUST provide a username.',
    parameters: z.object({
      username: z.string().describe('REQUIRED. The username of the specialist (e.g., admin, anna, erik, ingrid).'),
      email: z.string().optional().describe('Optional attendee email to filter by.')
    }),
    runTool: async (args) => {
      try {
        if (!args.username) {
          return { error: 'You MUST provide a username in the tool arguments!' };
        }
        const resolvedKey = resolveApiKey(args.username);
        let url = `${CAL_API_URL}/bookings?limit=100`;
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${resolvedKey}`,
            'cal-api-version': '2024-08-13'
          }
        });
        
        let rawData = response.data.data || response.data;
        let bookings = [];
        if (Array.isArray(rawData)) bookings = rawData;
        else if (rawData?.bookings && Array.isArray(rawData.bookings)) bookings = rawData.bookings;
        else bookings = [];
        
        if (args.email) {
          bookings = bookings.filter(b => b.attendees?.some(a => a.email.toLowerCase() === args.email.toLowerCase()));
        }
        
        return bookings.map(b => ({
          bookingUid: String(b.uid || b.id || ''),
          title: b.title,
          start: b.start,
          end: b.end,
          status: b.status,
          attendees: b.attendees?.map(a => ({ name: a.name, email: a.email }))
        }));
      } catch (err) {
        console.error('API Error fetching bookings:', err.response?.data || err.message);
        return { error: `Failed to fetch bookings: ${err.response?.data?.message || err.message}` };
      }
    }
  }),

  reschedule_booking: tool({
    description: 'Reschedule an existing booking to a new time. You MUST provide the bookingUid and the username of the specialist.',
    parameters: z.object({
      bookingUid: z.string().describe('REQUIRED. The unique identifier of the booking to reschedule.'),
      username: z.string().describe('REQUIRED. The username of the specialist (e.g., admin, anna, erik, ingrid).'),
      start: z.string().describe('REQUIRED. The new start time in ISO format (e.g., 2024-01-16T10:00:00Z).'),
      eventTypeId: z.number().optional().describe('The event type ID for the booking. Required if the original booking is missing an event type.'),
      rescheduleReason: z.string().optional().describe('Optional reason for rescheduling.')
    }),
    runTool: async (args) => {
      try {
        if (!args.username || !args.bookingUid || !args.start) {
          return { error: 'You MUST provide username, bookingUid, and start in the tool arguments!' };
        }
        
        const resolvedKey = resolveApiKey(args.username);
        const payload = {
          start: args.start
        };
        if (args.eventTypeId) {
          payload.eventTypeId = args.eventTypeId;
        }

        const response = await axios.post(`${CAL_API_URL}/bookings/${args.bookingUid}/reschedule`, payload, {
          headers: {
            'Authorization': `Bearer ${resolvedKey}`,
            'cal-api-version': '2024-08-13'
          }
        });
        
        return response.data.data || response.data;
      } catch (err) {
        console.error('Reschedule failed:', err.response?.data || err.message);
        return { error: `Failed to reschedule booking: ${err.response?.data?.message || err.message}` };
      }
    }
  }),

  cancel_booking: tool({
    description: 'Cancel an existing booking. You MUST provide the bookingUid and the username of the specialist.',
    parameters: z.object({
      bookingUid: z.string().describe('REQUIRED. The unique identifier of the booking to cancel.'),
      username: z.string().describe('REQUIRED. The username of the specialist (e.g., admin, anna, erik, ingrid).'),
      cancellationReason: z.string().optional().describe('Optional reason for cancellation.')
    }),
    runTool: async (args) => {
      try {
        if (!args.username || !args.bookingUid) {
          return { error: 'You MUST provide username and bookingUid in the tool arguments!' };
        }
        
        const resolvedKey = resolveApiKey(args.username);
        const payload = {
          cancellationReason: args.cancellationReason || 'Cancelled via AI Assistant'
        };

        const response = await axios.post(`${CAL_API_URL}/bookings/${args.bookingUid}/cancel`, payload, {
          headers: {
            'Authorization': `Bearer ${resolvedKey}`,
            'cal-api-version': '2024-06-14'
          }
        });
        
        return response.data.data || response.data;
      } catch (err) {
        console.error('Cancel failed:', err.response?.data || err.message);
        return { error: `Failed to cancel booking: ${err.response?.data?.message || err.message}` };
      }
    }
  }),

  create_event_type: tool({
    description: 'Create a new event type (treatment) for a specialist. You MUST provide the username, title, slug, length, and description.',
    parameters: z.object({
      username: z.string().describe('REQUIRED. The username of the specialist (e.g., admin, anna, erik, ingrid).'),
      title: z.string().describe('REQUIRED. The name of the treatment.'),
      slug: z.string().describe('REQUIRED. A URL-friendly slug for the treatment (e.g., classic-massage).'),
      length: z.number().describe('REQUIRED. The default duration in minutes.'),
      description: z.string().optional().describe('Description of the treatment.'),
      durationOptions: z.array(z.number()).optional().describe('If the treatment has multiple durations (e.g., 20, 50, 80), list them here.')
    }),
    runTool: async (args) => {
      try {
        if (!args.username || !args.title || !args.slug || !args.length) {
          return { error: 'You MUST provide username, title, slug, and length in the tool arguments!' };
        }

        const resolvedKey = resolveApiKey(args.username);
        
        const payload = {
          title: args.title,
          slug: args.slug,
          lengthInMinutes: args.length,
          description: args.description || '',
          metadata: {}
        };

        if (args.durationOptions && args.durationOptions.length > 0) {
          payload.lengthInMinutesOptions = args.durationOptions;
          // Just in case, also set it in metadata for older frontend compatibility
          payload.metadata.multipleDuration = args.durationOptions;
        }

        const response = await axios.post(`${CAL_API_URL}/event-types`, payload, {
          headers: {
            'Authorization': `Bearer ${resolvedKey}`,
            'cal-api-version': '2024-06-14'
          }
        });
        
        return response.data.data || response.data;
      } catch (err) {
        console.error('Create event type failed:', err.response?.data || err.message);
        return { error: `Failed to create event type: ${err.response?.data?.message || err.message}` };
      }
    }
  }),

  update_event_type: tool({
    description: 'Update an existing event type. You MUST provide the eventTypeId and the username of the specialist.',
    parameters: z.object({
      eventTypeId: z.number().describe('REQUIRED. The ID of the event type to update.'),
      username: z.string().describe('REQUIRED. The username of the specialist (e.g., admin, anna, erik, ingrid).'),
      title: z.string().optional().describe('New title.'),
      length: z.number().optional().describe('New default duration in minutes.'),
      description: z.string().optional().describe('New description.'),
      durationOptions: z.array(z.number()).optional().describe('New multiple durations (e.g., 20, 50, 80).')
    }),
    runTool: async (args) => {
      try {
        if (!args.username || !args.eventTypeId) return { error: 'You MUST provide username and eventTypeId!' };
        const resolvedKey = resolveApiKey(args.username);
        const payload = {};
        if (args.title) payload.title = args.title;
        if (args.length) payload.lengthInMinutes = args.length;
        if (args.description) payload.description = args.description;
        if (args.durationOptions && args.durationOptions.length > 0) {
          payload.lengthInMinutesOptions = args.durationOptions;
          payload.metadata = { multipleDuration: args.durationOptions };
        }
        const response = await axios.patch(`${CAL_API_URL}/event-types/${args.eventTypeId}`, payload, {
          headers: { 'Authorization': `Bearer ${resolvedKey}`, 'cal-api-version': '2024-06-14' }
        });
        return response.data.data || response.data;
      } catch (err) {
        return { error: `Failed to update event type: ${err.response?.data?.message || err.message}` };
      }
    }
  }),

  update_booking: tool({
    description: 'Update an existing booking with a phone number. Use this ONLY when processing an email reply from a user providing their phone number.',
    parameters: z.object({
      uid: z.string().describe('REQUIRED. The booking UID to update (e.g. "cdSR1UJeLDsb3vNqpMZsrp")'),
      phone: z.string().describe('REQUIRED. The phone number provided by the user'),
      username: z.string().describe('REQUIRED. The username of the specialist who hosts this booking (e.g., "anna")')
    }),
    runTool: async (args) => {
      try {
        if (!args.uid || !args.phone || !args.username) {
          return { error: 'You MUST provide uid, phone, and username!' };
        }
        
        const resolvedKey = resolveApiKey(args.username);
        const response = await axios.patch(`${CAL_API_URL}/bookings/${args.uid}`, {
          responses: {
            attendeePhoneNumber: args.phone
          }
        }, {
          headers: {
            'Authorization': `Bearer ${resolvedKey}`,
            'cal-api-version': '2024-08-13'
          }
        });
        
        return { status: 'success', message: 'Phone number updated successfully', data: response.data };
      } catch (err) {
        console.error('Update booking error:', err.response?.data || err.message);
        return { error: 'Failed to update booking: ' + (err.response?.data?.message || err.message) };
      }
    }
  }),

  delete_event_type: tool({
    description: 'Delete an existing event type. You MUST provide the eventTypeId and the username of the specialist.',
    parameters: z.object({
      eventTypeId: z.number().describe('REQUIRED. The ID of the event type to delete.'),
      username: z.string().describe('REQUIRED. The username of the specialist (e.g., admin, anna, erik, ingrid).')
    }),
    runTool: async (args) => {
      try {
        if (!args.username || !args.eventTypeId) return { error: 'You MUST provide username and eventTypeId!' };
        const resolvedKey = resolveApiKey(args.username);
        await axios.delete(`${CAL_API_URL}/event-types/${args.eventTypeId}`, {
          headers: { 'Authorization': `Bearer ${resolvedKey}`, 'cal-api-version': '2024-06-14' }
        });
        return { success: true, message: `Event type ${args.eventTypeId} deleted successfully.` };
      } catch (err) {
        return { error: `Failed to delete event type: ${err.response?.data?.message || err.message}` };
      }
    }
  })
};
