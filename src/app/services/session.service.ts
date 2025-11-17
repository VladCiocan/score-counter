import { Injectable } from '@angular/core';
import { Session, SessionEvent, SessionOption } from '../models/session.model';

export interface SessionStats {
  total: number;
  victories: number;
  defeats: number;
  balance: number;
}

export interface SessionOptionInput {
  label: string;
  outcome: 'victory' | 'defeat';
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionsKey = 'sessions';

  constructor() {}

  getCurrentUserId(): string {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user?.username || '';
  }

  startSession(name: string, optionInputs: SessionOptionInput[]): Session {
    const options: SessionOption[] = optionInputs
      .filter(opt => !!opt.label)
      .map(opt => ({ ...opt, count: 0 }));

    const session: Session = {
      id: this.generateId(),
      userId: this.getCurrentUserId(),
      name,
      startDate: new Date().toISOString(),
      options,
      events: [],
      isActive: true
    };

    const sessions = this.getSessions();
    const existingActive = sessions.find(s => s.userId === session.userId && s.isActive);
    if (existingActive) {
      existingActive.isActive = false;
      existingActive.endDate = new Date().toISOString();
    }

    sessions.push(session);
    this.saveAllSessions(sessions);
    return session;
  }

  endSession(sessionId: string): void {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.isActive) {
      session.isActive = false;
      session.endDate = new Date().toISOString();
      this.saveAllSessions(sessions);
    }
  }

  addOutcome(sessionId: string, optionLabel: string): void {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.isActive) {
      const option = session.options.find(o => o.label === optionLabel);
      if (option) {
        option.count += 1;
        const event: SessionEvent = {
          optionLabel: option.label,
          outcome: option.outcome,
          timestamp: new Date().toISOString()
        };
        session.events.push(event);
        this.saveAllSessions(sessions);
      }
    }
  }

  getActiveSession(): Session | null {
    return this.getSessions().find(s => s.isActive && s.userId === this.getCurrentUserId()) || null;
  }

  getUserSessions(): Session[] {
    return this.getSessions().filter(s => s.userId === this.getCurrentUserId());
  }

  getSessionStats(session: Session): SessionStats {
    const victories = session.options
      .filter(o => o.outcome === 'victory')
      .reduce((sum, option) => sum + option.count, 0);
    const defeats = session.options
      .filter(o => o.outcome === 'defeat')
      .reduce((sum, option) => sum + option.count, 0);

    return {
      total: victories + defeats,
      victories,
      defeats,
      balance: victories - defeats
    };
  }

  private getSessions(): Session[] {
    const sessions = localStorage.getItem(this.sessionsKey);
    if (!sessions) return [];

    try {
      const parsed = JSON.parse(sessions) as Session[];
      return parsed.map(session => ({
        ...session,
        startDate: session.startDate,
        endDate: session.endDate,
        options: session.options || [],
        events: session.events || []
      }));
    } catch (error) {
      console.error('Failed to parse sessions', error);
      return [];
    }
  }

  private saveAllSessions(sessions: Session[]): void {
    localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
