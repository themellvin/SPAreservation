import { calClient } from '../api/calClient';

// Interfaces matching the SQL Database Schema
export interface Organization {
  id: string;
  name: string;
  slug: string;
  cal_base_url: string;
  timezone: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'member' | 'owner';
  is_active: boolean;
  cal_user_id: string | null;
  created_at: string;
}

export interface SpecialistProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  specialty_label: string;
  active: boolean;
  requires_approval: boolean;
  booking_order: number;
  created_at: string;
}

export interface Treatment {
  id: string;
  code: string;
  name: string;
  description: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  requires_confirmation: boolean;
  is_active: boolean;
  cal_event_type_id: string | null;
  cal_event_type_slug: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  treatment_id: string;
  specialist_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: 'draft' | 'pending' | 'approved' | 'confirmed' | 'reschedule_requested' | 'rescheduled' | 'canceled' | 'declined' | 'completed';
  cal_booking_uid: string | null;
  starts_at: string;
  ends_at: string;
  notes: string;
  approval_required: boolean;
  source: 'gui' | 'api' | 'webhook' | 'admin';
  created_at: string;
}

export interface BookingStatusHistory {
  id: string;
  booking_id: string;
  old_status: string | null;
  new_status: string;
  reason: string | null;
  changed_by: string;
  payload: any;
  created_at: string;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  subscriber_url: string;
  secret: string;
  active: boolean;
  trigger_events: string[];
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  trigger_name: string;
  external_event_id: string | null;
  booking_id: string | null;
  payload: any;
  http_status: number;
  delivered_at: string;
  processed_at: string;
}

// Helpers for slugs
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

// Simulated Local Database in LocalStorage
export class MockDatabase {
  private static getStore<T>(key: string, fallback: T[]): T[] {
    const data = localStorage.getItem(`sb_db_${key}`);
    return data ? JSON.parse(data) : fallback;
  }

  private static setStore<T>(key: string, data: T[]): void {
    localStorage.setItem(`sb_db_${key}`, JSON.stringify(data));
  }

  // Getters & Setters for tables
  static getTreatments(): Treatment[] {
    return this.getStore('treatments', [
      { id: '101', code: 'T-101', name: 'Hanakasumi™ signature', description: 'Double exfoliation + relaxing massage', duration_minutes: 50, buffer_before_minutes: 0, buffer_after_minutes: 15, requires_confirmation: false, is_active: true, cal_event_type_id: null, cal_event_type_slug: null, created_at: new Date().toISOString() },
      { id: '102', code: 'T-102', name: 'Classic mountain massage (80m)', description: 'Full-body muscle tension relief', duration_minutes: 80, buffer_before_minutes: 0, buffer_after_minutes: 15, requires_confirmation: true, is_active: true, cal_event_type_id: '12345', cal_event_type_slug: 'mountain-80m', created_at: new Date().toISOString() },
      { id: '103', code: 'T-103', name: 'Classic mountain massage (50m)', description: 'Relaxing full-body massage', duration_minutes: 50, buffer_before_minutes: 0, buffer_after_minutes: 15, requires_confirmation: false, is_active: true, cal_event_type_id: null, cal_event_type_slug: null, created_at: new Date().toISOString() },
      { id: '104', code: 'T-104', name: 'Mountain stone massage', description: 'Deeply relaxing massage with hot stones', duration_minutes: 80, buffer_before_minutes: 0, buffer_after_minutes: 15, requires_confirmation: true, is_active: true, cal_event_type_id: null, cal_event_type_slug: null, created_at: new Date().toISOString() }
    ]);
  }

  static saveTreatments(data: Treatment[]): void {
    this.setStore('treatments', data);
  }

  static getSpecialists(): SpecialistProfile[] {
    return this.getStore('specialists', [
      { id: 'sp1', user_id: 'u1', display_name: 'Anna Kalniņa', bio: 'Senior therapist specializing in deep tissue massage.', specialty_label: 'Massage Specialist', active: true, requires_approval: false, booking_order: 1, created_at: new Date().toISOString() },
      { id: 'sp2', user_id: 'u2', display_name: 'Erik Lunde', bio: 'Lomi Lomi and Hot Stone massage certified specialist.', specialty_label: 'Therapist', active: true, requires_approval: false, booking_order: 2, created_at: new Date().toISOString() },
      { id: 'sp3', user_id: 'u3', display_name: 'Ingrid Berg', bio: 'Skin-type specialist with clinical facial focus.', specialty_label: 'Skin Esthetician', active: true, requires_approval: true, booking_order: 3, created_at: new Date().toISOString() }
    ]);
  }

