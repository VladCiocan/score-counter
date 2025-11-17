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
  private sessionsKey = 'sessions_v2';
  private legacySessionsKey = 'sessions';
  private sessionEventsPrefix = 'session_events_';
  private initialized = false;

  constructor() {}

  private ensureInitialized() {
    if (this.initialized) return;
    this.migrateLegacySessions();
    this.initialized = true;
  }

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
    this.persistSessionEvents(session.id, []);
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

  deleteSession(sessionId: string): boolean {
    const currentUserId = this.getCurrentUserId();
    const sessions = this.getSessions();
    const filteredSessions = sessions.filter(session => !(session.id === sessionId && session.userId === currentUserId));

    if (filteredSessions.length !== sessions.length) {
      this.saveAllSessions(filteredSessions);
      this.removeSessionEvents(sessionId);
      return true;
    }

    return false;
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
        const events = this.getSessionEvents(session.id);
        events.push(event);
        session.events = events;
        this.persistSessionEvents(session.id, events);
        this.saveAllSessions(sessions);
      }
    }
  }

  removeEvent(sessionId: string, timestamp: string): boolean {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId && s.userId === this.getCurrentUserId());
    if (!session) return false;

    const eventIndex = session.events.findIndex(e => e.timestamp === timestamp);
    if (eventIndex === -1) return false;

    const [removedEvent] = session.events.splice(eventIndex, 1);
    this.persistSessionEvents(session.id, session.events);
    const option = session.options.find(
      o => o.label === removedEvent.optionLabel && o.outcome === removedEvent.outcome
    );

    if (option && option.count > 0) {
      option.count -= 1;
    }

    this.saveAllSessions(sessions);
    return true;
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
    this.ensureInitialized();
    const sessions = localStorage.getItem(this.sessionsKey);
    if (!sessions) return [];

    try {
      const parsed = JSON.parse(sessions) as Session[];
      return parsed.map(session => ({
        ...session,
        startDate: session.startDate,
        endDate: session.endDate,
        options: session.options || [],
        events: this.getSessionEvents(session.id)
      }));
    } catch (error) {
      console.error('Failed to parse sessions', error);
      return [];
    }
  }

  private saveAllSessions(sessions: Session[]): void {
    const sessionsWithoutEvents = sessions.map(({ events, ...rest }) => ({ ...rest }));
    localStorage.setItem(this.sessionsKey, JSON.stringify(sessionsWithoutEvents));
  }

  private getSessionEvents(sessionId: string): SessionEvent[] {
    const eventsStr = localStorage.getItem(`${this.sessionEventsPrefix}${sessionId}`);
    if (!eventsStr) return [];
    try {
      return JSON.parse(eventsStr) as SessionEvent[];
    } catch (error) {
      console.error('Failed to parse session events', error);
      return [];
    }
  }

  private persistSessionEvents(sessionId: string, events: SessionEvent[]): void {
    localStorage.setItem(`${this.sessionEventsPrefix}${sessionId}`, JSON.stringify(events));
  }

  private removeSessionEvents(sessionId: string): void {
    localStorage.removeItem(`${this.sessionEventsPrefix}${sessionId}`);
  }

  private migrateLegacySessions(): void {
    const legacy = localStorage.getItem(this.legacySessionsKey);
    if (!legacy) return;

    try {
      const parsed = JSON.parse(legacy) as Session[];
      parsed.forEach(session => {
        if (!localStorage.getItem(`${this.sessionEventsPrefix}${session.id}`)) {
          this.persistSessionEvents(session.id, session.events || []);
        }
      });

      const sessionsWithoutEvents = parsed.map(({ events, ...rest }) => ({ ...rest }));
      localStorage.setItem(this.sessionsKey, JSON.stringify(sessionsWithoutEvents));
      localStorage.removeItem(this.legacySessionsKey);
    } catch (error) {
      console.error('Failed to migrate legacy sessions', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
