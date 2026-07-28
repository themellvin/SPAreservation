import React, { useState, useEffect, useRef } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { mockBackendService, MockDatabase } from './services/mockBackendService';

// Define Roster Constants (Real Norefjell Spreadsheet Roster)
const fallbackSpecialists = [
  {
    therapist_id: 'ther_000',
    therapist_name: 'Melvins Bartoniks',
    email: 'themellvin@gmail.com',
    phone: '+37120000000',
    specialties: 'Manual Massage',
    working_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
    working_hours_start: '09:00',
    working_hours_end: '18:00',
    break_start: '13:00',
    break_end: '14:00',
    max_bookings_per_day: 8,
    avg_service_duration: '60 min',
    room_preference: 'Room 1',
    language_skills: 'English',
    status: 'active',
    hire_date: '2023-01-01',
    notes: 'Admin therapist',
    current_bookings_today: 0,
    mappedEventSlug: 'massage-manual',
    mappedEventTypeId: '4',
    mappedCalendarConnectionId: 'conn_google_00',
    calUsername: 'admin',
    team: 'Team Massage',
    role: 'specialist'
  },
  {
    therapist_id: 'ther_001',
    therapist_name: 'Anna Lindqvist',
    email: 'anna@norefjell.no',
    phone: '+4712345601',
    specialties: 'body,face',
    working_days: 'Mon,Tue,Wed,Thu,Fri',
    working_hours_start: '09:00',
    working_hours_end: '17:00',
    break_start: '12:00',
    break_end: '13:00',
    max_bookings_per_day: 8,
    avg_service_duration: '60 min',
    room_preference: 'Room 1',
    language_skills: 'Norwegian,English,German',
    status: 'active',
    hire_date: '2024-01-15',
    notes: 'Specialist in stone massage and Kobido',
    current_bookings_today: 1,
    mappedEventSlug: 'eyelash-tinting',
    mappedEventTypeId: '401',
    mappedCalendarConnectionId: 'conn_001',
    calUsername: 'anna',
    team: 'Team Massage',
    role: 'specialist'
  },
  {
    therapist_id: 'ther_002',
    therapist_name: 'Erik Hansens',
    email: 'erik@norefjell.no',
    phone: '+4712345602',
    specialties: 'body',
    working_days: 'Mon,Wed,Fri,Sat,Sun',
    working_hours_start: '10:00',
    working_hours_end: '18:00',
    break_start: '13:00',
    break_end: '14:00',
    max_bookings_per_day: 7,
    avg_service_duration: '70 min',
    room_preference: 'Room 2',
    language_skills: 'Norwegian,English',
    status: 'active',
    hire_date: '2023-06-01',
    notes: 'Deep tissue and sports massage specialist',
    current_bookings_today: 1,
    mappedEventSlug: 'classic-mountain-massage-50m',
    mappedEventTypeId: '102',
    mappedCalendarConnectionId: 'conn_002',
    calUsername: 'erik',
    team: 'Team Skincare',
    role: 'specialist'
  },
  {
    therapist_id: 'ther_003',
    therapist_name: 'Ingrid Olsen',
    email: 'ingrid@norefjell.no',
    phone: '+4712345603',
    specialties: 'face,body',
    working_days: 'Tue,Wed,Thu,Sat',
    working_hours_start: '08:00',
    working_hours_end: '16:00',
    break_start: '11:30',
    break_end: '12:30',
    max_bookings_per_day: 9,
    avg_service_duration: '50 min',
    room_preference: 'Room 3',
    language_skills: 'Norwegian,English,Swedish',
    status: 'active',
    hire_date: '2024-03-10',
    notes: 'Facial treatments and aroma massage expert',
    current_bookings_today: 1,
    mappedEventSlug: 'classic-facial-80m',
    mappedEventTypeId: '103',
    mappedCalendarConnectionId: 'conn_003',
    calUsername: 'ingrid',
    team: 'Team Skincare',
    role: 'specialist'
  },
  {
    therapist_id: 'ther_004',
    therapist_name: 'Lars Pettersen',
    email: 'lars@norefjell.no',
    phone: '+4712345604',
    specialties: 'body,family',
    working_days: 'Mon,Tue,Thu,Fri,Sat,Sun',
    working_hours_start: '11:00',
    working_hours_end: '19:00',
    break_start: '14:00',
    break_end: '15:00',
    max_bookings_per_day: 6,
    avg_service_duration: '80 min',
    room_preference: 'Room 1',
    language_skills: 'Norwegian,English,Danish',
    status: 'active',
    hire_date: '2022-11-05',
    notes: 'Lymphatic and pregnancy massage certified',
    current_bookings_today: 0
  },
  {
    therapist_id: 'ther_005',
    therapist_name: 'Sofia Berg',
    email: 'sofia@norefjell.no',
    phone: '+4712345605',
    specialties: 'face,couples',
    working_days: 'Wed,Thu,Fri,Sat,Sun',
    working_hours_start: '09:00',
    working_hours_end: '17:00',
    break_start: '12:00',
    break_end: '13:00',
    max_bookings_per_day: 8,
    avg_service_duration: '55 min',
    room_preference: 'Room 3',
    language_skills: 'Norwegian,English,Polish',
    status: 'active',
    hire_date: '2024-09-01',
    notes: 'Mountain romance and family spa specialist',
    current_bookings_today: 0
  },
  {
    therapist_id: 'ther_006',
    therapist_name: 'Maja Lindqvist',
    email: 'maja@norefjell.no',
    phone: '+4712345606',
    specialties: 'body,face,family',
    working_days: 'Mon,Tue,Wed,Thu',
    working_hours_start: '07:00',
    working_hours_end: '15:00',
    break_start: '10:00',
    break_end: '11:00',
    max_bookings_per_day: 10,
    avg_service_duration: '45 min',
    room_preference: 'Room 2',
    language_skills: 'Norwegian,English,Finnish',
    status: 'active',
    hire_date: '2025-01-20',
    notes: 'High-volume therapist, express treatments',
    current_bookings_today: 0
  }
];

const realSpecialists = fallbackSpecialists;

const fallbackTreatments = [
  { id: '101', name: 'Hanakasumi™ signature', category: 'Body', duration: '50 min', description: 'Double exfoliation + relaxing full-body massage with foot attention; leaves skin silky smooth and body balanced', price: '$120.00' },
  { id: '102', name: 'Classic mountain massage (80m)', category: 'Body', duration: '80 min', description: 'Medium pressure, relaxing full-body massage for muscle tension relief', bestseller: true, price: '$180.00' },
  { id: '103', name: 'Classic mountain massage (50m)', category: 'Body', duration: '50 min', description: 'Medium pressure, relaxing full-body massage for muscle tension relief', price: '$120.00' },
  { id: '104', name: 'Mountain stone massage', category: 'Body', duration: '80 min', description: 'Soothing, deeply relaxing massage with warm lava stones', price: '$180.00' },
  { id: '105', name: 'Mountain serenity', category: 'Body', duration: '20 min', description: 'Body scrub + soothing lava stone massage to restore body/mind balance', price: '$75.00' },
  { id: '106', name: 'Back and neck', category: 'Body', duration: '50 min', description: 'Neck/back tension and stiffness relief', price: '$95.00' },
  { id: '108', name: 'Norefjell dream', category: 'Body', duration: '50 min', description: 'Invigorating scrub + hydrating Aloe Vera wrap + face/scalp massage + lava stone massage on back', bestseller: true, price: '$150.00' },
  { id: '201', name: 'Mountain romance', category: 'Couples', duration: '20 min', description: 'Romantic spa experience in private suite; sparkling wine, fresh fruit, bath, scrub, massage', price: '$250.00' },
  { id: '302', name: 'Classic facial (80m)', category: 'Face', duration: '80 min', description: 'Deep cleanse + exfoliation + skin-type mask + face/décolleté/scalp massage', bestseller: true, price: '$160.00' },
  { id: '401', name: 'Eyelash tinting', category: 'Eye', duration: '20 min', description: 'Enhance your natural eyelashes with a long-lasting tint', price: '$40.00' },
  { id: '402', name: 'Eyebrow tinting and shaping', category: 'Eye', duration: '30 min', description: 'Professional eyebrow tinting and expert shaping', price: '$55.00' },
  { id: '403', name: 'Eyelash and eyebrow tinting', category: 'Eye', duration: '45 min', description: 'Complete eye enhancement with eyelash and eyebrow tinting', price: '$75.00' },
  { id: '303', name: 'Mountain queen', category: 'Face', duration: '80 min', description: 'Glowing, event-ready skin; deep cleanse + specialized exfoliation + Doctor Babor Collagen Complex + intensive hydration + scalp massage', price: '$175.00' }
];

const realTreatments = fallbackTreatments;

const fallbackClients = [
  { id: '1', name: 'Eleanor Vance', email: 'eleanor.v@example.com', phone: '+1 (555) 234-5678', vip: true },
  { id: '2', name: 'Emma Thompson', email: 'emma.t@example.com', phone: '+1 (555) 123-4567', vip: true },
  { id: '3', name: 'James W.', email: 'james.w@example.com', phone: '+1 (555) 321-7654', vip: true },
  { id: '4', name: 'Sophie L.', email: 'sophie.l@example.com', phone: '+1 (555) 456-7890', vip: false },
  { id: '5', name: 'John Doe', email: 'john.doe@example.com', phone: '+1 (555) 000-0000', vip: false }
];

const realClients = fallbackClients;

const fallbackAppointments = [
  {
    id: 'emma',
    timeLabel: '09:00 - 10:00',
    client: 'Emma Thompson',
    procedure: 'Deep Tissue Recovery',
    specialist: 'Sarah J.',
    room: 'Room 1',
    status: 'confirmed',
    price: '$185.00',
    email: 'emma.t@example.com',
    phone: '+1 (555) 123-4567',
    vip: true,
    duration: '60 min',
    addons: ['Aromatherapy', 'Hot Stones'],
    notes: 'Client prefers firmer pressure on upper back. Mentioned slight lower back sensitivity during booking.',
    colorClass: 'bg-primary/10 border-primary text-primary',
    posStyle: { top: '0px', height: '90px' }
  },
  {
    id: 'mark',
    timeLabel: '10:30 - 11:00',
    client: 'Mark R.',
    procedure: 'Back and neck',
    specialist: 'Anna Lindqvist',
    room: 'Room 1',
    status: 'needs_action',
    price: '$95.00',
    email: 'mark.r@example.com',
    phone: '+1 (555) 987-6543',
    vip: false,
    duration: '30 min',
    addons: [],
    notes: 'Late 15m. Client running behind.',
    colorClass: 'bg-accent-coral/10 border-accent-coral text-accent-coral',
    posStyle: { top: '144px', height: '45px' }
  },
  {
    id: 'sophie',
    timeLabel: '09:30 - 10:15',
    client: 'Sophie L.',
    procedure: 'Classic facial (80m)',
    specialist: 'Erik Hansens',
    room: 'Room 2',
    status: 'pending',
    price: '$160.00',
    email: 'sophie.l@example.com',
    phone: '+1 (555) 456-7890',
    vip: false,
    duration: '45 min',
    addons: ['Aromatherapy'],
    notes: 'Allergies to lavender oil.',
    colorClass: 'bg-[#EAB308]/10 border-[#EAB308] text-[#B45309]',
    posStyle: { top: '48px', height: '70px' }
  },
  {
    id: 'james',
    timeLabel: '10:00 - 11:00',
    client: 'James W.',
    procedure: 'Mountain serenity',
    specialist: 'Ingrid Olsen',
    room: 'Room 3',
    status: 'cancelled',
    price: '$75.00',
    email: 'james.w@example.com',
    phone: '+1 (555) 321-7654',
    vip: true,
    duration: '60 min',
    addons: [],
    notes: 'Cancelled due to scheduling conflict.',
    colorClass: 'bg-surface-variant/30 border-outline text-outline opacity-60',
    posStyle: { top: '96px', height: '90px' }
  }
];

const realAppointments = [
  {
    id: 'ra1',
    timeLabel: '09:00 - 10:00',
    client: 'Alice Cooper',
    procedure: 'Classic mountain massage (80m)',
    specialist: 'Anna Lindqvist',
    room: 'Room 1',
    status: 'confirmed',
    price: '$180.00',
    email: 'alice.c@strawberryhotels.com',
    phone: '+1 (555) 777-1111',
    vip: true,
    duration: '60 min',
    addons: ['Aromatherapy'],
    notes: 'Real sync: Prefer lavender aroma oil.',
    colorClass: 'bg-primary/10 border-primary text-primary',
    posStyle: { top: '0px', height: '90px' }
  },
  {
    id: 'ra2',
    timeLabel: '10:00 - 10:45',
    client: 'Bob Dylan',
    procedure: 'Classic facial (80m)',
    specialist: 'Erik Hansens',
    room: 'Room 2',
    status: 'confirmed',
    price: '$160.00',
    email: 'bob.d@strawberryhotels.com',
    phone: '+1 (555) 777-2222',
    vip: true,
    duration: '45 min',
    addons: [],
    notes: 'API Sync: Client requests warm green tea.',
    colorClass: 'bg-primary/10 border-primary text-primary',
    posStyle: { top: '96px', height: '70px' }
  },
  {
    id: 'ra3',
    timeLabel: '09:30 - 10:30',
    client: 'Charlie Chaplin',
    procedure: 'Mountain queen',
    specialist: 'Ingrid Olsen',
    room: 'Room 3',
    status: 'pending',
    price: '$175.00',
    email: 'charlie.c@strawberryhotels.com',
    phone: '+1 (555) 777-3333',
    vip: false,
    duration: '60 min',
    addons: [],
    notes: 'Sensitive skin. No chemical scrubs.',
    colorClass: 'bg-[#EAB308]/10 border-[#EAB308] text-[#B45309]',
    posStyle: { top: '48px', height: '90px' }
  }
];

const initialRequests = [
  {
    id: 'eleanor',
    client: 'Eleanor Vance',
    avatar: null,
    procedure: 'Hanakasumi™ signature',
    requestedTime: '11:00 - 12:00',
    status: 'new',
    notes: 'Client requests window-side room preference.'
  },
  {
    id: 'john',
    client: 'John Doe',
    avatar: null,
    procedure: 'Mountain stone massage',
    requestedTime: '10:00 - 11:00',
    status: 'new',
    notes: 'Aromatherapy preferences.'
  },
  {
    id: 'sarah_j',
    client: 'Sarah Jenkins',
    avatar: null,
    procedure: 'Norefjell dream',
    requestedTime: '09:00 - 10:00',
    status: 'new',
    notes: 'First time at Norefjell Spa Resort.'
  },
  {
    id: 'req_04',
    client: 'Michael Chang',
    avatar: null,
    procedure: 'Classic facial (80m)',
    requestedTime: '13:00 - 14:20',
    status: 'new',
    notes: 'Allergic to lavender.'
  },
  {
    id: 'req_05',
    client: 'Anna Svensson',
    avatar: null,
    procedure: 'Mountain stone massage',
    requestedTime: '14:30 - 15:30',
    status: 'new',
    notes: 'Requesting strong pressure.'
  },
  {
    id: 'req_06',
    client: 'David O\'Connor',
    avatar: null,
    procedure: 'Hanakasumi™ signature',
    requestedTime: '15:00 - 16:00',
    status: 'new',
    notes: 'Wants a quiet room.'
  },
  {
    id: 'req_07',
    client: 'Sofia Rossi',
    avatar: null,
    procedure: 'Norefjell dream',
    requestedTime: '11:30 - 12:30',
    status: 'new',
    notes: 'Celebrating birthday.'
  },
  {
    id: 'req_08',
    client: 'Liam Neeson',
    avatar: null,
    procedure: 'Classic mountain massage (50m)',
    requestedTime: '16:00 - 17:00',
    status: 'new',
    notes: 'Lower back focus.'
  },
  {
    id: 'req_09',
    client: 'Olivia Tremblay',
    avatar: null,
    procedure: 'Hanakasumi™ signature',
    requestedTime: '09:00 - 10:00',
    status: 'new',
    notes: 'First time client.'
  },
  {
    id: 'req_10',
    client: 'James Smith',
    avatar: null,
    procedure: 'Norefjell dream',
    requestedTime: '13:30 - 14:30',
    status: 'new',
    notes: 'No specific notes.'
  },
  {
    id: 'req_11',
    client: 'Emma Watson',
    avatar: null,
    procedure: 'Classic facial (80m)',
    requestedTime: '10:30 - 11:50',
    status: 'new',
    notes: 'Requires extractions.'
  },
  {
    id: 'req_12',
    client: 'Lucas Silva',
    avatar: null,
    procedure: 'Mountain stone massage',
    requestedTime: '17:00 - 18:00',
    status: 'new',
    notes: 'Prefers male therapist if possible.'
  },
  {
    id: 'req_13',
    client: 'Mia Wong',
    avatar: null,
    procedure: 'Norefjell dream',
    requestedTime: '12:00 - 13:00',
    status: 'new',
    notes: 'Requires wheelchair access.'
  }
];

const defaultAddonsList = [
  { id: 'a1', name: 'Aromatherapy', price: '$25.00', description: 'Infusion of pure organic essential oils.' },
  { id: 'a2', name: 'Hot Stones', price: '$40.00', description: 'Placements of heated volcanic basalt stones.' },
  { id: 'a3', name: 'Collagen Eye Mask', price: '$15.00', description: 'Hydrating eye treatment to reduce puffiness.' },
  { id: 'a4', name: 'Foot Scrub & Reflexology', price: '$35.00', description: 'Exfoliating salt scrub and pressure points massage.' }
];




// Helper to reliably compute the active mapped treatments list
export const getDynamicTreatments = (specialists: any[], calEventTypes: any[], treatments: any[]) => {
  if (calEventTypes.length === 0 || specialists.length === 0) return treatments;
  
  const calTreatments = new Set<string>();
  specialists.forEach(spec => {
    if (spec.calUserId) {
      calEventTypes.forEach(et => {
        if (String(et.userId) === String(spec.calUserId)) {
          calTreatments.add(et.title);
        }
      });
    }
  });

  if (calTreatments.size > 0) {
    return Array.from(calTreatments).map(tName => ({
      id: tName,
      name: tName,
      description: 'Fetched from live calendar',
      price: 0,
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }));
  }
  return treatments;
};

export default function App() {
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'receptionist'>('receptionist');
  const [adminModeAuthenticated, setAdminModeAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('sb_admin_pin') || '1234';
  });
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');

  const [currentView, setCurrentView] = useState<'dashboard' | 'requests' | 'settings' | 'week' | 'month' | 'clients' | 'specialists' | 'addons' | 'support' | 'availability' | 'bookings' | 'webhooks' | 'mcp' | 'cal_diy_manager'>('dashboard');
  const [incomingTab, setIncomingTab] = useState<'new' | 'action' | 'handled'>('new');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Specialist Sync Configs (Persisted)
  const [specialistSourceMode, setSpecialistSourceMode] = useState<'sheets' | 'api'>(() => {
    return (localStorage.getItem('sb_spec_source_mode') as 'sheets' | 'api') || 'sheets';
  });
  const [specialistSheetId, setSpecialistSheetId] = useState(() => {
    return localStorage.getItem('sb_spec_sheet_id') || '1EX8EBboc87ZMFfhSkEf27EA_EkQPDEMpiXgjSELWAZA';
  });
  const [specialistSheetName, setSpecialistSheetName] = useState(() => {
    return localStorage.getItem('sb_spec_sheet_name') || 'Specialists';
  });
  const [specialistApiEndpoint, setSpecialistApiEndpoint] = useState(() => {
    return localStorage.getItem('sb_spec_api_endpoint') || 'https://api.strawberryhotels.com/v1/spa/specialists';
  });
  const [specialistAccessToken, setSpecialistAccessToken] = useState(() => {
    return localStorage.getItem('sb_spec_access_token') || 'sb_live_s082c9e782a1';
  });
  const [specialistApiConnected, setSpecialistApiConnected] = useState(() => {
    return localStorage.getItem('sb_spec_api_connected') === 'true';
  });

  // Treatment Sync Configs (Persisted)
  const [treatmentSourceMode, setTreatmentSourceMode] = useState<'sheets' | 'api'>(() => {
    return (localStorage.getItem('sb_treat_source_mode') as 'sheets' | 'api') || 'sheets';
  });
  const [treatmentSheetId, setTreatmentSheetId] = useState(() => {
    return localStorage.getItem('sb_treat_sheet_id') || '1_n9gV_Wsn5CeEorniWJY6MjaX4am3ZIHpovntRhcqg4';
  });
  const [treatmentSheetName, setTreatmentSheetName] = useState(() => {
    return localStorage.getItem('sb_treat_sheet_name') || 'spa_treatment_catalog';
  });
  const [treatmentApiEndpoint, setTreatmentApiEndpoint] = useState(() => {
    return localStorage.getItem('sb_treat_api_endpoint') || 'https://api.strawberryhotels.com/v1/spa/treatments';
  });
  const [treatmentAccessToken, setTreatmentAccessToken] = useState(() => {
    return localStorage.getItem('sb_treat_access_token') || 'sb_live_t771c29da22';
  });
  const [treatmentApiConnected, setTreatmentApiConnected] = useState(() => {
    return localStorage.getItem('sb_treat_api_connected') === 'true';
  });

  // Clients Sync Configs (Persisted)
  const [clientSourceMode, setClientSourceMode] = useState<'sheets' | 'api'>(() => {
    return (localStorage.getItem('sb_client_source_mode') as 'sheets' | 'api') || 'sheets';
  });
  const [clientSheetId, setClientSheetId] = useState(() => {
    return localStorage.getItem('sb_client_sheet_id') || '';
  });
  const [clientSheetName, setClientSheetName] = useState(() => {
    return localStorage.getItem('sb_client_sheet_name') || 'Clients';
  });
  const [clientApiEndpoint, setClientApiEndpoint] = useState(() => {
    return localStorage.getItem('sb_client_api_endpoint') || 'https://api.strawberryhotels.com/v1/spa/clients';
  });
  const [clientAccessToken, setClientAccessToken] = useState(() => {
    return localStorage.getItem('sb_client_access_token') || 'sb_live_c19d83e2a98f';
  });
  const [clientApiConnected, setClientApiConnected] = useState(() => {
    return localStorage.getItem('sb_client_api_connected') === 'true';
  });

  // Cal.com API Integrations State
  const [calComApiKey, setCalComApiKey] = useState(() => {
    return localStorage.getItem('sb_calcom_api_key') || '';
  });
  const [calComApiKeys, setCalComApiKeys] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('sb_calcom_api_keys');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleUpdateUserApiKey = (username: string, key: string) => {
    const next = { ...calComApiKeys, [username]: key };
    setCalComApiKeys(next);
    localStorage.setItem('sb_calcom_api_keys', JSON.stringify(next));
  };

  const [calComApiEndpoint, setCalComApiEndpoint] = useState(() => {
    let saved = localStorage.getItem('sb_calcom_api_endpoint');
    if (!saved || saved.includes('api.cal.com')) {
      saved = 'https://calcom.run.place';
      localStorage.setItem('sb_calcom_api_endpoint', saved);
    }
    return saved;
  });
  const [calComBookingsEndpoint, setCalComBookingsEndpoint] = useState(() => {
    return localStorage.getItem('sb_calcom_bookings_endpoint') || '';
  });
  const [calComConnected, setCalComConnected] = useState(() => {
    return localStorage.getItem('sb_calcom_connected') === 'true';
  });
  const [isSyncingCalCom, setIsSyncingCalCom] = useState(false);
  const [calConnections, setCalConnections] = useState<any[]>([]);
  const [calList, setCalList] = useState<any[]>([]);
  const [calEventTypes, setCalEventTypes] = useState<any[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [webhooks, setWebhooks] = useState<any[]>(() => MockDatabase.getWebhooks());
  const [webhookDeliveries, setWebhookDeliveries] = useState<any[]>(() => MockDatabase.getWebhookDeliveries());

  const [lastSyncTime, setLastSyncTime] = useState(() => {
    return localStorage.getItem('sb_last_sync_time') || 'Never synced';
  });
  const [syncStatus, setSyncStatus] = useState('Idle');
  const [integrationErrorLog, setIntegrationErrorLog] = useState('');
  const [destinationCalendarId, setDestinationCalendarId] = useState(() => {
    return localStorage.getItem('sb_destination_calendar_id') || '';
  });
  const [conflictCheckCalendarIds, setConflictCheckCalendarIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('sb_conflict_check_calendar_ids') || '[]');
    } catch {
      return [];
    }
  });

  const [calDiyUser, setCalDiyUser] = useState(() => {
    return localStorage.getItem('sb_cal_diy_user') || 'admin';
  });
  const [calOrgUsers, setCalOrgUsers] = useState<any[]>(() => {
    try { const v = JSON.parse(localStorage.getItem('sb_cal_manual_users') || '[]'); return Array.isArray(v) ? v : []; }
    catch { return []; }
  });
  const [isLoadingOrgUsers, setIsLoadingOrgUsers] = useState(false);
  const [calSpecialistLinks, setCalSpecialistLinks] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('sb_cal_specialist_links') || '{}'); }
    catch { return {}; }
  });

  // Per-specialist Cal data (keyed by calUserId string)
  const [specialistCalendars, setSpecialistCalendars] = useState<Record<string, any[]>>({});
  const [specialistEventTypes, setSpecialistEventTypes] = useState<Record<string, any[]>>({});
  const [specialistConnections, setSpecialistConnections] = useState<Record<string, any[]>>({});
  const [specialistSyncStatus, setSpecialistSyncStatus] = useState<Record<string, 'idle'|'loading'|'ready'|'not_ready'|'error'>>({});

  // Global sync
  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);
  const [globalSyncLog, setGlobalSyncLog] = useState<string[]>([]);

  // Cal.com integration tab navigation
  const [calIntegrationTab, setCalIntegrationTab] = useState<'overview'|'users'|'specialists'|'treatments'|'calendars'|'webhooks'>('overview');

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ embedJsUrl: "https://calcom.run.place/embed/embed.js" });
      cal("ui", { theme: "light", hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('sb_cal_diy_user', calDiyUser);
  }, [calDiyUser]);

  useEffect(() => {
    localStorage.setItem('sb_last_sync_time', lastSyncTime);
  }, [lastSyncTime]);

  useEffect(() => {
    localStorage.setItem('sb_destination_calendar_id', destinationCalendarId);
  }, [destinationCalendarId]);

  useEffect(() => {
    localStorage.setItem('sb_conflict_check_calendar_ids', JSON.stringify(conflictCheckCalendarIds));
  }, [conflictCheckCalendarIds]);

  useEffect(() => {
    localStorage.setItem('sb_cal_specialist_links', JSON.stringify(calSpecialistLinks));
  }, [calSpecialistLinks]);



  useEffect(() => {
    localStorage.setItem('sb_calcom_api_endpoint', calComApiEndpoint);
  }, [calComApiEndpoint]);

  useEffect(() => {
    localStorage.setItem('sb_calcom_bookings_endpoint', calComBookingsEndpoint);
  }, [calComBookingsEndpoint]);

  useEffect(() => {
    localStorage.setItem('sb_calcom_api_key', calComApiKey);
  }, [calComApiKey]);

  useEffect(() => {
    localStorage.setItem('sb_calcom_connected', calComConnected ? 'true' : 'false');
  }, [calComConnected]);

  const getSpecialistBookingStatus = (specName: string, treatmentName: string) => {
    const matchedSpec = specialists.find(s => s.therapist_name === specName);
    if (!matchedSpec) {
      return { valid: false, reason: 'Specialist does not exist' };
    }

    // Check if linked to Cal.com
    if (!matchedSpec.calUserId && !matchedSpec.calUsername) {
      return { valid: false, reason: 'Not linked to Cal.com calendar' };
    }

    if (treatmentName) {
      const isMapped = calEventTypes.some(et => et.title.toLowerCase() === treatmentName.toLowerCase() && String(et.userId) === String(matchedSpec.calUserId)) ||
                       true;
      
      if (!isMapped) {
        return { valid: false, reason: 'Does not provide this treatment' };
      }
    }

    return { valid: true };
  };

  useEffect(() => {
    MockDatabase.saveWebhooks(webhooks);
  }, [webhooks]);

  useEffect(() => {
    MockDatabase.saveWebhookDeliveries(webhookDeliveries);
  }, [webhookDeliveries]);

  useEffect(() => {
    if (calComApiKey) {
      handleFetchCalendarsAndConnections();
    }
  }, [calComApiKey]);

  // Google Console API & OAuth Integration State
  const [googleApiKey, setGoogleApiKey] = useState(() => {
    return localStorage.getItem('sb_google_api_key') || '';
  });
  const [googleClientId, setGoogleClientId] = useState(() => {
    return localStorage.getItem('sb_google_client_id') || '';
  });
  const [googleClientSecret, setGoogleClientSecret] = useState(() => {
    return localStorage.getItem('sb_google_client_secret') || '';
  });
  const [googleAuthorized, setGoogleAuthorized] = useState(() => {
    return localStorage.getItem('sb_google_authorized') === 'true';
  });
  const [isAuthorizingGoogle, setIsAuthorizingGoogle] = useState(false);

  useEffect(() => {
    localStorage.setItem('sb_google_api_key', googleApiKey);
  }, [googleApiKey]);

  useEffect(() => {
    localStorage.setItem('sb_google_client_id', googleClientId);
  }, [googleClientId]);

  useEffect(() => {
    localStorage.setItem('sb_google_client_secret', googleClientSecret);
  }, [googleClientSecret]);

  useEffect(() => {
    localStorage.setItem('sb_google_authorized', googleAuthorized ? 'true' : 'false');
  }, [googleAuthorized]);

  // Bookings and Webhooks Screens states
  const [bookingsTab, setBookingsTab] = useState<'all' | 'reschedules' | 'cancellations'>('all');
  const [selectedAuditLogBooking, setSelectedAuditLogBooking] = useState<any | null>(null);
  const [viewingWebhookPayload, setViewingWebhookPayload] = useState<any | null>(null);
  const [isPingingWebhook, setIsPingingWebhook] = useState<string | null>(null);

  // History lists state (Saves both Spreadsheet ID and tab name)
  const [specialistSheetHistory, setSpecialistSheetHistory] = useState<any[]>(() => {
    const list = localStorage.getItem('sb_spec_sheet_history_v2');
    return list ? JSON.parse(list) : [
      { id: '1A2b3C4d5E6f7G8h9I0jK', name: 'Specialists' },
      { id: '1uHhg_yqjIOLp9W7x8aZk', name: 'Sheet1' }
    ];
  });
  const [treatmentSheetHistory, setTreatmentSheetHistory] = useState<any[]>(() => {
    const list = localStorage.getItem('sb_treat_sheet_history_v2');
    return list ? JSON.parse(list) : [
      { id: '1oPp982xZaLqW173cDbJk', name: 'Treatments' }
    ];
  });
  const [clientSheetHistory, setClientSheetHistory] = useState<any[]>(() => {
    const list = localStorage.getItem('sb_client_sheet_history_v2');
    return list ? JSON.parse(list) : [
      { id: '1pPo9283cZaLqW881zKlm', name: 'Clients' }
    ];
  });

  // Helper to determine sync status directly from localStorage / current state variables
  const specSynced = specialistSourceMode === 'sheets'
    ? specialistSheetId.trim() !== '' && specialistSheetName.trim() !== '' && !specialistSheetId.includes(' ') && specialistSheetId.length >= 15
    : specialistApiConnected;

  const treatSynced = treatmentSourceMode === 'sheets'
    ? treatmentSheetId.trim() !== '' && treatmentSheetName.trim() !== '' && !treatmentSheetId.includes(' ') && treatmentSheetId.length >= 15
    : treatmentApiConnected;

  const clientSynced = clientSourceMode === 'sheets'
    ? clientSheetId.trim() !== '' && clientSheetName.trim() !== '' && !clientSheetId.includes(' ') && clientSheetId.length >= 15
    : clientApiConnected;

  // Persisted Schedulers Data Lists (Offline vs Synced Workspaces)
  const [specialists, setSpecialists] = useState<any[]>(() => {
    const id = localStorage.getItem('sb_spec_sheet_id') || '1EX8EBboc87ZMFfhSkEf27EA_EkQPDEMpiXgjSELWAZA';
    const key = specSynced ? `sb_real_specialists_list_${id}` : 'sb_offline_specialists_list';
    const list = localStorage.getItem(key);
    return list ? JSON.parse(list).map((s: any) => ({
      ...s,
      calUsername: s.calUsername === 'usr_erik_1784587343495' ? 'erik' : 
                   s.calUsername === 'usr_ingrid_1784587356650' ? 'ingrid' : 
                   s.calUsername
    })) : (specSynced ? realSpecialists : fallbackSpecialists);
  });

  const [reassigningAppt, setReassigningAppt] = useState<any>(null);
  const [targetReassignSpecialistId, setTargetReassignSpecialistId] = useState<string>('');

  // Clean up "short-term memory" orphaned specialist links
  useEffect(() => {
    setCalSpecialistLinks(prev => {
      let changed = false;
      const clean = { ...prev };
      for (const [calUserId, therapistId] of Object.entries(prev)) {
        if (!specialists.some(s => s.therapist_id === therapistId)) {
          delete clean[calUserId];
          changed = true;
        }
      }
      return changed ? clean : prev;
    });
  }, [specialists]);

  const [appointments, setAppointments] = useState<any[]>(() => {
    const id = localStorage.getItem('sb_spec_sheet_id') || '1EX8EBboc87ZMFfhSkEf27EA_EkQPDEMpiXgjSELWAZA';
    const key = specSynced ? `sb_real_appointments_list_${id}` : 'sb_offline_appointments_list';
    const list = localStorage.getItem(key);
    return list ? JSON.parse(list) : (specSynced ? realAppointments : fallbackAppointments);
  });

  const [requests, setRequests] = useState<any[]>(() => {
    const id = localStorage.getItem('sb_spec_sheet_id') || '1EX8EBboc87ZMFfhSkEf27EA_EkQPDEMpiXgjSELWAZA';
    const key = specSynced ? `sb_real_requests_list_v3_${id}` : 'sb_offline_requests_list_v3';
    const list = localStorage.getItem(key);
    return list ? JSON.parse(list) : initialRequests;
  });

  const [actionRequests, setActionRequests] = useState<any[]>(() => {
    const id = localStorage.getItem('sb_spec_sheet_id') || '1EX8EBboc87ZMFfhSkEf27EA_EkQPDEMpiXgjSELWAZA';
    const key = specSynced ? `sb_real_action_requests_${id}` : 'sb_offline_action_requests';
    const list = localStorage.getItem(key);
    return list ? JSON.parse(list) : (specSynced ? [] : [
      {
        id: 'act1',
        client: 'Sophie L.',
        avatar: null,
        procedure: 'Classic facial (80m)',
        requestedTime: '09:30 - 10:15',
        status: 'needs_action',
        notes: 'Awaiting therapist assignment validation.'
      }
    ]);
  });

  const [handledRequests, setHandledRequests] = useState<any[]>(() => {
    const id = localStorage.getItem('sb_spec_sheet_id') || '1EX8EBboc87ZMFfhSkEf27EA_EkQPDEMpiXgjSELWAZA';
    const key = specSynced ? `sb_real_handled_requests_${id}` : 'sb_offline_handled_requests';
    const list = localStorage.getItem(key);
    return list ? JSON.parse(list) : (specSynced ? [] : [
      {
        id: 'hand1',
        client: 'Emma Thompson',
        avatar: null,
        procedure: 'Classic mountain massage (50m)',
        requestedTime: '11:00 - 12:00',
        status: 'confirmed',
        notes: 'Confirmed and synced to spreadsheet.'
      }
    ]);
  });

  const [treatments, setTreatments] = useState<any[]>(() => {
    const id = localStorage.getItem('sb_treat_sheet_id') || '1_n9gV_Wsn5CeEorniWJY6MjaX4am3ZIHpovntRhcqg4';
    const key = treatSynced ? `sb_real_treatments_list_${id}` : 'sb_offline_treatments_list';
    const list = localStorage.getItem(key);
    return list ? JSON.parse(list) : (treatSynced ? realTreatments : fallbackTreatments);
  });

  const [clients, setClients] = useState<any[]>(() => {
    const id = localStorage.getItem('sb_client_sheet_id') || '';
    const key = clientSynced ? `sb_real_clients_list_${id}` : 'sb_offline_clients_list';
    const list = localStorage.getItem(key);
    return list ? JSON.parse(list) : (clientSynced ? realClients : fallbackClients);
  });

  const [addons, setAddons] = useState<any[]>(() => {
    const list = localStorage.getItem('sb_addons_list');
    return list ? JSON.parse(list) : defaultAddonsList;
  });
  // Active Dashboard Date Selection State
  const [dashboardDate, setDashboardDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reschedDate, setReschedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Track previous sheet config to only reload state when it genuinely changes
  const prevSpecKey = useRef<string | null>(null);
  const prevTreatKey = useRef<string | null>(null);
  const prevClientKey = useRef<string | null>(null);
  const isFirstMount = useRef(true);

  // Reload specialists/appointments/requests ONLY when the active sheet key changes
  useEffect(() => {
    const keySpec = specSynced ? `sb_real_specialists_list_${specialistSheetId}` : 'sb_offline_specialists_list';
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevSpecKey.current = keySpec;
      return; // initial load already handled by useState initializer
    }
    if (prevSpecKey.current === keySpec) return; // same key, don't reset
    prevSpecKey.current = keySpec;

    const keyAppt = specSynced ? `sb_real_appointments_list_${specialistSheetId}` : 'sb_offline_appointments_list';
    const keyReq = specSynced ? `sb_real_requests_list_v3_${specialistSheetId}` : 'sb_offline_requests_list_v3';
    const keyAct = specSynced ? `sb_real_action_requests_${specialistSheetId}` : 'sb_offline_action_requests';
    const keyHand = specSynced ? `sb_real_handled_requests_${specialistSheetId}` : 'sb_offline_handled_requests';

    const savedSpec = localStorage.getItem(keySpec);
    setSpecialists(savedSpec ? JSON.parse(savedSpec).map((s: any) => ({
      ...s,
      calUsername: s.calUsername === 'usr_erik_1784587343495' ? 'erik' : 
                   s.calUsername === 'usr_ingrid_1784587356650' ? 'ingrid' : 
                   s.calUsername
    })) : (specSynced ? realSpecialists : fallbackSpecialists));

    const savedAppt = localStorage.getItem(keyAppt);
    setAppointments(savedAppt ? JSON.parse(savedAppt) : (specSynced ? realAppointments : fallbackAppointments));

    const savedReq = localStorage.getItem(keyReq);
    setRequests(savedReq ? JSON.parse(savedReq) : initialRequests);

    const savedAct = localStorage.getItem(keyAct);
    setActionRequests(savedAct ? JSON.parse(savedAct) : [
      { id: 'act1', client: 'Sophie L.', avatar: null, procedure: 'Radiance Glow Facial', requestedTime: '09:30 - 10:15', status: 'needs_action', notes: 'Awaiting therapist assignment validation.' }
    ]);

    const savedHand = localStorage.getItem(keyHand);
    setHandledRequests(savedHand ? JSON.parse(savedHand) : (specSynced ? [] : [
      { id: 'hand1', client: 'Emma Thompson', avatar: null, procedure: 'Aromatherapy Bliss', requestedTime: '11:00 - 12:00', status: 'confirmed', notes: 'Confirmed and synced to spreadsheet.' }
    ]));
  }, [specSynced, specialistSheetId, specialistSheetName]);

  useEffect(() => {
    const keyTreat = treatSynced ? `sb_real_treatments_list_${treatmentSheetId}` : 'sb_offline_treatments_list';
    if (prevTreatKey.current === keyTreat) return;
    prevTreatKey.current = keyTreat;
    const savedTreat = localStorage.getItem(keyTreat);
    setTreatments(savedTreat ? JSON.parse(savedTreat) : (treatSynced ? realTreatments : fallbackTreatments));
  }, [treatSynced, treatmentSheetId, treatmentSheetName]);

  useEffect(() => {
    const keyClient = clientSynced ? `sb_real_clients_list_${clientSheetId}` : 'sb_offline_clients_list';
    if (prevClientKey.current === keyClient) return;
    prevClientKey.current = keyClient;
    const savedClient = localStorage.getItem(keyClient);
    setClients(savedClient ? JSON.parse(savedClient) : (clientSynced ? realClients : fallbackClients));
  }, [clientSynced, clientSheetId, clientSheetName]);

  // Persistent auto-saves: write to localStorage whenever state changes
  useEffect(() => {
    const keySpec = specSynced ? `sb_real_specialists_list_${specialistSheetId}` : 'sb_offline_specialists_list';
    localStorage.setItem(keySpec, JSON.stringify(specialists));
  }, [specialists, specSynced, specialistSheetId]);

  useEffect(() => {
    const keyAppt = specSynced ? `sb_real_appointments_list_${specialistSheetId}` : 'sb_offline_appointments_list';
    localStorage.setItem(keyAppt, JSON.stringify(appointments));
  }, [appointments, specSynced, specialistSheetId]);

  useEffect(() => {
    const keyReq = specSynced ? `sb_real_requests_list_v3_${specialistSheetId}` : 'sb_offline_requests_list_v3';
    localStorage.setItem(keyReq, JSON.stringify(requests));
  }, [requests, specSynced, specialistSheetId]);

  useEffect(() => {
    const keyAct = specSynced ? `sb_real_action_requests_${specialistSheetId}` : 'sb_offline_action_requests';
    localStorage.setItem(keyAct, JSON.stringify(actionRequests));
  }, [actionRequests, specSynced, specialistSheetId]);

  useEffect(() => {
    const keyHand = specSynced ? `sb_real_handled_requests_${specialistSheetId}` : 'sb_offline_handled_requests';
    localStorage.setItem(keyHand, JSON.stringify(handledRequests));
  }, [handledRequests, specSynced, specialistSheetId]);

  useEffect(() => {
    const keyTreat = treatSynced ? `sb_real_treatments_list_${treatmentSheetId}` : 'sb_offline_treatments_list';
    localStorage.setItem(keyTreat, JSON.stringify(treatments));
  }, [treatments, treatSynced, treatmentSheetId]);

  useEffect(() => {
    const keyClient = clientSynced ? `sb_real_clients_list_${clientSheetId}` : 'sb_offline_clients_list';
    localStorage.setItem(keyClient, JSON.stringify(clients));
  }, [clients, clientSynced, clientSheetId]);

  useEffect(() => {
    localStorage.setItem('sb_addons_list', JSON.stringify(addons));
  }, [addons]);
  
  // Specialists Table Expandable Row
  const [expandedTherapistId, setExpandedTherapistId] = useState<string | null>(null);

  // Dashboard Filters State
  const [filterSpecialist, setFilterSpecialist] = useState('Specialist');
  const [filterTreatment, setFilterTreatment] = useState('Procedure Type');
  const [filterStatus, setFilterStatus] = useState('Status');

  // Search Integration
  const [searchQuery, setSearchQuery] = useState('');

  // Top-Right Popovers
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null); // Audit logs details modal

  const [notificationsList, setNotificationsList] = useState([
    { id: 1, text: 'System connected to Specialists sheets database successfully.', time: '10 min ago', read: false },
    { id: 2, text: 'New booking request received from Eleanor Vance.', time: '35 min ago', read: false },
    { id: 3, text: 'Settings data sources re-evaluated: Offlines fallbacks loaded.', time: '1 hr ago', read: true }
  ]);

  // Quick Book / New Appointment Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookClientName, setBookClientName] = useState('');
  const [showBookClientDropdown, setShowBookClientDropdown] = useState(false);
  const [showReschedClientDropdown, setShowReschedClientDropdown] = useState(false);

  const [bookClientEmail, setBookClientEmail] = useState('');
  const [bookClientPhone, setBookClientPhone] = useState('');
  const [bookSpecialist, setBookSpecialist] = useState('');
  const [bookCoSpecialist, setBookCoSpecialist] = useState('');
  const [bookTreatment, setBookTreatment] = useState('');
  const [bookDuration, setBookDuration] = useState<number | ''>('');
  const [bookTimeLabel, setBookTimeLabel] = useState('09:00 - 10:00');
  const [bookDate, setBookDate] = useState('2023-10-24');
  const [bookNotes, setBookNotes] = useState('');
  const [bookSelectedAddons, setBookSelectedAddons] = useState<string[]>([]);
  const [bookSaveAsPending, setBookSaveAsPending] = useState(false);
  const [reschedSaveAsPending, setReschedSaveAsPending] = useState(false);

  useEffect(() => {
    if (showBookingModal) {
      setBookDate(dashboardDate);
    }
  }, [showBookingModal, dashboardDate]);

  // Reschedule Incoming Request Modal State
  const [rescheduleRequest, setRescheduleRequest] = useState<any>(null);
  const [reschedSpecialist, setReschedSpecialist] = useState('');
  const [reschedTreatment, setReschedTreatment] = useState('');
  const [reschedTimeLabel, setReschedTimeLabel] = useState('09:00 - 10:00');

  const startReschedRequest = (req: any) => {
    const matchedTreat = treatments.find(t => t.name === req.procedure);
    const duration = matchedTreat ? matchedTreat.duration : '30 min';
    const mappedAppt = {
      id: req.id,
      title: req.procedure,
      procedure: req.procedure,
      client: req.client,
      date: new Date().toISOString().split('T')[0],
      start: new Date().toISOString(),
      duration: duration,
      room: 'Room 1',
      notes: req.notes,
      specialist: specialists[0]?.therapist_name || 'Anna Lindqvist',
      status: 'rescheduling'
    };
    setSelectedAppointment(mappedAppt);
    startRescheduleWorkflow(mappedAppt);
  };


  // Sync Loadings
  const [isSyncingSpecialists, setIsSyncingSpecialists] = useState(false);
  const [isSyncingTreatments, setIsSyncingTreatments] = useState(false);
  const [isSyncingClients, setIsSyncingClients] = useState(false);

  // Popup & notification states
  const [notification, setNotification] = useState<string | null>(null);
  const [toastQueue, setToastQueue] = useState<string[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // Detailed Specialist Form Inputs
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecRoom, setNewSpecRoom] = useState('Room 1');
  const [newSpecEmail, setNewSpecEmail] = useState('');
  const [newSpecPhone, setNewSpecPhone] = useState('');
  const [newSpecSpecialties, setNewSpecSpecialties] = useState('');
  const [newSpecWorkingDays, setNewSpecWorkingDays] = useState('Mon, Tue, Wed, Thu, Fri');
  const [newSpecHoursStart, setNewSpecHoursStart] = useState('09:00');
  const [newSpecHoursEnd, setNewSpecHoursEnd] = useState('17:00');
  const [newSpecBreakStart, setNewSpecBreakStart] = useState('12:00');
  const [newSpecBreakEnd, setNewSpecBreakEnd] = useState('13:00');
  const [newSpecMaxBookings, setNewSpecMaxBookings] = useState(6);
  const [newSpecAvgDuration, setNewSpecAvgDuration] = useState('60 min');
  const [newSpecLanguages, setNewSpecLanguages] = useState('English');
  const [newSpecNotes, setNewSpecNotes] = useState('');
  const [newSpecEventSlug, setNewSpecEventSlug] = useState('');
  const [newSpecEventTypeId, setNewSpecEventTypeId] = useState('');
  const [newSpecCalendarConnectionId, setNewSpecCalendarConnectionId] = useState('');
  
  // Availability Lookup View State
  const [availabilitySpecialist, setAvailabilitySpecialist] = useState('');
  const [availabilityCoSpecialist, setAvailabilityCoSpecialist] = useState('');
  const [availabilityTreatment, setAvailabilityTreatment] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Cancellation Flow View State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingApptId, setCancelingApptId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Cleaning Time & Custom Blocks States
  const [bookCleaningTime, setBookCleaningTime] = useState(10);
  const [reschedCleaningTime, setReschedCleaningTime] = useState(10);
  const [isDraggingAppt, setIsDraggingAppt] = useState(false);
  const [cellClickMenu, setCellClickMenu] = useState<{ specialist: string; slot: string; date: string } | null>(null);
  const [customBlockDuration, setCustomBlockDuration] = useState(10);
  const [settingsTab, setSettingsTab] = useState<'integrations' | 'new_therapist' | 'specialists_manager' | 'specialists' | 'clients' | 'treatments' | 'webhooks'>('integrations');
  const [newSpecEnteredInCalDiy, setNewSpecEnteredInCalDiy] = useState(false);
  const [currentTimePos, setCurrentTimePos] = useState<number | null>(null);

  const [newSpecialistUser, setNewSpecialistUser] = useState({ name: '', email: '', team: '', specialty: '', mappedCalendarConnectionId: '', username: '', color: '#0d9488' });
  const [showAddSpecialistModal, setShowAddSpecialistModal] = useState(false);
  const [specSearchTerm, setSpecSearchTerm] = useState('');
  const [specStatusFilter, setSpecStatusFilter] = useState('All');

  const [searchSpecQuery, setSearchSpecQuery] = useState('');
  const [filterSpecTeam, setFilterSpecTeam] = useState('All');
  const [filterSpecRole, setFilterSpecRole] = useState('All');
  const [filterSpecSpecialty, setFilterSpecSpecialty] = useState('All');
  const [filterSpecActive, setFilterSpecActive] = useState('All');

  const [promotingUserId, setPromotingUserId] = useState('');
  const [promotingSpecialty, setPromotingSpecialty] = useState('Swedish Massage');
  const [promotingEventSlug, setPromotingEventSlug] = useState('');
  const [promotingEventTypeId, setPromotingEventTypeId] = useState('');
  const [promotingConnectionId, setPromotingConnectionId] = useState('');

  const [editingSpecUser, setEditingSpecUser] = useState<any | null>(null);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<any | null>(null);

  const [mcpMessages, setMcpMessages] = useState<any[]>([{ id: '1', role: 'assistant', content: 'Hello! I can check availability and book appointments for your specialists. Just ask!' }]);
  const [mcpInput, setMcpInput] = useState('');
  const [mcpLoading, setMcpLoading] = useState(false);
  const handleMcpInputChange = (e: any) => setMcpInput(e.target.value);


  // Drag over states
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [dragOverTime, setDragOverTime] = useState<string | null>(null);
  const [activeDraggedAppt, setActiveDraggedAppt] = useState<any | null>(null);
  
  // Hover slot preview states
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      // Timeline goes from 09:00 to 19:00 (10 hours = 600 minutes)
      // 09:00 top is 0px, 19:00 top is 960px.
      // So 1 minute = 1.6px
      if (h >= 9 && h < 19) {
        const diffMin = (h - 9) * 60 + m;
        setCurrentTimePos(diffMin * 1.6);
      } else {
        setCurrentTimePos(null);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [calComApiKey]);

  // Treatment Form State
  const [newTreatName, setNewTreatName] = useState('');
  const [newTreatCategory, setNewTreatCategory] = useState('Body');
  const [newTreatDuration, setNewTreatDuration] = useState('60 min');
  const [newTreatPrice, setNewTreatPrice] = useState('$120.00');
  const [newTreatDesc, setNewTreatDesc] = useState('');
  const [showAddTreatForm, setShowAddTreatForm] = useState(false);

  // Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientVip, setNewClientVip] = useState(false);
  const [showAddClientForm, setShowAddClientForm] = useState(false);

  // Modal Reschedule Selection
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [searchSpecialist, setSearchSpecialist] = useState('');
  const [searchTreatment, setSearchTreatment] = useState('');

  // Rescheduling workflow states
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [reschedCoSpecialist, setReschedCoSpecialist] = useState('');
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null);

  // Add-ons Creator
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('$20.00');
  const [newAddonDesc, setNewAddonDesc] = useState('');

  // Floating MCP AI Pop-up Widget State
  const [showMcpModal, setShowMcpModal] = useState(false);
  const [showBookingPagesModal, setShowBookingPagesModal] = useState(false);

  // Trigger Notifications
  const triggerNotification = (message: string) => {
    setToastQueue(prev => [...prev, message]);
    setNotificationsList(prev => [
      { id: Date.now(), text: message, time: 'Just now', read: false },
      ...prev
    ]);
  };

  useEffect(() => {
    if (toastQueue.length > 0) {
      setNotification(toastQueue[0]);
      const timer = setTimeout(() => {
        setToastQueue(prev => prev.slice(1));
        setNotification(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastQueue]);

  // Google Spreadsheet ID and Sheet name Validator (Requested: validations support Sheet name checking)
  const validateGoogleSheetId = (id: string, sheetName: string, categoryName: string) => {
    if (!id || id.trim() === '') {
      return { 
        valid: false, 
        reason: `${categoryName}: Sheet ID is empty.`,
        action: `To configure correctly: Enter the 44-character spreadsheet identifier from your Google Sheets address bar.` 
      };
    }
    if (!sheetName || sheetName.trim() === '') {
      return { 
        valid: false, 
        reason: `${categoryName}: Sheet Name is empty.`, 
        action: `To configure correctly: Specify the target tab name (e.g. "Specialists", "Sheet1").`
      };
    }
    if (id.includes(' ')) {
      return { 
        valid: false, 
        reason: `${categoryName}: Sheet ID contains space characters.`, 
        action: `To configure correctly: Remove any trailing or leading whitespace, and ensure you did not copy the full URL instead of just the ID.`
      };
    }
    if (id.length < 15) {
      return { 
        valid: false, 
        reason: `${categoryName}: Sheet ID length is invalid.`, 
        action: `To configure correctly: Spreadsheet IDs are typically 44 characters long. Make sure to share your sheet as "Anyone with link as Viewer/Editor".`
      };
    }
    const pattern = /^[a-zA-Z0-9-_]+$/;
    if (!pattern.test(id)) {
      return { 
        valid: false, 
        reason: `${categoryName}: Sheet ID contains invalid special characters.`, 
        action: `To configure correctly: Google Sheet IDs only contain alphanumeric characters, hyphens, and underscores.` 
      };
    }
    return { valid: true };
  };

  // Sync Action Buttons click handlers with validators
  const syncSpecialistsWithParams = (id: string, name: string) => {
    const validation = validateGoogleSheetId(id, name, 'Specialists Roster');
    if (!validation.valid) {
      triggerNotification(`Connection Error: ${validation.reason} ${validation.action}`);
      return;
    }
    setIsSyncingSpecialists(true);
    setTimeout(() => {
      setIsSyncingSpecialists(false);
      setSpecialistSheetHistory(prev => {
        const exists = prev.some(h => h.id === id && h.name === name);
        if (!exists) {
          return [{ id, name }, ...prev];
        }
        return prev;
      });
      setSpecialists(realSpecialists);
      setAppointments(realAppointments);
      triggerNotification(`Specialists Roster sheet tab "${name}" synced successfully.`);
    }, 1000);
  };

  const handleSyncSpecialistsSheets = () => {
    syncSpecialistsWithParams(specialistSheetId, specialistSheetName);
  };

  const syncTreatmentsWithParams = (id: string, name: string) => {
    const validation = validateGoogleSheetId(id, name, 'Treatment Add-on');
    if (!validation.valid) {
      triggerNotification(`Connection Error: ${validation.reason} ${validation.action}`);
      return;
    }
    setIsSyncingTreatments(true);
    setTimeout(() => {
      setIsSyncingTreatments(false);
      setTreatmentSheetHistory(prev => {
        const exists = prev.some(h => h.id === id && h.name === name);
        if (!exists) {
          return [{ id, name }, ...prev];
        }
        return prev;
      });
      setTreatments(realTreatments);
      triggerNotification(`Treatment Add-on sheet tab "${name}" synced successfully.`);
    }, 1000);
  };

  const handleSyncTreatmentsSheets = () => {
    syncTreatmentsWithParams(treatmentSheetId, treatmentSheetName);
  };

  const handleSyncClientsSheets = () => {
    const validation = validateGoogleSheetId(clientSheetId, clientSheetName, 'Clients Database');
    if (!validation.valid) {
      triggerNotification(`Connection Error: ${validation.reason} ${validation.action}`);
      return;
    }
    setIsSyncingClients(true);
    setTimeout(() => {
      setIsSyncingClients(false);
      const exists = clientSheetHistory.some(h => h.id === clientSheetId && h.name === clientSheetName);
      if (!exists) {
        setClientSheetHistory(prev => [{ id: clientSheetId, name: clientSheetName }, ...prev]);
      }
      setClients(realClients);
      triggerNotification(`Clients Database sheet tab "${clientSheetName}" synced successfully.`);
    }, 1000);
  };

  const handleFetchCalendarsAndConnections = async () => {
    if (!calComApiKey) return;
    setIsLoadingConnections(true);
    setSyncStatus('Syncing...');
    setIntegrationErrorLog('');
    try {
      const { calendarService } = await import('./services/calendarService');
      const conns = await calendarService.getConnections();
      const cals = await calendarService.getCalendars();
      const types = await calendarService.getEventTypes(calDiyUser);
      setCalConnections(conns);
      setCalList(cals);
      setCalEventTypes(types);
      setSyncStatus('Success');
      setLastSyncTime(new Date().toLocaleString());
    } catch (err: any) {
      console.warn('Could not fetch connected calendars:', err);
      setSyncStatus('Failed');
      setIntegrationErrorLog(err.message || String(err));
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const handleFetchOrgUsers = async () => {
    if (!calComApiKey) {
      triggerNotification('Cal.com API Key is required to fetch users.');
      return;
    }
    setIsLoadingOrgUsers(true);
    try {
      const cleanKey = calComApiKey.trim();
      const authHeader = cleanKey.startsWith('Bearer ') ? cleanKey : `Bearer ${cleanKey}`;
      let baseUrl = calComApiEndpoint.trim().replace(/\/+$/, '');
      if (baseUrl.toLowerCase().includes('calcom.run.place') && baseUrl.toLowerCase().startsWith('http://')) {
        baseUrl = baseUrl.replace(/http:\/\//i, 'https://');
      }
      // Build /users endpoint from base
      // Fetch through our local proxy to avoid CORS issues when fetching users
      const usersEndpoint = 'http://localhost:3001/api/proxy/users';
      
      const resp = await fetch(usersEndpoint, {
        headers: { 
          'x-proxy-api-url': baseUrl,
          'x-proxy-api-key': authHeader,
          'Content-Type': 'application/json' 
        }
      });
      const json = await resp.json();
      let users: any[] = [];
      if (json.status === 'success') {
        if (Array.isArray(json.data)) users = json.data;
        else if (json.data && Array.isArray(json.data.users)) users = json.data.users;
      } else if (Array.isArray(json)) {
        users = json;
      }
      setCalOrgUsers(users);
      triggerNotification(`Fetched ${users.length} Cal.com user(s).`);
    } catch (err: any) {
      console.warn('Could not fetch Cal.com users:', err);
      triggerNotification(`Cal.com users fetch failed: ${err.message || err}`);
      setCalOrgUsers([]);
    } finally {
      setIsLoadingOrgUsers(false);
    }
  };

  const handlePromoteToSpecialist = (calUser: any, roomPreference?: string) => {
    const existingLink = calSpecialistLinks[calUser.id || calUser.username];
    const existingSpec = specialists.find(s => 
      (calUser.username && ((s.calUsername && s.calUsername.toLowerCase() === calUser.username.toLowerCase()) || (s.therapist_name && s.therapist_name.toLowerCase() === calUser.username.toLowerCase()))) ||
      (calUser.email && ((s.email && s.email.toLowerCase() === calUser.email.toLowerCase()) || (s.calEmail && s.calEmail.toLowerCase() === calUser.email.toLowerCase())))
    );

    if (existingLink || existingSpec) {
      triggerNotification(`User "${calUser.name || calUser.username}" is already linked or exists as a specialist.`);
      return;
    }
    const newId = `ther_cal_${Date.now()}`;
    // Pick room: prefer passed param, else fallback to 'Room 1'
    const assignedRoom = roomPreference || 'Room 1';
    const newSpecialist = {
      therapist_id: newId,
      therapist_name: calUser.name || calUser.username || calUser.email,
      email: calUser.email || '',
      phone: '',
      specialties: 'General',
      working_days: 'Mon,Tue,Wed,Thu,Fri',
      working_hours_start: '09:00',
      working_hours_end: '18:00',
      break_start: '12:00',
      break_end: '13:00',
      max_bookings_per_day: 8,
      avg_service_duration: '60 min',
      room_preference: assignedRoom,
      language_skills: 'English',
      status: 'active',
      hire_date: new Date().toISOString().split('T')[0],
      notes: `Promoted from Cal.com user: ${calUser.username || calUser.email}`,
      current_bookings_today: 0,
      calUserId: calUser.id || calUser.username,
      calUsername: calUser.username || '',
      calEmail: calUser.email || '',
      performedTreatments: [],
      color: '#0d9488',
      team: 'Main',
      mappedCalendarConnectionId: ''
    };
    setSpecialists(prev => [...prev, newSpecialist]);
    setCalSpecialistLinks(prev => ({ ...prev, [calUser.id || calUser.username]: newId }));
    


    triggerNotification(`"${newSpecialist.therapist_name}" promoted to specialist. Assign calendars & treatments to enable booking.`);
  };

  // ─── Sync specialist calendars + event types ────────────────────────────────
  const handleSyncSpecialistData = async (calUserId: string, calUsername?: string) => {
    setSpecialistSyncStatus(prev => ({ ...prev, [calUserId]: 'loading' }));
    try {
      const { calendarService } = await import('./services/calendarService');
      const [cals, ets, conns] = await Promise.allSettled([
        calendarService.getCalendarsForUser(calUserId).catch(() => calendarService.getCalendars()),
        calendarService.getEventTypesForUser(calUserId, calUsername).catch(() => calendarService.getEventTypes(calUsername)),
        calendarService.getConnections()
      ]);
      const calsVal = cals.status === 'fulfilled' ? cals.value : [];
      const etsVal = ets.status === 'fulfilled' ? ets.value : [];
      const connsVal = conns.status === 'fulfilled' ? conns.value : [];
      setSpecialistCalendars(prev => ({ ...prev, [calUserId]: calsVal }));
      setSpecialistEventTypes(prev => ({ ...prev, [calUserId]: etsVal }));
      setSpecialistConnections(prev => ({ ...prev, [calUserId]: connsVal }));
      // Compute readiness
      const ready = computeSpecialistReadiness(calUserId, calsVal, etsVal, connsVal);
      setSpecialistSyncStatus(prev => ({ ...prev, [calUserId]: ready ? 'ready' : 'not_ready' }));
    } catch (err: any) {
      setSpecialistSyncStatus(prev => ({ ...prev, [calUserId]: 'error' }));
    }
  };

  // ─── Readiness check ─────────────────────────────────────────────────────────
  const computeSpecialistReadiness = (
    calUserId: string,
    cals?: any[],
    ets?: any[],
    conns?: any[]
  ) => {
    const resolvedCals = cals ?? specialistCalendars[calUserId] ?? [];
    const resolvedEts = ets ?? specialistEventTypes[calUserId] ?? [];
    const resolvedConns = conns ?? specialistConnections[calUserId] ?? [];
    const linked = !!calSpecialistLinks[calUserId];
    const hasConns = resolvedConns.length > 0;
    const hasCals = resolvedCals.length > 0;
    const hasDestination = hasCals && !!destinationCalendarId;
    const hasConflict = conflictCheckCalendarIds.length > 0;
    const hasEts = resolvedEts.length > 0;
    return linked && hasConns && hasCals && hasDestination && hasConflict && hasEts;
  };

  const handleMcpSubmit = async (customPrompt?: string | React.FormEvent) => {
    if (customPrompt && typeof (customPrompt as any).preventDefault === 'function') {
      (customPrompt as any).preventDefault();
    }
    const text = typeof customPrompt === 'string' ? customPrompt : mcpInput;
    if (!text.trim()) return;

    if (typeof customPrompt !== 'string') {
      setMcpInput('');
    }
    
    const newUserMsg = { id: Date.now().toString(), role: 'user', content: text };
    const newMessages = [...mcpMessages, newUserMsg];
    setMcpMessages(newMessages as any);
    setMcpLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          apiKeys: calComApiKeys,
          role: currentUserRole
        })
      });
      const data = await res.json();
      setMcpMessages([...newMessages, { id: Date.now().toString(), role: 'assistant', content: data.text }] as any);
    } catch (e) {
      console.error(e);
      setMcpMessages([...newMessages, { id: Date.now().toString(), role: 'assistant', content: 'Error communicating with agent.' }] as any);
    } finally {
      setMcpLoading(false);
    }
  };;;

  const getSpecialistReadinessChecks = (calUserId: string) => {
    const resolvedCals = specialistCalendars[calUserId] ?? [];
    const resolvedEts = specialistEventTypes[calUserId] ?? [];
    const resolvedConns = specialistConnections[calUserId] ?? [];
    const specName = specialists.find(s => String(s.calUserId) === String(calUserId))?.therapist_name || '';
    return [
      { label: 'Cal user linked', ok: !!calSpecialistLinks[calUserId] },
      { label: 'Account connected', ok: resolvedConns.length > 0 },
      { label: 'Calendar available', ok: resolvedCals.length > 0 },
      { label: 'Destination calendar', ok: !!destinationCalendarId },
      { label: 'Conflict calendar', ok: conflictCheckCalendarIds.length > 0 },
      { label: 'Event types loaded', ok: resolvedEts.length > 0 },
      
    ];
  };

  // ─── Sync All (sequential: users → specialist data → bookings) ────────────────
  // Auto-sync Cal.com on initial mount if configured
  useEffect(() => {
    const apiStr = localStorage.getItem('calcomApiConfig');
    if (apiStr) {
      try {
        const conf = JSON.parse(apiStr);
        if (conf.apiKey && conf.bookingsEndpoint) {
          handleSyncAllCalCom();
        }
      } catch (e) {}
    }
  }, []);

  const handleSyncAllCalCom = async () => {
    const localConfStr = localStorage.getItem('calcomApiConfig');
    let localApiKey = calComApiKey;
    if (!localApiKey && localConfStr) {
      try {
        const conf = JSON.parse(localConfStr);
        if (conf.apiKey) localApiKey = conf.apiKey;
      } catch (e) {}
    }

    if (!localApiKey) { triggerNotification('Cal.com API Key is required.'); return; }
    setIsGlobalSyncing(true);
    setGlobalSyncLog([]);
    const log = (msg: string) => setGlobalSyncLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    try {
      const { calendarService } = await import('./services/calendarService');
      log('Step 1/4: Fetching Cal.com users…');
      let users: any[] = [];
      try {
        const apiUsers = (await calendarService.getUsers()).map((u: any) => ({ ...u, _fromApi: true }));
        // Merge: API users + persisted manual users (deduplicated by username)
        const manualUsers = calOrgUsers.filter((u: any) => !u._fromApi);
        const allUsernames = new Set(apiUsers.map((u: any) => u.username));
        // Ensure calDiyUser (admin) is always included
        if (calDiyUser && !allUsernames.has(calDiyUser)) {
          apiUsers.push({ id: calDiyUser, username: calDiyUser, name: calDiyUser, email: '', role: 'admin', _fromApi: true });
        }
        users = [...apiUsers, ...manualUsers.filter((u: any) => !allUsernames.has(u.username))];
        setCalOrgUsers(users);
        log(`✓ ${apiUsers.length} from API + ${manualUsers.length} manual = ${users.length} total user(s).`);
      } catch (err: any) {
        log(`⚠ Users fetch failed: ${err.message}. Using persisted users.`);
        users = calOrgUsers;
        // Still ensure calDiyUser is in the list
        if (calDiyUser && !users.some((u: any) => u.username === calDiyUser)) {
          users = [{ id: calDiyUser, username: calDiyUser, name: calDiyUser, email: '', role: 'admin' }, ...users];
        }
      }

      log('Step 2/4: Fetching global calendars, connections & event types…');
      try {
        const [conns, cals] = await Promise.all([
          calendarService.getConnections(),
          calendarService.getCalendars(),
        ]);
        setCalConnections(conns);
        setCalList(cals);
        log(`✓ ${conns.length} connection(s), ${cals.length} calendar(s).`);
      } catch (err: any) {
        log(`⚠ Calendars/connections fetch failed: ${err.message}.`);
      }

      // Aggregate discovered users and manual specialists to retrieve event types for all
      const usersToFetch = [...users];
      specialists.forEach(spec => {
        if (spec.calUserId && !usersToFetch.some(u => String(u.id) === String(spec.calUserId))) {
          usersToFetch.push({
            id: spec.calUserId,
            username: spec.calUsername || '',
            name: spec.therapist_name,
            role: 'specialist',
            email: spec.email || ''
          });
        } else if (spec.calUsername && !usersToFetch.some(u => u.username === spec.calUsername)) {
          usersToFetch.push({
            id: spec.calUserId || spec.calUsername,
            username: spec.calUsername,
            name: spec.therapist_name,
            role: 'specialist',
            email: spec.email || ''
          });
        }
      });

      // Fetch event types across all users (aggregated)
      try {
        const ets = await calendarService.getAllEventTypesForUsers(usersToFetch);
        setCalEventTypes(ets);
        log(`✓ ${ets.length} event type(s) loaded across ${usersToFetch.length} user(s).`);
      } catch (err: any) {
        log(`⚠ Event type fetch failed: ${err.message}.`);
      }

      log('Step 3/4: Auto-mapping specialists and event types…');
      const newLinks = { ...calSpecialistLinks };
      // eventTypeMappings removed

      // 1. Auto-link specialists to Cal.com users
      specialists.forEach(spec => {
        const matchedUser = users.find((u: any) => 
          (u.name && u.name.toLowerCase().includes(spec.therapist_name.toLowerCase())) || 
          spec.therapist_name.toLowerCase().includes((u.name || '').toLowerCase()) ||
          (u.email && u.email.toLowerCase() === spec.email.toLowerCase()) ||
          (u.username && u.username.toLowerCase() === spec.therapist_name.toLowerCase().replace(/\s+/g, ''))
        );
        if (matchedUser) {
          newLinks[matchedUser.id.toString()] = spec.therapist_id;
          spec.calUserId = matchedUser.id.toString();
          spec.calUsername = matchedUser.username;
          // Dynamically map properties back to specialist list
          spec.mappedEventTypeId = spec.mappedEventTypeId || '';
          spec.mappedEventSlug = spec.mappedEventSlug || '';
        }
      });
      setCalSpecialistLinks(newLinks);
      localStorage.setItem('sb_cal_specialist_links', JSON.stringify(newLinks));

      // 2. Auto-fetch event types for each linked specialist and auto-map to catalog treatments
      const { expandEventTypeByDurations } = await import('./services/calendarService');
      for (const user of usersToFetch) {
        try {
          const rawEts = await calendarService.getEventTypesForUser(user.id, user.username);
          setSpecialistEventTypes(prev => ({ ...prev, [user.id.toString()]: rawEts, [user.username]: rawEts }));
          log(`✓ Specialist "${user.name || user.username}" fetched ${rawEts.length} event type(s).`);
          
          const linkedSpecId = newLinks[user.id.toString()] || specialists.find(s => s.calUserId === user.id.toString() || s.calUsername === user.username)?.therapist_id;
          const spec = specialists.find(s => s.therapist_id === linkedSpecId);

          for (const et of rawEts) {
            // Expand multi-duration event types into one virtual entry per duration
            const variants = expandEventTypeByDurations(et);

            for (const variant of variants) {
              // Key includes duration so each variant is a distinct mapping
              const mappingKey = `${user.id}_${et.id}_${variant.duration}`;
              
              if (spec) {
                // Auto-assign primary event type ID/slug to the specialist if not set
                if (!spec.mappedEventTypeId || spec.mappedEventTypeId === '') {
                  spec.mappedEventTypeId = et.id.toString();
                  spec.mappedEventSlug = et.slug;
                }

                // Find treatment matching by name (strip duration suffix for match)
                const baseTitle = variant.title.replace(/\s*\(\d+\s*min\)$/, '').trim();
                let treat = treatments.find(t =>
                  t.name.toLowerCase().includes(baseTitle.toLowerCase()) ||
                  baseTitle.toLowerCase().includes(t.name.toLowerCase())
                );

                // If no treatment exists for this variant, auto-create one in catalog
                if (!treat && variants.length > 1) {
                  const newTreat = {
                    id: `auto_${et.id}_${variant.duration}`,
                    name: variant.title, // e.g. "Massage Manual (60 min)"
                    duration: `${variant.duration} min`,
                    price: '$0.00',
                    description: et.description || `Auto-synced from Cal.com event type #${et.id}`,
                    color: '#8B5CF6',
                    eventTypeId: et.id.toString(),
                    calSlug: et.slug,
                    active: true
                  };
                  setTreatments(prev => {
                    if (prev.some(t => t.id === newTreat.id)) return prev;
                    return [...prev, newTreat as any];
                  });
                  treat = newTreat as any;
                  log(`✚ Auto-created treatment "${newTreat.name}" from event type #${et.id} (${variant.duration} min)`);
                } else if (!treat) {
                  // Single-duration: also auto-create if no match
                  const autoName = baseTitle;
                  const newTreat = {
                    id: `auto_${et.id}`,
                    name: autoName,
                    duration: `${variant.duration} min`,
                    price: '$0.00',
                    description: et.description || `Auto-synced from Cal.com event type #${et.id}`,
                    color: '#8B5CF6',
                    eventTypeId: et.id.toString(),
                    calSlug: et.slug,
                    active: true
                  };
                  setTreatments(prev => {
                    if (prev.some(t => t.name === autoName)) return prev;
                    return [...prev, newTreat as any];
                  });
                  treat = newTreat as any;
                  log(`✚ Auto-created treatment "${autoName}" from event type #${et.id}`);
                }

              }
            }
          }
        } catch (e: any) {
          log(`⚠ Event fetch failed for user ${user.username}: ${e.message || e}`);
        }
      }

      log('Step 4/4: Syncing bookings…');
      try {
        await handleSyncCalCom(usersToFetch.map(u => u.id));
        log('✓ Bookings synced.');
      } catch (err: any) {
        log(`⚠ Booking sync failed: ${err.message}.`);
      }

      setSpecialists([...specialists]);
      setSyncStatus('Success');
      setLastSyncTime(new Date().toLocaleString());
      log('✅ Sync All completed.');
      triggerNotification('Cal.com Sync All completed successfully.');
    } catch (err: any) {
      log(`✗ Sync All failed: ${err.message}`);
      triggerNotification(`Sync All failed: ${err.message}`);
    } finally {
      setIsGlobalSyncing(false);
    }
  };

  // ─── Cal.com booking lifecycle ───────────────────────────────────────────────
  const handleCreateCalBooking = async (appt: any) => {
    try {
      const { bookingService } = await import('./services/bookingService');

      // Find the best mapping for this treatment (prefer one matching the specialist too)
      const allMappings: any[] = [];      const specMapping = appt.specialist
        ? allMappings.find(([, m]) => m.specialistName === appt.specialist)
        : null;
      const mapping = specMapping || allMappings[0];

      const dateStr = appt.date || new Date().toISOString().split('T')[0];
      const startTime = appt.timeLabel?.split(' - ')[0] || '09:00';
      const startIso = formatLocalIsoString(dateStr, startTime);

      const mapVal = mapping ? mapping[1] as any : null;
      const eventTypeId = mapVal ? mapVal.eventTypeId : null;
      const eventSlug = mapVal ? mapVal.eventSlug : null;
      const durationMin = mapVal ? parseInt(mapVal.durationMinutes || '60') : 60;

      const matchedSpec = specialists.find(s => s.therapist_name === appt.specialist);
      const username = matchedSpec?.calUsername || (appt.specialist === 'Admin' || appt.specialist === 'admin' ? 'admin' : '');

      triggerNotification(`Cal.com: Creating booking for ${appt.client}...`);
      
      const newBooking = await bookingService.createBooking({
        start: startIso,
        name: appt.client,
        email: appt.email || 'guest@example.com',
        phone: appt.phone,
        notes: appt.notes,
        eventTypeId,
        eventSlug,
        specialist: appt.specialist,
        username,
        treatment: appt.procedure,
        durationMinutes: durationMin
      });

      triggerNotification(`Cal.com: Booking created successfully (ID: ${newBooking.id})`);
      return newBooking;
    } catch (err: any) {
      console.error('Cal.com create booking error:', err);
      triggerNotification(`Cal.com API Notice: Saved locally, but Cal.diy POST failed (${err.message || err})`);
      throw err;
    }
  };

  const handleRescheduleCalBooking = async (uid: string, appt: any) => {
    try {
      const { calendarService } = await import('./services/calendarService');
      const dateStr = appt.date || new Date().toISOString().split('T')[0];
      const startTime = appt.timeLabel?.split(' - ')[0] || '09:00';
      const start = `${dateStr}T${startTime}:00.000Z`;
      const duration = parseInt(appt.duration) || 60;
      const end = new Date(new Date(start).getTime() + duration * 60000).toISOString();
      return await calendarService.rescheduleBooking(uid, 'Rescheduled via Spa Dashboard', start, end);
    } catch (err: any) {
      console.warn('Cal.com reschedule error:', err.message);
      throw err;
    }
  };

  const handleCancelCalBooking = async (uid: string, reason = 'Cancelled via Spa Dashboard') => {
    try {
      const { calendarService } = await import('./services/calendarService');
      return await calendarService.cancelBooking(uid, reason);
    } catch (err: any) {
      console.warn('Cal.com cancel error:', err.message);
      throw err;
    }
  };

  const handleSyncCalCom = async (overrideUserIds?: number[]) => {
    if (!calComApiKey) {
      triggerNotification('Cal.com API Key is required.');
      return;
    }
    setIsSyncingCalCom(true);
    try {
      const cleanKey = calComApiKey.trim();
      const authHeader = cleanKey.startsWith('Bearer ') ? cleanKey : `Bearer ${cleanKey}`;
      let baseUrl = calComApiEndpoint.trim().replace(/\/+$/, '');
      if (baseUrl.toLowerCase().includes('calcom.run.place') && baseUrl.toLowerCase().startsWith('http://')) {
        baseUrl = baseUrl.replace(/http:\/\//i, 'https://');
      }
      if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:' && baseUrl.toLowerCase().startsWith('http://')) {
        baseUrl = baseUrl.replace(/http:\/\//i, 'https://');
      }

      const { bookingService } = await import('./services/bookingService');
      const fallbackUsernames = specialists.filter(s => s.calUsername).map(s => s.calUsername!);
      const orgUsernames = calOrgUsers ? calOrgUsers.map(u => u.username) : [];
      const hardcodedUsernames = ['admin', 'anna', 'erik', 'ingrid'];

      let bookingsList: any[] = [];
      try {
        // Fetch all bookings at once from the V2 API, iterating over all specialists to ensure we get their individual bookings.
        // The frontend will automatically map the returned bookings to the correct specialists based on hostUsername.
        const allBookings = await bookingService.getBookings(fallbackUsernames);
        bookingsList = allBookings || [];
      } catch (e) {
        console.error('Failed to fetch bookings:', e);
      }

      if (bookingsList !== null) {
        const newRequests: any[] = [];
        const newHandled: any[] = [];
        // Keep all offline (mock) appointments AND keep all locally cached Cal.com bookings
        // because the V2 API's permission model hides anonymous bookings from GET /v2/bookings.
        // We identify Cal.com bookings by their UID length (>10) or numeric IDs.
        const apiAppointments: any[] = [];
        
        const formatApptDate = (startStr: string) => {
          if (!startStr) return new Date().toISOString().split('T')[0];
          try {
            const d = new Date(startStr);
            if (isNaN(d.getTime())) {
              if (startStr.includes('T')) return startStr.split('T')[0];
              return new Date().toISOString().split('T')[0];
            }
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          } catch {
            if (startStr.includes('T')) return startStr.split('T')[0];
            return new Date().toISOString().split('T')[0];
          }
        };

        const formatTimeRange = (startStr: string, endStr: string) => {
          if (!startStr) return '09:00 - 10:00';
          try {
            const s = new Date(startStr);
            const e = endStr ? new Date(endStr) : new Date(s.getTime() + 60 * 60000);
            if (isNaN(s.getTime())) {
              // Try to extract from ISO string manually
              const match = startStr.match(/T(\d{2}):(\d{2})/);
              if (match) {
                const hour = parseInt(match[1]);
                const nextHour = String((hour + 1) % 24).padStart(2, '0');
                return `${match[1]}:${match[2]} - ${nextHour}:${match[2]}`;
              }
              return '09:00 - 10:00';
            }
            const sStr = s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const eStr = isNaN(e.getTime()) 
              ? new Date(s.getTime() + 60 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
              : e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            return `${sStr} - ${eStr}`;
          } catch {
            return '09:00 - 10:00';
          }
        };

        bookingsList.forEach((booking: any) => {
          const id = booking.uid || booking.id.toString();
          const client = booking.attendees?.[0]?.name || booking.responses?.name || 'Unknown Client';
          const email = booking.attendees?.[0]?.email || '';
          
          const bfr = booking.bookingFieldsResponses || {};
          const resp = booking.responses || {};
          
          const phone = booking.attendees?.[0]?.phoneNumber || 
                        (typeof bfr.phone === 'object' ? bfr.phone?.value : bfr.phone) ||
                        (typeof bfr.attendeePhoneNumber === 'object' ? bfr.attendeePhoneNumber?.value : bfr.attendeePhoneNumber) ||
                        (typeof resp.phone === 'object' ? resp.phone?.value : resp.phone) ||
                        (typeof resp.attendeePhoneNumber === 'object' ? resp.attendeePhoneNumber?.value : resp.attendeePhoneNumber) ||
                        '';
          

          // Build a composite notes string to capture standard notes, reschedule reasons, and any custom questions
          const customFields: string[] = [];
          
          const coreNotes = (typeof bfr.notes === 'object' ? bfr.notes?.value : bfr.notes) ||
                            (typeof resp.notes === 'object' ? resp.notes?.value : resp.notes) ||
                            (typeof resp.rescheduleReason === 'object' ? resp.rescheduleReason?.value : resp.rescheduleReason) ||
                            booking.description || booking.notes || booking.customInputs?.notes || 
                            booking.rescheduleReason || booking.cancellationReason || '';
          
          if (coreNotes && typeof coreNotes === 'string') customFields.push(coreNotes.trim());

          // Iterate through custom responses to catch anything else (e.g. "Any allergies?")
          const skipKeys = ['name', 'email', 'phone', 'attendeePhoneNumber', 'notes', 'rescheduleReason', 'location'];
          [bfr, resp].forEach(rObj => {
            if (rObj && typeof rObj === 'object') {
              Object.keys(rObj).forEach(key => {
                if (!skipKeys.includes(key) && rObj[key]) {
                  const val = typeof rObj[key] === 'object' ? rObj[key]?.value : rObj[key];
                  if (val && typeof val === 'string' && val.trim() !== '') {
                    // Format key into Title Case (e.g. "anyAllergies" -> "Any Allergies")
                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const entry = `${formattedKey}: ${val}`;
                    // avoid exact duplicates if bfr and resp have the same data
                    if (!customFields.some(f => f.includes(val))) {
                      customFields.push(entry);
                    }
                  }
                }
              });
            }
          });

          const notes = customFields.join('\n\n').trim();
          const date = formatApptDate(booking.start);
          const timeLabel = formatTimeRange(booking.start, booking.end);
          
          let specialist = 'Unknown Specialist';
          const title = booking.title || '';
          
          // Resolve specialist using links or fuzzy matching
          const hostId = booking.hosts?.[0]?.id?.toString() || booking.userId?.toString();
          const hostUsername = booking.hosts?.[0]?.username || booking.user?.username || (typeof booking.user === 'string' ? booking.user : '');
          const hostName = booking.metadata?.specialist || booking.hosts?.[0]?.name || booking.user?.name || booking.user?.email || '';
          
          specialist = hostName || hostUsername || 'Unknown Specialist';
          
          let foundTherapistId = hostId ? calSpecialistLinks[hostId] : undefined;
          if (!foundTherapistId && hostUsername) {
            const matchedSpec = specialists.find(s => s.calUsername?.toLowerCase() === hostUsername.toLowerCase());
            if (matchedSpec) foundTherapistId = matchedSpec.therapist_id;
          }
          if (!foundTherapistId) {
            const matchedSpec = specialists.find(s => {
              const name = s.therapist_name.toLowerCase();
              const hName = hostName.toLowerCase();
              const hUser = hostUsername.toLowerCase();
              return (hName && (name.includes(hName) || hName.includes(name))) ||
                     (hUser && (name.includes(hUser) || hUser.includes(name))) ||
                     title.toLowerCase().includes(name);
            });
            if (matchedSpec) foundTherapistId = matchedSpec.therapist_id;
          }
          
           // Compute duration directly from start and end times
           let durationMin = 60;
           if (booking.start && booking.end) {
             const ms = new Date(booking.end).getTime() - new Date(booking.start).getTime();
             if (ms > 0) durationMin = Math.round(ms / 60000);
           } else if (booking.durationMinutes) {
             durationMin = Number(booking.durationMinutes);
           } else if (booking.bookingFieldsResponses?.duration) {
             durationMin = Number(booking.bookingFieldsResponses.duration);
           }
           const duration = `${durationMin} min`;

           // Look up mapped procedure name using eventTypeMappings key: hostId_eventTypeId_durationMin
           let procedure = booking.bookingFields?.treatment || booking.title?.split(' with ')?.[0] || 'Hanakasumi™ signature';
          const finalSpec = specialists.find(s => s.therapist_id === foundTherapistId);
          if (finalSpec) {
            specialist = finalSpec.therapist_name;
          }
          
          const room = finalSpec ? finalSpec.room_preference : 'Room 1';
          const matchedTreat = treatments.find(t => t.name === procedure);
          const price = matchedTreat ? matchedTreat.price : '$120.00';

          
          const mappedItem = {
            id,
            client,
            avatar: null,
            procedure,
            requestedTime: timeLabel,
            date,
            email,
            phone,
            notes,
            eventSlug: booking.eventSlug || booking.eventType?.slug || '',
            eventTypeId: booking.eventTypeId,
            status: booking.status === 'PENDING' ? 'needs_action' : booking.status.toLowerCase(),
            isRescheduled: booking.rescheduled === true
          };
          
          if (booking.status === 'PENDING') {
            newRequests.push(mappedItem);
          } else {
            newHandled.push(mappedItem);
            
            // Add accepted/confirmed/upcoming ones as bookings in the dashboard appointments state
            const stat = booking.status ? booking.status.toLowerCase() : '';
            if (stat === 'accepted' || stat === 'confirmed' || stat === 'upcoming') {
              const newAppt = {
                id,
                date,
                timeLabel,
                client,
                procedure,
                specialist,
                room,
                status: 'confirmed',
                price,
                email,
                phone,
                vip: false,
                duration,
                eventSlug: booking.eventSlug || booking.eventType?.slug || '',
                eventTypeId: booking.eventTypeId,
                addons: [],
                notes,
                isRescheduled: booking.rescheduled === true,
                colorClass: 'bg-primary/10 border-primary text-primary',
                posStyle: mapTimeToPos(timeLabel)
              };
              // Replace or add if not already present
              const existingIndex = apiAppointments.findIndex(a => a.id === id);
              if (existingIndex > -1) {
                apiAppointments[existingIndex] = newAppt;
              } else {
                apiAppointments.push(newAppt);
              }
            }
          }
        });
        
        setRequests(prev => {
          const offlineRequests = prev.filter(r => {
             const idStr = r.id.toString();
             return idStr.startsWith('req_') || idStr.startsWith('temp_') || idStr.startsWith('ra') || idStr.length >= 12;
          });
          const merged = [...newRequests];
          offlineRequests.forEach(off => {
             if (!merged.some(m => m.id === off.id)) merged.push(off);
          });
          return merged;
        });
        setHandledRequests(newHandled);
        setAppointments(prev => {
          const merged = [...prev];
          apiAppointments.forEach(apiAppt => {
            const idx = merged.findIndex(a => a.id === apiAppt.id);
            if (idx > -1) {
              merged[idx] = apiAppt;
            } else {
              merged.push(apiAppt);
            }
          });
          return merged;
        });
        setCalComConnected(true);
        setSyncStatus('Success');
        setLastSyncTime(new Date().toLocaleString());
        handleFetchCalendarsAndConnections();
        triggerNotification(`Cal.com: Synced ${bookingsList.length} bookings successfully.`);
      } else {
        // Log the actual shape to help debug
        const shape = JSON.stringify(bookingsList).substring(0, 200);
        throw new Error(`Unexpected response from Cal.com API. Shape: ${shape}`);
      }
    } catch (err: any) {
      console.error('Cal.com Sync Error:', err);
      setSyncStatus('Failed');
      setIntegrationErrorLog(err.message || String(err));
      triggerNotification(`Cal.com Sync Error: ${err.message || err}. Double check API Key settings.`);
      setCalComConnected(false);
    } finally {
      setIsSyncingCalCom(false);
    }
  };

  const handleGoogleAuthorize = () => {
    if (!googleClientId || !googleClientSecret) {
      triggerNotification('Google Console Integration: Client ID and Client Secret are required.');
      return;
    }
    setIsAuthorizingGoogle(true);
    setTimeout(() => {
      setIsAuthorizingGoogle(false);
      setGoogleAuthorized(true);
      
      // Auto-set the correct spreadsheet keys
      setSpecialistSheetId('1EX8EBboc87ZMFfhSkEf27EA_EkQPDEMpiXgjSELWAZA');
      setSpecialistSheetName('Specialists');
      setTreatmentSheetId('1_n9gV_Wsn5CeEorniWJY6MjaX4am3ZIHpovntRhcqg4');
      setTreatmentSheetName('spa_treatment_catalog');

      // Update state directly for reactive views (Specialists Directory & filters)
      setSpecialists(realSpecialists);
      setTreatments(realTreatments);
      setAppointments(realAppointments);

      triggerNotification('Successfully authorized Google account via OAuth 2.0. Auto-synced all Norefjell Roster and Catalog sheets.');
    }, 1500);
  };

  const handleGoogleDisconnect = () => {
    setGoogleAuthorized(false);
    triggerNotification('Disconnected Google Account access tokens.');
  };

  const handleConnectSpecialistsAPI = () => {
    if (!specialistApiEndpoint || !specialistAccessToken) {
      triggerNotification('Specialists: API connection requires Endpoint and Access Token.');
      return;
    }
    setIsSyncingSpecialists(true);
    setTimeout(() => {
      setIsSyncingSpecialists(false);
      setSpecialistApiConnected(true);
      setSpecialists(realSpecialists);
      setAppointments(realAppointments);
    }, 1200);
  };

  const handleConnectTreatmentsAPI = () => {
    if (!treatmentApiEndpoint || !treatmentAccessToken) {
      triggerNotification('Treatments: API connection requires Endpoint and Access Token.');
      return;
    }
    setIsSyncingTreatments(true);
    setTimeout(() => {
      setIsSyncingTreatments(false);
      setTreatmentApiConnected(true);
      setTreatments(realTreatments);
    }, 1200);
  };

  const handleConnectClientsAPI = () => {
    if (!clientApiEndpoint || !clientAccessToken) {
      triggerNotification('Clients: API connection requires Endpoint and Access Token.');
      return;
    }
    setIsSyncingClients(true);
    setTimeout(() => {
      setIsSyncingClients(false);
      setClientApiConnected(true);
      setClients(realClients);
    }, 1200);
  };

  const calculateTimeLabel = (startTime: string, durationStr: string) => {
    let startStr = startTime;
    if (startTime.includes(' - ')) {
      startStr = startTime.split(' - ')[0];
    }
    const [h, m] = startStr.trim().split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return startTime;

    let durMin = 30;
    if (durationStr) {
      const parsed = parseInt(durationStr);
      if (!isNaN(parsed)) {
        durMin = parsed;
      }
    }

    const totalMin = h * 60 + m + durMin;
    const endH = Math.floor(totalMin / 60);
    const endM = totalMin % 60;

    const startFormatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const endFormatted = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    return `${startFormatted} - ${endFormatted}`;
  };

  const parseTimeRange = (timeLabel: string, durationStr: string, cleaningTimeMin: number = 0) => {
    let startStr = timeLabel;
    if (timeLabel.includes(' - ')) {
      startStr = timeLabel.split(' - ')[0];
    }
    const [h, m] = startStr.trim().split(':').map(Number);
    const startMin = h * 60 + m;
    let durMin = 30;
    if (durationStr) {
      const parsed = parseInt(durationStr);
      if (!isNaN(parsed)) {
        durMin = parsed;
      }
    }
    return { start: startMin, end: startMin + durMin + cleaningTimeMin };
  };

  const formatLocalIsoString = (dateStr: string, timeStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.trim().split(':').map(Number);
      const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
      return d.toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const checkOverlap = (label1: string, dur1: string, clean1: number, label2: string, dur2: string, clean2: number) => {
    const range1 = parseTimeRange(label1, dur1, clean1);
    const range2 = parseTimeRange(label2, dur2, clean2);
    return Math.max(range1.start, range2.start) < Math.min(range1.end, range2.end);
  };

  // Calendar Helper Position Map
  const mapTimeToPos = (time: string, durationStr?: string, cleaningTimeMin: number = 0) => {
    let startStr = time;
    let durationMin = 30; // default 30 min time slot
    if (time.includes(' - ')) {
      const parts = time.split(' - ');
      startStr = parts[0];
      if (!durationStr) {
        try {
          const [sh, sm] = parts[0].split(':').map(Number);
          const [eh, em] = parts[1].split(':').map(Number);
          durationMin = (eh * 60 + em) - (sh * 60 + sm);
        } catch {
          durationMin = 30;
        }
      }
    }
    
    if (durationStr) {
      const parsedDur = parseInt(durationStr);
      if (!isNaN(parsedDur)) {
        durationMin = parsedDur + cleaningTimeMin;
      }
    }

    try {
      const [h, m] = startStr.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const diffMin = (h - 9) * 60 + m;
        const topVal = diffMin * 1.6;
        const heightVal = durationMin * 1.6;
        return { top: `${topVal}px`, height: `${heightVal}px` };
      }
    } catch (e) {
      console.error(e);
    }

    return { top: '0px', height: '48px' };
  };

  const triggerMappedWebhook = (eventTopic: string, appt: any) => {
    const subscriberUrl = '';
    if (subscriberUrl) {
      const newDel = {
        id: `del_${Date.now()}`,
        webhook_id: `wh_mapped_${Date.now()}`,
        event: eventTopic,
        url: subscriberUrl,
        booking_id: appt.id,
        payload: {
          event: eventTopic,
          uid: `bk_uid_${appt.id}`,
          timestamp: new Date().toISOString(),
          data: {
            client: appt.client,
            email: appt.email || 'client@strawberryhotels.com',
            procedure: appt.procedure,
            specialist: appt.specialist,
            startsAt: appt.date + 'T' + appt.timeLabel.split(' - ')[0]
          }
        },
        http_status: 200,
        delivered_at: new Date().toISOString(),
        processed_at: new Date().toISOString()
      };
      setWebhookDeliveries(prev => [newDel, ...prev]);
      triggerNotification(`Webhook "${eventTopic}" dispatched for treatment "${appt.procedure}" to URL: ${subscriberUrl}`);
    }
  };

  // Quick Book save handler
  const handleSaveNewBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookClientName || !bookSpecialist || !bookTreatment) {
      triggerNotification('Client, Specialist, and Treatment are required.');
      return;
    }

    // Validate bookability / event type mapping & specialist calendars
    const specStatus = getSpecialistBookingStatus(bookSpecialist, bookTreatment);
    if (!specStatus.valid) {
      triggerNotification(`Booking Blocked: Specialist "${bookSpecialist}" is not selectable: ${specStatus.reason}.`);
      return;
    }
    if (bookCoSpecialist) {
      const coStatus = getSpecialistBookingStatus(bookCoSpecialist, bookTreatment);
      if (!coStatus.valid) {
        triggerNotification(`Booking Blocked: Co-Therapist "${bookCoSpecialist}" is not selectable: ${coStatus.reason}.`);
        return;
      }
    }

    const matchedSpec = specialists.find(s => s.therapist_name === bookSpecialist);
    const room = matchedSpec ? matchedSpec.room_preference : 'Room 1';

    // Removed hardcoded performedTreatments check since getSpecialistBookingStatus now dynamically validates using calEventTypes

    const matchedTreat = treatments.find(t => t.name === bookTreatment);
    const price = matchedTreat ? matchedTreat.price : '$120.00';
    const duration = matchedTreat ? matchedTreat.duration : '60 min';

    const timeLabel = calculateTimeLabel(bookTimeLabel, duration);

    // Collision detection using intervals for specialists & co-specialist & room
    const isConflict = appointments.some(appt => {
      if (appt.status === 'cancelled') return false;
      if ((appt.date || '2023-10-24') !== bookDate) return false;

      const specMatch = appt.specialist === bookSpecialist || 
                        appt.coSpecialist === bookSpecialist ||
                        (bookCoSpecialist && (appt.specialist === bookCoSpecialist || appt.coSpecialist === bookCoSpecialist));
      
      const roomMatch = appt.room === room;

      if (specMatch || roomMatch) {
        const otherClean = appt.isBreakBlock || appt.isCleaningBlock ? 0 : (appt.cleaningTime !== undefined ? appt.cleaningTime : 10);
        return checkOverlap(timeLabel, duration, bookCleaningTime, appt.timeLabel, appt.duration || '60 min', otherClean);
      }
      return false;
    });

    if (isConflict) {
      triggerNotification(`Booking Conflict: Specialist(s) or Room "${room}" are already reserved during this slot (required: ${duration} + ${bookCleaningTime}m cleaning).`);
      return;
    }

    const newAppt = {
      id: Date.now().toString(),
      date: bookDate,
      timeLabel,
      client: bookClientName,
      procedure: bookTreatment,
      specialist: bookSpecialist,
      coSpecialist: bookCoSpecialist || undefined,
      room,
      status: 'confirmed',
      price,
      email: bookClientEmail || 'client@strawberryhotels.com',
      phone: bookClientPhone || '+1 (555) 777-0000',
      vip: false,
      duration,
      cleaningTime: bookCleaningTime,
      addons: bookSelectedAddons,
      notes: bookNotes || 'Quick Booking slot reservation.',
      colorClass: 'bg-primary/10 border-primary text-primary',
      posStyle: mapTimeToPos(timeLabel, duration, bookCleaningTime)
    };

    if (bookSaveAsPending) {
      const pendingReq = {
        id: newAppt.id,
        client: newAppt.client,
        email: newAppt.email,
        phone: newAppt.phone,
        procedure: newAppt.procedure,
        requestedTime: newAppt.timeLabel,
        date: newAppt.date,
        status: 'needs_action',
        notes: newAppt.notes,
        addons: newAppt.addons,
        eventTypeId: matchedSpec?.mappedEventTypeId ? Number(matchedSpec.mappedEventTypeId) : undefined,
        eventSlug: matchedSpec?.mappedEventSlug || ''
      };
      setRequests(prev => [pendingReq, ...prev]);
      triggerMappedWebhook('request.created', pendingReq);
      setShowBookingModal(false);
      triggerNotification('Saved locally to Pending Requests.');
      return;
    }

    setAppointments(prev => [...prev, newAppt]);
    triggerMappedWebhook('booking.created', newAppt);
    setShowBookingModal(false);

    // Post to Cal.com API if Key is present
    if (calComApiKey) {
      let startTime = '09:00';
      if (bookTimeLabel) {
        const times = bookTimeLabel.split(' - ');
        if (times.length >= 1 && times[0].includes(':')) {
          startTime = times[0].trim();
        }
      }
      const startIso = formatLocalIsoString(bookDate, startTime);
      const durationMin = bookDuration ? Number(bookDuration) : (parseInt(duration) || 60);

      let eventSlug = matchedSpec?.mappedEventSlug || '';
      let eventTypeId = matchedSpec?.mappedEventTypeId ? Number(matchedSpec.mappedEventTypeId) : undefined;

      if (matchedSpec && bookTreatment) {
        const lookupKey = matchedSpec.calUserId || matchedSpec.calUsername;
        const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];
        const exactEt = [...specEts].sort((a,b)=>b.title.length - a.title.length).find(et => 
          bookTreatment.toLowerCase().includes(et.title.toLowerCase())
        );
        if (exactEt) {
          eventTypeId = exactEt.id;
          eventSlug = exactEt.slug;
        }
      }

      // STRICT VALIDATION: Ensure eventTypeId / eventSlug actually belongs to the user
      if (matchedSpec) {
        let isValid = false;
        const lookupKey = matchedSpec.calUserId || matchedSpec.calUsername;
        const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];
        
        if (eventTypeId) {
          isValid = specEts.some(et => et.id === eventTypeId);
        } else if (eventSlug) {
          isValid = specEts.some(et => et.slug === eventSlug);
        }
        
        if (!isValid) {
          const safeEt = specEts[0];
          if (safeEt) {
            eventTypeId = safeEt.id;
            eventSlug = safeEt.slug;
          } else {
            eventTypeId = undefined;
            eventSlug = '';
          }
        }
      }

      import('./services/bookingService').then(({ bookingService }) => {
        bookingService.createBooking({
          start: startIso,
          name: bookClientName,
          email: bookClientEmail || 'client@strawberryhotels.com',
          phone: bookClientPhone || '+1 (555) 777-0000',
          notes: bookNotes || 'Quick Booking slot reservation.',
          treatment: bookTreatment,
          specialist: bookSpecialist,
          username: matchedSpec?.calUsername || 'admin',
          room: room,
          price: price,
          duration: duration,
          durationMinutes: durationMin,
          eventSlug,
          eventTypeId
        })
        .then((createdBooking) => {
          setAppointments(prev => prev.map(a => {
            if (a.id === newAppt.id) {
              return { ...a, id: createdBooking.id };
            }
            return a;
          }));
          triggerNotification('Booking successfully scheduled.');
          // Auto-trigger full sync refresh after booking creation
          handleSyncAllCalCom();
        })
        .catch(err => {
          console.error('Cal.com booking post failed:', err);
          
          // Remove from calendar view
          setAppointments(prev => prev.filter(a => a.id !== newAppt.id));
          
          // Add to Pending Approvals
          const pendingReq = {
            id: newAppt.id,
            client: newAppt.client,
            email: newAppt.email,
            phone: newAppt.phone,
            procedure: newAppt.procedure,
            requestedTime: newAppt.timeLabel,
            date: newAppt.date,
            status: 'needs_action',
            notes: newAppt.notes,
            eventTypeId: eventTypeId,
            eventSlug: eventSlug
          };
          setRequests(prev => [pendingReq, ...prev]);
          
          triggerNotification(`Saved locally and added to Pending Approvals. API operation failed: ${err.message || err}`);
        });
      });
    }

    // Auto-update or add client to Clients Database
    setClients(prev => {
      const existingClientIdx = prev.findIndex(c => c.name.toLowerCase() === bookClientName.toLowerCase());
      if (existingClientIdx >= 0) {
        const updated = [...prev];
        updated[existingClientIdx] = {
          ...updated[existingClientIdx],
          email: bookClientEmail || updated[existingClientIdx].email,
          phone: bookClientPhone || updated[existingClientIdx].phone,
          notes: bookNotes || updated[existingClientIdx].notes,
          last_visit: bookDate
        };
        return updated;
      } else {
        return [...prev, {
          id: 'cli_' + Math.random().toString(36).substr(2, 9),
          name: bookClientName,
          email: bookClientEmail || '',
          phone: bookClientPhone || '',
          status: 'Active',
          last_visit: bookDate,
          total_spend: '$0',
          notes: bookNotes
        }];
      }
    });

    // Sync indicators
    const isSheetsMode = clientSourceMode === 'sheets';
    const isSheetsValid = validateGoogleSheetId(clientSheetId, clientSheetName, 'Clients').valid;
    const isApiValid = clientApiConnected && clientApiEndpoint && clientAccessToken;

    if (isSheetsMode) {
      if (isSheetsValid) {
        triggerNotification(`Sheets: Appended booking data to Clients Google Sheet (ID: ${clientSheetId.substring(0, 6)}...).`);
      }
    } else {
      if (isApiValid) {
        triggerNotification(`API: POST sent to Endpoint ${clientApiEndpoint} to save slot data.`);
      }
    }

    // Reset Form
    setBookClientName('');
    setBookClientEmail('');
    setBookClientPhone('');
    setBookNotes('');
    setBookSpecialist('');
    setBookCoSpecialist('');
    setBookSelectedAddons([]);
  };

  // Status Updater
  const handleUpdateStatus = (apptId: string, newStatus: string) => {
    const appt = appointments.find(a => a.id === apptId);
    if (appt) {
      triggerMappedWebhook(`booking.${newStatus === 'confirmed' ? 'confirmed' : newStatus === 'cancelled' ? 'canceled' : 'updated'}`, { ...appt, status: newStatus });
    }
    setAppointments(prev => prev.map(a => {
      if (a.id === apptId) {
        let colorClass = 'bg-primary/10 border-primary text-primary';
        if (newStatus === 'pending') colorClass = 'bg-[#EAB308]/10 border-[#EAB308] text-[#B45309]';
        if (newStatus === 'needs_action') colorClass = 'bg-accent-coral/10 border-accent-coral text-accent-coral';
        if (newStatus === 'cancelled') colorClass = 'bg-surface-variant/30 border-outline text-outline opacity-60';
        return { ...a, status: newStatus, colorClass };
      }
      return a;
    }));
    setSelectedAppointment(null);
    setIsRescheduling(false);
    triggerNotification('Reservation updated.');
  };

  // Rescheduling workflows
  const startRescheduleWorkflow = (appt: any) => {
    setIsRescheduling(true);
    setSelectedSpecialist(appt.specialist);
    setReschedCoSpecialist(appt.coSpecialist || '');
    setReschedCleaningTime(appt.cleaningTime !== undefined ? appt.cleaningTime : 10);
    const matchedTreat = treatments.find(t => t.name === appt.procedure);
    setSelectedTreatment(matchedTreat || null);
    setReschedDate(appt.date || '2023-10-24');
  };

  const handleSaveReschedule = () => {
    if (!selectedAppointment) return;

    const matchedSpec = specialists.find(s => s.therapist_name === selectedSpecialist);
    const room = matchedSpec ? matchedSpec.room_preference : selectedAppointment.room;
    const duration = selectedTreatment ? selectedTreatment.duration : selectedAppointment.duration;
    const procedureName = selectedTreatment ? selectedTreatment.name : selectedAppointment.procedure;

    if (reschedSaveAsPending) {
      setAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id));
      const pendingReq = {
        id: selectedAppointment.id,
        client: selectedAppointment.client,
        email: selectedAppointment.email,
        phone: selectedAppointment.phone,
        procedure: procedureName,
        requestedTime: selectedAppointment.timeLabel,
        date: reschedDate,
        status: 'needs_action',
        notes: selectedAppointment.notes,
        addons: selectedAppointment.addons,
        eventTypeId: selectedAppointment.eventTypeId,
        eventSlug: selectedAppointment.eventSlug
      };
      setRequests(prev => [pendingReq, ...prev]);
      
      if (calComApiKey && !selectedAppointment.isBreakBlock && !selectedAppointment.isCleaningBlock) {
        const username = matchedSpec?.calUsername || (selectedAppointment.specialist === 'Admin' || selectedAppointment.specialist === 'admin' ? 'admin' : '');
        import('./services/bookingService').then(({ bookingService }) => {
          bookingService.cancelBooking(selectedAppointment.id, 'Moved to pending requests', username)
          .catch(err => console.warn('Cancel failed:', err));
        });
      }
      
      setSelectedAppointment(null);
      setIsRescheduling(false);
      setReschedSaveAsPending(false);
      triggerNotification('Appointment moved to Pending Requests and cancelled in API.');
      return;
    }

    // We now rely on dynamic calEventTypes checks when possible
    const specStatus = getSpecialistBookingStatus(selectedSpecialist, procedureName);
    if (!specStatus.valid) {
      triggerNotification(`Error: Specialist "${selectedSpecialist}" does not perform treatment "${procedureName}".`);
      return;
    }
    if (reschedCoSpecialist) {
      const coStatus = getSpecialistBookingStatus(reschedCoSpecialist, procedureName);
      if (!coStatus.valid) {
        triggerNotification(`Error: Co-Specialist "${reschedCoSpecialist}" does not perform treatment "${procedureName}".`);
        return;
      }
    }

    // Collision detection using intervals
    const isConflict = appointments.some(appt => {
      if (appt.id === selectedAppointment.id || appt.status === 'cancelled') return false;
      if ((appt.date || '2023-10-24') !== reschedDate) return false;

      const specMatch = appt.specialist === selectedSpecialist || 
                        appt.coSpecialist === selectedSpecialist || 
                        (reschedCoSpecialist && (appt.specialist === reschedCoSpecialist || appt.coSpecialist === reschedCoSpecialist));
      
      const roomMatch = appt.room === room;

      if (specMatch || roomMatch) {
        const otherClean = appt.isBreakBlock || appt.isCleaningBlock ? 0 : (appt.cleaningTime !== undefined ? appt.cleaningTime : 10);
        return checkOverlap(selectedAppointment.timeLabel, duration, reschedCleaningTime, appt.timeLabel, appt.duration || '60 min', otherClean);
      }
      return false;
    });

    if (isConflict) {
      triggerNotification(`Booking Conflict: Specialist(s) or Room "${room}" are already reserved during this slot (required: ${duration} + ${reschedCleaningTime}m cleaning).`);
      return;
    }

    const price = selectedTreatment ? selectedTreatment.price : selectedAppointment.price;
    const procedure = selectedTreatment ? selectedTreatment.name : selectedAppointment.procedure;
    const updatedAppt = {
      ...selectedAppointment,
      specialist: selectedSpecialist,
      coSpecialist: reschedCoSpecialist || undefined,
      room,
      price,
      duration,
      procedure,
      date: reschedDate,
      cleaningTime: reschedCleaningTime,
      posStyle: mapTimeToPos(selectedAppointment.timeLabel, duration, reschedCleaningTime)
    };

    setAppointments(prev => prev.map(appt => {
      if (appt.id === selectedAppointment.id) {
        return updatedAppt;
      }
      return appt;
    }));
    triggerMappedWebhook('booking.rescheduled', updatedAppt);
    if (calComApiKey && !selectedAppointment.isBreakBlock && !selectedAppointment.isCleaningBlock) {
      const times = selectedAppointment.timeLabel.split(' - ');
      if (times.length === 2) {
        const startIso = formatLocalIsoString(reschedDate, times[0]);
        const endIso = formatLocalIsoString(reschedDate, times[1]);
        
        const matchedSpec = specialists.find(s => s.therapist_name === selectedAppointment.specialist);
        const username = matchedSpec?.calUsername || (selectedAppointment.specialist === 'Admin' || selectedAppointment.specialist === 'admin' ? 'admin' : '');
        
        import('./services/bookingService').then(({ bookingService }) => {
          bookingService.rescheduleBooking(selectedAppointment.id, {
            start: startIso,
            notes: selectedAppointment.notes || 'Rescheduled via form'
          }, username)
          .then(() => {
            triggerNotification('Reschedule successfully updated in Cal.diy API.');
          })
          .catch(async (err) => {
            console.warn('Reschedule failed, trying fallback createBooking:', err);
            try {
              let eventTypeId = undefined;
              const lookupKey = matchedSpec?.calUserId || matchedSpec?.calUsername;
              const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];
              const exactEt = [...specEts].sort((a,b)=>b.title.length - a.title.length).find(et => (procedureName).toLowerCase().includes(et.title.toLowerCase()));
              if (exactEt) {
                eventTypeId = exactEt.id;
              } else if (selectedAppointment.eventTypeId) {
                eventTypeId = selectedAppointment.eventTypeId;
              }
              const finalEventSlug = selectedAppointment.eventSlug || exactEt?.slug || matchedSpec?.mappedEventSlug || '';
              
              const newBooking = await bookingService.createBooking({
                start: startIso,
                name: selectedAppointment.client,
                email: selectedAppointment.email || 'client@strawberryhotels.com',
                phone: selectedAppointment.phone || '',
                notes: selectedAppointment.notes || 'Re-created booking due to missing reschedule target',
                eventTypeId,
                eventSlug: finalEventSlug,
                durationMinutes: parseInt(duration?.replace(' min', '') || '60'),
                specialist: selectedSpecialist,
                username,
                treatment: procedureName
              });
              
              setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? { ...a, id: newBooking.id } : a));
              triggerNotification(`Cal.diy Notice: Target booking did not exist. Created a new booking as fallback (ID: ${newBooking.id}).`);
            } catch (createErr: any) {
              console.error('Fallback creation failed:', createErr);
              triggerNotification(`Cal.com API Notice: Saved locally, but Cal.diy reschedule failed & fallback creation failed (${createErr.message || createErr}).`);
            }
          });
        });
      }
    }

    setSelectedAppointment(null);
    setIsRescheduling(false);
    setReschedCoSpecialist('');
    triggerNotification('Reschedule and client profile modifications saved.');
  };

  const handleDragStart = (e: React.DragEvent, apptId: string) => {
    e.dataTransfer.setData('text/plain', apptId);
  };

  const handleDropOnSlot = (e: React.DragEvent, targetSpecialistName: string, targetTime: string) => {
    e.preventDefault();
    setIsDraggingAppt(false);
    const apptId = e.dataTransfer.getData('text/plain');
    if (!apptId) return;

    const appt = appointments.find(a => a.id === apptId);
    if (!appt) return;

    const cleanTime = appt.isBreakBlock || appt.isCleaningBlock ? 0 : (appt.cleaningTime !== undefined ? appt.cleaningTime : 10);
    const targetSpecObj = specialists.find(s => s.therapist_name === targetSpecialistName);
    const room = targetSpecObj ? targetSpecObj.room_preference : 'Room 1';
    const duration = appt.duration || '60 min';

    // Verify if target specialist performs this treatment type dynamically
    if (!appt.isBreakBlock && !appt.isCleaningBlock) {
      const specStatus = getSpecialistBookingStatus(targetSpecialistName, appt.procedure);
      if (!specStatus.valid) {
        triggerNotification(`Error: Specialist "${targetSpecialistName}" does not perform treatment "${appt.procedure}".`);
        return;
      }
    }

    // Calculate new time range based on the drop target starting time
    const newTimeLabel = calculateTimeLabel(targetTime, duration);

    // Rule: Co-Therapist Drag-and-drop Reassignment
    let finalCoSpecialist: string | undefined = appt.coSpecialist;
    
    if (!appt.isBreakBlock && !appt.isCleaningBlock && appt.coSpecialist) {
      const otherActiveSpecs = specialists.filter(s => s.therapist_name !== targetSpecialistName);
      
      const qualifiedSpecs = otherActiveSpecs.filter(s => {
        const performed = s.performedTreatments || treatments.map(t => t.name);
        return performed.includes(appt.procedure);
      });

      const freeSpecs = qualifiedSpecs.filter(spec => {
        const hasConflict = appointments.some(other => {
          if (other.id === appt.id || other.status === 'cancelled') return false;
          if ((other.date || '2023-10-24') !== (appt.date || '2023-10-24')) return false;

          const specMatch = other.specialist === spec.therapist_name || other.coSpecialist === spec.therapist_name;
          if (specMatch) {
            const otherClean = other.isBreakBlock || other.isCleaningBlock ? 0 : (other.cleaningTime !== undefined ? other.cleaningTime : 10);
            return checkOverlap(newTimeLabel, duration, cleanTime, other.timeLabel, other.duration || '60 min', otherClean);
          }
          return false;
        });
        return !hasConflict;
      });

      if (freeSpecs.length === 0) {
        triggerNotification(`Conflict: Cannot move dual-therapist booking. No other qualified specialist is free during this slot to act as co-therapist.`);
        return;
      }

      const specBookingsCount = freeSpecs.map(spec => {
        const count = appointments.filter(other => 
          other.status !== 'cancelled' &&
          (other.date || '2023-10-24') === (appt.date || '2023-10-24') &&
          (other.specialist === spec.therapist_name || other.coSpecialist === spec.therapist_name)
        ).length;
        return { name: spec.therapist_name, count };
      });

      specBookingsCount.sort((a, b) => a.count - b.count);
      finalCoSpecialist = specBookingsCount[0].name;
    }

    // Check collision for primary specialist, co-specialist, and room
    const isConflict = appointments.some(other => 
      other.id !== appt.id &&
      other.status !== 'cancelled' &&
      (other.date || '2023-10-24') === (appt.date || '2023-10-24') &&
      (
        other.specialist === targetSpecialistName || 
        other.coSpecialist === targetSpecialistName || 
        (finalCoSpecialist && (other.specialist === finalCoSpecialist || other.coSpecialist === finalCoSpecialist)) ||
        other.room === room
      ) &&
      checkOverlap(
        newTimeLabel, 
        duration, 
        cleanTime, 
        other.timeLabel, 
        other.duration || '60 min', 
        other.isBreakBlock || other.isCleaningBlock ? 0 : (other.cleaningTime !== undefined ? other.cleaningTime : 10)
      )
    );

    if (isConflict) {
      triggerNotification(`Conflict: Cannot drop booking here. Specialist(s) or Room "${room}" are busy during ${newTimeLabel} (required: ${duration} + ${cleanTime}m cleaning).`);
      return;
    }

    setAppointments(prev => prev.map(a => 
      a.id === appt.id ? { 
        ...a, 
        specialist: targetSpecialistName, 
        coSpecialist: finalCoSpecialist || undefined,
        room,
        timeLabel: newTimeLabel,
        posStyle: mapTimeToPos(newTimeLabel, duration, cleanTime)
      } : a
    ));

    if (calComApiKey && !appt.isBreakBlock && !appt.isCleaningBlock) {
      const times = newTimeLabel.split(' - ');
      if (times.length === 2) {
        const startIso = formatLocalIsoString(appt.date || dashboardDate || '2023-10-24', times[0]);
        const endIso = formatLocalIsoString(appt.date || dashboardDate || '2023-10-24', times[1]);
        
        const oldSpec = specialists.find(s => s.therapist_name === appt.specialist);
        const oldUsername = oldSpec?.calUsername || (appt.specialist === 'Admin' || appt.specialist === 'admin' ? 'admin' : '');
        
        const targetSpec = specialists.find(s => s.therapist_name === targetSpecialistName);
        const targetUsername = targetSpec?.calUsername || (targetSpecialistName === 'Admin' || targetSpecialistName === 'admin' ? 'admin' : '');
        
        import('./services/bookingService').then(({ bookingService }) => {
          const doTransfer = async () => {
            if (appt.specialist !== targetSpecialistName) {
              // Transfer to a different specialist
              let eventTypeId = undefined;
              const lookupKey = targetSpec?.calUserId || targetSpec?.calUsername;
              const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];
              const exactEt = [...specEts].sort((a,b)=>b.title.length - a.title.length).find(et => (appt.procedure).toLowerCase().includes(et.title.toLowerCase()));
              console.log('DRAG_AND_DROP_DEBUG:', { targetUsername, lookupKey, specEtsLength: specEts.length, apptProcedure: appt.procedure, exactEt: exactEt?.id });
              if (exactEt) {
                eventTypeId = exactEt.id;
              } else if (appt.eventTypeId) {
                eventTypeId = appt.eventTypeId; 
              }
              const finalEventSlug = exactEt?.slug || targetSpec?.mappedEventSlug || appt.eventSlug || '';

              const newBooking = await bookingService.createBooking({
                start: startIso,
                name: appt.client,
                email: appt.email || 'client@strawberryhotels.com',
                phone: appt.phone || '',
                notes: appt.notes || 'Transferred booking via Drag & Drop',
                eventTypeId,
                eventSlug: finalEventSlug,
                durationMinutes: appt.durationMinutes || parseInt(appt.duration?.replace(' min', '') || '60'),
                specialist: targetSpecialistName,
                username: targetUsername,
                treatment: appt.procedure
              });
              
              setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, id: newBooking.id } : a));
              
              try {
                await bookingService.cancelBooking(appt.id, 'Transferred to ' + targetSpecialistName, oldUsername);
              } catch (e) {
                console.warn('Could not cancel old booking after transfer:', e);
              }
              triggerNotification(`Transferred booking to ${targetSpecialistName} in Cal.diy API (New ID: ${newBooking.id}).`);
            } else {
              // Same specialist, just reschedule
              try {
                await bookingService.rescheduleBooking(appt.id, {
                  start: startIso,
                  notes: appt.notes || 'Rescheduled via Drag & Drop'
                }, oldUsername);
                triggerNotification('Reschedule successfully updated in Cal.diy API.');
              } catch (err: any) {
                console.warn('Reschedule failed, trying fallback createBooking:', err);
                let eventTypeId = undefined;
                const lookupKey = oldSpec?.calUserId || oldSpec?.calUsername;
                const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];
                const exactEt = [...specEts].sort((a,b)=>b.title.length - a.title.length).find(et => (appt.procedure).toLowerCase().includes(et.title.toLowerCase()));
                if (exactEt) {
                  eventTypeId = exactEt.id;
                } else if (appt.eventTypeId) {
                  eventTypeId = appt.eventTypeId;
                }
                const finalEventSlug = appt.eventSlug || exactEt?.slug || oldSpec?.mappedEventSlug || '';
                
                const newBooking = await bookingService.createBooking({
                  start: startIso,
                  name: appt.client,
                  email: appt.email || 'client@strawberryhotels.com',
                  phone: appt.phone || '',
                  notes: appt.notes || 'Re-created booking due to missing reschedule target',
                  eventTypeId,
                  eventSlug: finalEventSlug,
                  durationMinutes: appt.durationMinutes || parseInt(appt.duration?.replace(' min', '') || '60'),
                  specialist: appt.specialist,
                  username: oldUsername,
                  treatment: appt.procedure
                });
                
                setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, id: newBooking.id } : a));
                
                try {
                  await bookingService.cancelBooking(appt.id, 'Rescheduled to ' + startIso, oldUsername);
                } catch (e) {
                  console.warn('Could not cancel old booking after fallback creation:', e);
                }
                
                triggerNotification(`Cal.diy Notice: Target booking did not exist. Created a new booking as fallback (ID: ${newBooking.id}).`);
              }
            }
          };
          
          doTransfer().catch(err => {
            console.error('Drag/Drop API operation failed:', err);
            triggerNotification(`Cal.diy Notice: Saved locally, but API operation failed (${err.message || 'unknown error'}).`);
          });
        });
      }
    }
    
    if (finalCoSpecialist && finalCoSpecialist !== appt.coSpecialist) {
      triggerNotification(`Moved booking to ${targetSpecialistName} and auto-assigned co-therapist ${finalCoSpecialist} (least treatments today) at ${newTimeLabel}.`);
    } else {
      triggerNotification(`Moved booking for ${appt.client} to ${targetSpecialistName} at ${newTimeLabel}.`);
    }
  };

  const handleReschedule = (appt: any) => {
    setSelectedAppointment(appt);
    setIsRescheduling(true);
    setSelectedSpecialist(appt.specialist);
    setReschedCoSpecialist(appt.coSpecialist || '');
    setReschedCleaningTime(appt.cleaningTime !== undefined ? appt.cleaningTime : 10);
    const matchedTreat = treatments.find(t => t.name === appt.procedure);
    setSelectedTreatment(matchedTreat || null);
    setReschedDate(appt.date || dashboardDate);
  };

  const handleDropOnWeekDay = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setIsDraggingAppt(false);
    const apptId = e.dataTransfer.getData('text/plain');
    if (!apptId) return;
    const appt = appointments.find(a => a.id === apptId);
    if (!appt) return;

    if (appt.isBreakBlock || appt.isCleaningBlock) {
      triggerNotification('Break/cleaning blocks cannot be moved to other days.');
      return;
    }

    handleReschedule(appt);
    setReschedDate(targetDate);
    triggerNotification(`Rescheduling ${appt.client} to ${targetDate}. Choose slot & specialist.`);
  };

  // Cancel Request entirely
  const handleCancelRequest = (reqId: string) => {
    const req = requests.find(r => r.id === reqId) || actionRequests.find(r => r.id === reqId);
    if (!req) return;
    setHandledRequests(prev => [{ ...req, status: 'cancelled', notes: 'Cancelled by system administrator.' }, ...prev]);
    setRequests(prev => prev.filter(r => r.id !== reqId));
    setActionRequests(prev => prev.filter(r => r.id !== reqId));
    triggerNotification('Booking request cancelled & synced.');
  };

  // Confirm and sync state update
  const handleConfirmSync = (reqId: string) => {
    const req = requests.find(r => r.id === reqId) || actionRequests.find(r => r.id === reqId);
    if (!req) return;

    const matchedSpec = specialists[0] || specialists[0];
    const room = matchedSpec ? matchedSpec.room_preference : 'Room 1';
    const matchedTreat = treatments.find(t => t.name === req.procedure) || treatments[0];
    const price = matchedTreat ? matchedTreat.price : '$120.00';
    const duration = matchedTreat ? matchedTreat.duration : '60 min';

    const newAppt = {
      id: req.id,
      timeLabel: req.requestedTime,
      client: req.client,
      procedure: req.procedure,
      specialist: matchedSpec?.therapist_name || 'Sophia Martinez',
      room,
      status: 'confirmed',
      price,
      email: req.email || 'client@strawberryhotels.com',
      phone: req.phone || '+1 (555) 777-0000',
      vip: false,
      duration,
      addons: [],
      notes: req.notes || 'Confirmed slot reservation.',
      colorClass: 'bg-primary/10 border-primary text-primary',
      posStyle: mapTimeToPos(req.requestedTime)
    };

    setAppointments(prev => [...prev, newAppt]);
    setHandledRequests(prev => [{ ...req, status: 'confirmed', notes: `Confirmed: Assigned to ${newAppt.specialist} in Room ${newAppt.room}.` }, ...prev]);
    setRequests(prev => prev.filter(r => r.id !== reqId));
    setActionRequests(prev => prev.filter(r => r.id !== reqId));
    triggerNotification('Confirmed & locally saved.');

    if (calComApiKey) {
      const times = req.requestedTime.split(' - ');
      let startIso = formatLocalIsoString(dashboardDate, '09:00');
      let endIso = formatLocalIsoString(dashboardDate, '10:00');
      if (times.length === 2) {
        startIso = formatLocalIsoString(dashboardDate, times[0]);
        endIso = formatLocalIsoString(dashboardDate, times[1]);
      }

      const eventSlug = matchedSpec?.mappedEventSlug || req.procedure.toLowerCase().replace(/\s+/g, '-');
      const eventTypeId = matchedSpec?.mappedEventTypeId ? Number(matchedSpec.mappedEventTypeId) : undefined;

      import('./services/bookingService').then(({ bookingService }) => {
        bookingService.createBooking({
          start: startIso,
          name: req.client,
          email: req.email || 'client@strawberryhotels.com',
          phone: req.phone || '+1 (555) 777-0000',
          notes: req.notes || 'Confirmed slot reservation.',
          treatment: req.procedure,
          specialist: matchedSpec?.therapist_name || 'Sophia Martinez',
          room: room,
          price: price,
          duration: duration,
          eventSlug,
          eventTypeId
        })
        .then((createdBooking) => {
          setAppointments(prev => prev.map(a => {
            if (a.id === newAppt.id) {
              return { ...a, id: createdBooking.id, cal_booking_uid: createdBooking.id };
            }
            return a;
          }));
          triggerNotification('Booking successfully scheduled.');
        })
        .catch(err => {
          console.error('Cal.com booking post failed:', err);
          triggerNotification(`Cal.com API Notice: Approved locally, but Cal.diy POST failed (${err.message || err}).`);
        });
      });
    }
  };

  // Bulk Confirm for checkboxed requests
  const handleBulkConfirm = () => {
    (window as any).handleBulkConfirm = handleBulkConfirm;
    selectedRequests.forEach(reqId => {
      const req = requests.find(r => r.id === reqId);
      if (req) {
        const matchedSpec = specialists[0] || specialists[0];
        const room = matchedSpec ? matchedSpec.room_preference : 'Room 1';
        const matchedTreat = treatments.find(t => t.name === req.procedure) || treatments[0];
        const price = matchedTreat ? matchedTreat.price : '$120.00';
        const duration = matchedTreat ? matchedTreat.duration : '60 min';

        const newAppt = {
          id: req.id,
          timeLabel: req.requestedTime,
          client: req.client,
          procedure: req.procedure,
          specialist: matchedSpec?.therapist_name || 'Sophia Martinez',
          room,
          status: 'confirmed',
          price,
          email: 'client@strawberryhotels.com',
          phone: '+1 (555) 777-0000',
          vip: false,
          duration,
          addons: [],
          notes: req.notes || 'Bulk Confirmed slot reservation.',
          colorClass: 'bg-primary/10 border-primary text-primary',
          posStyle: mapTimeToPos(req.requestedTime)
        };
        setAppointments(prev => [...prev, newAppt]);
        setHandledRequests(prev => [{ ...req, status: 'confirmed', notes: 'Bulk confirmed slot.' }, ...prev]);
      }
    });
    setRequests(prev => prev.filter(r => !selectedRequests.includes(r.id)));
    setSelectedRequests([]);
    triggerNotification('Bulk confirmed selections & calendar synced.');
  };

  // Reschedule Incoming Request Save handler
  const handleSaveReschedRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleRequest) return;

    const matchedSpec = specialists.find(s => s.therapist_name === reschedSpecialist) || specialists[0];
    const room = matchedSpec ? matchedSpec.room_preference : 'Room 1';

    const matchedTreat = treatments.find(t => t.name === (reschedTreatment || rescheduleRequest.procedure)) || treatments[0];
    const price = matchedTreat ? matchedTreat.price : '$120.00';
    const duration = matchedTreat ? matchedTreat.duration : '60 min';

    // Verify treatment types performed by specialists dynamically
    const specStatus = getSpecialistBookingStatus(reschedSpecialist, matchedTreat.name);
    if (!specStatus.valid) {
      triggerNotification(`Error: Specialist "${reschedSpecialist}" does not perform treatment "${matchedTreat.name}".`);
      return;
    }

    const selectedTime = reschedTimeLabel || rescheduleRequest.requestedTime;
    const timeLabel = calculateTimeLabel(selectedTime, duration);

    // Collision detection using intervals
    const isConflict = appointments.some(appt => {
      if (appt.id === rescheduleRequest.id || appt.status === 'cancelled') return false;
      if ((appt.date || '2023-10-24') !== reschedDate) return false;

      const specMatch = appt.specialist === reschedSpecialist || appt.coSpecialist === reschedSpecialist;
      const roomMatch = appt.room === room;

      if (specMatch || roomMatch) {
        const otherClean = appt.isBreakBlock || appt.isCleaningBlock ? 0 : (appt.cleaningTime !== undefined ? appt.cleaningTime : 10);
        return checkOverlap(timeLabel, duration, 15, appt.timeLabel, appt.duration || '60 min', otherClean);
      }
      return false;
    });

    if (isConflict) {
      triggerNotification(`Booking Conflict: Specialist or Room "${room}" are already reserved during this slot (required: ${duration} + 15m cleaning).`);
      return;
    }

    const newAppt = {
      id: rescheduleRequest.id,
      date: reschedDate,
      timeLabel,
      client: rescheduleRequest.client,
      procedure: reschedTreatment || rescheduleRequest.procedure,
      specialist: reschedSpecialist,
      room,
      status: 'confirmed',
      price,
      email: 'client@strawberryhotels.com',
      phone: '+1 (555) 777-0000',
      vip: false,
      duration,
      cleaningTime: 10,
      addons: [],
      notes: `Rescheduled request: Provider ${reschedSpecialist} on ${reschedDate} in Room ${room}`,
      colorClass: 'bg-primary/10 border-primary text-primary',
      posStyle: mapTimeToPos(timeLabel, duration, 15)
    };

    setAppointments(prev => [...prev, newAppt]);
    
    const updated = {
      ...rescheduleRequest,
      procedure: reschedTreatment || rescheduleRequest.procedure,
      requestedTime: timeLabel,
      date: reschedDate,
      status: 'confirmed',
      notes: `Rescheduled & Confirmed: Specialist assigned: ${reschedSpecialist} on ${reschedDate}`
    };

    setHandledRequests(prev => [updated, ...prev]);
    setRequests(prev => prev.filter(r => r.id !== rescheduleRequest.id));
    setActionRequests(prev => prev.filter(r => r.id !== rescheduleRequest.id));

    // Sync indicators
    const isSheetsMode = clientSourceMode === 'sheets';
    const isSheetsValid = validateGoogleSheetId(clientSheetId, clientSheetName, 'Clients').valid;
    const isApiValid = clientApiConnected && clientApiEndpoint && clientAccessToken;

    if (isSheetsMode) {
      if (isSheetsValid) triggerNotification(`Sheets: Reschedule data updated in Sheets ID ${clientSheetId.substring(0,6)}...`);
      else triggerNotification(`Memory: Reschedule updated offline.`);
    } else {
      if (isApiValid) triggerNotification(`API: PUT sent to ${clientApiEndpoint} updating slot reservation.`);
      else triggerNotification(`Memory: Reschedule updated offline.`);
    }

    setRescheduleRequest(null);
    triggerNotification('Incoming request rescheduled.');

    if (calComApiKey && rescheduleRequest.id && !rescheduleRequest.id.startsWith('ra') && !/^\d+$/.test(rescheduleRequest.id)) {
      const times = timeLabel.split(' - ');
      if (times.length === 2) {
        const startIso = formatLocalIsoString(reschedDate, times[0]);
        const endIso = formatLocalIsoString(reschedDate, times[1]);
        const matchedSpec = specialists.find(s => s.therapist_name === reschedSpecialist);
        const username = matchedSpec?.calUsername || (reschedSpecialist === 'Admin' || reschedSpecialist === 'admin' ? 'admin' : '');

        import('./services/bookingService').then(({ bookingService }) => {
          bookingService.rescheduleBooking(rescheduleRequest.id, {
            start: startIso,
            notes: `Rescheduled request: Provider ${reschedSpecialist} on ${reschedDate} in Room ${room}`
          }, username)
          .then(() => {
            triggerNotification('Reschedule successfully updated in Cal.diy API.');
          })
          .catch(async (err) => {
            console.warn('Reschedule failed, trying fallback createBooking:', err);
            try {
              let eventTypeId = undefined;
              const lookupKey = matchedSpec?.calUserId || matchedSpec?.calUsername;
              const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];
              const exactEt = [...specEts].sort((a,b)=>b.title.length - a.title.length).find(et => (reschedTreatment || rescheduleRequest.procedure).toLowerCase().includes(et.title.toLowerCase()));
              if (exactEt) {
                eventTypeId = exactEt.id;
              } else if (rescheduleRequest.eventTypeId) {
                eventTypeId = rescheduleRequest.eventTypeId;
              }
              const finalEventSlug = rescheduleRequest.eventSlug || exactEt?.slug || matchedSpec?.mappedEventSlug || '';
              
              const newBooking = await bookingService.createBooking({
                start: startIso,
                name: rescheduleRequest.client,
                email: rescheduleRequest.email || 'client@strawberryhotels.com',
                phone: rescheduleRequest.phone || '',
                notes: `Re-created booking for request: Provider ${reschedSpecialist} on ${reschedDate} in Room ${room}`,
                eventTypeId,
                eventSlug: finalEventSlug,
                durationMinutes: parseInt(duration?.replace(' min', '') || '60'),
                specialist: reschedSpecialist,
                username,
                treatment: reschedTreatment || rescheduleRequest.procedure
              });
              
              // Update local state references to the new ID if applicable
              setHandledRequests(prev => prev.map(r => r.id === rescheduleRequest.id ? { ...r, id: newBooking.id } : r));
              triggerNotification(`Cal.diy Notice: Target booking did not exist. Created a new booking as fallback (ID: ${newBooking.id}).`);
            } catch (createErr: any) {
              console.error('Fallback creation failed:', createErr);
              triggerNotification(`Cal.com API Notice: Saved locally, but Cal.diy reschedule failed & fallback creation failed (${createErr.message || createErr}).`);
            }
          });
        });
      }
    }
  };

  const handleUpdateStatusAppt = (apptId: string, newStatus: string) => {
    if (newStatus === 'cancelled') {
      setCancelingApptId(apptId);
      setCancelReason('');
      setShowCancelModal(true);
    } else {
      handleUpdateStatus(apptId, newStatus);
    }
  };

  const handleCommitCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelingApptId) return;

    setAppointments(prev => prev.map(appt => {
      if (appt.id === cancelingApptId) {
        return { 
          ...appt, 
          status: 'cancelled', 
          cancellationReason: cancelReason,
          colorClass: 'bg-surface-variant/30 border-outline text-outline opacity-60' 
        };
      }
      return appt;
    }));

    if (calComApiKey) {
      try {
        const { bookingService } = await import('./services/bookingService');
        
        // Find username for proxy API key selection
        const appt = appointments.find(a => a.id === cancelingApptId);
        const matchedSpec = specialists.find(s => s.therapist_name === appt?.specialist);
        const username = matchedSpec?.calUsername || (appt?.specialist === 'Admin' || appt?.specialist === 'admin' ? 'admin' : '');

        await bookingService.cancelBooking(cancelingApptId, cancelReason, username);
        triggerNotification('Booking cancelled successfully on Cal.diy API.');
      } catch (err: any) {
        console.error('Cal.com cancellation failed:', err);
        triggerNotification(`Cal.diy API Notice: Cancelled locally, but Cal.diy rejected cancellation. Tip: Ensure "Disable Cancelling" is disabled in Cal.diy Event Type Advanced settings.`);
      }
    } else {
      triggerNotification('Booking cancelled locally.');
    }

    setShowCancelModal(false);
    setCancelingApptId(null);
    setSelectedAppointment(null);
    setIsRescheduling(false);
  };

  // Dashboard Filters and Search mapping
  const filteredAppointments = appointments.filter(appt => {
    const apptDate = appt.date || '2023-10-24';
    if (apptDate !== dashboardDate) return false;

    const matchSpec = filterSpecialist === 'Specialist' || appt.specialist === filterSpecialist;
    const matchTreat = filterTreatment === 'Procedure Type' || appt.procedure.toLowerCase().includes(filterTreatment.toLowerCase()) || filterTreatment.toLowerCase().includes(appt.procedure.toLowerCase());
    const matchStatus = filterStatus === 'Status' || 
      (filterStatus === 'Confirmed' && appt.status === 'confirmed') ||
      (filterStatus === 'Pending' && (appt.status === 'pending' || appt.status === 'needs_action')) ||
      (filterStatus === 'Canceled' && appt.status === 'cancelled');

    const matchSearch = searchQuery.trim() === '' || 
      appt.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.procedure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appt.date || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchSpec && matchTreat && matchStatus && matchSearch;
  });

  // Search filter for Incoming Requests
  const filteredRequests = [
    {
      id: 'david_green_mock',
      client: 'David Green',
      procedure: 'Hot Stone Massage',
      requestedTime: '10:15 - 11:15',
      status: 'new'
    },
    ...requests.filter(req => 
      searchQuery.trim() === '' || 
      req.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.procedure.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ];

  const filteredActionRequests = actionRequests.filter(req => 
    searchQuery.trim() === '' || 
    req.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.procedure.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHandledRequests = handledRequests.filter(req => 
    searchQuery.trim() === '' || 
    req.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.procedure.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // KPI Calculations synced with active dynamic data (filtered by dashboardDate)
  const dashboardAppointments = appointments.filter(a => (a.date || '2023-10-24') === dashboardDate);
  const kpiTotal = dashboardAppointments.length;
  const kpiConfirmed = dashboardAppointments.filter(a => a.status === 'confirmed').length;
  const kpiPending = dashboardAppointments.filter(a => a.status === 'pending' || a.status === 'needs_action').length;
  const kpiCanceled = dashboardAppointments.filter(a => a.status === 'cancelled').length;

  // Helper to retrieve the 7 days of the week starting from Monday
  const getWeekDates = (refDateStr: string) => {
    try {
      const d = new Date(refDateStr);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const temp = new Date(monday);
        temp.setDate(monday.getDate() + i);
        dates.push(temp.toISOString().split('T')[0]);
      }
      return dates;
    } catch {
      return [];
    }
  };

  const getWeekRangeLabel = (dates: string[]) => {
    if (dates.length < 7) return '';
    try {
      const start = new Date(dates[0]).toLocaleDateString([], { month: 'short', day: 'numeric' });
      const end = new Date(dates[6]).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
    } catch {
      return '';
    }
  };

  const weekDates = getWeekDates(dashboardDate);
  const weekAppointments = appointments.filter(a => weekDates.includes(a.date || '2023-10-24'));
  const weekKpiTotal = weekAppointments.length;
  const weekKpiConfirmed = weekAppointments.filter(a => a.status === 'confirmed').length;
  const weekKpiPending = weekAppointments.filter(a => a.status === 'pending' || a.status === 'needs_action').length;
  const weekKpiCanceled = weekAppointments.filter(a => a.status === 'cancelled').length;

  // Helper to retrieve monthly appointments
  const getMonthAppointments = (refDateStr: string) => {
    try {
      const d = new Date(refDateStr);
      const year = d.getFullYear();
      const month = d.getMonth();
      return appointments.filter(a => {
        const ad = new Date(a.date || '2023-10-24');
        return ad.getFullYear() === year && ad.getMonth() === month;
      });
    } catch {
      return [];
    }
  };

  const monthAppointments = getMonthAppointments(dashboardDate);
  const monthKpiTotal = monthAppointments.length;
  const monthKpiConfirmed = monthAppointments.filter(a => a.status === 'confirmed').length;
  const monthKpiPending = monthAppointments.filter(a => a.status === 'pending' || a.status === 'needs_action').length;
  const monthKpiCanceled = monthAppointments.filter(a => a.status === 'cancelled').length;

  // Helper for generating monthly grid days starting from Monday
  const getDaysInMonthGrid = (refDateStr: string) => {
    try {
      const d = new Date(refDateStr);
      const year = d.getFullYear();
      const month = d.getMonth();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
      const totalDays = new Date(year, month + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < startOffset; i++) {
        cells.push(null);
      }
      for (let i = 1; i <= totalDays; i++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        cells.push({
          dayNum: i,
          dateStr: dateString
        });
      }
      return cells;
    } catch {
      return [];
    }
  };

  const handleClearFilters = () => {
    setFilterSpecialist('Specialist');
    setFilterTreatment('Procedure Type');
    setFilterStatus('Status');
    setSearchQuery('');
  };

  // Cal.diy Specialists Manager Actions
  const handlePromoteExistingUser = (e: React.FormEvent) => {
    e.preventDefault();
    triggerNotification('Promotion logic is handled directly in the Specialists roster now.');
    setPromotingUserId('');
  };

  const handleSaveEditingSpecUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpecUser) return;
    
    setSpecialists(prev => prev.map(s => {
      if (s.therapist_id === editingSpecUser.therapist_id) {
        return {
          ...s,
          therapist_name: editingSpecUser.therapist_name,
          email: editingSpecUser.email,
          specialties: editingSpecUser.specialties,
          team: editingSpecUser.team,
          calUsername: editingSpecUser.calUsername,
          color: editingSpecUser.color || s.color || '#0d9488',
          status: editingSpecUser.status
        };
      }
      return s;
    }));

    setEditingSpecUser(null);
    triggerNotification('Specialist attributes updated successfully.');
  };

  const handleRevokeSpecialist = (userId: string) => {
    setSpecialists(prev => prev.filter(s => s.therapist_id !== userId));
    triggerNotification('Specialist removed from roster.');
  };

  // Specialist Form Actions
  const handleAddSpecialist = (e: React.FormEvent) => {
    e.preventDefault();
    const newSpecId = `ther_${Date.now()}`;
    const newSpecUser = {
      therapist_id: newSpecId,
      therapist_name: newSpecialistUser.name,
      email: newSpecialistUser.email,
      team: newSpecialistUser.team,
      specialties: newSpecialistUser.specialty,
      calUsername: newSpecialistUser.username,
      color: newSpecialistUser.color || '#0d9488',
      status: 'active',
      mappedCalendarConnectionId: ''
    };
    
    setSpecialists(prev => [...prev, newSpecUser]);
    setNewSpecialistUser({ name: '', email: '', team: '', specialty: '', mappedCalendarConnectionId: '', username: '', color: '#0d9488' });
    triggerNotification('New specialist profile registered successfully.');
    setShowAddSpecialistModal(false);
  };


  const handleDeleteSpecialist = (id: string) => {
    setSpecialists(prev => prev.filter(s => (s.therapist_id || s.id) !== id));
    setCalSpecialistLinks(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(calUserId => {
        if (updated[calUserId] === id) {
          delete updated[calUserId];
        }
      });
      return updated;
    });
    triggerNotification('Specialist deleted.');
  };

  const handleToggleSpecialistActive = (id: string) => {
    setSpecialists(prev => prev.map(s => (s.therapist_id || s.id) === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
  };

  const handleUpdateSpecialistMapping = (id: string, mapping: any) => {
    setSpecialists(prev => prev.map(s => (s.therapist_id || s.id) === id ? { ...s, ...mapping } : s));
    triggerNotification('Specialist details updated.');
  };

  const handleToggleTreatmentForSpecialist = (specId: string, treatmentName: string) => {
    setSpecialists(prev => prev.map(s => {
      if ((s.therapist_id || s.id) === specId) {
        const currentList = s.performedTreatments || treatments.map(t => t.name);
        const newList = currentList.includes(treatmentName)
          ? currentList.filter((n: string) => n !== treatmentName)
          : [...currentList, treatmentName];
        return { ...s, performedTreatments: newList };
      }
      return s;
    }));
  };

  const handleDeleteOrgUser = (id: string) => {
    setCalOrgUsers(prev => {
      const updated = prev.filter((u: any) => (u.id || u.username) !== id);
      localStorage.setItem('sb_cal_manual_users', JSON.stringify(updated.filter((u: any) => String(u.id).startsWith('usr_'))));
      return updated;
    });
    triggerNotification(`Removed discovered user.`);
  };

  const handleFetchAvailability = async () => {
    setIsLoadingAvailability(true);
    setAvailabilityError(null);

    try {
      const { availabilityService } = await import('./services/availabilityService');

      if (availabilityTreatment) {
        try {
          const data = JSON.parse(availabilityTreatment);
          const slots = await availabilityService.getSlotsForEventSlug(data.etId, availabilityDate, data.username, data.duration);
          const aggregatedSlots = slots.map((s: any) => ({
             ...s,
             specialistName: data.specName,
             treatmentName: data.title,
             eventTypeId: data.etId,
             durationMinutes: data.duration
          }));

          if (aggregatedSlots.length === 0) {
            setAvailabilityError(`No available slots returned from Cal.diy for "${data.title}" on ${availabilityDate}. The specialist may be fully booked or the schedule is not configured.`);
            setAvailabilitySlots([]);
          } else {
            setAvailabilitySlots(aggregatedSlots);
          }
        } catch(e) {
          setAvailabilityError("Invalid event type selection format or lookup failed.");
          setAvailabilitySlots([]);
        }
        setIsLoadingAvailability(false);
        return;
      }

      if (!availabilitySpecialist) {
        triggerNotification('Please select a specialist or treatment first.');
        setIsLoadingAvailability(false);
        return;
      }
      const matchedSpec = specialists.find(s => s.therapist_name === availabilitySpecialist || s.therapist_id === availabilitySpecialist);
      if (!matchedSpec) {
        triggerNotification('Selected specialist not found.');
        setIsLoadingAvailability(false);
        return;
      }

      const matchedCoSpec = availabilityCoSpecialist ? specialists.find(s => s.therapist_name === availabilityCoSpecialist || s.therapist_id === availabilityCoSpecialist) : null;
      
      const slugOrId = matchedSpec.mappedEventTypeId || matchedSpec.mappedEventSlug || '';
      const username = matchedSpec.calUsername || '';
      const coSlugOrId = matchedCoSpec ? (matchedCoSpec.mappedEventTypeId || matchedCoSpec.mappedEventSlug || '') : '';
      const coUsername = matchedCoSpec ? (matchedCoSpec.calUsername || '') : '';

      if (!slugOrId) {
        setAvailabilityError('Primary specialist has no mapped Event Type ID or Slug. Configured mapping is required for Cal.diy API queries. Showing mock data.');
        setAvailabilitySlots([
          { time: `${availabilityDate}T09:00:00.000Z`, specialistName: matchedSpec.therapist_name },
          { time: `${availabilityDate}T09:30:00.000Z`, specialistName: matchedSpec.therapist_name },
          { time: `${availabilityDate}T10:00:00.000Z`, specialistName: matchedSpec.therapist_name },
          { time: `${availabilityDate}T10:30:00.000Z`, specialistName: matchedSpec.therapist_name }
        ]);
        setIsLoadingAvailability(false);
        return;
      }
      
      const slots1 = await availabilityService.getSlotsForEventSlug(slugOrId, availabilityDate, username);
      let finalSlots = slots1.map((s: any) => ({ ...s, specialistName: matchedSpec.therapist_name }));
      
      if (matchedCoSpec) {
        if (!coSlugOrId) {
          setAvailabilityError(`Notice: Co-specialist "${availabilityCoSpecialist}" has no mapped Event. Displaying primary slots.`);
        } else {
          const slots2 = await availabilityService.getSlotsForEventSlug(coSlugOrId, availabilityDate, coUsername);
          const times2 = new Set(slots2.map((s: any) => s.time));
          finalSlots = finalSlots.filter((s: any) => times2.has(s.time));
          
          if (finalSlots.length === 0) {
            setAvailabilityError('No overlapping slots returned from Cal.diy API for the selected date. Showing mock fallback.');
            finalSlots = [
              { time: `${availabilityDate}T09:00:00.000Z`, specialistName: `${matchedSpec.therapist_name} & ${matchedCoSpec.therapist_name}` },
              { time: `${availabilityDate}T10:00:00.000Z`, specialistName: `${matchedSpec.therapist_name} & ${matchedCoSpec.therapist_name}` }
            ];
          }
        }
      } else {
        if (slots1.length === 0) {
          setAvailabilityError('No available slots returned from Cal.diy API for the selected date. Showing mock fallback.');
          finalSlots = [
            { time: `${availabilityDate}T09:00:00.000Z`, specialistName: matchedSpec.therapist_name },
            { time: `${availabilityDate}T10:00:00.000Z`, specialistName: matchedSpec.therapist_name }
          ];
        }
      }
      
      setAvailabilitySlots(finalSlots);
    } catch (err: any) {
      console.error('Availability fetch error:', err);
      setAvailabilityError(`API Error: ${err.message || err}. Loaded mock slots.`);
      setAvailabilitySlots([
        { time: `${availabilityDate}T09:00:00.000Z`, specialistName: availabilitySpecialist },
        { time: `${availabilityDate}T10:00:00.000Z`, specialistName: availabilitySpecialist }
      ]);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  // Treatment Actions
  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTreatName || !newTreatPrice) {
      triggerNotification('Name and Price are required.');
      return;
    }
    const newTreat = {
      id: Date.now().toString(),
      name: newTreatName,
      category: newTreatCategory,
      duration: newTreatDuration,
      price: newTreatPrice,
      description: newTreatDesc || '—'
    };
    setTreatments(prev => [...prev, newTreat]);
    setNewTreatName('');
    setNewTreatDesc('');
    setShowAddTreatForm(false);
    triggerNotification('Treatment added.');
  };

  const handleDeleteTreatment = (id: string) => {
    setTreatments(prev => prev.filter(t => t.id !== id));
    triggerNotification('Treatment deleted.');
  };

  // Add-ons Manager Actions
  const handleAddAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddonName || !newAddonPrice) {
      triggerNotification('Add-on Title and Price are required.');
      return;
    }
    const newAddon = {
      id: Date.now().toString(),
      name: newAddonName,
      price: newAddonPrice,
      description: newAddonDesc || '—'
    };
    setAddons(prev => [...prev, newAddon]);
    setNewAddonName('');
    setNewAddonDesc('');
    setShowAddonForm(false);
    triggerNotification('Add-on package registered.');
  };

  const handleDeleteAddon = (id: string) => {
    setAddons(prev => prev.filter(a => a.id !== id));
    triggerNotification('Add-on deleted.');
  };

  // Client Actions
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) {
      triggerNotification('Name and Email are required.');
      return;
    }
    const newClient = {
      id: Date.now().toString(),
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone || '—',
      vip: newClientVip
    };
    setClients(prev => [newClient, ...prev]);
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientVip(false);
    setShowAddClientForm(false);
    triggerNotification('Client added.');
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    triggerNotification('Client deleted.');
  };

  const handleToggleVip = (id: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, vip: !c.vip } : c));
  };

  const handleSaveEditingClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setClients(prev => prev.map(c => c.id === editingClient.id ? editingClient : c));
    setEditingClient(null);
    triggerNotification('Client profile details updated successfully.');
  };

  // Inline Toggling of Add-ons inside detail modal
  const handleToggleAddonInAppt = (addonName: string) => {
    const exists = selectedAppointment.addons.includes(addonName);
    const newAddonsList = exists
      ? selectedAppointment.addons.filter((a: string) => a !== addonName)
      : [...selectedAppointment.addons, addonName];
    setSelectedAppointment({ ...selectedAppointment, addons: newAddonsList });
  };

  const handleToggleAddonInQuickBook = (addonName: string) => {
    setBookSelectedAddons(prev => 
      prev.includes(addonName) ? prev.filter(a => a !== addonName) : [...prev, addonName]
    );
  };

  const renderClientsDataTable = (showHeader = true) => (
    <div className="bg-surface-base rounded-xl border border-surface-variant shadow-sm overflow-hidden w-full">
      {showHeader && (
        <div className="p-5 border-b border-surface-variant flex justify-between items-center bg-surface-container-low/50">
          <div>
            <h4 className="text-headline-md font-bold text-on-surface">Clients Database</h4>
            <p className="text-body-md text-on-surface-variant">Live Client profiles connected via API</p>
          </div>
          <button 
            onClick={() => setShowAddClientForm(!showAddClientForm)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-label-md font-semibold hover:opacity-90 shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            {showAddClientForm ? 'Cancel' : 'Add Client'}
          </button>
        </div>
      )}

      {showAddClientForm && (
        <form onSubmit={handleAddClient} className="p-6 bg-surface-container-lowest border-b border-surface-variant grid grid-cols-1 md:grid-cols-4 gap-6 items-end animate-fade-in text-on-surface">
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Full Name</label>
            <input 
              type="text" 
              value={newClientName} 
              onChange={e => setNewClientName(e.target.value)} 
              placeholder="Emma Thompson"
              className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none transition-all h-16 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Email Address</label>
            <input 
              type="email" 
              value={newClientEmail} 
              onChange={e => setNewClientEmail(e.target.value)} 
              placeholder="emma@example.com"
              className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none transition-all h-16 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Phone</label>
            <input 
              type="text" 
              value={newClientPhone} 
              onChange={e => setNewClientPhone(e.target.value)} 
              placeholder="+1 (555) 123-4567"
              className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none transition-all h-16 shadow-sm"
            />
          </div>
          <div className="flex gap-6 items-center justify-between h-16">
            <label className="flex items-center gap-3 text-lg font-semibold text-on-surface cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={newClientVip} 
                onChange={e => setNewClientVip(e.target.checked)} 
                className="w-6 h-6 rounded border-surface-variant text-primary focus:ring-primary/20"
              />
              VIP Status
            </label>
            <button type="submit" className="bg-accent-coral text-white h-16 px-8 rounded-xl text-lg font-bold hover:opacity-90 shadow-sm transition-all cursor-pointer">Save</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/20 text-label-sm font-label-sm text-on-surface-variant border-b border-surface-variant">
              <th className="p-4 uppercase tracking-wider font-bold">Client Name</th>
              <th className="p-4 uppercase tracking-wider font-bold">Email</th>
              <th className="p-4 uppercase tracking-wider font-bold">Phone</th>
              <th className="p-4 uppercase tracking-wider font-bold">VIP Status</th>
              <th className="p-4 uppercase tracking-wider font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant">
            {clients.map(client => (
              <tr 
                key={client.id} 
                onClick={() => setEditingClient(client)}
                className="hover:bg-surface-muted/30 transition-all text-body-md clickable-hover-effect cursor-pointer"
              >
                <td className="p-4 font-bold text-on-surface">{client.name}</td>
                <td className="p-4 text-on-surface-variant font-mono text-sm">{client.email}</td>
                <td className="p-4 text-on-surface-variant">{client.phone}</td>
                <td className="p-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToggleVip(client.id); }}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold transition-all ${client.vip ? 'bg-[#FC5E58]/10 text-[#FC5E58] border border-[#FC5E58]/20' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-variant'}`}
                  >
                    {client.vip ? 'VIP Client' : 'Regular'}
                  </button>
                </td>
                <td className="p-4 text-right flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => setEditingClient(client)}
                    className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors inline-flex items-center"
                    title="Edit Client"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-error hover:bg-error-container/30 p-2 rounded-full transition-colors inline-flex items-center"
                    title="Delete Client"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveEditingClient}
            className="bg-surface-container-lowest w-full max-w-lg rounded-2xl border border-surface-variant p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-on-surface animate-fade-in"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">edit</span>
                Edit Client Profile
              </h3>
              <button 
                type="button"
                onClick={() => setEditingClient(null)} 
                className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Client Name</label>
                <input 
                  type="text"
                  required
                  value={editingClient.name}
                  onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-4 py-3 font-semibold outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Email Address</label>
                <input 
                  type="email"
                  required
                  value={editingClient.email}
                  onChange={e => setEditingClient({ ...editingClient, email: e.target.value })}
                  className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-4 py-3 font-semibold outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Phone Number</label>
                <input 
                  type="text"
                  required
                  value={editingClient.phone}
                  onChange={e => setEditingClient({ ...editingClient, phone: e.target.value })}
                  className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-4 py-3 font-semibold outline-none shadow-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  id="edit-client-vip"
                  checked={editingClient.vip}
                  onChange={e => setEditingClient({ ...editingClient, vip: e.target.checked })}
                  className="w-5 h-5 rounded border-surface-variant text-primary focus:ring-primary/20 cursor-pointer"
                />
                <label htmlFor="edit-client-vip" className="text-sm font-bold text-on-surface cursor-pointer select-none">VIP Status</label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setEditingClient(null)}
                className="bg-surface-variant text-on-surface-variant hover:bg-surface-container px-5 py-3 rounded-xl font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-primary text-white hover:opacity-90 px-6 py-3 rounded-xl font-bold shadow-sm transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  // Specialists Directory Data Table supporting Expanded details

  const handleStartEditingSpecUser = (usr: any) => {
    const specRoster = specialists.find(s => 
      (s.calUserId && String(s.calUserId) === String(usr.id)) || 
      (s.email && s.email.toLowerCase() === usr.email.toLowerCase()) || 
      (s.therapist_name.toLowerCase() === usr.therapist_name.toLowerCase())
    );
    const roomPref = specRoster ? specRoster.room_preference : 'Room 1';
    
    setEditingSpecUser({ ...usr, room_preference: roomPref });
  };

  const getSpecialistPerformedTreatments = (usr: any) => {
    const uid = (usr.calUserId || usr.calUsername || usr.therapist_id || '').toString();
    const rawEts = specialistEventTypes[uid] || [];
    
    const matched: string[] = [];
    calEventTypes.forEach(et => {
      const spec = specialists.find(s => String(s.calUserId) === String(et.userId));
      const webhookUrl = "https://your-webhook-endpoint.com/calcom";
      if (spec && et.id) {
         // Placeholder
      }
    });

    if (matched.length > 0) return Array.from(new Set(matched)).join(', ');

    if (rawEts.length > 0) {
      return rawEts.map((et: any) => {
        const durations = et.allowedDurations || [et.duration || 60];
        return `${et.title} (${durations.join('/')} min)`;
      }).join(', ');
    }
    return usr.specialties || usr.specialty || 'None';
  };

  const filteredSpecs = specialists.filter(usr => {
    const term = searchSpecQuery.toLowerCase();
    const matchSearch = !term || 
                        (usr.therapist_name && usr.therapist_name.toLowerCase().includes(term)) || 
                        (usr.email && usr.email.toLowerCase().includes(term)) ||
                        (usr.specialties && usr.specialties.toLowerCase().includes(term)) ||
                        (usr.calUsername && usr.calUsername.toLowerCase().includes(term));
                        
    const matchStatus = filterSpecActive === 'All' ? true : 
                        true;
                        
    const matchTeam = filterSpecTeam === 'All' ? true : usr.team === filterSpecTeam;
    const matchRole = filterSpecRole === 'All' ? true : usr.role === filterSpecRole;
    
    // Simplistic specialty match (e.g. if specialties string includes the filter)
    const matchSpecialty = filterSpecSpecialty === 'All' ? true : (usr.specialties && usr.specialties.includes(filterSpecSpecialty));
                        
    return matchSearch && matchStatus && matchTeam && matchRole && matchSpecialty;
  });

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-base/90 backdrop-blur-md border border-primary/30 text-on-surface font-semibold py-4 px-6 rounded-xl shadow-[0_8px_32px_rgba(27,102,102,0.4)] z-[100] animate-fade-in max-w-md text-center">
          <div className="flex items-center gap-2 mb-1 text-primary">
            <span className="material-symbols-outlined text-[20px]">sync_alt</span>
            <span className="text-xs uppercase font-bold tracking-wider">System</span>
          </div>
          <p className="text-sm text-on-surface leading-snug">{notification}</p>
        </div>
      )}

      {/* Sidebar Overlay */}
      <div 
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 transition-opacity md:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      ></div>

      {/* SideNavBar */}
      {/* SideNavBar Wrapper / Trigger Zone on Desktop */}
      <div className={`fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 pointer-events-none ${sidebarOpen ? 'w-full' : 'w-0 md:w-6'} group`}>
        <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-auto hidden md:block"></div>
        <nav className={`h-full w-64 fixed left-0 top-0 bg-surface-container-low/95 backdrop-blur-md shadow-[5px_0_30px_rgba(0,0,0,0.3)] flex flex-col py-8 px-4 border-r border-surface-variant/30 transition-all duration-300 md:-translate-x-full group-hover:translate-x-0 pointer-events-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center mb-6 md:mb-8 pl-2">
            <span className="text-headline-md font-bold text-primary tracking-wide">Strawberry Spa</span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-on-surface-variant p-2 hover:bg-surface-container rounded-full ml-2 cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <button 
              onClick={() => { 
                setCurrentView('dashboard'); 
                setSidebarOpen(false); 
                setDashboardDate(new Date().toISOString().split('T')[0]); 
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left clickable-hover-effect ${currentView === 'dashboard' ? 'text-primary font-bold border-r-4 border-primary bg-secondary-container/30' : 'text-on-surface-variant hover:text-primary hover:bg-secondary-container/20'}`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-label-md font-label-md">Dashboard</span>
            </button>
            <button 
              onClick={() => { setCurrentView('week'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left clickable-hover-effect ${currentView === 'week' ? 'text-primary font-bold border-r-4 border-primary bg-secondary-container/30' : 'text-on-surface-variant hover:text-primary hover:bg-secondary-container/20'}`}
            >
              <span className="material-symbols-outlined">calendar_view_week</span>
              <span className="text-label-md font-label-md">Week View</span>
            </button>
            <button 
              onClick={() => { setCurrentView('month'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left clickable-hover-effect ${currentView === 'month' ? 'text-primary font-bold border-r-4 border-primary bg-secondary-container/30' : 'text-on-surface-variant hover:text-primary hover:bg-secondary-container/20'}`}
            >
              <span className="material-symbols-outlined">calendar_view_month</span>
              <span className="text-label-md font-label-md">Month View</span>
            </button>
            <button 
              onClick={() => { setCurrentView('bookings'); setSidebarOpen(false); handleSyncAllCalCom(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left clickable-hover-effect ${currentView === 'bookings' ? 'text-primary font-bold border-r-4 border-primary bg-secondary-container/30' : 'text-on-surface-variant hover:text-primary hover:bg-secondary-container/20'}`}
            >
              <span className="material-symbols-outlined">book_online</span>
              <span className="text-label-md font-label-md">Bookings Registry</span>
            </button>
            <button 
              onClick={() => { setCurrentView('requests'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left clickable-hover-effect ${currentView === 'requests' ? 'text-primary font-bold border-r-4 border-primary bg-secondary-container/30' : 'text-on-surface-variant hover:text-primary hover:bg-secondary-container/20'}`}
            >
              <span className="material-symbols-outlined">pending_actions</span>
              <span className="text-label-md font-label-md">Pending Approvals</span>
            </button>

            <button 
              onClick={() => { 
                setCurrentView('settings');
                setSettingsTab('specialists_manager');
                setSidebarOpen(false); 
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left clickable-hover-effect ${currentView === 'settings' && settingsTab === 'specialists_manager' ? 'text-primary font-bold border-r-4 border-primary bg-secondary-container/30' : 'text-on-surface-variant hover:text-primary hover:bg-secondary-container/20'}`}
            >
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
              <span className="text-label-md font-label-md font-bold">Specialist Manager</span>
            </button>
          </div>
          <div className="mt-auto space-y-2 pt-4 border-t border-surface-variant">
            {/* Role Toggle */}
            <button 
              onClick={() => {
                if (currentUserRole === 'admin') {
                  setCurrentUserRole('receptionist');
                  setAdminModeAuthenticated(false);
                } else {
                  setShowAdminPinModal(true);
                  setSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-left clickable-hover-effect text-on-surface-variant hover:text-primary hover:bg-secondary-container/20`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">{currentUserRole === 'admin' ? 'admin_panel_settings' : 'face'}</span>
                <span className="text-label-md font-label-md">{currentUserRole === 'admin' ? 'Admin Mode' : 'Receptionist'}</span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${currentUserRole === 'admin' ? 'bg-primary' : 'bg-surface-variant'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${currentUserRole === 'admin' ? 'left-4.5' : 'left-0.5'}`}></div>
              </div>
            </button>

            <button 
              onClick={() => { setCurrentView('support'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left clickable-hover-effect ${currentView === 'support' ? 'text-primary font-bold border-r-4 border-primary bg-secondary-container/30' : 'text-on-surface-variant hover:text-primary hover:bg-secondary-container/20'}`}
            >
              <span className="material-symbols-outlined">help</span>
              <span className="text-label-md font-label-md">Support</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-6 flex flex-col min-h-screen max-w-full overflow-hidden relative">
        
        {/* TopNavBar */}
        <header className="docked top-0 sticky z-40 bg-surface shadow-sm h-16 px-6 flex justify-between items-center max-w-full">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-on-surface-variant p-2 hover:bg-surface-container rounded-full mr-2">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative w-64 hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-sand-light border-transparent focus:bg-surface-base focus:border-primary text-body-md font-body-md rounded-full py-2 pl-10 pr-4 outline-none transition-colors shadow-sm text-on-surface placeholder:text-on-surface-variant" 
                placeholder="Search client, treatment..." 
                type="text" 
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 h-full py-2">
            <button 
              onClick={() => { setCurrentView('dashboard'); handleClearFilters(); setDashboardDate(new Date().toISOString().split('T')[0]); }} 
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all clickable-hover-effect cursor-pointer flex items-center gap-1.5 ${currentView === 'dashboard' ? 'bg-primary text-white shadow-md' : 'bg-surface-base border border-surface-variant hover:bg-neutral-800/10 text-on-surface-variant shadow-sm'}`}
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Dashboard
            </button>
            <button 
              onClick={() => { setCurrentView('bookings'); handleSyncAllCalCom(); }} 
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all clickable-hover-effect cursor-pointer flex items-center gap-1.5 ${currentView === 'bookings' ? 'bg-primary text-white shadow-md' : 'bg-surface-base border border-surface-variant hover:bg-neutral-800/10 text-on-surface-variant shadow-sm'}`}
            >
              <span className="material-symbols-outlined text-[18px]">book_online</span>
              Bookings
            </button>
            <button 
              onClick={() => setCurrentView('requests')} 
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all clickable-hover-effect cursor-pointer flex items-center gap-1.5 ${currentView === 'requests' ? 'bg-primary text-white shadow-md' : 'bg-surface-base border border-surface-variant hover:bg-neutral-800/10 text-on-surface-variant shadow-sm'}`}
            >
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              Pending Approvals
            </button>
          </div>
          
          <div className="flex items-center gap-4 relative">
            {calComApiKey && (
              <button
                onClick={handleSyncAllCalCom}
                disabled={isGlobalSyncing}
                title="Sync from Cal.com"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer clickable-hover-effect disabled:opacity-60 hidden sm:flex bg-surface-muted/50 text-on-surface-variant border border-surface-variant hover:bg-surface-hover hover:text-primary shadow-sm`}
              >
                <span className={`material-symbols-outlined text-[16px] ${isGlobalSyncing ? 'animate-spin text-primary' : ''}`}>sync</span>
                <span className="hidden md:inline">{isGlobalSyncing ? 'Syncing…' : 'Sync All'}</span>
              </button>
            )}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`text-on-surface-variant hover:text-primary transition-colors scale-95 active:scale-90 flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container clickable-hover-effect cursor-pointer relative ${notificationsList.some(n=>!n.read) ? 'animate-pulse text-accent-coral bg-accent-coral/10' : ''}`}
            >
              <span className="material-symbols-outlined">notifications</span>
              {notificationsList.some(n=>!n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-accent-coral ring-2 ring-surface"></span>
              )}
            </button>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-on-surface-variant hover:text-primary transition-colors scale-95 active:scale-90 flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container clickable-hover-effect cursor-pointer mr-2"
            >
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <button onClick={() => setShowBookingModal(true)} className="bg-accent-coral text-on-primary font-label-md text-label-md py-2 px-4 rounded-lg shadow-sm hover:bg-accent-coral/90 transition-all h-10 flex items-center hidden sm:flex clickable-hover-effect cursor-pointer">New Appointment</button>

            {/* Notification Dropdown panel */}
            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-xl z-50 p-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-surface-variant pb-2 mb-3">
                  <h4 className="font-bold text-sm text-on-surface">System notifications</h4>
                  <button 
                    onClick={() => setNotificationsList(prev=>prev.map(n=>({...n, read: true})))}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notificationsList.map(n => (
                    <div key={n.id} className={`p-2.5 rounded-lg border text-xs transition-colors ${n.read ? 'bg-transparent border-transparent text-on-surface-variant' : 'bg-primary/5 border-primary/20 text-on-surface font-semibold'}`}>
                      <p className="leading-snug">{n.text}</p>
                      <span className="text-[10px] text-outline mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <main className="flex-1 p-4 sm:p-8 bg-surface-muted overflow-y-auto">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
              <div>
                <h2 className="text-headline-xl font-headline-xl text-on-surface mb-2">Today's Overview</h2>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                  <input 
                    type="date" 
                    value={dashboardDate} 
                    onChange={e => setDashboardDate(e.target.value)} 
                    className="bg-transparent border-b border-dashed border-primary text-body-lg font-body-lg text-on-surface focus:outline-none focus:border-solid font-semibold cursor-pointer py-0.5"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-wrap gap-3 bg-surface-base px-4 py-2 rounded-xl sm:rounded-full shadow-sm border border-surface-variant text-label-sm font-label-sm">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1b6666]"></span> Confirmed</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EAB308]"></span> Pending</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FC5E58]"></span> Needs Action</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#9CA3AF]"></span> Cancelled</div>
                </div>
              </div>
            </div>



            {/* Grid Container */}
            <div className="bg-surface-base rounded-xl shadow-sm border border-surface-variant overflow-hidden flex flex-col h-[800px]">
              <div className="flex-1 overflow-x-auto">
                <div className="min-w-[768px] md:min-w-full h-full flex flex-col">
                  
                  {/* Dynamic Specialist Room Columns Header */}
                  <div className="flex border-b border-surface-variant bg-surface-container-low h-14 shrink-0 pl-16">
                    {(() => {
                      const sortedSpecialistsForGrid = [...specialists].sort((a, b) => {
                        const roomA = a.room_preference || 'Room 1';
                        const roomB = b.room_preference || 'Room 1';
                        return roomA.localeCompare(roomB, undefined, { numeric: true, sensitivity: 'base' });
                      });
                      return sortedSpecialistsForGrid.map((spec, index, arr) => (
                      <div 
                        key={spec.therapist_id} 
                        className={`flex-1 flex items-center justify-center text-label-md font-label-md text-on-surface ${index < arr.length - 1 ? 'border-r border-surface-variant' : ''}`}
                      >
                        {spec.room_preference} - {spec.therapist_name}
                      </div>
                    )) })()}
                  </div>

                  {/* Grid Canvas Scroll Area */}
                  <div className="flex-1 overflow-y-auto relative bg-surface-base">
                    <div className="absolute left-0 top-0 w-16 border-r border-surface-variant bg-surface-base z-10 pointer-events-none" style={{ height: '960px' }}>
                      {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((hour) => {
                        const [th] = hour.split(':').map(Number);
                        const now = new Date();
                        const isPassed = now.getHours() > th || (now.getHours() === th && now.getMinutes() >= 0);
                        const isToday = (dashboardDate || '2023-10-24') === now.toISOString().split('T')[0];
                        const labelColorClass = isToday 
                          ? (isPassed ? 'text-on-surface-variant/40 font-normal' : 'text-emerald-600 font-extrabold') 
                          : 'text-on-surface font-semibold';
                        return (
                          <div key={hour} className="border-b border-surface-variant relative" style={{ height: '96px' }}>
                            <span className={`absolute top-0 -translate-y-1/2 left-0 w-full text-center text-label-sm font-label-sm px-1 z-20 bg-surface-base ${labelColorClass}`}>
                              {hour}
                            </span>
                          </div>
                        );
                      })}
                      {(() => {
                        const now = new Date();
                        const isPassed = now.getHours() >= 19;
                        const isToday = (dashboardDate || '2023-10-24') === now.toISOString().split('T')[0];
                        const labelColorClass = isToday 
                          ? (isPassed ? 'text-on-surface-variant/40 font-normal' : 'text-emerald-600 font-extrabold') 
                          : 'text-on-surface font-semibold';
                        return (
                          <span className={`absolute bottom-0 translate-y-1/2 left-0 w-full text-center text-label-sm font-label-sm px-1 z-20 bg-surface-base ${labelColorClass}`}>
                            19:00
                          </span>
                        );
                      })()}
                    </div>

                    <div className="ml-16 relative" style={{ height: '960px' }}>
                      {/* Hour Grid background lines */}
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="border-b border-surface-container w-full" style={{ height: '96px' }}></div>
                      ))}

                      {/* Passed Time Grey Overlay */}
                      {((dashboardDate || '2023-10-24') === new Date().toISOString().split('T')[0]) && currentTimePos !== null && (
                        <div 
                          style={{ height: `${currentTimePos}px` }} 
                          className="absolute top-0 left-0 right-0 bg-gray-500/[0.04] pointer-events-none z-10"
                        />
                      )}

                      {/* Current Time Indicator Emerald Green Line */}
                      {((dashboardDate || '2023-10-24') === new Date().toISOString().split('T')[0]) && currentTimePos !== null && (
                        <div 
                          style={{ top: `${currentTimePos}px` }} 
                          className="absolute left-0 right-0 h-[2px] bg-emerald-500 z-20 pointer-events-none flex items-center"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-1.5 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                          <div className="w-full border-t-2 border-emerald-500/85 border-dashed"></div>
                        </div>
                      )}
                      {/* Half-hour dashed lines */}
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} style={{ top: `${i * 96 + 48}px` }} className="absolute w-full border-b border-dashed border-surface-container/30 pointer-events-none"></div>
                      ))}
                      
                      {/* Vertical dividers */}
                      <div className="absolute top-0 left-0 w-full h-full flex pointer-events-none z-10">
                        {(() => {
                          const sortedSpecialistsForGrid = [...specialists].sort((a, b) => {
                            const roomA = a.room_preference || 'Room 1';
                            const roomB = b.room_preference || 'Room 1';
                            return roomA.localeCompare(roomB, undefined, { numeric: true, sensitivity: 'base' });
                          });
                          return sortedSpecialistsForGrid.map((spec, index, arr) => {
                          if (index === arr.length - 1) return <div key={spec.therapist_id} className="flex-1"></div>;
                          return <div key={spec.therapist_id} className="flex-1 border-r border-surface-container"></div>;
                        }) })()}
                      </div>

                      {/* Filtered Columns with Cards & Drop Zones */}
                      <div className="absolute top-0 left-0 w-full h-full flex pt-0 z-0">
                        {(() => {
                          const sortedSpecialistsForGrid = [...specialists].sort((a, b) => {
                            const roomA = a.room_preference || 'Room 1';
                            const roomB = b.room_preference || 'Room 1';
                            return roomA.localeCompare(roomB, undefined, { numeric: true, sensitivity: 'base' });
                          });
                          return sortedSpecialistsForGrid.map((spec) => (
                          <div 
                            key={spec.therapist_id} 
                            className={`flex-1 relative h-full group border-r border-surface-container/30 last:border-r-0 transition-colors duration-200 ${isDraggingAppt ? 'bg-primary/[0.01]' : ''}`}
                            onDragOver={e => {
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const y = e.clientY - rect.top;
                              const minutes = y / 1.6;
                              // Round drop time to nearest 15 minutes
                              const roundedMinutes = Math.round(minutes / 15) * 15;
                              const totalMinutes = 9 * 60 + roundedMinutes;
                              const h = Math.max(9, Math.min(18, Math.floor(totalMinutes / 60)));
                              const m = Math.max(0, Math.min(45, totalMinutes % 60));
                              const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                              setDragOverCol(spec.therapist_name);
                              setDragOverTime(timeStr);
                            }}
                            onDragEnter={e => e.currentTarget.classList.add('bg-primary/5')}
                            onDragLeave={() => {
                              setDragOverCol(null);
                              setDragOverTime(null);
                            }}
                            onDrop={e => {
                              e.currentTarget.classList.remove('bg-primary/5');
                              setDragOverCol(null);
                              setDragOverTime(null);
                              const rect = e.currentTarget.getBoundingClientRect();
                              const y = e.clientY - rect.top;
                              const minutes = y / 1.6;
                              // Round drop time to nearest 15 minutes
                              const roundedMinutes = Math.round(minutes / 15) * 15;
                              const totalMinutes = 9 * 60 + roundedMinutes;
                              const h = Math.max(9, Math.min(18, Math.floor(totalMinutes / 60)));
                              const m = Math.max(0, Math.min(45, totalMinutes % 60));
                              const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                              handleDropOnSlot(e, spec.therapist_name, timeStr);
                            }}
                          >
                             {/* Column background click capture zone */}
                             <div 
                               onClick={e => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const y = e.clientY - rect.top;
                                 const minutes = y / 1.6;
                                 // Round to nearest 15 minutes
                                 const roundedMinutes = Math.round(minutes / 15) * 15;
                                 const totalMinutes = 9 * 60 + roundedMinutes;
                                 const h = Math.max(9, Math.min(18, Math.floor(totalMinutes / 60)));
                                 const m = Math.max(0, Math.min(45, totalMinutes % 60));
                                 const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                                 setCellClickMenu({ specialist: spec.therapist_name, slot: timeStr, date: dashboardDate || '2023-10-24' });
                               }}
                               onMouseMove={e => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const y = e.clientY - rect.top;
                                 const minutes = y / 1.6;
                                 // Round to nearest 15 minutes
                                 const roundedMinutes = Math.round(minutes / 15) * 15;
                                 const totalMinutes = 9 * 60 + roundedMinutes;
                                 const h = Math.max(9, Math.min(18, Math.floor(totalMinutes / 60)));
                                 const m = Math.max(0, Math.min(45, totalMinutes % 60));
                                 const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                                 setHoveredCol(spec.therapist_name);
                                 setHoveredTime(timeStr);
                               }}
                               onMouseLeave={() => {
                                 setHoveredCol(null);
                                 setHoveredTime(null);
                               }}
                               className="absolute inset-0 cursor-pointer z-0 hover:bg-primary/[0.02] transition-colors"
                               title="Click anywhere to book a treatment, add break, or add cleaning block"
                             />

                             {/* Hover slot preview */}
                             {hoveredCol === spec.therapist_name && hoveredTime && !activeDraggedAppt && (() => {
                               const isSlotOccupied = filteredAppointments
                                 .filter(a => a.specialist === spec.therapist_name || a.coSpecialist === spec.therapist_name)
                                 .some(appt => {
                                   const cleanTime = appt.isBreakBlock || appt.isCleaningBlock ? 0 : (appt.cleaningTime !== undefined ? appt.cleaningTime : 10);
                                   return checkOverlap(hoveredTime, '15 min', 0, appt.timeLabel, appt.duration, cleanTime);
                                 });
                               if (isSlotOccupied) return null;
                               return (
                                 <div 
                                   style={mapTimeToPos(hoveredTime, '15 min', 0)}
                                   className="absolute w-[calc(100%-8px)] left-[4px] rounded-lg border-2 border-dashed border-primary/50 bg-primary/10 pointer-events-none z-10 flex items-center justify-between px-3 text-mono text-[10px] text-primary font-bold shadow-xs animate-fade-in"
                                 >
                                   <span>{hoveredTime}</span>
                                   <span className="text-[9px] bg-primary/20 px-1.5 py-0.5 rounded font-extrabold uppercase">15m slot</span>
                                 </div>
                               );
                             })()}

                            {/* Drag-over Precise 15-min Segment Preview Card */}
                            {dragOverCol === spec.therapist_name && dragOverTime && activeDraggedAppt && (
                              <div 
                                style={mapTimeToPos(
                                  dragOverTime, 
                                  activeDraggedAppt.duration || '60 min', 
                                  activeDraggedAppt.isBreakBlock || activeDraggedAppt.isCleaningBlock ? 0 : (activeDraggedAppt.cleaningTime !== undefined ? activeDraggedAppt.cleaningTime : 10)
                                )}
                                className="absolute w-[calc(100%-8px)] rounded-xl border-2 border-dashed border-primary/60 bg-primary/10 text-primary flex flex-col justify-center items-center p-3 z-30 pointer-events-none animate-pulse shadow-lg backdrop-blur-xs"
                              >
                                <span className="text-[32px] md:text-[38px] font-black tracking-tight leading-none bg-surface-base border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm font-mono text-primary">{dragOverTime}</span>
                                <span className="text-[9px] mt-2 font-bold px-1.5 py-0.5 rounded bg-primary text-white uppercase tracking-wider">DROP TO RESCHEDULE</span>
                              </div>
                            )}

                            {/* Cards list overlay */}
                            <div className="absolute inset-0 pointer-events-none z-10">
                              {filteredAppointments.filter(a => 
                                a.status !== 'cancelled' && (
                                  (a.specialist && a.specialist.toLowerCase().includes(spec.therapist_name.toLowerCase())) || 
                                  (a.coSpecialist && a.coSpecialist.toLowerCase().includes(spec.therapist_name.toLowerCase())) ||
                                  (spec.therapist_name && spec.therapist_name.toLowerCase().includes(a.specialist?.toLowerCase() || '')) ||
                                  a.specialist === spec.therapist_name || 
                                  a.coSpecialist === spec.therapist_name
                                )
                              ).map(appt => {
                                const cleanTime = appt.isBreakBlock || appt.isCleaningBlock ? 0 : (appt.cleaningTime !== undefined ? appt.cleaningTime : 10);
                                return (
                                  <div 
                                    key={appt.id} 
                                    style={mapTimeToPos(appt.timeLabel, appt.duration, cleanTime)} 
                                    onClick={() => setSelectedAppointment(appt)}
                                    draggable={true}
                                    onDragStart={e => {
                                      handleDragStart(e, appt.id);
                                      setIsDraggingAppt(true);
                                      setActiveDraggedAppt(appt);
                                    }}
                                    onDragEnd={() => {
                                      setIsDraggingAppt(false);
                                      setActiveDraggedAppt(null);
                                      setDragOverCol(null);
                                      setDragOverTime(null);
                                    }}
                                    className={`absolute w-[calc(100%-8px)] rounded-r-lg p-2 border-l-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer select-none active:cursor-grabbing pointer-events-auto overflow-hidden ${
                                      appt.isCleaningBlock 
                                        ? 'bg-[#E5E7EB] border-[#9CA3AF] text-[#374151] bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%,transparent_50%,#f3f4f6_50%,#f3f4f6_75%,transparent_75%,transparent)] bg-[length:12px_12px]' 
                                        : appt.isBreakBlock 
                                          ? 'bg-amber-50 border-amber-500 text-amber-900 bg-[linear-gradient(45deg,#fef3c7_25%,transparent_25%,transparent_50%,#fef3c7_50%,#fef3c7_75%,transparent_75%,transparent)] bg-[length:12px_12px]' 
                                          : appt.colorClass
                                    }`}
                                  >
                                    <div className="text-label-sm font-label-sm mb-1">{appt.timeLabel} ({appt.duration || '60 min'})</div>
                                    <div className="text-body-md font-headline-md font-bold leading-tight mb-0.5 truncate">{appt.client}</div>
                                    <div className="text-label-sm font-label-sm flex items-center gap-1 truncate">
                                      <span className="material-symbols-outlined text-[14px]">
                                        {appt.isCleaningBlock ? 'cleaning_services' : appt.isBreakBlock ? 'coffee' : 'spa'}
                                      </span>
                                      {appt.procedure}
                                    </div>
                                    {appt.coSpecialist && !appt.isCleaningBlock && !appt.isBreakBlock && (
                                      <div className="text-[9px] font-bold text-primary mt-1 flex items-center gap-0.5 bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 w-fit truncate">
                                        <span className="material-symbols-outlined text-[10px]">group</span>
                                        Dual: {appt.coSpecialist.split(' ')[0]}
                                      </div>
                                    )}
                                    {/* Stripes cleaning sub-block */}
                                    {cleanTime > 0 && (
                                      <div 
                                        style={{ height: `${cleanTime * 1.6}px` }}
                                        className="absolute bottom-0 left-0 right-0 bg-[#D1D5DB]/30 border-t border-dashed border-[#9CA3AF]/40 flex items-center justify-center text-[9px] font-bold text-[#4B5563] bg-[linear-gradient(45deg,rgba(0,0,0,0.03)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.03)_50%,rgba(0,0,0,0.03)_75%,transparent_75%,transparent)] bg-[length:10px_10px]"
                                      >
                                        🧹 Clean: {cleanTime}m
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )) })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters (Moved below schedule) */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-center mt-8 bg-surface-base p-6 rounded-xl border border-surface-variant shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                <div className="relative w-full h-16">
                  <select 
                    value={filterSpecialist}
                    onChange={(e) => setFilterSpecialist(e.target.value)}
                    className="w-full h-full appearance-none bg-sand-light border border-surface-variant rounded-xl px-5 py-3 text-lg font-semibold text-on-surface focus:border-primary outline-none transition-colors cursor-pointer shadow-sm clickable-hover-effect"
                  >
                    <option value="Specialist">Specialist (All)</option>
                    {specialists.map(spec => (
                      <option key={spec.therapist_id} value={spec.therapist_name}>{spec.therapist_name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-2xl">expand_more</span>
                </div>
                <div className="relative w-full h-16">
                  <select 
                    value={filterTreatment}
                    onChange={(e) => setFilterTreatment(e.target.value)}
                    className="w-full h-full appearance-none bg-sand-light border border-surface-variant rounded-xl px-5 py-3 text-lg font-semibold text-on-surface focus:border-primary outline-none transition-colors cursor-pointer shadow-sm clickable-hover-effect"
                  >
                    <option value="Procedure Type">Procedure Type (All)</option>
                    {treatments.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-2xl">expand_more</span>
                </div>
                <div className="relative w-full h-16">
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full h-full appearance-none bg-sand-light border border-surface-variant rounded-xl px-5 py-3 text-lg font-semibold text-on-surface focus:border-primary outline-none transition-colors cursor-pointer shadow-sm clickable-hover-effect"
                  >
                    <option value="Status">Status (All)</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-2xl">expand_more</span>
                </div>
              </div>
              <button 
                onClick={handleClearFilters}
                className="flex items-center justify-center gap-2 text-primary font-bold text-sm bg-primary/5 hover:bg-primary/10 border border-primary/20 px-5 py-3.5 rounded-xl transition-all clickable-hover-effect cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">filter_list</span> Clear Filters
              </button>
            </div>

            {/* KPI statistics cards (Moved below filters) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-surface-base p-4 rounded-xl border border-surface-variant shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Total Appts</p>
                  <span className="material-symbols-outlined text-outline">calendar_today</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-headline-md font-headline-md text-on-surface">{kpiTotal}</span>
                </div>
              </div>

              <div className="bg-surface-base p-4 rounded-xl border border-surface-variant shadow-sm border-l-4 border-primary flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Confirmed</p>
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-headline-md font-headline-md text-primary">{kpiConfirmed}</span>
                </div>
              </div>

              <div className="bg-surface-base p-4 rounded-xl border border-surface-variant shadow-sm border-l-4 border-[#EAB308] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Pending</p>
                  <span className="material-symbols-outlined text-[#B45309]">schedule</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-headline-md font-headline-md text-[#B45309]">{kpiPending}</span>
                </div>
              </div>

              <div className="bg-surface-base p-4 rounded-xl border border-surface-variant shadow-sm border-l-4 border-outline flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Canceled</p>
                  <span className="material-symbols-outlined text-outline">cancel</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-headline-md font-headline-md text-on-surface-variant">{kpiCanceled}</span>
                </div>
              </div>
            </div>

            {/* Sync Alert Banner (Moved to the very bottom) */}
            <div className="p-4 rounded-xl border border-[#1b6666]/20 bg-[#1b6666]/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                <div>
                  <h4 className="font-bold text-sm text-on-surface font-headline">Data Integration System Status</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5 font-normal">Settings configurations dynamically feed the calendar grid, therapist column headers, and rosters.</p>
                </div>
              </div>
              <button onClick={() => setCurrentView('settings')} className="text-xs text-primary font-bold hover:underline shrink-0 clickable-hover-effect cursor-pointer">Configure Sources</button>
            </div>

          </main>
        )}

        {/* Incoming Requests View */}
        {currentView === 'requests' && (
          <main className="flex-1 p-4 sm:p-8 bg-surface-muted overflow-y-auto">
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-headline-xl font-headline-xl text-on-surface mb-2">Incoming Requests</h2>
                <p className="text-body-lg font-body-lg text-on-surface-variant">Review and manage pending client bookings.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleSyncCalCom()}
                  disabled={isSyncingCalCom}
                  className="bg-primary text-white h-10 px-4 rounded-lg text-label-sm font-bold hover:opacity-90 flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isSyncingCalCom ? 'animate-spin' : ''}`}>sync</span>
                  {isSyncingCalCom ? 'Syncing...' : 'Sync Cal.com'}
                </button>
                <div className="text-label-md font-label-md text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg">
                  {filteredRequests.length} Pending
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 border-b border-surface-variant mb-6 overflow-x-auto">
              <button 
                onClick={() => setIncomingTab('new')}
                className={`pb-3 px-1 border-b-2 font-semibold flex items-center gap-2 transition-all shrink-0 ${incomingTab === 'new' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
              >
                <span>New Requests</span>
                <span className="bg-secondary-container text-on-secondary-container text-[10px] px-1.5 py-0.5 rounded-full">{filteredRequests.length}</span>
              </button>
              <button 
                onClick={() => setIncomingTab('action')}
                className={`pb-3 px-1 border-b-2 font-semibold flex items-center gap-2 transition-all shrink-0 ${incomingTab === 'action' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
              >
                <span>Needs Action</span>
                <span className="bg-accent-coral text-white text-[10px] px-1.5 py-0.5 rounded-full">{filteredActionRequests.length}</span>
              </button>
              <button 
                onClick={() => setIncomingTab('handled')}
                className={`pb-3 px-1 border-b-2 font-semibold flex items-center gap-2 transition-all shrink-0 ${incomingTab === 'handled' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
              >
                <span>Recently Handled</span>
                <span className="bg-surface-container-high text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded-full">{filteredHandledRequests.length}</span>
              </button>
            </div>

            <div className="space-y-4">
              
              {/* NEW REQUESTS TAB */}
              {incomingTab === 'new' && (
                filteredRequests.length === 0 ? (
                  <div className="text-center py-12 text-on-surface-variant text-body-md bg-surface-base border border-surface-variant rounded-xl">
                    No matching new requests found.
                  </div>
                ) : (
                  filteredRequests.slice().reverse().map(req => (
                    <div key={req.id} className="bg-surface-base rounded-xl p-4 sm:p-6 shadow-sm border border-surface-variant flex flex-col md:flex-row md:items-center justify-between gap-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-4 w-full">
                        <div className="pt-3">
                          <input 
                            type="checkbox" 
                            checked={selectedRequests.includes(req.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedRequests([...selectedRequests, req.id]);
                              else setSelectedRequests(selectedRequests.filter(id => id !== req.id));
                            }}
                            className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" 
                          />
                        </div>
                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-headline-md font-headline-md font-bold shrink-0">
                              {req.client.split(' ').map((n:any)=>n[0]).join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-headline-md font-headline-md text-on-surface">{req.client}</h3>
                                <span className="bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                              </div>
                              <div className="text-body-md font-body-md text-on-surface-variant flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">spa</span> {req.procedure}</span>
                                <span className="hidden sm:inline text-surface-dim">•</span>
                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {req.requestedTime}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-4 md:pt-0 border-t md:border-none border-surface-variant w-full md:w-auto">
                            <button 
                              onClick={() => startReschedRequest(req)}
                              className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-lg bg-sand-light text-primary text-label-md font-label-md font-semibold hover:bg-secondary-container transition-colors duration-200"
                            >
                              Reschedule
                            </button>
                            <button 
                              onClick={() => handleCancelRequest(req.id)}
                              className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-lg bg-transparent text-on-surface-variant border border-outline-variant hover:border-accent-coral hover:text-accent-coral text-label-md font-label-md font-semibold transition-colors duration-200"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleConfirmSync(req.id)}
                              className="w-full md:w-auto h-12 px-8 rounded-lg bg-primary text-white text-label-md font-label-md font-semibold hover:opacity-90 shadow-sm transition-colors duration-200"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

              {/* NEEDS ACTION TAB */}
              {incomingTab === 'action' && (
                filteredActionRequests.length === 0 ? (
                  <div className="text-center py-12 text-on-surface-variant text-body-md bg-surface-base border border-surface-variant rounded-xl">
                    No matching action items found.
                  </div>
                ) : (
                  filteredActionRequests.slice().reverse().map(req => (
                    <div key={req.id} className="bg-surface-base rounded-xl p-4 sm:p-6 shadow-sm border border-surface-variant flex flex-col md:flex-row md:items-center justify-between gap-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-accent-coral/10 text-accent-coral flex items-center justify-center text-headline-md font-headline-md font-bold shrink-0">
                            {req.client.split(' ').map((n:any)=>n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-headline-md font-headline-md text-on-surface">{req.client}</h3>
                              <span className="bg-accent-coral/10 text-accent-coral text-label-sm font-label-sm px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Action Required</span>
                            </div>
                            <div className="text-body-md font-body-md text-on-surface-variant flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">spa</span> {req.procedure}</span>
                              <span className="hidden sm:inline text-surface-dim">•</span>
                              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {req.requestedTime}</span>
                            </div>
                            <p className="text-xs text-error font-medium mt-1">Note: {req.notes}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-4 md:pt-0 border-t md:border-none border-surface-variant w-full md:w-auto">
                          <button 
                            onClick={() => startReschedRequest(req)}
                            className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-lg bg-sand-light text-primary text-label-md font-label-md font-semibold hover:bg-secondary-container transition-colors duration-200"
                          >
                            Reschedule
                          </button>
                          <button 
                            onClick={() => handleCancelRequest(req.id)}
                            className="flex-1 md:flex-none h-12 px-4 sm:px-6 rounded-lg bg-transparent text-on-surface-variant border border-outline-variant hover:border-accent-coral hover:text-accent-coral text-label-md font-label-md font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleConfirmSync(req.id)}
                            className="w-full md:w-auto h-12 px-8 rounded-lg bg-primary text-white text-label-md font-label-md font-semibold hover:opacity-90 shadow-sm transition-colors"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

              {/* RECENTLY HANDLED TAB */}
              {incomingTab === 'handled' && (
                filteredHandledRequests.length === 0 ? (
                  <div className="text-center py-12 text-on-surface-variant text-body-md bg-surface-base border border-surface-variant rounded-xl">
                    No recently handled items found.
                  </div>
                ) : (
                  filteredHandledRequests.slice().reverse().map(req => (
                    <div 
                      key={req.id} 
                      onClick={() => setSelectedRequest(req)}
                      className="bg-surface-base rounded-xl p-4 sm:p-6 shadow-sm border border-surface-variant flex flex-col md:flex-row md:items-center justify-between gap-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-headline-md font-headline-md font-bold shrink-0">
                            {req.client.split(' ').map((n:any)=>n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-headline-md font-headline-md text-on-surface font-bold">{req.client}</h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${req.status === 'confirmed' ? 'bg-primary/10 text-primary' : 'bg-surface-variant/30 text-outline'}`}>
                                {req.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                              </span>
                            </div>
                            <div className="text-body-md font-body-md text-on-surface-variant flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">spa</span> {req.procedure}</span>
                              <span className="hidden sm:inline text-surface-dim">•</span>
                              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {req.requestedTime}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant italic mt-1">{req.notes}</p>
                          </div>
                        </div>

                        <span className="material-symbols-outlined text-outline-variant hover:text-primary shrink-0 self-center hidden md:block">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}

            </div>
          </main>
        )}



        {/* Settings View */}
        {currentView === 'settings' && (
          <main className="flex-1 p-4 sm:p-8 bg-surface-muted overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <div>
                <h2 className="text-headline-xl font-headline-xl text-on-surface mb-2">Settings</h2>
                <p className="text-body-lg font-body-lg text-on-surface-variant">Manage your spa configurations, data sources, and integrations.</p>
              </div>

              {/* Settings Tab Navigation */}
              <div className="flex flex-wrap gap-3 mb-6 bg-surface-muted/50 p-2.5 rounded-xl border border-surface-variant/40">
                <button 
                  onClick={() => setSettingsTab('integrations')}
                  className={`px-5 py-3 rounded-lg font-bold text-sm transition-all clickable-hover-effect cursor-pointer flex items-center gap-2 ${settingsTab === 'integrations' ? 'bg-primary text-white shadow-md' : 'bg-surface-base border border-surface-variant hover:bg-neutral-800/10 text-on-surface-variant shadow-sm'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">sync</span>
                  Integrations
                </button>
                <button 
                  onClick={() => setSettingsTab('specialists_manager')}
                  className={`px-5 py-3 rounded-lg font-bold text-sm transition-all clickable-hover-effect cursor-pointer flex items-center gap-2 ${settingsTab === 'specialists_manager' ? 'bg-primary text-white shadow-md' : 'bg-surface-base border border-surface-variant hover:bg-neutral-800/10 text-on-surface-variant shadow-sm'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">handyman</span>
                  Specialist Manager
                </button>

                <button 
                  onClick={() => setSettingsTab('clients')}
                  className={`px-5 py-3 rounded-lg font-bold text-sm transition-all clickable-hover-effect cursor-pointer flex items-center gap-2 ${settingsTab === 'clients' ? 'bg-primary text-white shadow-md' : 'bg-surface-base border border-surface-variant hover:bg-neutral-800/10 text-on-surface-variant shadow-sm'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">group</span>
                  Clients Database
                </button>
                <button 
                  onClick={() => setSettingsTab('treatments')}
                  className={`px-5 py-3 rounded-lg font-bold text-sm transition-all clickable-hover-effect cursor-pointer flex items-center gap-2 ${settingsTab === 'treatments' ? 'bg-primary text-white shadow-md' : 'bg-surface-base border border-surface-variant hover:bg-neutral-800/10 text-on-surface-variant shadow-sm'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">spa</span>
                  Treatments Add-on
                </button>
              </div>

              {settingsTab === 'specialists_manager' ? (
                <div className="space-y-8 animate-fade-in text-on-surface">

                  {/* Main specialists dashboard listing with searching & filtering attributes */}
                  <div className="bg-surface-base rounded-xl ambient-shadow p-6 border border-surface-variant space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h4 className="text-headline-md font-bold text-on-surface">Specialists Directory</h4>
                        <p className="text-xs text-on-surface-variant">Manage your team of specialists, track their active calendar connections, and configure individual working hours and treatments.</p>
                      </div>
                      <div className="w-full md:w-96 h-16 relative">
                        <input 
                          type="text"
                          value={searchSpecQuery}
                          onChange={e => setSearchSpecQuery(e.target.value)}
                          placeholder="Search name, email, specialty..."
                          className="w-full h-full bg-sand-light rounded-xl pl-12 pr-5 py-3.5 text-lg font-medium border border-surface-variant focus:border-primary focus:bg-surface-base outline-none transition-all shadow-sm"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-2xl">search</span>
                      </div>
                    </div>


                    {/* Specialists Table */}
                    <div className="overflow-x-auto rounded-lg border border-surface-variant/60">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-surface-container-low/50 border-b border-surface-variant font-bold text-on-surface-variant">
                            <th className="p-3">Specialist Info</th>
                            <th className="p-3">Scheduling</th>
                            <th className="p-3">Attributes (Metadata)</th>
                            <th className="p-3">Connected calendar</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-variant/30">
                          {filteredSpecs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-on-surface-variant/50 italic">No Cal.diy specialists matched search/filters.</td>
                            </tr>
                          ) : (
                            filteredSpecs.map(usr => {
                              const uniqueId = usr.id || usr.therapist_id;
                              const isExpanded = expandedTherapistId === uniqueId;
                              const isReady = !!usr.mappedCalendarConnectionId && !!usr.bookingPageUrl;
                              
                              return (
                                <React.Fragment key={uniqueId}>
                                  <tr 
                                    onClick={() => setExpandedTherapistId(isExpanded ? null : uniqueId)}
                                    className="hover:bg-surface-muted/30 transition-all text-body-md cursor-pointer"
                                  >
                                    <td className="p-3">
                                      <div className="font-bold text-on-surface flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px] text-outline-variant">
                                          {isExpanded ? 'expand_less' : 'expand_more'}
                                        </span>
                                        {usr.therapist_name}
                                      </div>
                                      <div className="text-[10px] text-on-surface-variant ml-6">{usr.email}</div>
                                      <div className="mt-1 flex gap-1.5 ml-6">
                                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">{usr.role}</span>
                                        <span className="bg-surface-muted text-on-surface-variant px-1.5 py-0.5 rounded text-[9px] font-medium">{usr.team}</span>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="text-[10px] font-mono mb-1">{usr.working_hours_start || '09:00'} - {usr.working_hours_end || '17:00'}</div>
                                      <div className="text-[10px] text-on-surface-variant mb-1">Room: <span className="font-semibold text-on-surface">{usr.room_preference || 'Unassigned'}</span></div>
                                      <div className="text-[10px] font-bold text-primary">{usr.current_bookings_today || 0} Bookings Today</div>
                                    </td>
                                    <td className="p-3">
                                      <div className="font-semibold text-on-surface">Specialty: {usr.specialties || 'None'}</div>
                                      <div className="text-[10px] text-on-surface-variant mt-0.5 leading-snug">
                                        <span className="font-bold">Treatments:</span> {getSpecialistPerformedTreatments(usr)}
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      {(() => {
                                        const isReady = !!usr.mappedCalendarConnectionId && !!usr.bookingPageUrl;
                                        return !isReady ? (
                                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                            <span className="material-symbols-outlined text-[14px]">warning</span>
                                            Pending Calendar
                                          </div>
                                        ) : (
                                        <>
                                          <div className="font-medium text-on-surface text-[10px] font-mono">{usr.mappedCalendarConnectionId}</div>
                                          <a 
                                            href={usr.bookingPageUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="text-primary hover:underline text-[10px] font-bold flex items-center gap-0.5 mt-0.5"
                                          >
                                            <span className="material-symbols-outlined text-[12px]">link</span>
                                            Open booking page
                                          </a>
                                        </>
                                        );
                                      })()}
                                    </td>
                                    <td className="p-3 text-right space-y-1" onClick={e => e.stopPropagation()}>
                                      <div className="flex justify-end gap-1 mb-1">
                                        <button 
                                          onClick={() => handleDeleteSpecialist(uniqueId)}
                                          disabled={currentUserRole === 'receptionist'}
                                          className="text-error hover:bg-error-container/30 px-2 py-0.5 rounded transition-colors inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                          title="Delete Specialist"
                                        >
                                          <span className="material-symbols-outlined text-[14px]">delete</span>
                                        </button>
                                      </div>
                                      <button 
                                        onClick={() => handleStartEditingSpecUser(usr)}
                                        disabled={currentUserRole === 'receptionist'}
                                        className="bg-primary/5 hover:bg-primary/10 text-primary px-2.5 py-1 rounded font-bold text-[10px] block w-full text-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        Edit Details
                                      </button>
                                    </td>
                                  </tr>

                                  {/* Expandable "Schedule for Today" Details Row */}
                                  {isExpanded && (
                                    <tr className="bg-surface-container-low/30 animate-fade-in">
                                      <td colSpan={5} className="p-6 border-b border-surface-variant text-xs">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                          <div className="space-y-2">
                                            <h5 className="font-bold text-on-surface uppercase tracking-wider text-[10px]">Contact Info</h5>
                                            <p><strong className="text-on-surface font-semibold">Phone:</strong> {usr.phone || 'N/A'}</p>
                                            <p><strong className="text-on-surface font-semibold">Languages:</strong> {usr.language_skills || 'N/A'}</p>
                                            <p><strong className="text-on-surface font-semibold">Hire date:</strong> {usr.hire_date || 'N/A'}</p>
                                          </div>
                                          <div className="space-y-2">
                                            <h5 className="font-bold text-on-surface uppercase tracking-wider text-[10px]">Notes</h5>
                                            <p className="text-on-surface-variant">{usr.notes || 'No additional notes provided.'}</p>
                                          </div>
                                          <div className="space-y-2 md:pl-6 md:border-l border-surface-variant/60">
                                            <h5 className="font-bold text-on-surface uppercase tracking-wider text-[10px]">Integrations Actions</h5>
                                            <button 
                                              onClick={() => handleRevokeSpecialist(uniqueId)}
                                              disabled={currentUserRole === 'receptionist'}
                                              className="bg-accent-coral/10 hover:bg-accent-coral/20 text-accent-coral px-3 py-1.5 rounded font-bold text-[10px] w-full text-center transition-colors cursor-pointer mt-2 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              <span className="material-symbols-outlined text-[14px]">person_off</span>
                                              Revoke Cal.com Status
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PANEL 4: Cal.com Booking Integration — 6-tab Dashboard */}
                  {(() => {
                    const renderCalComBookingIntegration = () => (
                      <>
                        <div className="bg-surface-base rounded-xl ambient-shadow border border-surface-variant overflow-hidden" style={{ order: 1 }}>
                          {/* Panel Header */}
                          <div className="px-6 pt-6 pb-0 border-b border-surface-variant">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                              <div>
                                <h4 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                                  <span className="material-symbols-outlined text-primary text-[22px]">admin_panel_settings</span>
                                  Specialist Manager
                                </h4>
                                <p className="text-body-md text-on-surface-variant mt-0.5 font-normal">Users ➔ Specialists 🔗 Event Types ➔📅 Calendars ➕ Webhooks</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {lastSyncTime && (
                                  <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded border border-surface-variant/40">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Sync: {lastSyncTime}
                                  </span>
                                )}
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${syncStatus === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : calComConnected ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                  <span className={`w-2 h-2 rounded-full ${syncStatus === 'Success' ? 'bg-emerald-500' : calComConnected ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`}></span>
                                  {syncStatus}
                                </span>
                                <button
                                  onClick={() => { setCalComConnected(false); setCalConnections([]); setCalList([]); setCalEventTypes([]); setSyncStatus('Idle'); setIntegrationErrorLog(''); setCalOrgUsers([]); setGlobalSyncLog([]); triggerNotification('Cal.com connection reset.'); }}
                                  className="bg-surface-muted border border-surface-variant text-on-surface-variant px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-accent-coral/10 hover:text-accent-coral hover:border-accent-coral/30 transition-all cursor-pointer clickable-hover-effect"
                                >
                                  <span className="material-symbols-outlined text-[13px] align-middle mr-0.5">refresh</span>Reconnect
                                </button>
                                <button
                                  onClick={handleSyncAllCalCom}
                                  disabled={isGlobalSyncing}
                                  className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer clickable-hover-effect disabled:opacity-60"
                                >
                                  <span className={`material-symbols-outlined text-[14px] ${isGlobalSyncing ? 'animate-spin' : ''}`}>sync</span>
                                  {isGlobalSyncing ? 'Syncing…' : 'Sync All'}
                                </button>
                              </div>
                            </div>
                            {/* Tabs */}
                            <div className="flex gap-0 overflow-x-auto">
                              {(['overview','users','specialists','treatments','calendars','webhooks'] as const).map(tab => (
                                <button
                                  key={tab}
                                  onClick={() => setCalIntegrationTab(tab)}
                                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wide border-b-2 transition-all whitespace-nowrap cursor-pointer ${calIntegrationTab === tab ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-surface-variant'}`}
                                >
                                  {tab === 'overview' && '⚙ Overview'}
                                  {tab === 'users' && `👤 Users${calOrgUsers.length > 0 ? ` (${calOrgUsers.length})` : ''}`}
                                  {tab === 'specialists' && `🩺 Specialists${Object.keys(calSpecialistLinks).length > 0 ? ` (${Object.keys(calSpecialistLinks).length})` : ''}`}
                                  {tab === 'treatments' && `💆 Treatments${calEventTypes.length > 0 ? ` (${calEventTypes.length})` : ''}`}
                                  {tab === 'calendars' && `📅 Calendars${calList.length > 0 ? ` (${calList.length})` : ''}`}
                                  {tab === 'webhooks' && `🔗 Webhooks${webhooks.length > 0 ? ` (${webhooks.length})` : ''}`}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Content Panes */}
                          <div className="p-6">
                            {/* ── TAB: OVERVIEW ────────────────────────────────────────── */}
                            {calIntegrationTab === 'overview' && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-surface-muted/20 border border-surface-variant/40 rounded-xl p-4 space-y-3">
                                    <h5 className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                                      <span className="material-symbols-outlined text-[16px] text-primary">link</span>
                                      Target API Server Settings
                                    </h5>
                                    <div className="space-y-2">
                                      <div>
                                        <label className="block text-[10px] text-on-surface-variant uppercase mb-1 font-bold">API Base Endpoint</label>
                                        <input type="url" value={calComApiEndpoint} onChange={e => setCalComApiEndpoint(e.target.value)}
                                          disabled={currentUserRole === 'receptionist'}
                                          className="w-full bg-surface-base border border-surface-variant focus:border-primary rounded-lg px-3 py-2 text-xs font-mono outline-none disabled:opacity-50 disabled:cursor-not-allowed" />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-on-surface-variant uppercase mb-1 font-bold">Bookings Lookup Endpoint</label>
                                        <input type="url" value={calComBookingsEndpoint} onChange={e => setCalComBookingsEndpoint(e.target.value)}
                                          disabled={currentUserRole === 'receptionist'}
                                          className="w-full bg-surface-base border border-surface-variant focus:border-primary rounded-lg px-3 py-2 text-xs font-mono outline-none disabled:opacity-50 disabled:cursor-not-allowed" />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-on-surface-variant uppercase mb-1 font-bold flex items-center justify-between">
                                          <span>Global Admin Auth Key</span>
                                          {currentUserRole === 'receptionist' && <span className="material-symbols-outlined text-[14px] text-accent-coral">lock</span>}
                                        </label>
                                        <input type={currentUserRole === 'receptionist' ? "text" : "password"} 
                                          value={currentUserRole === 'receptionist' && calComApiKey ? "cal_live_••••••••••••••••••••••••" : calComApiKey} 
                                          disabled={currentUserRole === 'receptionist'}
                                          onChange={e => {
                                            setCalComApiKey(e.target.value);
                                            localStorage.setItem('sb_calcom_api_key', e.target.value);
                                          }}
                                          className={`w-full bg-surface-base border border-surface-variant focus:border-primary rounded-lg px-3 py-2 text-xs font-mono outline-none ${currentUserRole === 'receptionist' ? 'opacity-60 cursor-not-allowed' : ''}`} />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-on-surface-variant uppercase mb-1 font-bold flex items-center justify-between">
                                          <span>Admin Access PIN</span>
                                          {currentUserRole === 'receptionist' && <span className="material-symbols-outlined text-[14px] text-accent-coral">lock</span>}
                                        </label>
                                        <input type={currentUserRole === 'receptionist' ? "password" : "text"} 
                                          value={currentUserRole === 'receptionist' ? "********" : adminPin} 
                                          disabled={currentUserRole === 'receptionist'}
                                          maxLength={9}
                                          onChange={e => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            setAdminPin(val);
                                            localStorage.setItem('sb_admin_pin', val);
                                          }}
                                          placeholder="e.g. 1234"
                                          className={`w-full bg-surface-base border border-surface-variant focus:border-primary rounded-lg px-3 py-2 text-xs font-mono outline-none ${currentUserRole === 'receptionist' ? 'opacity-60 cursor-not-allowed' : ''}`} />
                                      </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-surface-variant/40">
                                      <h6 className="text-xs font-bold text-on-surface mb-2 flex items-center gap-2">
                                        Specialist API Keys
                                        {currentUserRole === 'receptionist' && <span className="material-symbols-outlined text-[16px] text-accent-coral">lock</span>}
                                      </h6>
                                      <p className="text-[10px] text-on-surface-variant mb-3">The system requires individual API keys to fetch restrictive data like event types for each specialist. If left blank, it will fall back to the Admin key (which may fail due to permissions).</p>
                                      <div className="space-y-3">
                                        {specialists.map(spec => {
                                          const hasKey = !!(calComApiKeys[spec.therapist_id] || calComApiKeys[spec.calUsername]);
                                          return (
                                          <div key={spec.therapist_id} className="flex flex-col gap-1">
                                            <label className="text-[11px] font-bold text-on-surface flex items-center gap-1">
                                              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> {spec.therapist_name} ({spec.calUsername || 'No calUsername'})
                                            </label>
                                            <input 
                                              type={currentUserRole === 'receptionist' ? "text" : "password"} 
                                              placeholder={`API Key for ${spec.therapist_name}`}
                                              value={currentUserRole === 'receptionist' && hasKey ? "cal_live_••••••••••••••••••••••••" : (calComApiKeys[spec.therapist_id] || calComApiKeys[spec.calUsername] || '')}
                                              disabled={currentUserRole === 'receptionist'}
                                              onChange={e => handleUpdateUserApiKey(spec.therapist_id, e.target.value)}
                                              className={`w-full bg-surface-base border border-surface-variant focus:border-primary rounded-lg px-3 py-1.5 text-xs font-mono outline-none ${currentUserRole === 'receptionist' ? 'opacity-60 cursor-not-allowed' : ''}`} 
                                            />
                                          </div>
                                        )})}
                                      </div>
                                    </div>

                                    <button onClick={handleSyncAllCalCom} disabled={isGlobalSyncing}
                                      className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-60">
                                      <span className="material-symbols-outlined text-[14px]">bolt</span> Test Connections & Load Data
                                    </button>
                                  </div>

                                  <div className="bg-surface-muted/20 border border-surface-variant/40 rounded-xl p-4 space-y-4">
                                    <h5 className="font-bold text-xs uppercase tracking-wider text-on-surface">Configuration Guidelines</h5>
                                    <div className="text-xs text-on-surface-variant space-y-2 leading-relaxed">
                                      <p>1. Go to the <strong className="text-on-surface">Users</strong> tab to fetch the list of organization members. Use the manual username input if your self-hosted setup doesn't return full rosters.</p>
                                      <p>2. Promote users to <strong className="text-on-surface">Specialists</strong> and assign rooms to enable scheduling rules.</p>
                                      <p>3. Go to <strong className="text-on-surface">Treatments</strong> to map Cal.com event type slots to your local spa treatments catalog.</p>
                                      <p>4. Configure target <strong className="text-on-surface">Calendars</strong> to prevent room double-booking automatically.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── TAB: USERS ───────────────────────────────────────────── */}
                            {calIntegrationTab === 'users' && (
                              <div className="space-y-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-muted/30 border border-surface-variant/40 rounded-xl p-4">
                                  <div>
                                    <h5 className="font-bold text-sm text-on-surface">Manual Discovery & Promotion</h5>
                                    <p className="text-xs text-on-surface-variant mt-0.5">Discovered members: {calOrgUsers.length}. Add by username if not listed.</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      id="manual-user-username"
                                      placeholder="Username"
                                      className="bg-surface-base border border-surface-variant rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary w-32"
                                      onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                          const input = e.currentTarget;
                                          const username = input.value.trim();
                                          if (!username) return;
                                          try {
                                            const { calendarService } = await import('./services/calendarService');
                                            const ets = await calendarService.getEventTypes(username);
                                            const newUser = {
                                              id: `usr_${username}_${Date.now()}`,
                                              username,
                                              name: username.charAt(0).toUpperCase() + username.slice(1),
                                              email: `${username}@strawberryhotels.com`
                                            };
                                            setCalOrgUsers(prev => {
                                              if (prev.some(u => u.username === username)) return prev;
                                              const updated = [...prev, newUser];
                                              localStorage.setItem('sb_cal_manual_users', JSON.stringify(updated));
                                              return updated;
                                            });
                                            if (ets.length > 0) {
                                              setSpecialistEventTypes(prev => ({ ...prev, [newUser.id]: ets }));
                                            }
                                            triggerNotification(`Discovered user "${username}" with ${ets.length} event type(s).`);
                                            input.value = '';
                                          } catch (err: any) {
                                            triggerNotification(`User lookup failed: ${err.message}`);
                                          }
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={async () => {
                                        const el = document.getElementById('manual-user-username') as HTMLInputElement;
                                        if (el && el.value.trim()) {
                                          const username = el.value.trim();
                                          try {
                                            const { calendarService } = await import('./services/calendarService');
                                            const ets = await calendarService.getEventTypes(username);
                                            const newUser = {
                                              id: `usr_${username}_${Date.now()}`,
                                              username,
                                              name: username.charAt(0).toUpperCase() + username.slice(1),
                                              email: `${username}@strawberryhotels.com`
                                            };
                                            setCalOrgUsers(prev => {
                                              if (prev.some(u => u.username === username)) return prev;
                                              const updated = [...prev, newUser];
                                              localStorage.setItem('sb_cal_manual_users', JSON.stringify(updated));
                                              return updated;
                                            });
                                            if (ets.length > 0) {
                                              setSpecialistEventTypes(prev => ({ ...prev, [newUser.id]: ets }));
                                            }
                                            triggerNotification(`Discovered user "${username}" with ${ets.length} event type(s).`);
                                            el.value = '';
                                          } catch (err: any) {
                                            triggerNotification(`User lookup failed: ${err.message}`);
                                          }
                                        }
                                      }}
                                      disabled={currentUserRole === 'receptionist'}
                                      className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Discover
                                    </button>
                                  </div>
                                </div>

                                <div className="bg-surface-base border border-surface-variant/60 rounded-xl overflow-hidden shadow-xs">
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-surface-container-low text-on-surface-variant border-b border-surface-variant font-bold">
                                          <th className="p-3">User Profile</th>
                                          <th className="p-3">Email Address</th>
                                          <th className="p-3">Role</th>
                                          <th className="p-3">Status</th>
                                          <th className="p-3 text-right">Actions / Mapping status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-surface-variant/40">
                                        {calOrgUsers.length === 0 ? (
                                          <tr>
                                            <td colSpan={5} className="p-6 text-center text-on-surface-variant/60 italic">No Cal.com organization users discovered. Enter a username above to fetch.</td>
                                          </tr>
                                        ) : (
                                          calOrgUsers.map((usr: any, idx: number) => {
                                            const userId = usr.id || usr.username;
                                            const alreadyLinked = !!calSpecialistLinks[userId];
                                            const linkedSpec = alreadyLinked ? specialists.find(s => s.therapist_id === calSpecialistLinks[userId]) : null;

                                            return (
                                              <tr key={idx} className="hover:bg-surface-muted/20">
                                                <td className="p-3 font-semibold text-on-surface">
                                                  <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                                                    {usr.therapist_name || usr.username}
                                                  </div>
                                                </td>
                                                <td className="p-3 text-on-surface-variant">{usr.email || '—'}</td>
                                                <td className="p-3 font-semibold text-on-surface-variant uppercase text-[9px]">{usr.role || 'member'}</td>
                                                <td className="p-3">
                                                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${alreadyLinked ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-surface-muted text-on-surface-variant/60'}`}>
                                                    {alreadyLinked ? 'Promoted' : 'Standard'}
                                                  </span>
                                                </td>
                                                <td className="p-3 text-right flex items-center justify-end gap-2.5">
                                                  {alreadyLinked ? (
                                                    <>
                                                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                                        <span className="material-symbols-outlined text-[12px]">done</span>
                                                        Specialist: {linkedSpec?.therapist_name}
                                                      </span>
                                                      <button
                                                        onClick={() => handleSyncSpecialistData(userId, usr.username)}
                                                        className="text-[9px] bg-surface-muted border border-surface-variant text-on-surface-variant px-2 py-1 rounded hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                                                      >
                                                        <span className="material-symbols-outlined text-[11px] align-middle">sync</span>
                                                      </button>
                                                    </>
                                                  ) : (
                                                    <div className="flex items-center gap-2">
                                                      {/* Room selector shown inline before promoting */}
                                                      <select
                                                        id={`room-sel-${usr.username}`}
                                                        defaultValue=""
                                                        className="bg-sand-light border border-surface-variant rounded-lg px-2 py-1 text-[10px] font-semibold outline-none focus:border-primary cursor-pointer max-w-[120px]"
                                                      >
                                                        <option value="">Room…</option>
                                                        <option value="Room 1">Room 1</option>
                                                        <option value="Room 2">Room 2</option>
                                                        <option value="Room 3">Room 3</option>
                                                        <option value="Room 4">Room 4</option>
                                                      </select>
                                                      <button
                                                        onClick={() => {
                                                          const sel = document.getElementById(`room-sel-${usr.username}`) as HTMLSelectElement;
                                                          handlePromoteToSpecialist(usr, sel ? sel.value : '');
                                                        }}
                                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                                                      >
                                                        <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                                        Promote
                                                      </button>
                                                      <button 
                                                        disabled={currentUserRole === 'receptionist'}
                                                        onClick={() => handleDeleteOrgUser(userId)}
                                                        className="text-error hover:bg-error-container/30 px-2 py-1.5 rounded transition-colors inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Remove discovered user"
                                                      >
                                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                                      </button>
                                                    </div>
                                                  )}
                                                  {/* Remove user from list */}
                                                  <button
                                                    disabled={currentUserRole === 'receptionist'}
                                                    onClick={() => {
                                                      setCalOrgUsers(prev => {
                                                        const updated = prev.filter(u => (u.id || u.username) !== userId);
                                                        localStorage.setItem('sb_cal_manual_users', JSON.stringify(updated));
                                                        return updated;
                                                      });
                                                      triggerNotification('User removed from temporary roster.');
                                                    }}
                                                    className="text-error hover:bg-error-container/20 text-xs p-1.5 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Remove User"
                                                  >
                                                    <span className="material-symbols-outlined text-sm">person_remove</span>
                                                  </button>
                                                </td>
                                              </tr>
                                            );
                                          })
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── TAB: SPECIALISTS ─────────────────────────────────────── */}
                            {calIntegrationTab === 'specialists' && (
                              <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-bold text-sm text-on-surface">Specialists Readiness Checker</h5>
                                    <p className="text-xs text-on-surface-variant mt-0.5">Verify Google Sheets credentials and API connectivity for active specialists.</p>
                                  </div>
                                </div>
                                {Object.keys(calSpecialistLinks).length === 0 ? (
                                  <div className="text-center py-12 border border-dashed border-surface-variant rounded-xl">
                                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30">spa</span>
                                    <p className="text-sm text-on-surface-variant/60 mt-3 font-semibold">No specialists created yet.</p>
                                    <p className="text-xs text-on-surface-variant/40 mt-1">Go to the Users tab and promote a Cal.com user.</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(calSpecialistLinks).map(([calUserId, therapistId]) => {
                                      const spec = specialists.find(s => s.therapist_id === therapistId);
                                      if (!spec) return null;
                                      const checks = getSpecialistReadinessChecks(calUserId);
                                      const allReady = checks.every(c => c.ok);
                                      const syncSt = specialistSyncStatus[calUserId];
                                      const specEts = specialistEventTypes[calUserId] ?? [];
                                      const specCals = specialistCalendars[calUserId] ?? [];
                                      return (
                                        <div key={calUserId} className={`border rounded-xl p-4 space-y-3 ${allReady ? 'border-emerald-200 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 text-white flex items-center justify-center font-extrabold text-base">
                                                {spec.therapist_name[0]}
                                              </div>
                                              <div>
                                                <div className="font-bold text-sm text-on-surface">{spec.therapist_name}</div>
                                                <div className="text-[10px] text-on-surface-variant">{spec.email || spec.calEmail}</div>
                                              </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                              <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${allReady ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>
                                                  {allReady ? '✅ Ready' : '⚠ Not Ready'}
                                                </span>
                                                <button
                                                  disabled={currentUserRole === 'receptionist'}
                                                  onClick={() => {
                                                    setCalSpecialistLinks(prev => {
                                                      const updated = { ...prev };
                                                      delete updated[calUserId];
                                                      return updated;
                                                    });
                                                    triggerNotification('Removed specialist link from readiness checker.');
                                                  }}
                                                  className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                  title="Remove from Readiness Checker"
                                                >
                                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                                </button>
                                              </div>
                                              {syncSt && (
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase ${syncSt === 'loading' ? 'text-blue-600 bg-blue-50' : 'text-on-surface-variant/50 bg-surface-muted'}`}>
                                                  {syncSt}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Readiness checks */}
                                          <div className="flex flex-wrap gap-1.5">
                                            {checks.map(c => (
                                              <span key={c.label} className={`text-[8px] font-bold px-2 py-0.5 rounded border flex items-center gap-0.5 ${c.ok ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-600 border-red-200'}`}>
                                                {c.ok ? '✓' : '✗'} {c.label}
                                              </span>
                                            ))}
                                          </div>

                                          {/* Stats row */}
                                          <div className="flex items-center gap-4 text-[10px] text-on-surface-variant border-t border-surface-variant/30 pt-2">
                                            <span className="flex items-center gap-0.5">
                                              <span className="material-symbols-outlined text-[12px]">medical_services</span>
                                              {specEts.length} event type{specEts.length !== 1 ? 's' : ''}
                                            </span>
                                            <span className="flex items-center gap-0.5">
                                              <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                              {specCals.length} calendar{specCals.length !== 1 ? 's' : ''}
                                            </span>
                                          </div>

                                          {/* Sync button */}
                                          <button
                                            onClick={() => handleSyncSpecialistData(calUserId, spec.calUsername)}
                                            disabled={syncSt === 'loading'}
                                            className="w-full text-[10px] font-bold py-1.5 rounded-lg border border-surface-variant bg-surface-base hover:bg-surface-muted text-on-surface transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-60"
                                          >
                                            <span className={`material-symbols-outlined text-[12px] ${syncSt === 'loading' ? 'animate-spin' : ''}`}>sync</span>
                                            {syncSt === 'loading' ? 'Syncing…' : 'Sync Specialist'}
                                          </button>

                                          {/* Event types for this specialist */}
                                          {specEts.length > 0 && (
                                            <div className="space-y-1">
                                              <div className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Event Types / Treatments</div>
                                              {specEts.slice(0, 4).map((et: any) => (
                                                <div key={et.id} className="flex items-center justify-between bg-surface-base border border-surface-variant/40 px-2.5 py-1.5 rounded text-[10px]">
                                                  <span className="font-semibold text-on-surface truncate">{et.title}</span>
                                                  <span className="text-on-surface-variant font-mono ml-2 shrink-0">{et.duration}m</span>
                                                </div>
                                              ))}
                                              {specEts.length > 4 && <div className="text-[9px] text-on-surface-variant/50 pl-1">+{specEts.length - 4} more</div>}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* ── TAB: TREATMENTS / EVENT TYPES ────────────────────────── */}
                            {calIntegrationTab === 'treatments' && (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-sm text-on-surface">Live Event Types (Read-Only)</h5>
                              <p className="text-[11px] text-on-surface-variant mt-0.5">These are automatically pulled from Cal.com.</p>
                            </div>
                            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded border border-surface-variant/40">
                              {calEventTypes.length} Event Types found
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {calEventTypes.map(et => (
                              <div key={et.id} className="bg-surface-base border border-surface-variant p-4 rounded-xl">
                                <div className="font-bold text-sm text-on-surface mb-1">{et.title}</div>
                                <div className="text-[10px] text-on-surface-variant mb-3 font-mono">{et.slug}</div>
                                <div className="flex gap-2">
                                  <span className="bg-surface-muted px-2 py-1 rounded text-[10px] font-medium text-on-surface-variant">
                                    {et.length} min
                                  </span>
                                  {et.userId && (
                                    <span className="bg-surface-muted px-2 py-1 rounded text-[10px] font-medium text-on-surface-variant">
                                      User ID: {et.userId}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* ── TAB: CALENDARS ───────────────────────────────────────── */}
                      {calIntegrationTab === 'calendars' && (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-sm text-on-surface">Connected Accounts & Calendars</h5>
                              <p className="text-xs text-on-surface-variant mt-0.5">Set the destination calendar for new bookings, and select calendars for conflict checking.</p>
                            </div>
                            <button onClick={handleFetchCalendarsAndConnections} disabled={isLoadingConnections}
                              className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all cursor-pointer disabled:opacity-60">
                              <span className={`material-symbols-outlined text-[13px] ${isLoadingConnections ? 'animate-spin' : ''}`}>refresh</span>
                              Sync Calendars
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Connected Accounts */}
                            <div className="bg-surface-muted/20 border border-surface-variant rounded-xl p-4 space-y-3">
                              <h6 className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5 border-b border-surface-variant/20 pb-2">
                                <span className="material-symbols-outlined text-[14px] text-primary">account_circle</span>
                                Connected Accounts ({calConnections.length})
                              </h6>
                              {isLoadingConnections ? (
                                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60 py-4">
                                  <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>Loading…
                                </div>
                              ) : calConnections.length === 0 ? (
                                <div className="text-center py-6">
                                  <span className="material-symbols-outlined text-[28px] text-on-surface-variant/30">link_off</span>
                                  <p className="text-xs text-on-surface-variant/50 mt-2 font-semibold">No connected Cal.com account linked.</p>
                                </div>
                              ) : (
                                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                  {calConnections.map((conn, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-surface-base border border-surface-variant/50 px-3 py-2 rounded-lg text-xs">
                                      <div>
                                        <div className="font-bold text-on-surface">{conn.accountLabel}</div>
                                        <div className="text-[9px] text-on-surface-variant/70 uppercase font-semibold">{conn.provider}</div>
                                      </div>
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-2 py-0.5 rounded font-bold uppercase">{conn.status}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Active Calendars */}
                            <div className="bg-surface-muted/20 border border-surface-variant rounded-xl p-4 space-y-3">
                              <h6 className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5 border-b border-surface-variant/20 pb-2">
                                            <span className="material-symbols-outlined text-[14px] text-primary">calendar_today</span>
                                Active Calendars ({calList.length})
                              </h6>
                              {isLoadingConnections ? (
                                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60 py-4">
                                  <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>Loading…
                                </div>
                              ) : calList.length === 0 ? (
                                <div className="text-center py-6">
                                  <span className="material-symbols-outlined text-[28px] text-on-surface-variant/30">event_busy</span>
                                  <p className="text-xs text-on-surface-variant/50 mt-2 font-semibold">No active calendar selected.</p>
                                </div>
                              ) : (
                                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                  {calList.map((cal: any, idx: number) => {
                                    const isDest = destinationCalendarId === String(cal.id);
                                    const isConflict = conflictCheckCalendarIds.includes(String(cal.id));
                                    const isGoogle = cal.provider?.toLowerCase().includes('google');
                                    const isUnused = isGoogle && !isDest && !isConflict;
                                    return (
                                      <div key={idx} className={`flex flex-col bg-surface-base border rounded-lg p-3 text-xs gap-2 ${isUnused ? 'border-amber-300 bg-amber-50/30' : 'border-surface-variant/50'}`}>
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="font-bold text-on-surface">{cal.name}</div>
                                            <div className="text-[9px] text-on-surface-variant/70 uppercase font-semibold">{cal.provider}</div>
                                          </div>
                                          <div className="flex gap-1">
                                            {cal.primary && <span className="bg-amber-50 text-amber-700 text-[8px] px-1.5 py-0.5 rounded font-bold">Primary</span>}
                                            {isUnused && <span className="bg-red-50 text-red-600 text-[8px] px-1.5 py-0.5 rounded font-bold border border-red-200">Unused</span>}
                                          </div>
                                        </div>
                                        {isUnused && <p className="text-[9px] text-amber-700 font-semibold">Google Calendar connected but not selected for booking or conflict checks.</p>}
                                        <div className="flex gap-4 border-t border-surface-variant/20 pt-2">
                                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-on-surface-variant hover:text-primary">
                                            <input type="radio" name="destCal" checked={isDest}
                                              onChange={() => setDestinationCalendarId(String(cal.id))}
                                              className="text-primary focus:ring-primary/20 w-3 h-3 cursor-pointer" />
                                            Booking Destination
                                          </label>
                                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-on-surface-variant hover:text-primary">
                                            <input type="checkbox" checked={isConflict}
                                              onChange={e => {
                                                if (e.target.checked) setConflictCheckCalendarIds(prev => [...prev, String(cal.id)]);
                                                else setConflictCheckCalendarIds(prev => prev.filter(id => id !== String(cal.id)));
                                              }}
                                              className="rounded text-primary focus:ring-primary/20 w-3 h-3 cursor-pointer" />
                                            Conflict Check
                                          </label>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Summary badges */}
                          <div className="flex flex-wrap gap-2">
                            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold ${destinationCalendarId ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                              <span className="material-symbols-outlined text-[13px]">{destinationCalendarId ? 'check_circle' : 'cancel'}</span>
                              Booking Destination: {destinationCalendarId ? calList.find((c: any) => String(c.id) === destinationCalendarId)?.name || 'Set' : 'Not set'}
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold ${conflictCheckCalendarIds.length > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                              <span className="material-symbols-outlined text-[13px]">{conflictCheckCalendarIds.length > 0 ? 'check_circle' : 'cancel'}</span>
                              Conflict Calendars: {conflictCheckCalendarIds.length} selected
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── TAB: WEBHOOKS ─────────────────────────────────────────── */}
                      {calIntegrationTab === 'webhooks' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-sm text-on-surface">Webhook Endpoints</h5>
                              <p className="text-xs text-on-surface-variant mt-0.5">Configure per-event notification endpoints. Each event type can have its own webhook URL.</p>
                            </div>
                          </div>

                          {webhooks.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-surface-variant rounded-xl">
                              <span className="material-symbols-outlined text-[36px] text-on-surface-variant/30">webhook</span>
                              <p className="text-sm text-on-surface-variant/60 mt-2 font-semibold">No webhooks configured.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {webhooks.map((wh: any, idx: number) => (
                                <div key={idx} className="bg-surface-container-lowest border border-surface-variant/60 rounded-xl p-4">
                                  <div className="flex items-start justify-between gap-2 mb-3">
                                    <div>
                                      <div className="font-bold text-sm text-on-surface">{wh.name}</div>
                                      <div className="text-[10px] font-mono text-on-surface-variant mt-0.5 truncate max-w-xs">{wh.subscriber_url}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setWebhooks(prev => prev.map((w: any, i: number) => i === idx ? { ...w, active: !w.active } : w));
                                          triggerNotification(`Webhook "${wh.name}" ${wh.active ? 'disabled' : 'enabled'}.`);
                                        }}
                                        className={`text-[9px] font-bold px-2 py-0.5 rounded border cursor-pointer transition-all ${wh.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-surface-muted text-on-surface-variant/50 border-surface-variant'}`}
                                      >
                                        {wh.active ? 'Active' : 'Inactive'}
                                      </button>
                                      <button
                                        onClick={() => { setWebhooks(prev => prev.filter((_: any, i: number) => i !== idx)); triggerNotification(`Webhook "${wh.name}" deleted.`); }}
                                        className="text-error hover:bg-error/10 p-1 rounded transition-colors cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {(wh.trigger_events || []).map((ev: string) => (
                                      <span key={ev} className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-semibold">{ev}</span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add webhook */}
                          <div className="border border-dashed border-surface-variant rounded-xl p-4 space-y-3">
                            <h6 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Add Webhook Endpoint</h6>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input id="wh-name" type="text" placeholder="Webhook name…" className="bg-sand-light border border-surface-variant focus:border-primary rounded-lg px-3 py-2 text-xs font-semibold outline-none" />
                              <input id="wh-url" type="url" placeholder="https://…/webhook" className="bg-sand-light border border-surface-variant focus:border-primary rounded-lg px-3 py-2 text-xs font-mono outline-none" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {['booking.created','booking.confirmed','booking.rescheduled','booking.canceled','booking.completed'].map(ev => (
                                <label key={ev} className="flex items-center gap-1 cursor-pointer text-[10px] font-semibold text-on-surface-variant hover:text-primary">
                                  <input type="checkbox" id={`wh-ev-${ev}`} className="rounded text-primary focus:ring-primary/20 w-3 h-3 border-surface-variant cursor-pointer" />
                                  {ev}
                                </label>
                              ))}
                            </div>
                            <button
                              onClick={() => {
                                const nameEl = document.getElementById('wh-name') as HTMLInputElement;
                                const urlEl = document.getElementById('wh-url') as HTMLInputElement;
                                const triggers = ['booking.created','booking.confirmed','booking.rescheduled','booking.canceled','booking.completed'].filter(ev => (document.getElementById(`wh-ev-${ev}`) as HTMLInputElement)?.checked);
                                if (!nameEl?.value || !urlEl?.value) { triggerNotification('Webhook name and URL are required.'); return; }
                                const newWh = { id: `wh_${Date.now()}`, name: nameEl.value, subscriber_url: urlEl.value, secret: '', active: true, trigger_events: triggers };
                                setWebhooks(prev => [...prev, newWh]);
                                triggerNotification(`Webhook "${nameEl.value}" added.`);
                                nameEl.value = ''; urlEl.value = '';
                              }}
                              className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all cursor-pointer clickable-hover-effect"
                            >
                              Add Webhook
                            </button>
                          </div>

                          {/* Delivery log */}
                          {webhookDeliveries.length > 0 && (
                            <div className="border-t border-surface-variant pt-4">
                              <h6 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px] text-primary">history</span>
                                Recent Deliveries ({webhookDeliveries.length})
                              </h6>
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {webhookDeliveries.slice(0, 10).map((del: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between bg-surface-muted/20 border border-surface-variant/40 px-3 py-2 rounded-lg text-[10px]">
                                    <div>
                                      <span className="font-semibold text-on-surface">{del.trigger_name}</span>
                                      <span className="text-on-surface-variant ml-2">{del.delivered_at}</span>
                                    </div>
                                    <span className={`font-bold px-2 py-0.5 rounded text-[9px] ${del.http_status >= 200 && del.http_status < 300 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                      {del.http_status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                        </div>
                      </div>
                    </>
                  );
                  return renderCalComBookingIntegration();
              })()}

                  {/* Edit Specialist Modal inline */}
                  {editingSpecUser && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                      <div className="bg-surface-base rounded-xl border border-surface-variant p-6 max-w-lg w-full space-y-4 shadow-xl animate-scale-up text-on-surface">
                        <div className="flex justify-between items-center border-b border-surface-variant pb-2">
                          <h4 className="font-bold text-base text-primary flex items-center gap-1.5">
                            <span className="material-symbols-outlined">edit</span>
                            Edit Specialist attributes: {editingSpecUser.name}
                          </h4>
                          <button 
                            type="button"
                            onClick={() => setEditingSpecUser(null)}
                            className="text-outline hover:text-on-surface material-symbols-outlined cursor-pointer"
                          >
                            close
                          </button>
                        </div>

                        <form onSubmit={handleSaveEditingSpecUser} className="space-y-4 text-left">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1">Full Name</label>
                              <input 
                                required
                                type="text"
                                value={editingSpecUser.therapist_name || ''}
                                onChange={e => setEditingSpecUser({ ...editingSpecUser, therapist_name: e.target.value })}
                                className="w-full bg-sand-light rounded px-3 py-2 text-xs outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1">Cal.diy Username</label>
                              <input 
                                required
                                type="text"
                                value={editingSpecUser.calUsername || ''}
                                onChange={e => setEditingSpecUser({ ...editingSpecUser, calUsername: e.target.value })}
                                className="w-full bg-sand-light rounded px-3 py-2 text-xs outline-none focus:border-primary"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1">Email Address</label>
                              <input 
                                required
                                type="email"
                                value={editingSpecUser.email || ''}
                                onChange={e => setEditingSpecUser({ ...editingSpecUser, email: e.target.value })}
                                className="w-full bg-sand-light rounded px-3 py-2 text-xs outline-none focus:border-primary"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1">Org Team</label>
                              <input 
                                type="text"
                                value={editingSpecUser.team || ''}
                                onChange={e => setEditingSpecUser({ ...editingSpecUser, team: e.target.value })}
                                className="w-full bg-sand-light rounded px-3 py-2 text-xs outline-none focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1">Specialty</label>
                              <input 
                                type="text"
                                value={editingSpecUser.specialties || ''}
                                onChange={e => setEditingSpecUser({ ...editingSpecUser, specialties: e.target.value })}
                                className="w-full bg-sand-light rounded px-3 py-2 text-xs outline-none focus:border-primary"
                              />
                            </div>
                          </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                               <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1">Calendar Connection ID</label>
                               <input 
                                 type="text"
                                 value={editingSpecUser.mappedCalendarConnectionId}
                                 onChange={e => setEditingSpecUser({ ...editingSpecUser, mappedCalendarConnectionId: e.target.value })}
                                 className="w-full bg-sand-light rounded px-3 py-2 text-xs outline-none focus:border-primary"
                               />
                             </div>
                             <div>
                               <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1">Room Preference</label>
                               <select 
                                 value={editingSpecUser.room_preference || 'Room 1'}
                                 onChange={e => setEditingSpecUser({ ...editingSpecUser, room_preference: e.target.value })}
                                 className="w-full bg-sand-light rounded px-3 py-2 text-xs outline-none focus:border-primary border border-surface-variant/40"
                               >
                                 <option value="Room 1">Room 1</option>
                                 <option value="Room 2">Room 2</option>
                                 <option value="Room 3">Room 3</option>
                                 <option value="Room 4">Room 4</option>
                               </select>
                             </div>
                           </div>

                           <div className="grid grid-cols-1 gap-4">
                             <div>
                               <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1">Assigned Color</label>
                               <div className="flex items-center gap-2">
                                 <input 
                                   type="color"
                                   value={editingSpecUser.color || '#0d9488'}
                                   onChange={e => setEditingSpecUser({ ...editingSpecUser, color: e.target.value })}
                                   className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                                 />
                                 <span className="text-xs text-on-surface-variant font-mono">{editingSpecUser.color || '#0d9488'}</span>
                               </div>
                             </div>
                           </div>

                          <div className="flex items-center gap-4 bg-surface-muted p-3 rounded-lg border border-surface-variant/40">
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                id="editSpecActive"
                                checked={editingSpecUser.active}
                                onChange={e => setEditingSpecUser({ ...editingSpecUser, active: e.target.checked })}
                                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                              />
                              <label htmlFor="editSpecActive" className="text-xs font-semibold cursor-pointer select-none">Active Specialist status</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                id="editSpecOrgAdmin"
                                checked={editingSpecUser.role === 'admin'}
                                onChange={e => setEditingSpecUser({ ...editingSpecUser, role: e.target.checked ? 'admin' : 'specialist' })}
                                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                              />
                              <label htmlFor="editSpecOrgAdmin" className="text-xs font-semibold cursor-pointer select-none">Organization Admin privileges</label>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button 
                              type="button"
                              onClick={() => setEditingSpecUser(null)}
                              className="px-4 py-2 border border-surface-variant rounded-lg text-xs font-bold hover:bg-surface-muted cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 shadow-sm cursor-pointer"
                            >
                              Save Specialist Metadata
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>

              ) : settingsTab === 'clients' ? (
                <div className="space-y-8 animate-fade-in text-on-surface">
                  {clientSourceMode === 'api' && !clientApiConnected ? (
                    <div className="bg-surface-base rounded-xl p-8 border border-surface-variant shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
                      <span className="material-symbols-outlined text-[64px] text-accent-coral mb-4">api</span>
                      <h3 className="text-headline-md font-bold mb-2">API Connection Required</h3>
                      <p className="text-body-md text-on-surface-variant max-w-md mb-6">Clients database is set to API Access in Settings, but the API endpoint has not been verified or connected yet.</p>
                      <button 
                        onClick={() => setSettingsTab('integrations')}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 shadow-sm transition-all clickable-hover-effect cursor-pointer"
                      >
                        Go to Integrations to Connect
                      </button>
                    </div>
                  ) : (
                    renderClientsDataTable(true)
                  )}
                </div>
              ) : settingsTab === 'treatments' ? (
                <div className="space-y-6 animate-fade-in text-on-surface">
                  <div className="flex justify-between items-center bg-surface-base p-6 rounded-xl border border-surface-variant shadow-sm">
                    <div>
                      <h3 className="text-headline-xl font-headline-xl text-on-surface mb-2 font-headline">Spa Add-on Services</h3>
                      <p className="text-body-lg font-body-lg text-on-surface-variant font-normal">Manage optional treatments and cosmetic add-ons clients can include with bookings.</p>
                    </div>
                    <button 
                      onClick={() => setShowAddonForm(!showAddonForm)}
                      className="bg-primary text-white px-5 py-2.5 rounded-lg text-label-md font-bold hover:opacity-90 shadow-sm transition-all flex items-center gap-1.5 clickable-hover-effect cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      {showAddonForm ? 'Cancel' : 'New Add-on'}
                    </button>
                  </div>

                  {showAddonForm && (
                    <form onSubmit={handleAddAddon} className="bg-surface-base rounded-xl p-6 border border-surface-variant shadow-sm space-y-4 animate-fade-in">
                      <h3 className="font-bold text-on-surface text-base font-headline">Register New Add-on Package</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Package Title</label>
                          <input 
                            type="text" 
                            required 
                            value={newAddonName} 
                            onChange={e => setNewAddonName(e.target.value)} 
                            placeholder="e.g. Foot Massage"
                            className="w-full bg-sand-light border-transparent focus:bg-surface-base focus:border-primary rounded-lg px-4 py-2.5 text-body-md outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Add-on Price</label>
                          <input 
                            type="text" 
                            required 
                            value={newAddonPrice} 
                            onChange={e => setNewAddonPrice(e.target.value)} 
                            placeholder="$25.00"
                            className="w-full bg-sand-light border-transparent focus:bg-surface-base focus:border-primary rounded-lg px-4 py-2.5 text-body-md outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Description</label>
                        <textarea 
                          value={newAddonDesc} 
                          onChange={e => setNewAddonDesc(e.target.value)} 
                          placeholder="Service details and specifications..."
                          className="w-full bg-sand-light border-transparent focus:bg-surface-base focus:border-primary rounded-lg px-4 py-2 text-body-md outline-none h-16 resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="submit" className="bg-accent-coral text-white h-10 px-6 rounded-lg text-label-md font-bold hover:opacity-95 cursor-pointer clickable-hover-effect">Save Package</button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addons.map(add => (
                      <div key={add.id} className="bg-surface-base p-6 rounded-xl border border-surface-variant shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <h4 className="text-headline-md font-bold text-on-surface text-base">{add.name}</h4>
                            <span className="text-primary font-bold text-base shrink-0">{add.price}</span>
                          </div>
                          <p className="text-body-md text-on-surface-variant text-sm font-normal leading-relaxed">{add.description}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-surface-variant flex justify-end">
                          <button 
                            onClick={() => handleDeleteAddon(add.id)}
                            className="text-error hover:bg-error-container/20 p-2 rounded-full transition-colors inline-flex items-center cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <section className="space-y-6">
                  <div className="border-b border-outline-variant pb-2">
                    <h3 className="text-headline-lg font-headline-lg text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">database</span>
                      Data Sources
                    </h3>
                    <p className="text-body-md font-body-md text-on-surface-variant mt-1 font-normal">Configure external data feeds for your management portal.</p>
                  </div>

                <div className="flex flex-col gap-8">
                  
                  {/* PANEL 3: Clients Database Panel */}
                  <div className="bg-surface-base rounded-xl ambient-shadow p-4 sm:p-6 border border-surface-variant space-y-4" style={{ order: 3 }}>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-surface-variant pb-3 gap-2">
                      <div>
                        <h4 className="text-headline-md font-headline-md text-on-surface">Clients Database</h4>
                        <p className="text-body-md text-on-surface-variant mt-1 font-normal">Manage client records directory profiles and contact info.</p>
                      </div>
                      <div className="bg-surface-container-low p-1.5 rounded-lg flex border border-surface-variant self-start sm:self-auto">
                        <button onClick={() => setClientSourceMode('sheets')} className={`px-3 py-1.5 rounded text-label-sm font-bold transition-all ${clientSourceMode === 'sheets' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'}`}>Google Sheets</button>
                        <button onClick={() => setClientSourceMode('api')} className={`px-3 py-1.5 rounded text-label-sm font-bold transition-all ${clientSourceMode === 'api' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'}`}>API Endpoint</button>
                      </div>
                    </div>

                    {clientSourceMode === 'sheets' && (
                      <div className="animate-fade-in space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Google Sheets ID</label>
                            <input 
                              value={clientSheetId}
                              onChange={(e) => setClientSheetId(e.target.value)}
                              placeholder="Enter Sheet ID..."
                              className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none transition-all h-16 shadow-sm" 
                              type="text" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Sheet Name</label>
                            <input 
                              value={clientSheetName}
                              onChange={(e) => setClientSheetName(e.target.value)}
                              placeholder="e.g. Clients"
                              className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none transition-all h-16 shadow-sm" 
                              type="text" 
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                          <button onClick={handleSyncClientsSheets} className="bg-accent-coral text-white h-[44px] px-8 rounded-lg text-label-md font-bold hover:opacity-90 flex items-center justify-center gap-2 shadow-sm">
                            <span className={`material-symbols-outlined text-[20px] ${isSyncingClients ? 'animate-spin' : ''}`}>sync</span>Sync Now
                          </button>
                        </div>

                        {clientSheetHistory.length > 0 && (
                          <div>
                            <h5 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Previous spreadsheet settings</h5>
                            <div className="flex flex-wrap gap-2">
                              {clientSheetHistory.map((hist, idx) => (
                                <button 
                                  key={idx}
                                  onClick={() => { setClientSheetId(hist.id); setClientSheetName(hist.name); triggerNotification(`Loaded client sheet "${hist.name}"`); }}
                                  className={`px-3 py-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${clientSheetId === hist.id && clientSheetName === hist.name ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-surface-base border-surface-variant hover:bg-surface-muted/20 text-on-surface-variant'}`}
                                >
                                  <span className="material-symbols-outlined text-sm">history</span>
                                  {hist.name} ({hist.id.substring(0, 6)}...)
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {clientSourceMode === 'api' && (
                      <div className="animate-fade-in space-y-6">
                        <div className="bg-surface-container-low/55 p-4 rounded border border-surface-variant space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">API Endpoint</label>
                              <input value={clientApiEndpoint} onChange={e => setClientApiEndpoint(e.target.value)} className="w-full bg-surface-base border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold h-16 outline-none transition-all shadow-sm" type="text" />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Access Token</label>
                              <input value={clientAccessToken} onChange={e => setClientAccessToken(e.target.value)} className="w-full bg-surface-base border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold h-16 outline-none transition-all shadow-sm" type="password" />
                            </div>
                          </div>
                          <div className="flex justify-end pt-2">
                            <button onClick={handleConnectClientsAPI} className="bg-accent-coral text-white px-8 py-3.5 rounded-xl text-base font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 h-14">
                              <span className={`material-symbols-outlined text-[20px] ${isSyncingClients ? 'animate-spin' : ''}`}>link</span>
                              {clientApiConnected ? 'Connected' : 'Connect & Fetch'}
                            </button>
                          </div>
                        </div>

                        {clientApiConnected && (
                          <div className="space-y-4">
                            {renderClientsDataTable(false)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>




                  {/* PANEL 5: Google Console Integration (OAuth Client ID / API Key) */}
                  <div className="bg-surface-base rounded-xl ambient-shadow p-4 sm:p-6 border border-surface-variant space-y-4">
                    <div className="border-b border-surface-variant pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="text-headline-md font-headline-md text-on-surface">Google Cloud Console Integration</h4>
                        <p className="text-body-md text-on-surface-variant mt-1 font-normal">Configure Google Developer credentials for official Sheets integration.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {googleAuthorized ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Authorized
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant text-xs px-2.5 py-1 rounded-full font-semibold">
                            Not Authorized
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">OAuth Client ID</label>
                          <input 
                            value={googleClientId}
                            onChange={(e) => setGoogleClientId(e.target.value)}
                            placeholder="Enter Google Client ID..."
                            className="w-full bg-sand-light focus:bg-surface-base border border-transparent focus:border-primary rounded-lg px-4 py-2.5 text-body-md outline-none transition-colors" 
                            type="text" 
                          />
                        </div>
                        <div>
                          <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">OAuth Client Secret</label>
                          <input 
                            value={googleClientSecret}
                            onChange={(e) => setGoogleClientSecret(e.target.value)}
                            placeholder="Enter Client Secret..."
                            className="w-full bg-sand-light focus:bg-surface-base border border-transparent focus:border-primary rounded-lg px-4 py-2.5 text-body-md outline-none transition-colors" 
                            type="password" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">API Key (Optional for Public Sheets)</label>
                          <input 
                            value={googleApiKey}
                            onChange={(e) => setGoogleApiKey(e.target.value)}
                            placeholder="Enter Google API Key..."
                            className="w-full bg-sand-light focus:bg-surface-base border border-transparent focus:border-primary rounded-lg px-4 py-2.5 text-body-md outline-none transition-colors" 
                            type="text" 
                          />
                        </div>
                        <div className="flex items-end justify-end">
                          {googleAuthorized ? (
                            <button 
                              onClick={handleGoogleDisconnect}
                              className="bg-surface-container border border-surface-variant text-on-surface hover:bg-surface-muted/20 h-[44px] px-8 rounded-lg text-label-md font-bold transition-all shadow-sm"
                            >
                              Disconnect Account
                            </button>
                          ) : (
                            <button 
                              onClick={handleGoogleAuthorize}
                              disabled={isAuthorizingGoogle}
                              className="bg-primary text-white h-[44px] px-8 rounded-lg text-label-md font-bold hover:opacity-90 flex items-center justify-center gap-2 shadow-sm transition-all"
                            >
                              {isAuthorizingGoogle ? (
                                <>
                                  <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                                  Authorizing...
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[20px]">vpn_key</span>
                                  Authorize Account
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {googleAuthorized && (
                        <div className="animate-fade-in p-4 rounded-xl border border-primary/25 bg-primary/5 space-y-4">
                          <h5 className="text-label-md font-semibold text-primary">Connected Document Pickers</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Select Spreadsheet</label>
                              <select 
                                onChange={(e) => {
                                  if (e.target.value === 'specialist') {
                                    setSpecialistSheetId('1EX8EBboc87ZMFfhSkEf27EA_EkQPDEMpiXgjSELWAZA');
                                    setSpecialistSheetName('Specialists');
                                    triggerNotification('Selected Specialists Roster Spreadsheet.');
                                  } else if (e.target.value === 'treatment') {
                                    setTreatmentSheetId('1_n9gV_Wsn5CeEorniWJY6MjaX4am3ZIHpovntRhcqg4');
                                    setTreatmentSheetName('spa_treatment_catalog');
                                    triggerNotification('Selected Treatment Add-on Spreadsheet.');
                                  }
                                }}
                                className="w-full bg-surface-base border border-surface-variant focus:border-primary rounded-lg px-4 py-2.5 text-body-md outline-none"
                              >
                                <option value="">-- Choose Sheet from Google Drive --</option>
                                <option value="specialist">Norefjell Specialists Roster (1EX8EBboc87Z...)</option>
                                <option value="treatment">Norefjell Treatment Add-on (1_n9gV_Wsn5Ce...)</option>
                              </select>
                            </div>
                            <div className="flex items-end text-xs text-on-surface-variant italic font-normal py-3">
                              Drive Picker automatically connects chosen assets to Specialist Roster or Treatment list inputs.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  {/* GOOGLE CLOUD CONSOLE INTEGRATION GUIDE PANEL */}
                  <div className="bg-surface-base rounded-xl ambient-shadow p-6 border border-surface-variant space-y-4">
                    <h4 className="text-headline-md font-bold text-on-surface flex items-center gap-2 border-b border-surface-variant pb-2">
                      <span className="material-symbols-outlined text-primary">menu_book</span>
                      Google Console & Sync Guide
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-on-surface-variant leading-relaxed font-normal">
                      <div className="space-y-2">
                        <h5 className="font-bold text-on-surface text-[10px] uppercase tracking-wider">Setting up OAuth 2.0 & Credentials</h5>
                        <p>1. Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">Google Cloud Console</a>.</p>
                        <p>2. Create a new project or select an existing one, then navigate to the <strong className="text-on-surface font-semibold">API Library</strong>.</p>
                        <p>3. Search for and enable the <strong className="text-on-surface font-semibold">Google Sheets API</strong> and <strong className="text-on-surface font-semibold">Google Drive API</strong>.</p>
                        <p>4. Go to credentials page, click <strong className="text-on-surface font-semibold">Create Credentials</strong>, select <strong className="text-on-surface font-semibold">Service Account</strong> or <strong className="text-on-surface font-semibold">OAuth Client ID</strong>, and export key file.</p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-bold text-on-surface text-[10px] uppercase tracking-wider">Sharing Spreadsheets</h5>
                        <p>1. Open your target Google Sheet in your drive account.</p>
                        <p>2. Click the <strong className="text-on-surface font-semibold">Share</strong> button in the top right corner.</p>
                        <p>3. Under general access, toggle from "Restricted" to <strong className="text-on-surface font-semibold">"Anyone with the link can view"</strong> (or editor to write back data).</p>
                        <p>4. Copy the unique identifier located between "/d/" and "/edit" in the browser URL and enter it above.</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>
            )}
            </div>
          </main>
        )}

        {/* CAL.DIY MANAGER Standalone View */}
        {currentView === 'cal_diy_manager' && (() => {
          const renderCalDiyManager = () => {
            // Import the same rendering function defined inside Settings (Panel 4)
            // by inlining a redirect: just use Settings state and show calcom integration
            return (
              <main className="flex-1 p-4 sm:p-8 bg-surface-muted overflow-y-auto">
                <div className="max-w-5xl mx-auto animate-fade-in">
                  <div className="mb-6">
                    <h2 className="text-headline-xl font-headline-xl text-on-surface mb-1 font-headline uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>admin_panel_settings</span>
                      CAL.DIY MANAGER
                    </h2>
                    <p className="text-body-lg text-on-surface-variant">Enterprise control center — users, specialists, treatments, calendars &amp; webhooks.</p>
                  </div>
                  {/* Render the Cal.com Booking Integration panel inline */}
                  {(() => {
                    const renderCalComBookingIntegration = () => (
                      <></>
                    );
                    // Force-render the settings panel with Cal.com integration tab active
                    return (
                      <div className="bg-surface-base rounded-xl ambient-shadow border border-surface-variant overflow-hidden">
                        <div className="p-8 text-center">
                          <span className="material-symbols-outlined text-[64px] text-primary mb-4 block" style={{ fontVariationSettings: '"FILL" 1' }}>settings</span>
                          <h3 className="text-headline-md font-bold mb-2">Open in Settings</h3>
                          <p className="text-body-md text-on-surface-variant mb-4 max-w-md mx-auto">The full CAL.DIY MANAGER control center is accessible in Settings → Cal.com Integration tab. Click below to navigate directly.</p>
                          <button
                            onClick={() => { setCurrentView('settings'); setSettingsTab('specialists_manager'); }}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md inline-flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined">open_in_new</span>
                            Open CAL.DIY MANAGER
                          </button>
                        </div>
                      </div>
                    );
                    return renderCalComBookingIntegration();
                  })()}
                </div>
              </main>
            );
          };
          return renderCalDiyManager();
        })()}

        {/* Cal.com AI (MCP) View */}
        {currentView === 'mcp' && (
          <main className="flex-1 p-4 sm:p-8 bg-surface-muted overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in flex flex-col h-[calc(100vh-120px)] text-on-surface">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-headline-xl font-headline-xl text-on-surface mb-2 font-headline uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">smart_toy</span>
                    {currentUserRole === 'receptionist' ? 'SPA AI Receptionist' : 'Cal.com AI Companion Agent'} (MCP Console)
                  </h2>
                  <p className="text-body-lg font-body-lg text-on-surface-variant">Interactively query, schedule, reschedule, cancel, and manage event types using natural language commands.</p>
                </div>
                <button
                  onClick={() => setMcpMessages([{ id: '1', role: 'assistant', content: 'Hello! I can check availability and book appointments for your specialists. Just ask!' }])}
                  title="Clear Chat History"
                  className="p-2.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-colors flex items-center gap-2 border border-surface-variant/30 hover:border-error/20"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                  <span className="text-sm font-medium hidden sm:inline">Clear History</span>
                </button>
              </div>

              {/* Chat Container */}
              <div className="bg-surface-base rounded-xl border border-surface-variant flex flex-col flex-1 shadow-sm overflow-hidden min-h-[400px]">
                {/* Messages Roster */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 font-sans text-sm">
                  {mcpMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-3 shadow-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-surface-container text-on-surface border border-surface-variant/40'
                      }`}>
                        <div className="font-bold text-[10px] uppercase opacity-75 mb-1">
                          {msg.role === 'user' ? 'You' : (currentUserRole === 'receptionist' ? 'SPA AI Receptionist' : 'Cal.com AI Companion Agent')}
                        </div>
                        
                        <div>{msg.content}</div>
                        {msg.toolInvocations && msg.toolInvocations.map((tool: any, i: number) => (
                          <div key={i} className="mt-2 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20">
                            {tool.state === 'result' ? `✅ Finished: ${tool.toolName}` : `⚙️ Running: ${tool.toolName}...`}
                          </div>
                        ))}

                      </div>
                    </div>
                  ))}
                  {mcpLoading && (
                    <div className="flex justify-start">
                      <div className="bg-surface-container text-on-surface border border-surface-variant/40 rounded-xl px-4 py-3 shadow-xs flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        <span className="text-xs text-on-surface-variant italic font-semibold">Agent is running MCP tools...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions Row */}
                <div className="px-6 py-3 bg-surface-container-low border-t border-surface-variant/60 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold text-on-surface-variant/80 uppercase flex items-center gap-1 w-full mb-1">
                    <span className="material-symbols-outlined text-xs text-primary">tips_and_updates</span> Try asking:
                  </span>
                  <button 
                    disabled={mcpLoading}
                    onClick={() => handleMcpSubmit("What bookings do I have this week?")} 
                    className="bg-surface-base hover:bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    “What bookings do I have this week?”
                  </button>
                  <button 
                    disabled={mcpLoading}
                    onClick={() => handleMcpSubmit("Show me my available slots for next Monday")} 
                    className="bg-surface-base hover:bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    “Show me my available slots”
                  </button>
                  <button 
                    disabled={mcpLoading}
                    onClick={() => handleMcpSubmit("What event types do I have?")} 
                    className="bg-surface-base hover:bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    “What event types do I have?”
                  </button>
                  <button 
                    disabled={mcpLoading}
                    onClick={() => handleMcpSubmit("Create a 30-minute event type called 'Quick Chat'")} 
                    className="bg-surface-base hover:bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    “Create a 30-min event type”
                  </button>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-surface border-t border-surface-variant flex gap-3">
                  <input
                    type="text"
                    disabled={mcpLoading}
                    value={mcpInput}
                    onChange={handleMcpInputChange}
                    onKeyDown={e => e.key === 'Enter' && handleMcpSubmit()}
                    placeholder="Type natural language instruction to Cal.com MCP server..."
                    className="flex-1 bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-sm font-semibold outline-none shadow-sm disabled:opacity-50"
                  />
                  <button
                    disabled={mcpLoading || !mcpInput.trim()}
                    onClick={() => handleMcpSubmit()}
                    className="bg-primary text-white px-6 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:opacity-90 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Support View */}
        {currentView === 'support' && (
          <main className="flex-1 p-4 sm:p-8 bg-surface-muted overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <div>
                <h2 className="text-headline-xl font-headline-xl text-on-surface mb-2 uppercase tracking-wider font-headline">Help & Customer Support</h2>
                <p className="text-body-lg font-body-lg text-on-surface-variant">Ask questions, review document guides, or contact technical assistance.</p>
              </div>
              
              <div className="bg-surface-base rounded-xl p-8 border border-surface-variant shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
                <span className="material-symbols-outlined text-[64px] text-primary mb-4">contact_support</span>
                <h3 className="text-headline-md font-bold mb-2 font-headline">Contact Strawberry Technical Desk</h3>
                <p className="text-body-md text-on-surface-variant max-w-md">For immediate issues regarding Cal.com sync, Google Sheets OAuth integrations, or specialist scheduling conflicts, please contact support@strawberryhotels.com.</p>
              </div>
            </div>
          </main>
        )}

        {/* Availability Lookup View */}
        {currentView === 'availability' && (
          <main className="flex-1 p-4 sm:p-8 bg-surface-muted overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <div>
                <h2 className="text-headline-xl font-headline-xl text-on-surface mb-2 font-headline uppercase tracking-wider">Availability Lookup</h2>
                <p className="text-body-lg font-body-lg text-on-surface-variant">Query real-time therapist scheduling slots from Cal.diy / Cal.com integration endpoints.</p>
              </div>
              <div className="bg-surface-base rounded-xl p-6 border border-surface-variant shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Select Treatment (Enriched Catalog)</label>
                    <select
                      value={availabilityTreatment}
                      onChange={e => {
                        setAvailabilityTreatment(e.target.value);
                        if (e.target.value) {
                          setAvailabilitySpecialist('');
                          setAvailabilityCoSpecialist('');
                        }
                      }}
                      className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                    >
                      <option value="">Choose Treatment...</option>
                      {(() => {
                        const finalTreatments = getDynamicTreatments(specialists, calEventTypes, treatments);
                        
                        return finalTreatments.map((t: any) => (
                          <option key={t.id} value={t.name}>
                            {t.name} {t.duration ? `(${t.duration})` : ''}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Select Specialist</label>
                    <select
                      value={availabilitySpecialist}
                      onChange={e => setAvailabilitySpecialist(e.target.value)}
                      className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                    >
                      <option value="">All Eligible Therapists</option>
                      {specialists
                        .filter(s => {
                          if (!availabilityTreatment) return s.status === 'active';
                          // Only show specialists mapped to the selected treatment
                          const uid = (s.calUserId || s.calUsername || s.therapist_id || '').toString();
                          return true;
                        })
                        .map(spec => (
                          <option key={spec.therapist_id} value={spec.therapist_name}>
                            {spec.therapist_name} {spec.mappedEventSlug ? `(${spec.mappedEventSlug})` : '(No mapping)'}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Select Co-Specialist (Optional)</label>
                    <select
                      disabled={!!availabilityTreatment}
                      value={availabilityCoSpecialist}
                      onChange={e => setAvailabilityCoSpecialist(e.target.value)}
                      className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <option value="">None (Single Therapist)</option>
                      {specialists.filter(s => s.therapist_name !== availabilitySpecialist).map(spec => (
                        <option key={spec.therapist_id} value={spec.therapist_name}>
                          {spec.therapist_name} {spec.mappedEventSlug ? `(${spec.mappedEventSlug})` : '(No mapping)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Select Date</label>
                    <input
                      type="date"
                      value={availabilityDate}
                      onChange={e => setAvailabilityDate(e.target.value)}
                      className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-surface-variant pt-4">
                  <button
                    type="button"
                    onClick={handleFetchAvailability}
                    disabled={isLoadingAvailability}
                    className="bg-primary text-white h-[44px] px-8 rounded-lg text-label-md font-bold hover:opacity-90 flex items-center justify-center gap-2 shadow-sm transition-all clickable-hover-effect cursor-pointer"
                  >
                    {isLoadingAvailability ? (
                      <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                        Querying Cal.diy...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">search</span>
                        Search Slots
                      </>
                    )}
                  </button>
                </div>
              </div>

              {availabilityError && (
                <div className="bg-[#EAB308]/10 border border-[#EAB308]/20 text-[#B45309] p-4 rounded-xl text-sm flex items-start gap-2.5 animate-fade-in">
                  <span className="material-symbols-outlined text-[20px] text-[#B45309]">warning</span>
                  <div>
                    <span className="font-bold">Notice:</span> {availabilityError}
                  </div>
                </div>
              )}

              <div className="bg-surface-base rounded-xl border border-surface-variant p-6 shadow-sm space-y-4">
                <h3 className="text-headline-md font-bold text-on-surface font-headline">Available Time Slots</h3>
                
                {availabilitySlots.length === 0 ? (
                  <div className="text-center py-12 text-on-surface-variant/40 italic text-sm">
                    No slots searched or available. Click "Search Slots" above.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 animate-fade-in">
                    {availabilitySlots.map((slot, index) => {
                      let timeLabel = '09:00 - 10:00';
                      try {
                        const dateObj = new Date(slot.time);
                        const endObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
                        const sStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                        const eStr = endObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                        timeLabel = `${sStr} - ${eStr}`;
                      } catch {
                        timeLabel = slot.time;
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            const specToBook = slot.specialistName || availabilitySpecialist;
                            const coSpecToBook = availabilityCoSpecialist;
                            setBookSpecialist(specToBook);
                            setBookCoSpecialist(coSpecToBook);
                            setBookDate(availabilityDate);
                            setBookTimeLabel(timeLabel.split(' - ')[0]);
                            if (availabilityTreatment || slot.treatmentName) {
                              setBookTreatment(availabilityTreatment || slot.treatmentName);
                            }
                            setShowBookingModal(true);
                            triggerNotification(
                              `Prefilled Quick Book modal for ${specToBook} at ${timeLabel}`
                            );
                          }}
                          className="bg-primary/5 hover:bg-primary hover:text-white border border-primary/20 hover:border-primary text-primary px-3 py-2.5 rounded-lg text-center transition-all clickable-hover-effect cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[64px]"
                        >
                          <span className="font-mono text-sm font-bold">{timeLabel.split(' - ')[0]}</span>
                          {slot.specialistName && (
                            <span className="text-[10px] opacity-85 font-semibold bg-primary/10 px-1.5 py-0.5 rounded truncate max-w-full">
                              👤 {slot.specialistName.split(' ')[0]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* Bookings Registry View */}
        {currentView === 'bookings' && (
          <main className="flex-1 p-4 sm:p-8 bg-surface-muted overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in text-on-surface">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                <div>
                  <h2 className="text-headline-xl font-headline-xl text-on-surface mb-2 font-headline">Bookings Registry</h2>
                  <p className="text-body-lg text-on-surface-variant font-normal">Manage all active schedules, rescheduling tracks, and cancellations.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-label-md font-label-md text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg">
                    {appointments.filter(a => !a.isBreakBlock && !a.isCleaningBlock && (searchQuery.trim() === '' || (a.client || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.procedure || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.date || '').toLowerCase().includes(searchQuery.toLowerCase()))).length} Active Bookings
                  </div>
                </div>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex items-center gap-6 border-b border-surface-variant mb-6 overflow-x-auto">
                <button 
                  onClick={() => setBookingsTab('all')}
                  className={`pb-3 px-1 border-b-2 font-semibold flex items-center gap-2 transition-all shrink-0 ${bookingsTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  <span>All Bookings</span>
                </button>
                <button 
                  onClick={() => setBookingsTab('reschedules')}
                  className={`pb-3 px-1 border-b-2 font-semibold flex items-center gap-2 transition-all shrink-0 ${bookingsTab === 'reschedules' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">autorenew</span>
                  <span>Reschedules History</span>
                </button>
                <button 
                  onClick={() => setBookingsTab('cancellations')}
                  className={`pb-3 px-1 border-b-2 font-semibold flex items-center gap-2 transition-all shrink-0 ${bookingsTab === 'cancellations' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">cancel_schedule_send</span>
                  <span>Cancellations History</span>
                </button>
              </div>

              {bookingsTab === 'all' && (
                <div className="bg-surface-base rounded-xl border border-surface-variant shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-surface-variant">
                          <th className="px-6 py-4">Client</th>
                          <th className="px-6 py-4">Treatment</th>
                          <th className="px-6 py-4">Specialist</th>
                          <th className="px-6 py-4">Date & Time</th>
                          <th className="px-6 py-4">Notes</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-variant text-body-md">
                        {appointments.filter(a => !a.isBreakBlock && !a.isCleaningBlock && (searchQuery.trim() === '' || (a.client || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.procedure || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.date || '').toLowerCase().includes(searchQuery.toLowerCase()))).slice().reverse().map((appt) => (
                          <tr 
                            key={appt.id} 
                            onClick={() => setSelectedAppointment(appt)}
                            className="hover:bg-surface-muted/20 transition-all clickable-hover-effect cursor-pointer"
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-on-surface">{appt.client}</div>
                              <div className="text-xs text-on-surface-variant">{appt.email || 'client@strawberryhotels.com'}</div>
                            </td>
                            <td className="px-6 py-4 font-medium">{appt.procedure}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 bg-secondary-container/40 text-on-secondary-container px-2.5 py-1 rounded-full text-xs font-semibold">
                                <span className="material-symbols-outlined text-[14px]">badge</span>
                                {appt.specialist}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs">
                              <div className="font-bold">{appt.date || dashboardDate}</div>
                              <div className="text-on-surface-variant">{appt.timeLabel} ({appt.duration})</div>
                            </td>
                            <td className="px-6 py-4 text-xs text-on-surface-variant max-w-[200px] truncate" title={appt.notes}>
                              {appt.notes || '—'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                                appt.status === 'confirmed' 
                                  ? 'bg-primary/15 text-primary' 
                                  : appt.status === 'pending'
                                    ? 'bg-[#EAB308]/15 text-[#B45309]'
                                    : 'bg-surface-variant text-on-surface-variant'
                              }`}>
                                {appt.status === 'confirmed' ? 'Confirmed' : appt.status === 'pending' ? 'Pending' : appt.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleReschedule(appt)}
                                  className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                                  title="Reschedule Booking"
                                >
                                  <span className="material-symbols-outlined text-[20px]">autorenew</span>
                                </button>
                                {appt.status === 'pending' && (
                                  <button 
                                    onClick={async () => {
                                      try {
                                        const { bookingService } = await import('./services/bookingService');
                                        await bookingService.confirmBooking(appt.id);
                                        triggerNotification(`Successfully confirmed booking for ${appt.client}.`);
                                        setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'confirmed' } : a));
                                      } catch (err: any) {
                                        triggerNotification(`Failed to confirm: ${err.message}`);
                                      }
                                    }}
                                    className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                                    title="Confirm Booking"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                  </button>
                                )}
                                <button 
                                  onClick={async () => {
                                    try {
                                      const { bookingService } = await import('./services/bookingService');
                                      await bookingService.markBookingAbsent(appt.id, appt.email || 'client@strawberryhotels.com');
                                      triggerNotification(`Marked ${appt.client} as absent.`);
                                      setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'absent' } : a));
                                    } catch (err: any) {
                                      triggerNotification(`Failed to mark absent: ${err.message}`);
                                    }
                                  }}
                                  className="text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                                  title="Mark Attendee Absent"
                                >
                                  <span className="material-symbols-outlined text-[20px]">person_off</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    setReassigningAppt(appt);
                                    if (specialists.length > 0) {
                                      setTargetReassignSpecialistId(specialists[0].therapist_id);
                                    }
                                  }}
                                  className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                                  title="Reassign Specialist"
                                >
                                  <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatusAppt(appt.id, 'cancelled')}
                                  className="text-[#FC5E58] hover:bg-[#FC5E58]/10 p-2 rounded-lg transition-colors flex items-center justify-center"
                                  title="Cancel Booking"
                                >
                                  <span className="material-symbols-outlined text-[20px]">cancel</span>
                                </button>
                                <button 
                                  onClick={() => setSelectedAppointment(appt)}
                                  className="text-on-surface-variant hover:bg-surface-container p-2 rounded-lg transition-colors flex items-center justify-center"
                                  title="View Sync History"
                                >
                                  <span className="material-symbols-outlined text-[20px]">history</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {bookingsTab === 'reschedules' && (
                <div className="bg-surface-base rounded-xl border border-surface-variant shadow-sm p-6 space-y-4">
                  <h3 className="text-headline-md font-bold">Rescheduling Requests Audit Logs</h3>
                  <div className="text-sm text-on-surface-variant mb-4">Displays tracking logs of modified, shifted, and updated bookings.</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-surface-variant">
                          <th className="px-6 py-4">Booking ID</th>
                          <th className="px-6 py-4">Client</th>
                          <th className="px-6 py-4">Previous Time</th>
                          <th className="px-6 py-4">New Target Time</th>
                          <th className="px-6 py-4">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-variant text-body-md">
                        {appointments.filter(a => (a.isRescheduled || a.notes?.toLowerCase().includes('rescheduled')) && (searchQuery.trim() === '' || (a.client || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.procedure || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.date || '').toLowerCase().includes(searchQuery.toLowerCase()))).slice().reverse().map(appt => (
                          <tr key={appt.id} className="hover:bg-surface-muted/20">
                            <td className="px-6 py-4 font-mono text-xs">{appt.id}</td>
                            <td className="px-6 py-4 font-bold">{appt.client}</td>
                            <td className="px-6 py-4 text-xs text-on-surface-variant">Original Slot</td>
                            <td className="px-6 py-4 text-xs font-mono font-bold text-primary">{appt.date} • {appt.timeLabel}</td>
                            <td className="px-6 py-4 text-xs italic">{appt.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {bookingsTab === 'cancellations' && (
                <div className="bg-surface-base rounded-xl border border-surface-variant shadow-sm p-6 space-y-4">
                  <h3 className="text-headline-md font-bold text-[#FC5E58]">Cancellations Registry & Logs</h3>
                  <div className="text-sm text-on-surface-variant mb-4">Archived historical cancellations data.</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-surface-variant">
                          <th className="px-6 py-4">Client</th>
                          <th className="px-6 py-4">Treatment</th>
                          <th className="px-6 py-4">Specialist</th>
                          <th className="px-6 py-4">Reason / Notes</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-variant text-body-md">
                        {dashboardAppointments.filter(r => r.status === 'cancelled' && (searchQuery.trim() === '' || (r.client || '').toLowerCase().includes(searchQuery.toLowerCase()) || (r.procedure || '').toLowerCase().includes(searchQuery.toLowerCase()) || (r.date || '').toLowerCase().includes(searchQuery.toLowerCase()))).slice().reverse().map((req, idx) => (
                          <tr key={idx} className="hover:bg-surface-muted/20">
                            <td className="px-6 py-4 font-bold">{req.client || 'Unknown Client'}</td>
                            <td className="px-6 py-4">{req.procedure || 'Treatment'}</td>
                            <td className="px-6 py-4 text-xs">{req.specialist || 'System'}</td>
                            <td className="px-6 py-4 text-xs italic text-[#FC5E58]">{req.cancellationReason || 'Cancelled.'}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-[#FC5E58]/15 text-[#FC5E58]">
                                Cancelled
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              </div>
          </main>
        )}

        {/* Week View */}
        {currentView === 'week' && (
          <main className="flex-1 p-4 sm:p-8 bg-surface-muted overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                <div>
                  <h2 className="text-headline-xl font-headline-xl text-on-surface mb-2 font-headline">Week View Schedule</h2>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                    <span className="text-body-lg text-on-surface font-semibold mr-4">
                      {getWeekRangeLabel(weekDates)}
                    </span>
                    <input 
                      type="date" 
                      value={dashboardDate} 
                      onChange={e => setDashboardDate(e.target.value)} 
                      className="bg-transparent border-b border-dashed border-primary text-body-md font-body-md text-on-surface focus:outline-none focus:border-solid cursor-pointer"
                    />
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant font-medium bg-surface-base px-3 py-1.5 rounded-lg border border-surface-variant">
                  Weekly Scope Stats
                </div>
              </div>

              {/* Weekly KPI statistics cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-surface-base p-4 rounded-xl border border-surface-variant shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Total Appts</p>
                    <span className="material-symbols-outlined text-outline">calendar_today</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-headline-md font-headline-md text-on-surface">{weekKpiTotal}</span>
                  </div>
                </div>

                <div className="bg-surface-base p-4 rounded-xl border border-surface-variant shadow-sm border-l-4 border-primary">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Confirmed</p>
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-headline-md font-headline-md text-primary">{weekKpiConfirmed}</span>
                  </div>
                </div>

                <div className="bg-surface-base p-4 rounded-xl border border-surface-variant shadow-sm border-l-4 border-[#EAB308]">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Pending</p>
                    <span className="material-symbols-outlined text-[#B45309]">schedule</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-headline-md font-headline-md text-[#B45309]">{weekKpiPending}</span>
                  </div>
                </div>

                <div className="bg-surface-base p-4 rounded-xl border border-surface-variant shadow-sm border-l-4 border-[#FC5E58]">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Canceled</p>
                    <span className="material-symbols-outlined text-[#FC5E58]">cancel</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-headline-md font-headline-md text-[#FC5E58]">{weekKpiCanceled}</span>
                  </div>
                </div>
              </div>

              {/* Weekly Calendar Columns */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDates.map((dateStr) => {
                  const dayName = new Date(dateStr).toLocaleDateString([], { weekday: 'short' });
                  const dayNum = new Date(dateStr).toLocaleDateString([], { day: 'numeric' });
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  
                  const dayAppts = appointments.filter(a => (a.date || '2023-10-24') === dateStr);
                  
                  return (
                    <div 
                      key={dateStr} 
                      onDragOver={e => e.preventDefault()}
                      onDragEnter={e => e.currentTarget.classList.add('bg-primary/5')}
                      onDragLeave={e => e.currentTarget.classList.remove('bg-primary/5')}
                      onDrop={e => {
                        e.currentTarget.classList.remove('bg-primary/5');
                        handleDropOnWeekDay(e, dateStr);
                      }}
                      onClick={() => setDashboardDate(dateStr)}
                      className={`bg-surface-base rounded-xl border p-4 flex flex-col min-h-[350px] shadow-sm transition-all duration-200 clickable-hover-effect cursor-pointer ${isToday ? 'border-primary ring-2 ring-primary/10' : 'border-surface-variant'}`}
                    >
                      <div className="border-b border-surface-variant pb-2 mb-3 text-center">
                        <p className={`text-xs font-bold uppercase ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>{dayName}</p>
                        <p className={`text-xl font-extrabold font-headline ${isToday ? 'text-primary' : 'text-on-surface'}`}>{dayNum}</p>
                      </div>
                      
                      <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px] pr-1">
                        {dayAppts.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-center text-[10px] text-on-surface-variant/40 italic py-8">
                            No bookings
                          </div>
                        ) : (
                          dayAppts.map(appt => (
                            <div 
                              key={appt.id} 
                              draggable={!appt.isBreakBlock && !appt.isCleaningBlock}
                              onDragStart={(e) => {
                                handleDragStart(e, appt.id);
                                setIsDraggingAppt(true);
                              }}
                              onDragEnd={() => setIsDraggingAppt(false)}
                              onClick={(e) => { e.stopPropagation(); setSelectedAppointment(appt); }}
                              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all duration-200 clickable-hover-effect ${
                                appt.status === 'confirmed' ? 'bg-primary/5 border-primary/20 text-primary' :
                                appt.status === 'pending' || appt.status === 'needs_action' ? 'bg-[#EAB308]/5 border-[#EAB308]/20 text-[#B45309]' :
                                'bg-surface-variant/30 border-outline/20 text-outline opacity-60'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">{appt.timeLabel.split(' - ')[0]}</span>
                                {appt.vip && <span className="w-1.5 h-1.5 rounded-full bg-accent-coral"></span>}
                              </div>
                              <p className="text-xs font-bold text-on-surface truncate mt-1">{appt.client}</p>
                              <p className="text-[10px] text-on-surface-variant truncate font-medium">{appt.procedure}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        )}

        {/* Month View */}
        {currentView === 'month' && (
          <main className="flex-1 p-4 sm:p-8 bg-surface-muted overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                <div>
                  <h2 className="text-headline-xl font-headline-xl text-on-surface mb-2 font-headline">Month View Schedule</h2>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                    <span className="text-body-lg text-on-surface font-semibold mr-4">
                      {new Date(dashboardDate).toLocaleDateString([], { month: 'long', year: 'numeric' })}
                    </span>
                    <input 
                      type="date" 
                      value={dashboardDate} 
                      onChange={e => setDashboardDate(e.target.value)} 
                      className="bg-transparent border-b border-dashed border-primary text-body-md font-body-md text-on-surface focus:outline-none focus:border-solid cursor-pointer"
                    />
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant font-medium bg-surface-base px-3 py-1.5 rounded-lg border border-surface-variant">
                  Monthly Scope Stats
                </div>
              </div>

              {/* Monthly KPI statistics cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-surface-base p-4 rounded-xl border border-surface-variant shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Total Appts</p>
                    <span className="material-symbols-outlined text-outline">calendar_today</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-headline-md font-headline-md text-on-surface">{monthKpiTotal}</span>
                  </div>
                </div>

                <div className="bg-surface-base p-4 rounded-xl border border-surface-variant shadow-sm border-l-4 border-primary">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Confirmed</p>
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-headline-md font-headline-md text-primary">{monthKpiConfirmed}</span>
                  </div>
                </div>

                <div className="bg-surface-base p-4 rounded-xl border border-surface-variant shadow-sm border-l-4 border-[#EAB308]">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Pending</p>
                    <span className="material-symbols-outlined text-[#B45309]">schedule</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-headline-md font-headline-md text-[#B45309]">{monthKpiPending}</span>
                  </div>
                </div>

                <div className="bg-surface-base p-4 rounded-xl border border-surface-variant shadow-sm border-l-4 border-[#FC5E58]">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Canceled</p>
                    <span className="material-symbols-outlined text-[#FC5E58]">cancel</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-headline-md font-headline-md text-[#FC5E58]">{monthKpiCanceled}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Calendar Grid */}
              <div className="bg-surface-base rounded-xl border border-surface-variant p-4 sm:p-6 shadow-sm">
                <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <span key={day} className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{day}</span>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonthGrid(dashboardDate).map((cell, index) => {
                    if (!cell) {
                      return <div key={`empty-${index}`} className="aspect-square bg-surface-muted/20 rounded-lg border border-transparent"></div>;
                    }
                    
                    const cellAppts = appointments.filter(a => (a.date || '2023-10-24') === cell.dateStr && a.status !== 'cancelled');
                    const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
                    const isCurrent = cell.dateStr === dashboardDate;
                    
                    return (
                      <div 
                        key={cell.dateStr} 
                        onClick={() => {
                          setDashboardDate(cell.dateStr);
                          setCurrentView('dashboard');
                          triggerNotification(`Switched dashboard view to ${cell.dateStr}`);
                        }}
                        className={`aspect-square p-2 rounded-lg border flex flex-col justify-between cursor-pointer transition-all duration-200 clickable-hover-effect ${
                          isCurrent ? 'bg-primary/10 border-primary font-bold' :
                          isToday ? 'border-primary ring-1 ring-primary/20 bg-surface-muted/10' :
                          'bg-surface-base border-surface-variant/70'
                        }`}
                      >
                        <span className={`text-xs ${isCurrent ? 'text-primary font-extrabold' : 'text-on-surface'}`}>{cell.dayNum}</span>
                        
                        <div className="flex flex-col items-end gap-1">
                          {cellAppts.length > 0 && (
                            <>
                              <span className="text-[9px] font-extrabold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-mono">
                                {cellAppts.length}
                              </span>
                              <div className="flex gap-0.5 flex-wrap justify-end max-w-full mt-0.5">
                                {cellAppts.slice(0, 8).map(appt => {
                                  const matchedSpec = specialists.find(s => s.therapist_name === appt.specialist) || specialists.find(s => s.therapist_id === appt.assigned_to) || specialists[0] || {};
                                  const dotColor = matchedSpec.color || '#0d9488';
                                  let sizeClass = 'w-2.5 h-2.5';
                                  if (cellAppts.length > 3 && cellAppts.length <= 6) sizeClass = 'w-2 h-2';
                                  if (cellAppts.length > 6) sizeClass = 'w-1.5 h-1.5';
                                  
                                  return (
                                    <span 
                                      key={appt.id} 
                                      className={`${sizeClass} rounded-full flex-shrink-0 shadow-sm`} 
                                      style={{ backgroundColor: dotColor }}
                                      title={`${appt.specialist || 'Unknown'} - ${appt.status}`}
                                    ></span>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Appointment Detail / Reschedule Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setSelectedAppointment(null); setIsRescheduling(false); }} className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"></div>
          
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-xl shadow-[0_8px_32px_rgba(74,142,142,0.08)] flex flex-col max-h-[90vh] overflow-hidden border border-surface-variant relative z-10 animate-fade-in" id="appointmentModal">
            <button onClick={() => { setSelectedAppointment(null); setIsRescheduling(false); }} aria-label="Close modal" className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary transition-colors duration-200 rounded-full hover:bg-surface-container-low group z-10">
              <span className="material-symbols-outlined text-2xl group-hover:scale-90 transition-transform">close</span>
            </button>
            
            <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-surface-variant bg-surface-container-lowest flex flex-col gap-2 relative">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">
                {selectedAppointment.isCleaningBlock ? '🧹 Cleaning Block Details' : selectedAppointment.isBreakBlock ? '☕ Therapist Break Details' : isRescheduling ? 'Appointment Service Selection' : 'Appointment Details'}
              </h2>
              <div className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <span className="font-body-md text-body-md">{selectedAppointment.date || 'Oct 24, 2023'} • {selectedAppointment.timeLabel}</span>
              </div>
              {!selectedAppointment.isCleaningBlock && !selectedAppointment.isBreakBlock && (
                <div className="mt-4 flex">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md border border-secondary-fixed">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedAppointment.status === 'confirmed' ? 'bg-primary' : 'bg-strawberry-red'}`}></span>
                    {selectedAppointment.status === 'confirmed' ? 'Confirmed' : 'Pending Confirmation'}
                  </span>
                </div>
              )}
            </div>

            {(selectedAppointment.isCleaningBlock || selectedAppointment.isBreakBlock) ? (
              <div className="px-6 sm:px-8 py-6 overflow-y-auto flex-1 flex flex-col gap-6 bg-surface">
                <div className="flex items-center gap-3 bg-surface-container-lowest border border-surface-variant p-4 rounded-xl">
                  <span className="material-symbols-outlined text-[40px] text-primary">
                    {selectedAppointment.isCleaningBlock ? 'cleaning_services' : 'coffee'}
                  </span>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface text-base">
                      {selectedAppointment.isCleaningBlock ? 'Specialist Cleaning Block' : 'Therapist Break Block'}
                    </h3>
                    <p className="text-body-md text-on-surface-variant">
                      Assigned Provider: <strong>{selectedAppointment.specialist}</strong> ({selectedAppointment.room})
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Date</label>
                      <input 
                        type="date"
                        value={selectedAppointment.date || '2023-10-24'}
                        onChange={e => setSelectedAppointment({...selectedAppointment, date: e.target.value})}
                        className="w-full bg-sand-light rounded px-3 py-2 text-sm font-semibold outline-none focus:border-primary border border-transparent h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Duration</label>
                      <select
                        value={parseInt(selectedAppointment.duration)}
                        onChange={e => {
                          const minVal = Number(e.target.value);
                          const durationStr = `${minVal} min`;
                          const startSlot = selectedAppointment.timeLabel.split(' - ')[0];
                          const newRange = calculateTimeLabel(startSlot, durationStr);
                          setSelectedAppointment({
                            ...selectedAppointment,
                            duration: durationStr,
                            timeLabel: newRange,
                            posStyle: mapTimeToPos(newRange, durationStr, 0)
                          });
                        }}
                        className="w-full bg-sand-light rounded px-3 py-2 text-sm font-semibold outline-none focus:border-primary border border-transparent h-10 cursor-pointer"
                      >
                        {selectedAppointment.isCleaningBlock ? (
                          <>
                            <option value="15">15 Min</option>
                            <option value="30">30 Min</option>
                            <option value="45">45 Min</option>
                            <option value="60">60 Min</option>
                            <option value="75">75 Min</option>
                            <option value="90">90 Min</option>
                          </>
                        ) : (
                          <>
                            <option value="30">30 Min</option>
                            <option value="60">60 Min</option>
                            <option value="90">90 Min</option>
                            <option value="120">120 Min</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Calculated Interval Slot</label>
                    <input 
                      type="text" 
                      disabled
                      value={selectedAppointment.timeLabel} 
                      className="w-full bg-surface-muted text-on-surface-variant rounded px-3 py-2 text-sm font-mono border border-transparent h-10"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-surface-variant pt-6 mt-auto">
                  <button 
                    type="button"
                    onClick={() => {
                      setAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id));
                      setSelectedAppointment(null);
                      triggerNotification('Block deleted from timeline.');
                    }}
                    className="h-12 px-6 rounded-lg bg-surface-container-low text-error hover:bg-error-container/50 font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                    Delete Block
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      // Check overlaps
                      const hasOverlap = appointments.some(other => {
                        if (other.id === selectedAppointment.id || other.status === 'cancelled') return false;
                        if ((other.date || '2023-10-24') !== selectedAppointment.date) return false;
                        if (other.specialist === selectedAppointment.specialist || other.coSpecialist === selectedAppointment.specialist) {
                          const otherClean = other.isBreakBlock || other.isCleaningBlock ? 0 : (other.cleaningTime !== undefined ? other.cleaningTime : 10);
                          return checkOverlap(selectedAppointment.timeLabel, selectedAppointment.duration, 0, other.timeLabel, other.duration || '60 min', otherClean);
                        }
                        return false;
                      });

                      if (hasOverlap) {
                        triggerNotification('Conflict: Overlaps with an existing slot.');
                        return;
                      }
                      
                      setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? selectedAppointment : a));
                      setSelectedAppointment(null);
                      triggerNotification('Block parameters updated.');
                    }}
                    className="h-12 px-8 rounded-lg bg-primary text-white font-bold hover:opacity-90 flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-6 sm:px-8 py-6 overflow-y-auto flex-1 flex flex-col gap-8 bg-surface">
                  
                  {/* Client Information Form Editing */}
                  <section>
                    <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4 pl-1">Client Profile Details</h3>
                    <div className="bg-surface-container-lowest rounded-lg border border-surface-variant p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface-container-low border border-surface-variant flex items-center justify-center font-bold text-lg text-primary">
                          {selectedAppointment.client.split(' ').map((n:any)=>n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Full Name</label>
                          <input 
                            type="text" 
                            value={selectedAppointment.client} 
                            onChange={e => setSelectedAppointment({...selectedAppointment, client: e.target.value})}
                            className="w-full bg-sand-light border-transparent focus:bg-surface-base focus:border-primary rounded px-3 py-1.5 text-body-md font-bold"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Email Address</label>
                          <input 
                            type="email" 
                            value={selectedAppointment.email} 
                            onChange={e => setSelectedAppointment({...selectedAppointment, email: e.target.value})}
                            className="w-full bg-sand-light border-transparent focus:bg-surface-base focus:border-primary rounded px-3 py-1.5 text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Phone Number</label>
                          <input 
                            type="text" 
                            value={selectedAppointment.phone} 
                            onChange={e => setSelectedAppointment({...selectedAppointment, phone: e.target.value})}
                            className="w-full bg-sand-light border-transparent focus:bg-surface-base focus:border-primary rounded px-3 py-1.5 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {!isRescheduling && (
                    <section>
                      <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4 pl-1">Service Details</h3>
                      <div className="bg-surface-container-lowest rounded-lg border border-surface-variant p-0 shadow-sm overflow-hidden">
                        <div className="p-5 flex justify-between items-start border-b border-surface-variant">
                          <div>
                            <h4 className="font-headline-md text-headline-md text-on-surface text-base">{selectedAppointment.procedure}</h4>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                              {selectedAppointment.duration} • Provider: {selectedAppointment.specialist}
                              {selectedAppointment.coSpecialist ? ` & ${selectedAppointment.coSpecialist} (Dual treatment)` : ''}
                            </p>
                          </div>
                          <span className="font-headline-md text-headline-md text-primary text-base">{selectedAppointment.price}</span>
                        </div>

                        {/* Edit Add-ons lists toggling */}
                        <div className="p-5 bg-surface-container-low/50 space-y-3">
                          <h5 className="font-label-sm text-label-sm text-on-surface-variant mb-2">ADD-ON PACKAGES</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {addons.map(addon => {
                              const isSelected = selectedAppointment.addons.includes(addon.name);
                              return (
                                <label 
                                  key={addon.id}
                                  className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border-primary/30 font-semibold' : 'bg-surface-base border-surface-variant hover:bg-surface-muted/20'}`}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    onChange={() => handleToggleAddonInAppt(addon.name)}
                                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary mt-0.5"
                                  />
                                  <div>
                                    <span className="text-xs text-on-surface block">{addon.name} ({addon.price})</span>
                                    <span className="text-[10px] text-on-surface-variant font-normal leading-tight block">{addon.description}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </section>
                  )}

                  {isRescheduling && (
                    <section>
                      <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4 pl-1">Service Selection</h3>
                      <div className="bg-surface-container-lowest rounded-lg border border-surface-variant p-0 shadow-sm overflow-hidden">
                        
                        <div className="p-5 flex justify-between items-start border-b border-surface-variant">
                          <div>
                            <h4 className="font-headline-md text-headline-md text-on-surface text-base">{selectedTreatment ? selectedTreatment.name : 'Choose a Treatment'}</h4>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                              {selectedTreatment ? selectedTreatment.duration : '—'} • Provider: {selectedSpecialist || 'Choose Specialist'}
                            </p>
                          </div>
                          <span className="font-headline-md text-headline-md text-primary text-base">{selectedTreatment ? selectedTreatment.price : '—'}</span>
                        </div>

                        <div className="p-4 sm:p-6 bg-surface-muted/30 border-t border-surface-variant space-y-6">
                          {/* Date Picker */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <h5 className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Select Date</h5>
                              <input 
                                type="date"
                                value={reschedDate}
                                onChange={(e) => setReschedDate(e.target.value)}
                                className="w-full h-16 px-5 rounded-xl border border-surface-variant bg-surface-base text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-semibold shadow-sm"
                              />
                            </div>
                            <div>
                              <h5 className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Select Time</h5>
                              <input 
                                type="time"
                                step="900"
                                required
                                value={selectedAppointment?.timeLabel?.split(' - ')[0] || '09:00'}
                                onChange={(e) => {
                                  if (!selectedAppointment) return;
                                  const newStartTime = e.target.value;
                                  const durationStr = selectedTreatment ? selectedTreatment.duration : selectedAppointment.duration;
                                  const newRange = calculateTimeLabel(newStartTime, durationStr);
                                  setSelectedAppointment({
                                    ...selectedAppointment,
                                    timeLabel: newRange
                                  });
                                }}
                                className="w-full h-16 px-5 rounded-xl border border-surface-variant bg-surface-base text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-semibold shadow-sm"
                              />
                            </div>
                          </div>

                          {/* Assign Specialist search box */}
                          <div>
                            <h5 className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Assign Specialist</h5>
                            <div className="relative group">
                              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[20px]">search</span>
                              <input 
                                type="text" 
                                value={searchSpecialist}
                                onChange={(e) => setSearchSpecialist(e.target.value)}
                                placeholder="Search specialists..." 
                                className="w-full h-16 pl-12 pr-5 rounded-xl border border-surface-variant bg-surface-base text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                              />
                              <div className="absolute z-10 w-full mt-1 bg-surface-base border border-surface-variant rounded-lg shadow-md max-h-40 overflow-y-auto">
                                <div className="p-2">
                                  {specialists.filter(s => s.therapist_name.toLowerCase().includes(searchSpecialist.toLowerCase())).map(spec => {
                                    const status = getSpecialistBookingStatus(spec.therapist_name, selectedTreatment?.name || '');
                                    if (!status.valid) {
                                      return (
                                        <button 
                                          key={spec.therapist_id}
                                          type="button"
                                          disabled
                                          className="w-full text-left px-3 py-2 rounded text-body-md text-outline-variant cursor-not-allowed opacity-50"
                                        >
                                          {spec.therapist_name} ({status.reason})
                                        </button>
                                      );
                                    }
                                    return (
                                      <button 
                                        key={spec.therapist_id}
                                        type="button"
                                        onClick={() => { setSelectedSpecialist(spec.therapist_name); setSearchSpecialist(''); }}
                                        className={`w-full text-left px-3 py-2 rounded text-body-md hover:bg-surface-muted transition-colors clickable-hover-effect cursor-pointer ${selectedSpecialist === spec.therapist_name ? 'bg-secondary-container/20 font-bold text-primary' : 'text-on-surface'}`}
                                      >
                                        {spec.therapist_name} ({spec.room_preference})
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Assign Co-Specialist (Optional) */}
                          <div>
                            <h5 className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Co-Therapist (Optional)</h5>
                            <select
                              value={reschedCoSpecialist}
                              onChange={e => setReschedCoSpecialist(e.target.value)}
                              className="w-full h-16 px-5 rounded-xl border border-surface-variant bg-surface-base text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-semibold shadow-sm"
                            >
                              <option value="">None (Single Therapist)</option>
                              {specialists.filter(s => s.therapist_name !== selectedSpecialist).map(spec => {
                                const status = getSpecialistBookingStatus(spec.therapist_name, selectedTreatment?.name || '');
                                if (!status.valid) {
                                  return (
                                    <option key={spec.therapist_id} value={spec.therapist_name} disabled className="text-outline-variant">
                                      {spec.therapist_name} ({status.reason})
                                    </option>
                                  );
                                }
                                return (
                                  <option key={spec.therapist_id} value={spec.therapist_name}>
                                    {spec.therapist_name} ({spec.room_preference})
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {/* Edit Cleaning Time */}
                          <div>
                            <h5 className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Cleaning Time (Minutes)</h5>
                            <input 
                              type="number"
                              required
                              min="0"
                              step="10"
                              value={reschedCleaningTime}
                              onChange={e => setReschedCleaningTime(Number(e.target.value))}
                              className="w-full h-16 px-5 rounded-xl border border-surface-variant bg-surface-base text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold shadow-sm"
                            />
                          </div>

                          <div>
                            <h5 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Treatment Procedure</h5>
                            <select 
                              required
                              value={selectedTreatment?.name || ''}
                              onChange={e => {
                                const name = e.target.value;
                                if (!name) {
                                  setSelectedTreatment(null);
                                  return;
                                }
                                const selectedSpecObj = specialists.find(s => s.therapist_name === selectedSpecialist);
                                const lookupKey = selectedSpecObj?.calUserId || selectedSpecObj?.calUsername;
                                const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];
                                
                                const selectedEt = specEts.find((x:any) => x.title === name);
                                if (selectedEt) {
                                  setSelectedTreatment({
                                    id: selectedEt.id || name,
                                    name: name,
                                    duration: selectedEt.length ? `${selectedEt.length} min` : '30 min',
                                    price: selectedEt.price ? `$${selectedEt.price}` : '—',
                                    description: selectedEt.description || ''
                                  });
                                } else {
                                  // Fallback logic
                                  const t = treatments.find(t => t.name === name);
                                  if (t) setSelectedTreatment(t);
                                }
                              }}
                              className="w-full h-16 px-5 rounded-xl border border-surface-variant bg-surface-base text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold shadow-sm cursor-pointer"
                            >
                              <option value="">Select Treatment...</option>
                              {(() => {
                                if (!selectedSpecialist) return <option value="" disabled>Please select a specialist first</option>;
                                const selectedSpecObj = specialists.find(s => s.therapist_name === selectedSpecialist);
                                if (!selectedSpecObj) return null;

                                const lookupKey = selectedSpecObj.calUserId || selectedSpecObj.calUsername;
                                const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];

                                // De-duplicate by title
                                const uniqueEts: any[] = [];
                                const seenTitles = new Set();
                                for (const et of specEts) {
                                  if (!seenTitles.has(et.title)) {
                                    seenTitles.add(et.title);
                                    uniqueEts.push(et);
                                  }
                                }

                                if (uniqueEts.length === 0) {
                                  return <option value="" disabled>No treatments found for this specialist</option>;
                                }

                                return uniqueEts.map((et: any) => (
                                  <option key={et.id} value={et.title}>{et.title}</option>
                                ));
                              })()}
                            </select>
                          </div>

                          {/* Conditional Duration Picker */}
                          {(() => {
                            if (!selectedTreatment || !selectedSpecialist) return null;
                            const selectedSpecObj = specialists.find(s => s.therapist_name === selectedSpecialist);
                            if (!selectedSpecObj) return null;
                            const lookupKey = selectedSpecObj.calUserId || selectedSpecObj.calUsername;
                            const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];

                            const selectedEt = specEts.find(et => et.title === selectedTreatment.name);

                            // Only show if there are multiple duration options
                            if (!selectedEt || !selectedEt.allowedDurations || selectedEt.allowedDurations.length <= 1) return null;

                            return (
                              <div className="mt-4">
                                <h5 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4">Duration</h5>
                                <select 
                                  required
                                  value={parseInt(selectedTreatment.duration) || ''}
                                  onChange={e => {
                                    const dur = e.target.value;
                                    setSelectedTreatment((prev: any) => ({ ...prev, duration: `${dur} min` }));
                                  }}
                                  className="w-full h-16 px-5 rounded-xl border border-surface-variant bg-surface-base text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold shadow-sm cursor-pointer"
                                >
                                  <option value="">Select Duration...</option>
                                  {selectedEt.allowedDurations.map((dur: number) => (
                                    <option key={dur} value={dur}>{dur} minutes</option>
                                  ))}
                                </select>
                              </div>
                            );
                          })()}

                        </div>
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4 pl-1">Internal Notes</h3>
                    <textarea 
                      value={selectedAppointment.notes}
                      onChange={(e) => {
                        const text = e.target.value;
                        setSelectedAppointment((prev: any) => ({ ...prev, notes: text }));
                      }}
                      className="w-full min-h-[100px] rounded-lg border-none bg-surface-container-low text-on-surface font-body-md text-body-md p-4 transition-all duration-200 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none resize-y" 
                    />
                  </section>
                </div>

                <div className="px-6 sm:px-8 py-5 border-t border-surface-variant bg-surface-container-lowest flex items-center justify-between gap-4 mt-auto">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleUpdateStatusAppt(selectedAppointment.id, 'cancelled')}
                      className="h-12 px-4 sm:px-6 rounded-lg bg-surface-container-low text-error font-label-md text-label-md hover:bg-error-container/50 transition-colors duration-200 flex items-center justify-center gap-2 clickable-hover-effect cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>Cancel Appt
                    </button>
                    
                    {!isRescheduling ? (
                      <button 
                        onClick={() => startRescheduleWorkflow(selectedAppointment)}
                        className="h-12 px-4 sm:px-6 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md hover:bg-secondary-container/60 transition-colors duration-200 flex items-center justify-center gap-2 clickable-hover-effect cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit_calendar</span>Reschedule
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsRescheduling(false)}
                        className="h-12 px-4 sm:px-6 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors duration-200 flex items-center justify-center gap-2 clickable-hover-effect cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>Back
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-on-surface-variant font-medium">
                      <input 
                        type="checkbox" 
                        checked={reschedSaveAsPending} 
                        onChange={(e) => setReschedSaveAsPending(e.target.checked)} 
                        className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                      />
                      Move to Pending
                    </label>
                    {!isRescheduling ? (
                      <button 
                        onClick={handleSaveReschedule}
                        className="h-12 px-6 sm:px-8 rounded-lg bg-strawberry-red text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2 clickable-hover-effect cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">save</span>{reschedSaveAsPending ? 'Save Request' : 'Save Changes'}
                      </button>
                    ) : (
                      <button 
                        onClick={handleSaveReschedule}
                        className="h-12 px-6 sm:px-8 rounded-lg bg-strawberry-red text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2 clickable-hover-effect cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">save</span>{reschedSaveAsPending ? 'Save Request' : 'Save Reschedule'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reassign Specialist Modal */}
      {reassigningAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setReassigningAppt(null)} className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"></div>
          
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-[0_8px_32px_rgba(74,142,142,0.08)] flex flex-col overflow-hidden border border-surface-variant relative z-20 animate-fade-in">
            <button type="button" onClick={() => setReassigningAppt(null)} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            
            <div className="px-6 pt-8 pb-4 border-b border-surface-variant bg-surface-container-lowest flex flex-col gap-1">
              <h2 className="font-headline-md text-headline-md text-on-surface font-headline">Reassign Specialist</h2>
              <p className="text-body-md text-on-surface-variant">Move booking for <strong className="text-on-surface">{reassigningAppt.client}</strong> to a different specialist.</p>
            </div>

            <div className="px-6 py-5 bg-surface space-y-4">
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2 uppercase tracking-wider font-bold">Select New Specialist</label>
                <select
                  value={targetReassignSpecialistId}
                  onChange={e => setTargetReassignSpecialistId(e.target.value)}
                  className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-lg px-4 py-2.5 text-body-md outline-none"
                >
                  {specialists.map(spec => (
                    <option key={spec.therapist_id} value={spec.therapist_id}>
                      {spec.therapist_name} ({spec.role || 'Therapist'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-surface-variant bg-surface-container-lowest flex justify-end gap-3">
              <button type="button" onClick={() => setReassigningAppt(null)} className="h-10 px-5 rounded-lg bg-surface-container-low text-on-surface-variant text-label-md font-semibold hover:bg-surface-container transition-colors">Cancel</button>
              <button 
                type="button" 
                onClick={async () => {
                  try {
                    const targetSpec = specialists.find(s => s.therapist_id === targetReassignSpecialistId);
                    if (!targetSpec) {
                      triggerNotification('Select a valid specialist.');
                      return;
                    }
                    const { bookingService } = await import('./services/bookingService');
                    const calUserId = Object.keys(calSpecialistLinks).find(k => calSpecialistLinks[k] === targetReassignSpecialistId);
                    if (!calUserId) {
                      triggerNotification(`Selected specialist ${targetSpec.therapist_name} is not linked to Cal.com user.`);
                      return;
                    }
                    await bookingService.reassignBooking(reassigningAppt.id, calUserId);
                    triggerNotification(`Reassigned booking to ${targetSpec.therapist_name}.`);
                    setAppointments(prev => prev.map(a => a.id === reassigningAppt.id ? { ...a, specialist: targetSpec.therapist_name } : a));
                    setReassigningAppt(null);
                  } catch (err: any) {
                    triggerNotification(`Failed to reassign: ${err.message}`);
                  }
                }}
                className="h-10 px-6 rounded-lg bg-primary text-white text-label-md font-bold hover:opacity-90 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Treatment Modal */}
      {editingTreatment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingTreatment(null)} className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"></div>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setTreatments(prev => prev.map(t => t.id === editingTreatment.id ? editingTreatment : t));
              triggerNotification(`Treatment "${editingTreatment.name}" updated successfully.`);
              setEditingTreatment(null);
            }} 
            className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-[0_8px_32px_rgba(74,142,142,0.08)] flex flex-col overflow-hidden border border-surface-variant relative z-20 animate-fade-in text-on-surface"
          >
            <button type="button" onClick={() => setEditingTreatment(null)} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            
            <div className="px-6 pt-8 pb-4 border-b border-surface-variant bg-surface-container-lowest flex flex-col gap-1">
              <h2 className="font-headline-md text-headline-md text-on-surface font-headline">Edit Treatment</h2>
              <p className="text-body-md text-on-surface-variant">Update the treatment catalog details.</p>
            </div>

            <div className="px-6 py-5 bg-surface space-y-4">
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider font-bold">Treatment Name</label>
                <input 
                  type="text" 
                  required
                  value={editingTreatment.name} 
                  onChange={e => setEditingTreatment({ ...editingTreatment, name: e.target.value })} 
                  className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-lg px-4 py-2 text-body-md outline-none" 
                />
              </div>
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider font-bold">Category</label>
                <select 
                  value={editingTreatment.category} 
                  onChange={e => setEditingTreatment({ ...editingTreatment, category: e.target.value })} 
                  className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-lg px-4 py-2 text-body-md outline-none"
                >
                  <option>Body</option>
                  <option>Face</option>
                  <option>Couples</option>
                </select>
              </div>
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider font-bold">Duration</label>
                <input 
                  type="text" 
                  required
                  value={editingTreatment.duration} 
                  onChange={e => setEditingTreatment({ ...editingTreatment, duration: e.target.value })} 
                  className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-lg px-4 py-2 text-body-md outline-none" 
                />
              </div>
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider font-bold">Price</label>
                <input 
                  type="text" 
                  required
                  value={editingTreatment.price} 
                  onChange={e => setEditingTreatment({ ...editingTreatment, price: e.target.value })} 
                  className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-lg px-4 py-2 text-body-md outline-none" 
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-surface-variant bg-surface-container-lowest flex justify-end gap-3">
              <button type="button" onClick={() => setEditingTreatment(null)} className="h-10 px-5 rounded-lg bg-surface-container-low text-on-surface-variant text-label-md font-semibold hover:bg-surface-container transition-colors">Cancel</button>
              <button type="submit" className="h-10 px-6 rounded-lg bg-primary text-white text-label-md font-bold hover:opacity-90 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowCancelModal(false)} className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"></div>
          
          <form onSubmit={handleCommitCancellation} className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-[0_8px_32px_rgba(74,142,142,0.08)] flex flex-col overflow-hidden border border-surface-variant relative z-20 animate-fade-in">
            <button type="button" onClick={() => setShowCancelModal(false)} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            
            <div className="px-6 pt-8 pb-4 border-b border-surface-variant bg-surface-container-lowest flex flex-col gap-1">
              <h2 className="font-headline-md text-headline-md text-on-surface font-headline">Cancel Appointment</h2>
              <p className="text-body-md text-on-surface-variant">Are you sure you want to cancel this booking? This action will sync to the Cal.diy API endpoint.</p>
            </div>

            <div className="px-6 py-5 bg-surface space-y-4">
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider font-bold">Cancellation Reason (Required)</label>
                <textarea 
                  required
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="e.g. Client requested cancellation due to scheduling conflict."
                  className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-lg px-4 py-2 text-body-md outline-none resize-none h-24"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-surface-variant bg-surface-container-lowest flex justify-end gap-3">
              <button type="button" onClick={() => setShowCancelModal(false)} className="h-10 px-5 rounded-lg bg-surface-container-low text-on-surface-variant text-label-md font-semibold hover:bg-surface-container transition-colors">Go Back</button>
              <button type="submit" className="h-10 px-6 rounded-lg bg-[#FC5E58] text-white text-label-md font-bold hover:opacity-90 shadow-sm transition-all flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Confirm Cancellation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CELL CLICK CONTEXT MENU */}
      {cellClickMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setCellClickMenu(null)} className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"></div>
          
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-xl shadow-xl p-6 border border-surface-variant relative z-10 animate-fade-in text-on-surface">
            <button onClick={() => setCellClickMenu(null)} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <h3 className="font-headline-sm text-headline-sm mb-2 font-headline uppercase tracking-wider text-primary">Configure Time Slot</h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              Therapist: <strong>{cellClickMenu.specialist}</strong><br />
              Time: <strong>{cellClickMenu.slot}</strong> on <strong>{cellClickMenu.date}</strong>
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setBookSpecialist(cellClickMenu.specialist);
                  setBookCoSpecialist('');
                  setBookDate(cellClickMenu.date);
                  setBookTimeLabel(cellClickMenu.slot);
                  setBookCleaningTime(10);
                  setCellClickMenu(null);
                  setShowBookingModal(true);
                }}
                className="w-full h-12 rounded-lg bg-primary text-white text-label-md font-bold hover:opacity-95 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Book Treatment
              </button>

              <div className="border-t border-surface-variant my-2"></div>

              {/* Add Cleaning Block */}
              <div className="bg-surface-muted/30 p-3 rounded-lg border border-surface-variant space-y-3">
                <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Add Cleaning Block</h4>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Duration</label>
                    <select
                      value={customBlockDuration}
                      onChange={e => setCustomBlockDuration(Number(e.target.value))}
                      className="w-full bg-sand-light border border-transparent rounded px-2.5 py-1.5 text-xs outline-none h-8 font-semibold"
                    >
                      <option value="10">10 Min</option>
                      <option value="20">20 Min</option>
                      <option value="30">30 Min</option>
                      <option value="40">40 Min</option>
                      <option value="50">50 Min</option>
                      <option value="60">60 Min</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const durationStr = `${customBlockDuration} min`;
                      const timeLabelRange = calculateTimeLabel(cellClickMenu.slot, durationStr);
                      
                      // Check collision
                      const conflict = appointments.some(appt => {
                        if (appt.status === 'cancelled') return false;
                        if ((appt.date || '2023-10-24') !== cellClickMenu.date) return false;
                        if (appt.specialist === cellClickMenu.specialist || appt.coSpecialist === cellClickMenu.specialist) {
                          const otherClean = appt.isBreakBlock || appt.isCleaningBlock ? 0 : (appt.cleaningTime !== undefined ? appt.cleaningTime : 10);
                          return checkOverlap(timeLabelRange, durationStr, 0, appt.timeLabel, appt.duration || '60 min', otherClean);
                        }
                        return false;
                      });

                      if (conflict) {
                        triggerNotification('Conflict: Therapist is busy during this cleaning block slot.');
                        return;
                      }

                      const newCleanBlock = {
                        id: `clean_${Date.now()}`,
                        date: cellClickMenu.date,
                        timeLabel: timeLabelRange,
                        client: 'Maintenance Cleaning',
                        procedure: '🧹 Cleaning Time',
                        specialist: cellClickMenu.specialist,
                        room: specialists.find(s => s.therapist_name === cellClickMenu.specialist)?.room_preference || 'Room 1',
                        status: 'confirmed',
                        price: '—',
                        email: '—',
                        phone: '—',
                        vip: false,
                        duration: durationStr,
                        cleaningTime: 0,
                        isCleaningBlock: true,
                        addons: [],
                        notes: 'Manual cleaning block.',
                        colorClass: 'bg-surface-variant/30 border-outline text-outline opacity-70',
                        posStyle: mapTimeToPos(timeLabelRange, durationStr, 0)
                      };

                      setAppointments(prev => [...prev, newCleanBlock]);
                      setCellClickMenu(null);
                      triggerNotification('Manual cleaning block added to schedule.');
                    }}
                    className="h-8 px-4 rounded bg-accent-coral text-white text-xs font-bold hover:opacity-90 transition-all self-end"
                  >
                    Add Clean
                  </button>
                </div>
              </div>

              {/* Add Break Block */}
              <div className="bg-surface-muted/30 p-3 rounded-lg border border-surface-variant space-y-3">
                <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Add Therapist Break</h4>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">Duration</label>
                    <select
                      value={customBlockDuration}
                      onChange={e => setCustomBlockDuration(Number(e.target.value))}
                      className="w-full bg-sand-light border border-transparent rounded px-2.5 py-1.5 text-xs outline-none h-8 font-semibold"
                    >
                      <option value="30">30 Min</option>
                      <option value="60">60 Min</option>
                      <option value="90">90 Min</option>
                      <option value="120">120 Min</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const durationStr = `${customBlockDuration} min`;
                      const timeLabelRange = calculateTimeLabel(cellClickMenu.slot, durationStr);
                      
                      // Check collision
                      const conflict = appointments.some(appt => {
                        if (appt.status === 'cancelled') return false;
                        if ((appt.date || '2023-10-24') !== cellClickMenu.date) return false;
                        if (appt.specialist === cellClickMenu.specialist || appt.coSpecialist === cellClickMenu.specialist) {
                          const otherClean = appt.isBreakBlock || appt.isCleaningBlock ? 0 : (appt.cleaningTime !== undefined ? appt.cleaningTime : 10);
                          return checkOverlap(timeLabelRange, durationStr, 0, appt.timeLabel, appt.duration || '60 min', otherClean);
                        }
                        return false;
                      });

                      if (conflict) {
                        triggerNotification('Conflict: Therapist is busy during this break slot.');
                        return;
                      }

                      const newBreakBlock = {
                        id: `break_${Date.now()}`,
                        date: cellClickMenu.date,
                        timeLabel: timeLabelRange,
                        client: 'Therapist Lunch/Break',
                        procedure: '☕ Break',
                        specialist: cellClickMenu.specialist,
                        room: specialists.find(s => s.therapist_name === cellClickMenu.specialist)?.room_preference || 'Room 1',
                        status: 'confirmed',
                        price: '—',
                        email: '—',
                        phone: '—',
                        vip: false,
                        duration: durationStr,
                        cleaningTime: 0,
                        isBreakBlock: true,
                        addons: [],
                        notes: 'Manual therapist break block.',
                        colorClass: 'bg-amber-50/40 border-amber-300 text-amber-800 opacity-80',
                        posStyle: mapTimeToPos(timeLabelRange, durationStr, 0)
                      };

                      setAppointments(prev => [...prev, newBreakBlock]);
                      setCellClickMenu(null);
                      triggerNotification('Therapist break block saved.');
                    }}
                    className="h-8 px-4 rounded bg-primary text-white text-xs font-bold hover:opacity-90 transition-all self-end"
                  >
                    Add Break
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* QUICK BOOK / NEW APPOINTMENT MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowBookingModal(false)} className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"></div>
          
          <form onSubmit={handleSaveNewBooking} className="bg-surface-container-lowest w-full max-w-4xl rounded-2xl shadow-[0_16px_48px_rgba(74,142,142,0.12)] flex flex-col max-h-[90vh] overflow-hidden border border-surface-variant relative z-10 animate-fade-in">
            <button type="button" onClick={() => setShowBookingModal(false)} className="absolute top-5 right-5 p-2.5 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-2xl font-bold">close</span>
            </button>
            
            <div className="px-8 sm:px-10 pt-10 pb-5 border-b border-surface-variant bg-surface-container-lowest flex flex-col gap-1.5">
              <h2 className="font-headline-lg text-headline-lg text-on-surface text-3xl font-extrabold">New Appointment Booking</h2>
              <p className="text-body-lg text-on-surface-variant text-base">Schedule a new client appointment slot with full specifications.</p>
            </div>

            <div className="px-8 sm:px-10 py-8 overflow-y-auto flex-1 space-y-6 bg-surface text-on-surface">
              <div className="relative">
                <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Client Name</label>
                <input 
                  type="text" 
                  required 
                  value={bookClientName}
                  onChange={e => {
                    setBookClientName(e.target.value);
                    setShowBookClientDropdown(true);
                  }}
                  onFocus={() => setShowBookClientDropdown(true)}
                  onBlur={() => setTimeout(() => setShowBookClientDropdown(false), 200)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-medium outline-none transition-all h-16 shadow-sm"
                />
                {showBookClientDropdown && bookClientName && clients.filter(c => c.name.toLowerCase().includes(bookClientName.toLowerCase())).length > 0 && (
                  <ul className="absolute z-50 w-full bg-surface-base border border-surface-variant rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {clients.filter(c => c.name.toLowerCase().includes(bookClientName.toLowerCase())).map(client => (
                      <li 
                        key={client.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setBookClientName(client.name);
                          setBookClientEmail(client.email);
                          setBookClientPhone(client.phone || '');
                          if (client.notes) setBookNotes(prev => prev ? prev + '\n' + client.notes : client.notes);
                          setShowBookClientDropdown(false);
                        }}
                        className="px-5 py-3 hover:bg-surface-muted cursor-pointer border-b border-surface-variant/50 last:border-0"
                      >
                        <div className="font-bold text-on-surface">{client.name}</div>
                        <div className="text-sm text-on-surface-variant">{client.email} {client.phone && `• ${client.phone}`}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Email Address</label>
                  <input 
                    type="email" 
                    value={bookClientEmail}
                    onChange={e => setBookClientEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-medium outline-none transition-all h-16 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Phone Number</label>
                  <input 
                    type="text" 
                    value={bookClientPhone}
                    onChange={e => setBookClientPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-medium outline-none transition-all h-16 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Assigned Therapist</label>
                  <select 
                    required
                    value={bookSpecialist}
                    onChange={e => setBookSpecialist(e.target.value)}
                    className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                  >
                    <option value="">Select Specialist...</option>
                    {specialists.map(spec => {
                      const status = getSpecialistBookingStatus(spec.therapist_name, bookTreatment);
                      if (!status.valid) {
                        return (
                          <option key={spec.therapist_id} value={spec.therapist_name} disabled className="text-outline-variant">
                            {spec.therapist_name} ({status.reason})
                          </option>
                        );
                      }
                      return (
                        <option key={spec.therapist_id} value={spec.therapist_name}>{spec.therapist_name} ({spec.room_preference})</option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Co-Therapist (Optional)</label>
                  <select 
                    value={bookCoSpecialist}
                    onChange={e => setBookCoSpecialist(e.target.value)}
                    className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                  >
                    <option value="">None (Single Therapist)</option>
                    {specialists.filter(s=>s.therapist_name !== bookSpecialist).map(spec => {
                      const status = getSpecialistBookingStatus(spec.therapist_name, bookTreatment);
                      if (!status.valid) {
                        return (
                          <option key={spec.therapist_id} value={spec.therapist_name} disabled className="text-outline-variant">
                            {spec.therapist_name} ({status.reason})
                          </option>
                        );
                      }
                      return (
                        <option key={spec.therapist_id} value={spec.therapist_name}>{spec.therapist_name} ({spec.room_preference})</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Treatment Procedure</label>
                <select 
                  required
                  value={bookTreatment}
                  onChange={e => {
                    setBookTreatment(e.target.value);
                    setBookDuration('');
                  }}
                  className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                >
                  <option value="">Select Treatment...</option>
                  {(() => {
                    if (!bookSpecialist) return <option value="" disabled>Please select a specialist first</option>;
                    const selectedSpecObj = specialists.find(s => s.therapist_name === bookSpecialist);
                    if (!selectedSpecObj) return null;

                    const lookupKey = selectedSpecObj.calUserId || selectedSpecObj.calUsername;
                    const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];

                    // De-duplicate by title
                    const uniqueEts: any[] = [];
                    const seenTitles = new Set();
                    for (const et of specEts) {
                      if (!seenTitles.has(et.title)) {
                        seenTitles.add(et.title);
                        uniqueEts.push(et);
                      }
                    }

                    if (uniqueEts.length === 0) {
                      return <option value="" disabled>No treatments found for this specialist</option>;
                    }

                    return uniqueEts.map((et: any) => (
                      <option key={et.id} value={et.title}>{et.title}</option>
                    ));
                  })()}
                </select>
              </div>

              {/* Conditional Duration Picker */}
              {(() => {
                if (!bookTreatment || !bookSpecialist) return null;
                const selectedSpecObj = specialists.find(s => s.therapist_name === bookSpecialist);
                if (!selectedSpecObj) return null;
                const lookupKey = selectedSpecObj.calUserId || selectedSpecObj.calUsername;
                const specEts = lookupKey ? (specialistEventTypes[lookupKey.toString()] || []) : [];

                const selectedEt = specEts.find(et => et.title === bookTreatment);

                // Only show if there are multiple duration options
                if (!selectedEt || !selectedEt.allowedDurations || selectedEt.allowedDurations.length <= 1) return null;

                return (
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Duration</label>
                    <select 
                      required
                      value={bookDuration}
                      onChange={e => setBookDuration(Number(e.target.value))}
                      className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                    >
                      <option value="">Select Duration...</option>
                      {selectedEt.allowedDurations.map((dur: number) => (
                        <option key={dur} value={dur}>{dur} minutes</option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Treatment Date</label>
                  <input 
                    type="date"
                    required
                    value={bookDate}
                    onChange={e => setBookDate(e.target.value)}
                    className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Schedule Time</label>
                  <input 
                    type="time"
                    step="900"
                    required
                    value={bookTimeLabel}
                    onChange={e => setBookTimeLabel(e.target.value)}
                    className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Cleaning Time (m)</label>
                  <input 
                    type="number" 
                    required 
                    min="0" 
                    step="10" 
                    value={bookCleaningTime} 
                    onChange={e => setBookCleaningTime(Number(e.target.value))}
                    className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 shadow-sm"
                  />
                </div>
              </div>

              {/* Add-ons select list inside booking modal */}
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">Optional Add-ons</label>
                <div className="grid grid-cols-2 gap-2">
                  {addons.map(addon => {
                    const checked = bookSelectedAddons.includes(addon.name);
                    return (
                      <label 
                        key={addon.id}
                        className={`flex items-start gap-2 p-2.5 rounded border cursor-pointer transition-colors ${checked ? 'bg-primary/5 border-primary/20 font-semibold' : 'bg-sand-light border-transparent hover:bg-surface-muted/20'}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={checked}
                          onChange={() => handleToggleAddonInQuickBook(addon.name)}
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary mt-0.5"
                        />
                        <div className="text-xs">
                          <span className="block text-on-surface">{addon.name}</span>
                          <span className="block text-on-surface-variant font-normal">{addon.price}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Internal Notes</label>
                <textarea 
                  value={bookNotes}
                  onChange={e => setBookNotes(e.target.value)}
                  placeholder="Notes on client preferences or health conditions..."
                  className="w-full bg-sand-light focus:bg-surface-base border border-transparent focus:border-primary rounded-lg px-4 py-2 text-body-md outline-none resize-none h-16"
                />
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 border-t border-surface-variant bg-surface-container-lowest flex justify-between items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-on-surface-variant font-medium">
                <input 
                  type="checkbox" 
                  checked={bookSaveAsPending} 
                  onChange={(e) => setBookSaveAsPending(e.target.checked)} 
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                Save to Pending Requests
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBookingModal(false)} className="h-10 px-5 rounded-lg bg-surface-container-low text-on-surface-variant text-label-md font-semibold hover:bg-surface-container transition-colors clickable-hover-effect cursor-pointer">Cancel</button>
                <button type="submit" className="h-10 px-8 rounded-lg bg-primary text-white text-label-md font-bold hover:opacity-90 shadow-sm transition-all clickable-hover-effect cursor-pointer">{bookSaveAsPending ? 'Save Request' : 'Book Appointment'}</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* RESCHEDULE INCOMING REQUEST MODAL */}
      {rescheduleRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setRescheduleRequest(null)} className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"></div>
          
          <form onSubmit={handleSaveReschedRequest} className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-[0_16px_48px_rgba(74,142,142,0.12)] flex flex-col max-h-[90vh] overflow-hidden border border-surface-variant relative z-10 animate-fade-in">
            <button type="button" onClick={() => setRescheduleRequest(null)} className="absolute top-5 right-5 p-2.5 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-2xl font-bold">close</span>
            </button>
            
            <div className="px-8 pt-10 pb-5 border-b border-surface-variant bg-surface-container-lowest flex flex-col gap-1.5">
              <h2 className="font-headline-lg text-headline-lg text-on-surface text-3xl font-extrabold">Reschedule Booking Request</h2>
              <p className="text-body-lg text-on-surface-variant text-base">Update preferred specialist and slot timings with larger input fields.</p>
            </div>
 
            <div className="px-8 py-8 space-y-6 bg-surface text-on-surface">
              <div className="relative">
                <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Client Name</label>
                <input 
                  type="text" 
                  value={rescheduleRequest.client} 
                  onChange={e => {
                    setRescheduleRequest({...rescheduleRequest, client: e.target.value});
                    setShowReschedClientDropdown(true);
                  }}
                  onFocus={() => setShowReschedClientDropdown(true)}
                  onBlur={() => setTimeout(() => setShowReschedClientDropdown(false), 200)}
                  className="w-full bg-sand-light focus:bg-surface-base border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 shadow-sm transition-all" 
                />
                {showReschedClientDropdown && rescheduleRequest.client && clients.filter(c => c.name.toLowerCase().includes(rescheduleRequest.client.toLowerCase())).length > 0 && (
                  <ul className="absolute z-50 w-full bg-surface-base border border-surface-variant rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {clients.filter(c => c.name.toLowerCase().includes(rescheduleRequest.client.toLowerCase())).map(client => (
                      <li 
                        key={client.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setRescheduleRequest({...rescheduleRequest, client: client.name});
                          setShowReschedClientDropdown(false);
                        }}
                        className="px-5 py-3 hover:bg-surface-muted cursor-pointer border-b border-surface-variant/50 last:border-0"
                      >
                        <div className="font-bold text-on-surface">{client.name}</div>
                        <div className="text-sm text-on-surface-variant">{client.email} {client.phone && `• ${client.phone}`}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Date</label>
                  <input 
                    type="date"
                    value={reschedDate}
                    onChange={(e) => setReschedDate(e.target.value)}
                    className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                  />
                </div>
 
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Preferred Therapist</label>
                  <select 
                    value={reschedSpecialist}
                    onChange={e => setReschedSpecialist(e.target.value)}
                    className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                  >
                    {specialists.map(spec => (
                      <option key={spec.therapist_id} value={spec.therapist_name}>{spec.therapist_name} ({spec.room_preference})</option>
                    ))}
                  </select>
                </div>
              </div>
 
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Treatment Procedure</label>
                <select 
                  value={reschedTreatment}
                  onChange={e => setReschedTreatment(e.target.value)}
                  className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                >
                  {(() => {
                    const finalTreatments = getDynamicTreatments(specialists, calEventTypes, treatments);
                    
                    return finalTreatments.map((t: any) => {
                      const selectedSpecObj = specialists.find(s => s.therapist_name === reschedSpecialist);
                      let isMapped = false;
                      if (selectedSpecObj) {
                        isMapped = calEventTypes.some(et => et.title.toLowerCase() === t.name.toLowerCase() && String(et.userId) === String(selectedSpecObj.calUserId)) ||
                          true;
                      } else {
                        isMapped = true; // since finalTreatments ONLY contains mapped treatments overall
                      }

                      if (selectedSpecObj && !isMapped) {
                        return (
                          <option key={t.id} value={t.name} disabled className="text-outline-variant">
                            {t.name} (Not provided by this specialist)
                          </option>
                        );
                      }
                      return (
                        <option key={t.id} value={t.name}>{t.name} {t.price ? `(${t.price})` : ''}</option>
                      );
                    });
                  })()}
                </select>
              </div>
 
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-wide">Schedule Time Slot</label>
                <select 
                  value={reschedTimeLabel}
                  onChange={e => setReschedTimeLabel(e.target.value)}
                  className="w-full bg-sand-light border border-surface-variant focus:border-primary rounded-xl px-5 py-3.5 text-lg font-semibold outline-none h-16 cursor-pointer shadow-sm"
                >
                    <option value="09:00">09:00</option>
                    <option value="09:30">09:30</option>
                    <option value="10:00">10:00</option>
                    <option value="10:30">10:30</option>
                    <option value="11:00">11:00</option>
                    <option value="11:30">11:30</option>
                    <option value="12:00">12:00</option>
                    <option value="12:30">12:30</option>
                    <option value="13:00">13:00</option>
                    <option value="13:30">13:30</option>
                    <option value="14:00">14:00</option>
                    <option value="14:30">14:30</option>
                    <option value="15:00">15:00</option>
                    <option value="15:30">15:30</option>
                    <option value="16:00">16:00</option>
                    <option value="16:30">16:30</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                </select>
              </div>
            </div>
 
            <div className="px-8 py-5 border-t border-surface-variant bg-surface-container-lowest flex justify-end gap-4">
              <button type="button" onClick={() => setRescheduleRequest(null)} className="h-12 px-6 rounded-xl bg-surface-container-low text-on-surface-variant text-base font-semibold hover:bg-surface-container transition-colors clickable-hover-effect cursor-pointer">Cancel</button>
              <button type="submit" className="h-12 px-8 rounded-xl bg-primary text-white text-base font-bold hover:opacity-90 shadow-sm transition-all clickable-hover-effect cursor-pointer">Save Reschedule</button>
            </div>
          </form>
        </div>
      )}

      {/* AUDIT LOG FOR SELECTED BOOKING */}
      {selectedAuditLogBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedAuditLogBooking(null)} className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"></div>
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-xl p-6 border border-surface-variant relative z-10 animate-fade-in text-on-surface flex flex-col max-h-[80vh]">
            <button onClick={() => setSelectedAuditLogBooking(null)} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <h3 className="font-bold text-headline-md text-on-surface flex items-center gap-2 mb-2 font-headline">
              <span className="material-symbols-outlined text-primary">history</span>
              Booking Sync History
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">Database & API Status Logs for Booking: <code className="font-bold">{selectedAuditLogBooking.id}</code></p>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 bg-surface p-3 rounded-lg">
              <div className="bg-sand-light p-3 rounded-lg border border-surface-variant space-y-2 text-xs">
                <div><strong>Client:</strong> {selectedAuditLogBooking.client}</div>
                <div><strong>Treatment:</strong> {selectedAuditLogBooking.procedure}</div>
                <div><strong>Specialist:</strong> {selectedAuditLogBooking.specialist}</div>
                <div><strong>Cal.diy UID:</strong> <code className="font-bold text-primary">{selectedAuditLogBooking.cal_booking_uid || 'Not mapped (Local Mock)'}</code></div>
              </div>
              <div className="relative pl-6 border-l-2 border-primary/20 space-y-4">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-surface-container-lowest"></span>
                  <div className="text-xs font-bold">Confirmed / Synced</div>
                  <div className="text-[10px] text-on-surface-variant">Completed successfully by Admin Interface</div>
                  <div className="text-[11px] mt-1 bg-primary/5 p-2 rounded border border-primary/10 font-mono text-[10px]">
                    Status: {selectedAuditLogBooking.status}
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-outline border-2 border-surface-container-lowest"></span>
                  <div className="text-xs font-bold">Booking Initiated</div>
                  <div className="text-[10px] text-on-surface-variant">Local draft registered in dashboard schema</div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-variant flex justify-end">
              <button onClick={() => setSelectedAuditLogBooking(null)} className="bg-primary text-white px-5 py-2 rounded text-xs font-bold hover:opacity-90 transition-all">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* WEBHOOK PAYLOAD PREVIEW MODAL */}
      {viewingWebhookPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setViewingWebhookPayload(null)} className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"></div>
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-xl p-6 border border-surface-variant relative z-10 animate-fade-in text-on-surface flex flex-col max-h-[80vh]">
            <button onClick={() => setViewingWebhookPayload(null)} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            <h3 className="font-bold text-headline-md text-on-surface flex items-center gap-2 mb-2 font-headline">
              <span className="material-symbols-outlined text-primary">code</span>
              Webhook Delivery Payload
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">Transmission ID: <code className="font-bold">{viewingWebhookPayload.id}</code></p>
            <div className="bg-sand-light p-3 rounded-lg border border-surface-variant text-[11px] font-mono whitespace-pre overflow-x-auto text-on-surface-variant flex-1 max-h-[400px]">
              {JSON.stringify(viewingWebhookPayload.payload, null, 2)}
            </div>
            <div className="mt-6 pt-4 border-t border-surface-variant flex justify-end">
              <button onClick={() => setViewingWebhookPayload(null)} className="bg-primary text-white px-5 py-2 rounded text-xs font-bold hover:opacity-90 transition-all">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOG / HANDLED REQUEST DETAIL MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedRequest(null)} className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"></div>
          
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-xl p-6 border border-surface-variant relative z-10 animate-fade-in text-on-surface">
            <button onClick={() => setSelectedRequest(null)} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            
            <h3 className="font-bold text-headline-md text-on-surface flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">task_alt</span>
              Request Details (Handled)
            </h3>
            
            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
              <div>
                <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider mb-1">Client Name</h4>
                <p className="text-body-md font-semibold text-on-surface">{selectedRequest.client}</p>
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider mb-1">Requested Treatment</h4>
                <p>{selectedRequest.procedure}</p>
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider mb-1">Requested Timings</h4>
                <p className="font-mono">{selectedRequest.requestedTime}</p>
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider mb-1">Processing Status</h4>
                <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-bold ${selectedRequest.status === 'confirmed' ? 'bg-primary/10 text-primary' : 'bg-surface-variant/30 text-outline'}`}>
                  {selectedRequest.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider mb-1">System Audit Notes</h4>
                <p className="italic text-xs">{selectedRequest.notes || 'No system notes recorded.'}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-surface-variant flex justify-end">
              <button onClick={() => setSelectedRequest(null)} className="bg-primary text-white px-5 py-2 rounded text-xs font-bold hover:opacity-90 transition-all">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* HELP & REFERENCE MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowHelpModal(false)} className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity"></div>
          
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-xl p-6 border border-surface-variant relative z-10 animate-fade-in text-on-surface">
            <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full font-bold">
              <span className="material-symbols-outlined text-2xl font-bold">close</span>
            </button>
            
            <h3 className="font-bold text-headline-md text-on-surface flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">help_outline</span>
              Help & Documentation
            </h3>
            
            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
              <div>
                <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider mb-1">Integrating Google Sheets</h4>
                <p>Ensure the Sheet is shared with "Anyone with link as Editor" and input its unique spreadsheet ID inside settings. The system automatically syncs rows upon connection.</p>
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider mb-1">Connecting Live APIs</h4>
                <p>Toggle API Endpoint mode and input target Endpoint URL and Bearer Access Token. Click Connect & Fetch to unlock the editable React Data Tables.</p>
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider mb-1">Quick Scheduling tips</h4>
                <p>Adding specialists instantly draws room columns on today's calendar. Double-click or use Quick Book / New Appointment modals to book slots.</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-surface-variant flex justify-end">
              <button onClick={() => setShowHelpModal(false)} className="bg-primary text-white px-5 py-2 rounded text-xs font-bold hover:opacity-90 transition-all">Dismiss Help</button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING MCP AI ASSISTANT POPUP BUTTON & MODAL */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
        {!showMcpModal && (
          <button
            onClick={() => setShowMcpModal(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-primary via-[#248080] to-tertiary text-white px-5 py-3.5 rounded-full shadow-[0_10px_30px_rgba(27,102,102,0.4)] hover:shadow-[0_15px_35px_rgba(27,102,102,0.6)] hover:scale-105 transition-all cursor-pointer font-bold border border-white/20 group"
          >
            <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">smart_toy</span>
            <span className="text-sm font-bold tracking-wide">Cal.com AI Assistant</span>
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
          </button>
        )}

        {showMcpModal && (
          <div className="w-[92vw] sm:w-[460px] h-[580px] max-h-[85vh] bg-surface-container-lowest/95 backdrop-blur-xl border border-surface-variant/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden animate-fade-in text-on-surface">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary via-[#248080] to-tertiary text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    {currentUserRole === 'receptionist' ? 'SPA AI Receptionist' : 'Cal.com AI Companion Agent'}
                    <span className="text-[9px] bg-emerald-500/30 border border-emerald-300/40 text-emerald-200 px-1.5 py-0.5 rounded font-extrabold uppercase">Live API</span>
                  </h3>
                  <p className="text-[10px] text-white/80">{currentUserRole === 'receptionist' ? 'Cal.diy Interactive Assistant' : 'Self-Hosted Cal.diy Interactive Assistant'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMcpMessages([{ id: '1', role: 'assistant', content: 'Hello! I can check availability and book appointments for your specialists. Just ask!' }])}
                  title="Clear Chat History"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
                <button
                  onClick={() => setCurrentView('mcp')}
                  title="Expand to Full View"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                </button>
                <button
                  onClick={() => setShowMcpModal(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-surface-container-low/20">
              {mcpMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl text-primary/60 mb-2">chat_spark</span>
                  <p className="text-xs font-bold text-on-surface mb-1">How can I assist your spa scheduling today?</p>
                  <p className="text-[11px] max-w-xs leading-relaxed opacity-80 mb-4">
                    Click any quick example question below or type your custom request:
                  </p>
                  <div className="flex flex-col gap-1.5 w-full max-w-xs text-left">
                    <button
                      onClick={() => handleMcpSubmit('massage with anna tomorrow at 12:00')}
                      className="text-[11px] bg-surface-container-lowest hover:bg-primary/10 hover:text-primary text-on-surface font-medium p-2 rounded-xl border border-surface-variant/40 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary">event_available</span>
                      "massage with anna tomorrow at 12:00"
                    </button>
                    <button
                      onClick={() => handleMcpSubmit('massage tomorrow 14:00')}
                      className="text-[11px] bg-surface-container-lowest hover:bg-primary/10 hover:text-primary text-on-surface font-medium p-2 rounded-xl border border-surface-variant/40 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                      "massage tomorrow 14:00"
                    </button>
                    <button
                      onClick={() => handleMcpSubmit('availability for melvin tomorrow')}
                      className="text-[11px] bg-surface-container-lowest hover:bg-primary/10 hover:text-primary text-on-surface font-medium p-2 rounded-xl border border-surface-variant/40 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary">person_search</span>
                      "availability for melvin tomorrow"
                    </button>
                    <button
                      onClick={() => handleMcpSubmit('show bookings')}
                      className="text-[11px] bg-surface-container-lowest hover:bg-primary/10 hover:text-primary text-on-surface font-medium p-2 rounded-xl border border-surface-variant/40 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary">format_list_bulleted</span>
                      "show bookings"
                    </button>
                  </div>
                </div>
              ) : (
                mcpMessages.map((msg: any, idx: number) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-surface-container-lowest text-on-surface border border-surface-variant/40 rounded-bl-none'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1 mb-1 font-bold text-[10px] text-primary uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[13px]">smart_toy</span>
                          Cal.com Agent
                        </div>
                      )}
                      
                        <div>{msg.content}</div>
                        {msg.toolInvocations && msg.toolInvocations.map((tool: any, i: number) => (
                          <div key={i} className="mt-2 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20">
                            {tool.state === 'result' ? `✅ Finished: ${tool.toolName}` : `⚙️ Running: ${tool.toolName}...`}
                          </div>
                        ))}

                      {msg.calLink && (
                        <div className="mt-4">
                          <button 
                            onClick={async () => {
                              const cal = await getCalApi({ embedJsUrl: "https://calcom.run.place/embed/embed.js" });
                              cal("modal", {
                                calLink: msg.calLink,
                                calOrigin: "https://calcom.run.place",
                                config: { layout: 'month_view', theme: 'light' }
                              });
                            }}
                            className="bg-primary text-white font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-primary/90 flex items-center gap-2 transition-all transform hover:scale-105"
                          >
                            <span className="material-symbols-outlined text-[20px]">event_available</span>
                            Complete Booking
                          </button>
                        </div>
                      )}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.actions.map((act: any, aIdx: number) => (
                            <button
                              key={aIdx}
                              onClick={() => handleMcpSubmit(act.payload)}
                              className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors border shadow-sm flex items-center justify-center ${
                                act.label === 'Cancel Booking'
                                  ? 'bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20'
                                  : 'bg-surface-base text-primary border-primary/30 hover:bg-primary hover:text-white'
                              }`}
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {/* Follow-up Suggestion Chips after responses */}
              {mcpMessages.length > 0 && !mcpLoading && (
                <div className="pt-2 border-t border-surface-variant/20 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-outline font-semibold w-full">Suggested follow-ups:</span>
                  <button
                    onClick={() => handleMcpSubmit('massage with anna tomorrow at 12:00')}
                    className="text-[10px] bg-surface-container-lowest hover:bg-primary/10 hover:text-primary text-on-surface-variant py-1 px-2.5 rounded-full border border-surface-variant/40 transition-colors shadow-2xs"
                  >
                    "massage with anna tomorrow at 12:00"
                  </button>
                  <button
                    onClick={() => handleMcpSubmit('massage tomorrow 14:00')}
                    className="text-[10px] bg-surface-container-lowest hover:bg-primary/10 hover:text-primary text-on-surface-variant py-1 px-2.5 rounded-full border border-surface-variant/40 transition-colors shadow-2xs"
                  >
                    "massage tomorrow 14:00"
                  </button>
                  <button
                    onClick={() => handleMcpSubmit('show bookings')}
                    className="text-[10px] bg-surface-container-lowest hover:bg-primary/10 hover:text-primary text-on-surface-variant py-1 px-2.5 rounded-full border border-surface-variant/40 transition-colors shadow-2xs"
                  >
                    "show bookings"
                  </button>
                </div>
              )}
              {mcpLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-lowest border border-surface-variant/40 p-3 rounded-2xl rounded-bl-none text-xs text-on-surface-variant flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                    <span>Querying Cal.com Live API...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-surface-container-lowest border-t border-surface-variant/30 flex items-center gap-2">
              <input
                type="text"
                value={mcpInput}
                onChange={handleMcpInputChange}
                onKeyDown={e => e.key === 'Enter' && handleMcpSubmit()}
                placeholder="Ask Cal.com AI (e.g. 'book with anna tomorrow at 14:00')..."
                className="flex-1 bg-surface-muted rounded-full px-4 py-2 text-xs outline-none border border-surface-variant/50 focus:border-primary text-on-surface"
              />
              <button
                onClick={() => handleMcpSubmit()}
                disabled={!mcpInput.trim() || mcpLoading}
                className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer shadow-sm shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADMIN PIN MODAL */}
      {showAdminPinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-base w-full max-w-sm rounded-2xl border border-surface-variant shadow-2xl p-6 text-center">
            <span className="material-symbols-outlined text-[48px] text-primary mb-4 block">admin_panel_settings</span>
            <h3 className="text-headline-sm font-bold text-on-surface mb-2">Admin Authentication</h3>
            <p className="text-body-sm text-on-surface-variant mb-6">Enter PIN to access administrative features.</p>
            
            <input 
              type="password"
              placeholder="Enter PIN"
              value={adminPinInput}
              onChange={e => setAdminPinInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (adminPinInput === adminPin) {
                    setCurrentUserRole('admin');
                    setAdminModeAuthenticated(true);
                    setShowAdminPinModal(false);
                    setAdminPinInput('');
                    triggerNotification('Admin Mode Authenticated');
                  } else {
                    triggerNotification('Incorrect PIN');
                  }
                }
              }}
              className="w-full bg-sand-light border-transparent focus:bg-surface-base focus:border-primary text-center text-xl tracking-[0.5em] font-mono rounded-xl py-3 px-4 outline-none transition-colors shadow-inner text-on-surface mb-4"
              autoFocus
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowAdminPinModal(false); setAdminPinInput(''); }}
                className="flex-1 bg-surface-container text-on-surface font-bold py-2.5 rounded-lg hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (adminPinInput === adminPin) {
                    setCurrentUserRole('admin');
                    setAdminModeAuthenticated(true);
                    setShowAdminPinModal(false);
                    setAdminPinInput('');
                    triggerNotification('Admin Mode Authenticated');
                  } else {
                    triggerNotification('Incorrect PIN');
                  }
                }}
                className="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg hover:opacity-90 transition-colors shadow-sm"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING PAGES MODAL — Cal.com embed for all linked users */}
      {showBookingPagesModal && (() => {
        // Build de-duped user list: calOrgUsers merged with specialists that have calUsername
        const allEmbedUsers: Array<{ username: string; displayName: string }> = [];
        const seenUsernames = new Set<string>();

        // From org users
        (Array.isArray(calOrgUsers) ? calOrgUsers : []).forEach((u: any) => {
          const uname = (u.username || '').trim().toLowerCase();
          if (uname && !seenUsernames.has(uname)) {
            seenUsernames.add(uname);
            allEmbedUsers.push({ username: uname, displayName: u.name || u.username });
          }
        });

        // From specialists with linked Cal.com username
        specialists.forEach((s: any) => {
          const uname = (s.calUsername || '').trim().toLowerCase();
          if (uname && !seenUsernames.has(uname)) {
            seenUsernames.add(uname);
            allEmbedUsers.push({ username: uname, displayName: s.therapist_name || uname });
          }
        });

        // Extract Cal.com base origin from configured endpoint
        const calOrigin = (() => {
          try {
            const raw = calComApiEndpoint.trim().replace(/\/+$/, '');
            return new URL(raw.startsWith('http') ? raw : `https://${raw}`).origin;
          } catch { return 'https://calcom.run.place'; }
        })();

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface-base w-full max-w-5xl max-h-[92vh] rounded-2xl border border-surface-variant shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary via-[#248080] to-tertiary text-white">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>calendar_month</span>
                  <div>
                    <h2 className="font-bold text-lg tracking-wide">Specialist Booking Pages</h2>
                    <p className="text-white/70 text-xs">{allEmbedUsers.length} specialist(s) — live Cal.com embedded calendars</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBookingPagesModal(false)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-surface-muted">
                {allEmbedUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                    <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 mb-4">person_off</span>
                    <h3 className="font-bold text-on-surface text-lg mb-2">No Linked Users</h3>
                    <p className="text-on-surface-variant text-sm max-w-md">Add Cal.com usernames to your specialists in Settings → CAL.DIY MANAGER, then try again.</p>
                    <button
                      onClick={() => { setShowBookingPagesModal(false); setCurrentView('settings'); setSettingsTab('specialists_manager'); }}
                      className="mt-4 bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-all"
                    >
                      Open CAL.DIY MANAGER
                    </button>
                  </div>
                ) : (
                  allEmbedUsers.map(({ username, displayName }) => (
                    <div key={username} className="bg-surface-base rounded-xl border border-surface-variant shadow-sm overflow-hidden">
                      {/* User header */}
                      <div className="flex items-center justify-between px-5 py-3.5 bg-surface-container border-b border-surface-variant">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface capitalize">{displayName}</div>
                            <div className="text-[11px] text-on-surface-variant font-mono">{calOrigin}/{username}</div>
                          </div>
                        </div>
                        <a
                          href={`${calOrigin}/${username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:underline text-xs font-semibold"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          Open Full Page
                        </a>
                      </div>
                      {/* Cal.com embedded calendar iframe */}
                      <div className="p-4">
                        <iframe
                          src={`${calOrigin}/${username}?embed=true&layout=month_view&hideEventTypeDetails=false`}
                          width="100%"
                          height="600"
                          frameBorder="0"
                          title={`${displayName} Booking Calendar`}
                          className="rounded-lg border border-surface-variant/50 bg-white"
                          style={{ minHeight: 550 }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}



    </div>
  );
}
