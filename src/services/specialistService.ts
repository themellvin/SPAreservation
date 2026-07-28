export interface Specialist {
  therapist_id: string;
  therapist_name: string;
  room_preference: string;
  specialties: string;
  working_hours_start: string;
  working_hours_end: string;
  status: string; // 'active' | 'inactive'
  mappedEventSlug?: string;
  mappedEventTypeId?: string;
  mappedCalendarConnectionId?: string;
}

export const specialistService = {
  normalizeSpecialists: (rawSpecialists: any[]): Specialist[] => {
    return rawSpecialists.map(s => ({
      therapist_id: s.therapist_id,
      therapist_name: s.therapist_name || s.name || 'Unnamed Specialist',
      room_preference: s.room_preference || 'Room 1',
      specialties: s.specialties || '',
      working_hours_start: s.working_hours_start || '09:00',
      working_hours_end: s.working_hours_end || '17:00',
      status: s.status || 'active',
      mappedEventSlug: s.mappedEventSlug || '',
      mappedEventTypeId: s.mappedEventTypeId || '',
      mappedCalendarConnectionId: s.mappedCalendarConnectionId || ''
    }));
  }
};
