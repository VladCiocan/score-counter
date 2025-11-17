import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG standalone
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

// Services
import { AuthService } from '../services/auth.service';
import { SessionService, SessionOptionInput } from '../services/session.service';
import { Session, SessionEvent, SessionOption } from '../models/session.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    TableModule,
    ToastModule,
    FormsModule,
    DatePipe,
    NgIf,
    NgFor,
    TagModule,
    InputTextModule,
    SelectModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="dashboard">
      <div class="welcome">
        <div class="intro">
          <p class="eyebrow">Bun venit, {{ auth.getCurrentUser()?.username }}!</p>
          <h2>Sesiuni personalizate pentru victorii și înfrângeri.</h2>
          <p class="muted">
            Configurează câmpurile unei sesiuni, marchează rezultatele cu butoane dedicate și urmărește statisticile instant.
          </p>
        </div>
        <div class="session-builder">
          <div class="session-builder__header">
            <div>
              <p class="eyebrow">Configurație nouă</p>
              <h3>Pregătește următoarea sesiune</h3>
            </div>
            <p-tag value="Live" *ngIf="activeSession" severity="success"></p-tag>
          </div>

          <div class="field">
            <label for="sessionName">Nume sesiune</label>
            <input
              pInputText
              id="sessionName"
              [(ngModel)]="newSessionName"
              placeholder="Ex. Liga de seară"
              class="w-full"
            />
          </div>

          <div class="fields-grid">
            <div class="field-row" *ngFor="let field of newFields; let i = index">
              <input
                pInputText
                [(ngModel)]="field.label"
                name="label-{{ i }}"
                placeholder="Etichetă (ex. Victorie rapidă)"
                class="w-full"
              />
              <p-select
                [options]="outcomeOptions"
                optionLabel="label"
                optionValue="value"
                [(ngModel)]="field.outcome"
                name="outcome-{{ i }}"
                styleClass="dropdown"
              ></p-select>
              <button
                pButton
                type="button"
                icon="pi pi-trash"
                class="p-button-text"
                severity="danger"
                (click)="removeField(i)"
                [disabled]="newFields.length === 1"
                aria-label="Șterge câmp"
              ></button>
            </div>
            <button pButton type="button" icon="pi pi-plus" label="Adaugă câmp" class="p-button-text" (click)="addField()"></button>
          </div>

          <button pButton type="button" label="Pornește sesiunea" icon="pi pi-play" class="w-full" (click)="startSession()"></button>
        </div>
      </div>

      <div class="layout">
        <div class="sidebar">
          <p-card header="Sesiunile tale" styleClass="card-elevated">
            <div class="session-list" *ngIf="sessions.length; else emptyList">
              <button
                *ngFor="let session of sessions"
                class="session-item"
                [class.active]="selectedSession?.id === session.id"
                (click)="previewSession(session)"
                type="button"
              >
                <div>
                  <p class="muted">{{ session.name }}</p>
                  <strong>#{{ session.id.substring(0, 6) }}</strong>
                </div>
                <p-tag
                  [value]="session.isActive ? 'Activă' : 'Închisă'"
                  [severity]="session.isActive ? 'success' : 'secondary'"
                ></p-tag>
              </button>
            </div>
            <ng-template #emptyList>
              <p class="muted">Nu există sesiuni. Creează una nouă pentru a începe.</p>
            </ng-template>
          </p-card>
        </div>

        <div class="content" *ngIf="selectedSession as session">
          <p-card [header]="session.name" styleClass="card-elevated">
            <div class="session-meta">
              <div>
                <p class="label">ID</p>
                <p class="value">#{{ session.id.substring(0, 8) }}</p>
              </div>
              <div>
                <p class="label">Start</p>
                <p class="value">{{ session.startDate | date: 'short' }}</p>
              </div>
              <div>
                <p class="label">Status</p>
                <p-tag [value]="session.isActive ? 'Activă' : 'Închisă'" [severity]="session.isActive ? 'success' : 'secondary'"></p-tag>
              </div>
              <div>
                <p class="label">Total acțiuni</p>
                <p class="value">{{ getStats(session).total }}</p>
              </div>
            </div>

            <div class="stats-grid" *ngIf="getStats(session) as s">
              <div class="stat">
                <p class="label">Victorii</p>
                <p class="value success">{{ s.victories }}</p>
              </div>
              <div class="stat">
                <p class="label">Înfrângeri</p>
                <p class="value danger">{{ s.defeats }}</p>
              </div>
              <div class="stat">
                <p class="label">Diferență</p>
                <p class="value">{{ s.balance }}</p>
              </div>
            </div>

            <div class="options-panel" *ngIf="session.isActive && session.options.length">
              <p class="label">Adaugă un rezultat</p>
              <div class="options-grid">
                <button
                  *ngFor="let option of session.options"
                  pButton
                  type="button"
                  [label]="option.label"
                  [icon]="option.outcome === 'victory' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"
                  [severity]="option.outcome === 'victory' ? 'success' : 'danger'"
                  (click)="recordOutcome(option)"
                ></button>
              </div>
            </div>

            <p-table [value]="session.options" responsiveLayout="scroll" *ngIf="session.options.length">
              <ng-template pTemplate="header">
                <tr>
                  <th>Opțiune</th>
                  <th>Tip</th>
                  <th>Număr intrări</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-option>
                <tr>
                  <td>{{ option.label }}</td>
                  <td>
                    <p-tag
                      [value]="option.outcome === 'victory' ? 'Victorie' : 'Înfrângere'"
                      [severity]="option.outcome === 'victory' ? 'success' : 'danger'"
                    ></p-tag>
                  </td>
                  <td>{{ option.count }}</td>
                </tr>
              </ng-template>
            </p-table>

            <p-table [value]="session.events" responsiveLayout="scroll" *ngIf="session.events.length">
              <ng-template pTemplate="header">
                <tr>
                  <th>Înregistrare</th>
                  <th>Tip</th>
                  <th>Moment</th>
                  <th></th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-event>
                <tr>
                  <td>{{ event.optionLabel }}</td>
                  <td>
                    <p-tag
                      [value]="event.outcome === 'victory' ? 'Victorie' : 'Înfrângere'"
                      [severity]="event.outcome === 'victory' ? 'success' : 'danger'"
                    ></p-tag>
                  </td>
                  <td>{{ event.timestamp | date: 'short' }}</td>
                  <td class="actions-cell">
                    <button
                      pButton
                      type="button"
                      icon="pi pi-trash"
                      class="p-button-text"
                      severity="danger"
                      (click)="removeEvent(event)"
                      aria-label="Șterge înregistrare"
                    ></button>
                  </td>
                </tr>
              </ng-template>
            </p-table>

            <div class="footer-bar">
              <div class="muted">Gestionează sesiunile și deconectează-te oricând.</div>
              <div class="actions">
                <button
                  pButton
                  label="Șterge sesiunea"
                  icon="pi pi-trash"
                  class="p-button-outlined"
                  severity="danger"
                  (click)="deleteSession()"
                  [disabled]="!session"
                ></button>
                <button pButton label="Închide sesiunea" icon="pi pi-stop" class="p-button-outlined" (click)="endSession()" [disabled]="!session.isActive"></button>
                <button pButton label="Logout" icon="pi pi-sign-out" class="p-button-text" (click)="onLogout()"></button>
              </div>
            </div>
          </p-card>
        </div>
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
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.25rem;
        align-items: stretch;
      }

      .intro h2 {
        margin: 0 0 0.4rem;
        font-size: 1.9rem;
      }

      .muted {
        color: var(--ink-subtle);
        margin: 0;
      }

      .eyebrow {
        font-size: 0.85rem;
        letter-spacing: 0.02em;
        color: var(--primary-strong);
        font-weight: 700;
        margin: 0 0 0.35rem;
      }

      .session-builder {
        background: var(--surface-muted);
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 18px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .session-builder__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .field label,
      .label {
        display: block;
        margin-bottom: 0.35rem;
        font-weight: 600;
        color: var(--ink);
      }

      .fields-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .field-row {
        display: grid;
        grid-template-columns: 1fr 200px 48px;
        gap: 0.75rem;
        align-items: center;
      }

      .dropdown {
        width: 100%;
      }

      .layout {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 1.25rem;
      }

      .sidebar .session-list {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }

      .session-item {
        width: 100%;
        padding: 0.85rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        background: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .session-item.active {
        border-color: var(--primary-color);
        box-shadow: 0 10px 30px rgba(79, 70, 229, 0.1);
      }

      .session-item strong {
        display: block;
        margin-top: 0.15rem;
      }

      .content .session-meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
      }

      .label {
        font-size: 0.9rem;
      }

      .value {
        margin: 0.2rem 0 0;
        font-weight: 700;
        font-size: 1.2rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 0.75rem;
        margin: 1rem 0;
      }

      .stat {
        background: var(--surface-muted);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 14px;
        padding: 0.85rem 1rem;
      }

      .value.success {
        color: #16a34a;
      }

      .value.danger {
        color: #dc2626;
      }

      .options-panel {
        margin: 1rem 0 1.25rem;
      }

      .options-grid {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .w-full {
        width: 100%;
      }

      .footer-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.85rem 1rem;
        background: var(--surface-muted);
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        margin-top: 1.25rem;
      }

      .footer-bar .actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .actions-cell {
        text-align: right;
      }

      @media (max-width: 1024px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .field-row {
          grid-template-columns: 1fr;
        }

        .field-row button {
          justify-self: start;
        }
      }
    `
  ],
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {
  activeSession: Session | null = null;
  sessions: Session[] = [];
  selectedSession: Session | null = null;
  newSessionName = '';
  newFields: SessionOptionInput[] = [
    { label: 'Victorie', outcome: 'victory' },
    { label: 'Înfrângere', outcome: 'defeat' }
  ];
  outcomeOptions = [
    { label: 'Victorie', value: 'victory' },
    { label: 'Înfrângere', value: 'defeat' }
  ];

  constructor(
    public auth: AuthService,
    private sessionService: SessionService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSessions();
  }

  addField() {
    this.newFields.push({ label: '', outcome: 'victory' });
  }

  removeField(index: number) {
    if (this.newFields.length > 1) {
      this.newFields.splice(index, 1);
    }
  }

  loadSessions() {
    this.sessions = this.sessionService.getUserSessions();
    this.activeSession = this.sessionService.getActiveSession();
    if (this.activeSession) {
      this.selectedSession = this.activeSession;
    } else if (this.sessions.length) {
      this.selectedSession = this.sessions[this.sessions.length - 1];
    } else {
      this.selectedSession = null;
    }
  }

  startSession() {
    const sanitizedFields = this.newFields.filter(f => f.label.trim() !== '');
    if (!this.newSessionName.trim() || sanitizedFields.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Incomplet', detail: 'Adaugă un nume și cel puțin o opțiune.' });
      return;
    }

    this.sessionService.startSession(this.newSessionName, sanitizedFields);
    this.newSessionName = '';
    this.newFields = [
      { label: 'Victorie', outcome: 'victory' },
      { label: 'Înfrângere', outcome: 'defeat' }
    ];
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

  deleteSession() {
    if (this.selectedSession && this.sessionService.deleteSession(this.selectedSession.id)) {
      this.messageService.add({ severity: 'info', summary: 'Sesiune', detail: 'Sesiune ștearsă.' });
      this.loadSessions();
    }
  }

  recordOutcome(option: SessionOption) {
    if (this.activeSession) {
      this.sessionService.addOutcome(this.activeSession.id, option.label);
      this.loadSessions();
      this.messageService.add({ severity: 'success', summary: 'Înregistrat', detail: `${option.label} adăugată` });
    }
  }

  removeEvent(event: SessionEvent) {
    if (!this.selectedSession) return;
    const removed = this.sessionService.removeEvent(this.selectedSession.id, event.timestamp);
    if (removed) {
      this.messageService.add({ severity: 'warn', summary: 'Șters', detail: 'Înregistrare eliminată.' });
      this.loadSessions();
    }
  }

  getStats(session: Session) {
    return this.sessionService.getSessionStats(session);
  }

  previewSession(session: Session) {
    this.selectedSession = session;
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
