export interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startMin: number;
  endMin: number;
  timezone: string;
}

export interface AvailabilityForm {
  timezone: string;
  slots: AvailabilitySlot[];
}

export interface UpdateAvailabilityRequest {
  slots: Array<Omit<AvailabilitySlot, 'id'>>;
}
