export interface Session {
  id: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  scores: number[];
  isActive: boolean;
}