  static saveSpecialists(data: SpecialistProfile[]): void {
    this.setStore('specialists', data);
  }

  static getUsers(): User[] {
    return this.getStore('users', [
      { id: 'u1', email: 'anna.k@strawberryhotels.com', full_name: 'Anna Kalniņa', role: 'member', is_active: true, cal_user_id: 'usr1', created_at: new Date().toISOString() },
      { id: 'u2', email: 'erik.l@strawberryhotels.com', full_name: 'Erik Lunde', role: 'member', is_active: true, cal_user_id: 'usr2', created_at: new Date().toISOString() },
      { id: 'u3', email: 'ingrid.b@strawberryhotels.com', full_name: 'Ingrid Berg', role: 'member', is_active: true, cal_user_id: 'usr3', created_at: new Date().toISOString() }
    ]);
  }

  static saveUsers(data: User[]): void {
    this.setStore('users', data);
  }

  static getBookings(): Booking[] {
    return this.getStore('bookings', []);
  }

  static saveBookings(data: Booking[]): void {
    this.setStore('bookings', data);
  }

  static getHistory(): BookingStatusHistory[] {
    return this.getStore('history', []);
  }

  static saveHistory(data: BookingStatusHistory[]): void {
    this.setStore('history', data);
  }

  static getWebhooks(): WebhookEndpoint[] {
    return this.getStore('webhooks', [
      {
        id: 'wh1',
        name: 'Strawberry Booking Event Sync',
        subscriber_url: 'https://spa.strawberryhotels.com/api/webhooks/calcom',
        secret: 'whsec_strawberry_spa_secret_2026',
        active: true,
        trigger_events: ['booking.created', 'booking.requested', 'booking.confirmed', 'booking.rescheduled', 'booking.canceled', 'booking.completed']
      }
    ]);
  }

  static saveWebhooks(data: WebhookEndpoint[]): void {
    this.setStore('webhooks', data);
  }

  static getWebhookDeliveries(): WebhookDelivery[] {
    return this.getStore('webhook_deliveries', [
      {
        id: 'del1',
        webhook_id: 'wh1',
        trigger_name: 'booking.created',
        external_event_id: 'evt_99824',
        booking_id: null,
        payload: { event: 'booking.created', uid: 'mock_initial_webhook' },
        http_status: 200,
        delivered_at: new Date().toISOString(),
        processed_at: new Date().toISOString()
      }
    ]);
  }

  static saveWebhookDeliveries(data: WebhookDelivery[]): void {
    this.setStore('webhook_deliveries', data);
  }
}

