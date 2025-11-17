export interface SessionOption {
  label: string;
  outcome: 'victory' | 'defeat';
  count: number;
}

export interface SessionEvent {
  optionLabel: string;
  outcome: 'victory' | 'defeat';
  timestamp: string;
}

export interface Session {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate?: string;
  options: SessionOption[];
  events: SessionEvent[];
  isActive: boolean;
}
