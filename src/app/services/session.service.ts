import { Injectable } from '@angular/core';
import { Session } from '../models/session.model';

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

  startSession(): Session {
    const session: Session = {
      id: this.generateId(),
      userId: this.getCurrentUserId(),
      startDate: new Date(),
      scores: [],
      isActive: true
    };
    this.saveSession(session);
    return session;
  }

  endSession(sessionId: string): void {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.isActive) {
      session.isActive = false;
      session.endDate = new Date();
      this.saveAllSessions(sessions);
    }
  }

  addScore(sessionId: string, score: number): void {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.isActive) {
      session.scores.push(score);
      this.saveAllSessions(sessions);
    }
  }

  getActiveSession(): Session | null {
    return this.getSessions().find(s => s.isActive && s.userId === this.getCurrentUserId()) || null;
  }

  getUserSessions(): Session[] {
    return this.getSessions().filter(s => s.userId === this.getCurrentUserId());
  }

  getSessionStats(session: Session) {
    const scores = session.scores;
    if (scores.length === 0) return { total: 0, avg: 0, max: 0, min: 0 };

    return {
      total: scores.reduce((a, b) => a + b, 0),
      avg: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
      max: Math.max(...scores),
      min: Math.min(...scores),
      count: scores.length
    };
  }

  private getSessions(): Session[] {
    const sessions = localStorage.getItem(this.sessionsKey);
    return sessions ? JSON.parse(sessions) : [];
  }

  private saveAllSessions(sessions: Session[]): void {
    localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
  }

  private saveSession(session: Session): void {
    const sessions = this.getSessions();
    sessions.push(session);
    this.saveAllSessions(sessions);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