// Emulated Backend API Service
export const mockBackendService = {
  // Public APIs
  getTreatments: async (): Promise<Treatment[]> => {
    return MockDatabase.getTreatments();
  },

  getSpecialists: async (): Promise<SpecialistProfile[]> => {
    return MockDatabase.getSpecialists();
  },

  // Import treatments from Spreadsheet (Source of Truth)
  importTreatments: async (treats: any[], calApiKeyPresent: boolean): Promise<{ imported: number; synced: number }> => {
    const current = MockDatabase.getTreatments();
    let importedCount = 0;
    let syncedCount = 0;

    const updated = [...current];

    for (const item of treats) {
      const existingIdx = updated.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase() || t.code === item.id);
      const isNew = existingIdx === -1;
      
      const newTreat: Treatment = {
        id: isNew ? Math.random().toString(36).substring(7) : updated[existingIdx].id,
        code: item.id || `T-${Math.floor(100 + Math.random() * 900)}`,
        name: item.name,
        description: item.description || '',
        duration_minutes: parseInt(item.duration) || 60,
        buffer_before_minutes: 0,
        buffer_after_minutes: 15,
        requires_confirmation: item.requires_confirmation !== undefined ? !!item.requires_confirmation : true,
        is_active: true,
        cal_event_type_id: !isNew ? updated[existingIdx].cal_event_type_id : null,
        cal_event_type_slug: !isNew ? updated[existingIdx].cal_event_type_slug : null,
        created_at: !isNew ? updated[existingIdx].created_at : new Date().toISOString()
      };

      if (isNew) {
        updated.push(newTreat);
      } else {
        updated[existingIdx] = newTreat;
      }
      importedCount++;
    }

    MockDatabase.saveTreatments(updated);

    // Auto sync to Cal.diy if API Key is present
    if (calApiKeyPresent) {
      try {
        const syncResult = await mockBackendService.syncEventTypesWithCalDiy();
        syncedCount = syncResult.synced;
      } catch (err) {
        console.warn('Auto-sync during spreadsheet import failed:', err);
      }
    }

    return { imported: importedCount, synced: syncedCount };
  },

  // Synchronize Event Types with Cal.diy
  syncEventTypesWithCalDiy: async (): Promise<{ synced: number }> => {
    const treatments = MockDatabase.getTreatments();
    let count = 0;

    try {
      const response = await calClient.get('/event-types');
      const calEventTypes = response && response.status === 'success' && Array.isArray(response.data) ? response.data : [];

      const updated = [...treatments];

      for (let i = 0; i < updated.length; i++) {
        const t = updated[i];
        if (!t.is_active) continue;

        // Try to match by slug or title
        const targetSlug = slugify(t.name);
        const match = calEventTypes.find((et: any) => et.slug === targetSlug || et.title.toLowerCase() === t.name.toLowerCase());

        if (match) {
          updated[i].cal_event_type_id = String(match.id);
          updated[i].cal_event_type_slug = match.slug;
          count++;
        } else {
          // If event type doesn't exist, create it via POST /event-types!
          try {
            console.log(`Creating Cal.diy Event Type for treatment: "${t.name}"`);
            const createResponse = await calClient.post('/event-types', {
              title: t.name,
              slug: targetSlug,
              lengthInMinutes: t.duration_minutes,
              description: t.description || 'Synced from spa spreadsheet database.',
              requiresBookerEmailVerification: false
            });

            if (createResponse && createResponse.status === 'success' && createResponse.data) {
              updated[i].cal_event_type_id = String(createResponse.data.id);
              updated[i].cal_event_type_slug = createResponse.data.slug;
              count++;
            }
          } catch (e) {
            console.error(`Failed to create Cal.diy event-type for "${t.name}":`, e);
          }
        }
      }

      MockDatabase.saveTreatments(updated);
    } catch (err) {
      console.error('syncEventTypesWithCalDiy error:', err);
      throw err;
    }

    return { synced: count };
  },

  // Booking Pipeline Request Flow
  createBookingRequest: async (params: {
    treatmentId: string;
    specialistId: string | null;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    startsAt: string; // local ISO string
    endsAt: string;   // local ISO string
    notes?: string;
  }): Promise<Booking> => {
    const treatments = MockDatabase.getTreatments();
    const specialists = MockDatabase.getSpecialists();
    const bookings = MockDatabase.getBookings();
    const history = MockDatabase.getHistory();

    const treatment = treatments.find(t => t.id === params.treatmentId);
    if (!treatment) throw new Error('Selected Treatment not found');

    const specialist = params.specialistId ? specialists.find(s => s.id === params.specialistId) : null;

    // Checks "Next month not ready" rule:
    // If request date is next month (e.g. diff > 15 days or month > current month) and specialist's schedule is not final,
    // we enforce manual confirmation
    const targetDate = new Date(params.startsAt);
    const today = new Date();
    const isNextMonth = targetDate.getMonth() !== today.getMonth() || targetDate.getFullYear() !== today.getFullYear();
    
    // Determine status
    let requiresApproval = treatment.requires_confirmation;
    if (specialist && specialist.requires_approval) {
      requiresApproval = true;
    }
    if (isNextMonth) {
      requiresApproval = true; // Enforce approval for future schedule
    }

    const bookingStatus = requiresApproval ? 'pending' : 'confirmed';

    const newBooking: Booking = {
      id: Math.random().toString(36).substring(7),
      treatment_id: params.treatmentId,
      specialist_id: params.specialistId,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
      status: bookingStatus,
      cal_booking_uid: null,
      starts_at: params.startsAt,
      ends_at: params.endsAt,
      notes: params.notes || '',
      approval_required: requiresApproval,
      source: 'gui',
      created_at: new Date().toISOString()
    };

    bookings.push(newBooking);
    MockDatabase.saveBookings(bookings);

    // Log status history
    const histRecord: BookingStatusHistory = {
      id: Math.random().toString(36).substring(7),
      booking_id: newBooking.id,
      old_status: null,
      new_status: bookingStatus,
      reason: requiresApproval ? 'Booking requested (requires staff approval)' : 'Booking confirmed instantly',
      changed_by: 'Customer Booker',
      payload: newBooking,
      created_at: new Date().toISOString()
    };
    history.push(histRecord);
    MockDatabase.saveHistory(history);

    // If instant book, post immediately to Cal.diy
    if (!requiresApproval) {
      try {
        const created = await calClient.post('/bookings', {
          start: params.startsAt,
          end: params.endsAt,
          responses: {
            name: params.customerName,
            email: params.customerEmail,
            notes: params.notes || ''
          },
          attendees: [{
            name: params.customerName,
            email: params.customerEmail,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            phoneNumber: params.customerPhone
          }],
          eventTypeId: treatment.cal_event_type_id ? Number(treatment.cal_event_type_id) : undefined,
          metadata: {
            treatmentCode: treatment.code,
            treatmentName: treatment.name,
            specialistId: specialist?.id || 'unassigned'
          }
        });

        if (created && created.status === 'success' && created.data) {
          newBooking.cal_booking_uid = created.data.uid;
          newBooking.status = 'confirmed';
          MockDatabase.saveBookings(bookings.map(b => b.id === newBooking.id ? newBooking : b));

          // Log confirmation step
          history.push({
            id: Math.random().toString(36).substring(7),
            booking_id: newBooking.id,
            old_status: 'draft',
            new_status: 'confirmed',
            reason: 'Cal.diy API Booking created successfully',
            changed_by: 'Cal.diy API',
            payload: created.data,
            created_at: new Date().toISOString()
          });
          MockDatabase.saveHistory(history);
        }
      } catch (err: any) {
        console.error('Instant booking posting to Cal.diy failed:', err);
      }
    }

    return newBooking;
  },

  // Approve a pending booking (Manual Approval flow)
  approveBooking: async (id: string): Promise<Booking> => {
    const bookings = MockDatabase.getBookings();
    const history = MockDatabase.getHistory();
    const treatments = MockDatabase.getTreatments();

    const booking = bookings.find(b => b.id === id);
    if (!booking) throw new Error('Booking not found');

    const treatment = treatments.find(t => t.id === booking.treatment_id);
    if (!treatment) throw new Error('Treatment details not found');

    // Create the booking in Cal.diy
    const response = await calClient.post('/bookings', {
      start: booking.starts_at,
      end: booking.ends_at,
      responses: {
        name: booking.customer_name,
        email: booking.customer_email,
        notes: booking.notes
      },
      attendees: [{
        name: booking.customer_name,
        email: booking.customer_email,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        phoneNumber: booking.customer_phone
      }],
      eventTypeId: treatment.cal_event_type_id ? Number(treatment.cal_event_type_id) : undefined,
      metadata: {
        bookingId: booking.id,
        treatmentCode: treatment.code
      }
    });

    if (response && response.status === 'success' && response.data) {
      booking.status = 'confirmed';
      booking.cal_booking_uid = response.data.uid;
      MockDatabase.saveBookings(bookings.map(b => b.id === id ? booking : b));

      // Audit trail
      history.push({
        id: Math.random().toString(36).substring(7),
        booking_id: id,
        old_status: 'pending',
        new_status: 'confirmed',
        reason: 'Staff approved and scheduled on Cal.diy',
        changed_by: 'Administrator',
        payload: response.data,
        created_at: new Date().toISOString()
      });
      MockDatabase.saveHistory(history);
    } else {
      throw new Error('Cal.diy API booking creation rejected');
    }

    return booking;
  },

  // Decline a pending booking
  declineBooking: async (id: string, reason: string): Promise<Booking> => {
    const bookings = MockDatabase.getBookings();
    const history = MockDatabase.getHistory();

    const booking = bookings.find(b => b.id === id);
    if (!booking) throw new Error('Booking not found');

    booking.status = 'declined';
    MockDatabase.saveBookings(bookings.map(b => b.id === id ? booking : b));

    // Audit trail
    history.push({
      id: Math.random().toString(36).substring(7),
      booking_id: id,
      old_status: 'pending',
      new_status: 'declined',
      reason: reason || 'Declined by Administrator',
      changed_by: 'Administrator',
      payload: { reason },
      created_at: new Date().toISOString()
    });
    MockDatabase.saveHistory(history);

    return booking;
  },

  // Webhooks simulation
  simulateWebhookEvent: async (webhookId: string, eventType: string, bookingUid: string, payloadData: any): Promise<WebhookDelivery> => {
    const webhooks = MockDatabase.getWebhooks();
    const deliveries = MockDatabase.getWebhookDeliveries();
    
    const webhook = webhooks.find(w => w.id === webhookId);
    if (!webhook) throw new Error('Webhook subscriber not found');

    const newDelivery: WebhookDelivery = {
      id: Math.random().toString(36).substring(7),
      webhook_id: webhookId,
      trigger_name: eventType,
      external_event_id: `evt_${Math.floor(10000 + Math.random() * 90000)}`,
      booking_id: null,
      payload: {
        event: eventType,
        uid: bookingUid,
        timestamp: new Date().toISOString(),
        data: payloadData
      },
      http_status: 200,
      delivered_at: new Date().toISOString(),
      processed_at: new Date().toISOString()
    };

    deliveries.push(newDelivery);
    MockDatabase.saveWebhookDeliveries(deliveries);

    return newDelivery;
  }
};
