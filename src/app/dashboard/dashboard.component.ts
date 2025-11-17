import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG standalone
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';

// Services
import { AuthService } from '../services/auth.service';
import { SessionService, SessionStats } from '../services/session.service';
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
    DecimalPipe,
    NgIf,
    NgFor,
    TagModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="dashboard">
      <div class="welcome">
        <div>
          <p class="eyebrow">Bun venit, {{ auth.getCurrentUser()?.username }}!</p>
          <h2>Controlează-ți sesiunile și urmărește progresul.</h2>
          <p class="muted">
            Pornește o sesiune nouă, adaugă puncte și analizează istoricul într-un tabel clar și modern.
          </p>
          <div class="actions">
            <button
              pButton
              label="Start session"
              icon="pi pi-play"
              (click)="startSession()"
              [disabled]="!!activeSession"
            ></button>
            <button
              pButton
              label="Închide sesiunea"
              icon="pi pi-stop"
              class="p-button-outlined"
              (click)="endSession()"
              [disabled]="!activeSession"
            ></button>
          </div>
        </div>
        <div class="session-card" *ngIf="activeSession; else noActive">
          <div class="session-header">
            <div>
              <p class="eyebrow">Sesiune activă</p>
              <h3>#{{ activeSession!.id.substring(0, 6) }}</h3>
            </div>
            <p-tag value="Live" severity="success"></p-tag>
          </div>
          <div class="stats-grid">
            <div>
              <p class="label">Total</p>
              <p class="value">{{ stats.total }}</p>
            </div>
            <div>
              <p class="label">Medie</p>
              <p class="value">{{ stats.avg | number: '1.0-2' }}</p>
            </div>
            <div>
              <p class="label">Max</p>
              <p class="value">{{ stats.max }}</p>
            </div>
            <div>
              <p class="label">Înregistrări</p>
              <p class="value">{{ stats.count }}</p>
            </div>
          </div>
        </div>
        <ng-template #noActive>
          <div class="session-card empty">
            <p class="muted">Nu există o sesiune activă. Pornește una nouă pentru a începe să numeri.</p>
          </div>
        </ng-template>
      </div>

      <div class="layout">
        <div class="left">
          <p-card header="Adaugă scoruri" styleClass="card-elevated" *ngIf="activeSession">
            <div class="field">
              <label for="score">Valoare</label>
              <p-inputNumber
                id="score"
                [(ngModel)]="newScore"
                placeholder="Ex. 10"
                inputId="score"
                [minFractionDigits]="0"
                class="w-full"
              ></p-inputNumber>
            </div>
            <button
              pButton
              type="button"
              label="Adaugă în sesiune"
              icon="pi pi-plus"
              class="w-full mt-3"
              (click)="addScore()"
              [disabled]="newScore === null"
            ></button>

            <ul class="score-list" *ngIf="(activeSession?.scores?.length || 0) > 0">
              <li *ngFor="let s of activeSession!.scores; let i = index">
                <span>#{{ i + 1 }}</span>
                <strong>{{ s }}</strong>
              </li>
            </ul>
          </p-card>

          <p-card *ngIf="!activeSession" header="Începe o sesiune" styleClass="card-elevated">
            <p class="muted">Pornește o sesiune pentru a începe să adaugi scoruri.</p>
            <button pButton label="Start session" icon="pi pi-play" class="mt-2" (click)="startSession()"></button>
          </p-card>
        </div>

        <div class="right">
          <p-card header="Istoric sesiuni" styleClass="card-elevated">
            <p-table [value]="sessions" responsiveLayout="scroll">
              <ng-template pTemplate="header">
                <tr>
                  <th>ID</th>
                  <th>Start</th>
                  <th>Final</th>
                  <th>Scoruri</th>
                  <th>Total</th>
                  <th>Medie</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-session>
                <tr>
                  <td class="id">{{ session.id.substring(0, 6) }}</td>
                  <td>{{ session.startDate | date: 'short' }}</td>
                  <td>{{ session.endDate ? (session.endDate | date: 'short') : '—' }}</td>
                  <td>{{ session.scores.join(', ') || '—' }}</td>
                  <td>{{ getStats(session).total }}</td>
                  <td>{{ getStats(session).avg | number: '1.0-2' }}</td>
                </tr>
              </ng-template>
            </p-table>
          </p-card>
        </div>
      </div>

      <div class="footer-bar">
        <div class="muted">Gestionează sesiunile în siguranță și deconectează-te oricând.</div>
        <button pButton label="Logout" icon="pi pi-sign-out" class="p-button-text" (click)="onLogout()"></button>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .welcome {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.25rem;
        align-items: stretch;
      }

      .eyebrow {
        font-size: 0.85rem;
        letter-spacing: 0.02em;
        color: var(--primary-strong);
        font-weight: 700;
        margin: 0 0 0.35rem;
      }

      .welcome h2 {
        margin: 0 0 0.5rem;
        font-size: 1.9rem;
      }

      .muted {
        color: var(--ink-subtle);
        margin: 0;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
        flex-wrap: wrap;
      }

      .session-card {
        background: var(--surface-muted);
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 18px;
        padding: 1.25rem;
      }

      .layout {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.25rem;
      }

      .left,
      .right {
        width: 100%;
      }

      .session-card.empty {
        display: grid;
        place-items: center;
        min-height: 180px;
        text-align: center;
      }

      .session-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .session-header h3 {
        margin: 0.1rem 0 0;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .label {
        margin: 0;
        color: var(--ink-subtle);
        font-size: 0.9rem;
      }

      .value {
        margin: 0.2rem 0 0;
        font-weight: 700;
        font-size: 1.4rem;
      }

      .p-card.card-elevated {
        width: 100%;
      }

      .w-full {
        width: 100%;
      }

      .mt-3 {
        margin-top: 0.75rem;
      }

      .mt-2 {
        margin-top: 0.5rem;
      }

      .field label {
        display: block;
        margin-bottom: 0.35rem;
        font-weight: 600;
      }

      .score-list {
        list-style: none;
        padding: 0;
        margin: 1rem 0 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .score-list li {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0.85rem;
        background: #fff;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        font-weight: 600;
      }

      .id {
        font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, monospace;
      }

      .footer-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.85rem 1rem;
        background: var(--surface-muted);
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.2);
      }

      @media (max-width: 768px) {
        .footer-bar {
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-start;
        }
      }
    `
  ],
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {
  activeSession: Session | null = null;
  sessions: Session[] = [];
  newScore: number | null = null;
  stats: SessionStats = { total: 0, avg: 0, max: 0, min: 0, count: 0 };

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
    this.stats = this.activeSession
      ? this.sessionService.getSessionStats(this.activeSession)
      : { total: 0, avg: 0, max: 0, min: 0, count: 0 };
  }

  startSession() {
    this.sessionService.startSession();
    this.loadSessions();
    this.messageService.add({ severity: 'success', summary: 'Sesiune', detail: 'Sesiune pornită!' });
  }

  endSession() {
    if (this.activeSession) {
      this.sessionService.endSession(this.activeSession.id);
      this.loadSessions();
      this.messageService.add({ severity: 'info', summary: 'Sesiune', detail: 'Sesiune încheiată.' });
    }
  }

  addScore() {
    if (this.activeSession && this.newScore !== null) {
      this.sessionService.addScore(this.activeSession.id, this.newScore);
      this.newScore = null;
      this.loadSessions();
      this.messageService.add({ severity: 'success', summary: 'Scor', detail: 'Scor adăugat!' });
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
