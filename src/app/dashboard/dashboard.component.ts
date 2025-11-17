import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import {DatePipe, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG standalone
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

// Services
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { Session } from '../models/session.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ButtonModule,
    InputNumberModule,
    CardModule,
    TableModule,
    ToastModule,
    FormsModule,
    DatePipe,
    NgIf
  ],
  template: `
    <p-toast></p-toast>
    <div class="p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
        <div>
          <span class="mr-3">Hello, {{ auth.getCurrentUser()?.username }}!</span>
          <button pButton icon="pi pi-sign-out" (click)="onLogout()" class="p-button-text"></button>
        </div>
      </div>

      <!-- Session Control -->
      <div class="card mb-4">
        <h3>Session Control</h3>
        <div class="flex gap-2">
          <button pButton label="Start New Session" (click)="startSession()" [disabled]="!!activeSession"></button>
          <button pButton label="End Session" (click)="endSession()" [disabled]="!activeSession"></button>
        </div>
      </div>

      <!-- Add Score -->
      <div class="card mb-4" *ngIf="activeSession">
        <h3>Add Score to Current Session</h3>
        <div class="flex gap-2 align-items-end">
          <p-inputNumber [(ngModel)]="newScore" placeholder="Score" mode="decimal" class="w-15rem"></p-inputNumber>
          <button pButton icon="pi pi-plus" label="Add" (click)="addScore()" [disabled]="newScore === null"></button>
        </div>
        <ul class="mt-3">
          <li *ngFor="let s of activeSession.scores; let i = index">
            {{ i + 1 }}. {{ s }}
          </li>
        </ul>
      </div>

      <!-- Stats -->
      <div class="grid">
        <div class="col-12 md:col-6">
          <div class="card">
            <h3>Current Session Stats</h3>
            <div *ngIf="activeSession; else noActive">
              <p><strong>Total:</strong> {{ stats.total }}</p>
              <p><strong>Average:</strong> {{ stats.avg }}</p>
              <p><strong>Max:</strong> {{ stats.max }}</p>
              <p><strong>Min:</strong> {{ stats.min }}</p>
              <p><strong>Entries:</strong> {{ stats.total }}</p>
            </div>
            <ng-template #noActive>
              <p>No active session.</p>
            </ng-template>
          </div>
        </div>

        <div class="col-12">
          <div class="card">
            <h3>Session History</h3>
            <p-table [value]="sessions" responsiveLayout="scroll">
              <ng-template pTemplate="header">
                <tr>
                  <th>ID</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Scores</th>
                  <th>Total</th>
                  <th>Avg</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-session>
                <tr>
                  <td>{{ session.id.substring(0,6) }}</td>
                  <td>{{ session.startDate | date:'short' }}</td>
                  <td>{{ session.endDate ? (session.endDate | date:'short') : '—' }}</td>
                  <td>{{ session.scores.join(', ') || '—' }}</td>
                  <td>{{ getStats(session).total }}</td>
                  <td>{{ getStats(session).avg }}</td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      </div>
    </div>
  `,
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {
  activeSession: Session | null = null;
  sessions: Session[] = [];
  newScore: number | null = null;
  stats: { total: number; avg: number; max: number; min: number } | {
    total: number;
    avg: string;
    max: number;
    min: number;
    count: number
  } = { total: 0, avg: 0, max: 0, min: 0, count: 0 };

  constructor(
    public auth: AuthService,
    private sessionService: SessionService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    this.sessions = this.sessionService.getUserSessions();
    this.activeSession = this.sessionService.getActiveSession();
    if (this.activeSession) {
      this.stats = this.sessionService.getSessionStats(this.activeSession);
    }
  }

  startSession() {
    this.sessionService.startSession();
    this.loadSessions();
    this.messageService.add({ severity: 'success', summary: 'Session', detail: 'New session started!' });
  }

  endSession() {
    if (this.activeSession) {
      this.sessionService.endSession(this.activeSession.id);
      this.loadSessions();
      this.messageService.add({ severity: 'info', summary: 'Session', detail: 'Session ended.' });
    }
  }

  addScore() {
    if (this.activeSession && this.newScore !== null) {
      this.sessionService.addScore(this.activeSession.id, this.newScore);
      this.newScore = null;
      this.loadSessions(); // refresh stats
    }
  }

  getStats(session: Session) {
    return this.sessionService.getSessionStats(session);
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
