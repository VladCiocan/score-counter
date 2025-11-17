import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';

// PrimeNG standalone imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    ToastModule,
    FormsModule,
    RouterLink
  ],
  template: `
    <p-toast></p-toast>
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <span class="pill">Cont existent</span>
          <h2>Autentifică-te</h2>
          <p class="muted">Gestionează-ți sesiunile și urmărește scorurile în timp real.</p>
        </div>
        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="auth-form">
          <p-inputGroup>
            <p-inputGroupAddon>
              <i class="pi pi-user"></i>
            </p-inputGroupAddon>
            <input pInputText type="text" [(ngModel)]="username" name="username" placeholder="Utilizator" required />
          </p-inputGroup>

          <p-inputGroup>
            <p-inputGroupAddon>
              <i class="pi pi-lock"></i>
            </p-inputGroupAddon>
            <input pInputText type="password" [(ngModel)]="password" name="password" placeholder="Parolă" required />
          </p-inputGroup>

          <button pButton type="submit" label="Intră în cont" class="w-full"></button>
        </form>
        <p class="muted small">
          Nu ai cont? <a routerLink="/register">Creează unul nou</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .auth-card {
        width: min(440px, 100%);
        background: linear-gradient(180deg, #ffffff, #f7f7ff);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 18px;
        padding: 1.8rem;
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
      }

      .auth-header h2 {
        margin: 0.4rem 0 0.35rem;
        font-size: 1.6rem;
      }

      .auth-header p {
        margin: 0;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        padding: 0.35rem 0.75rem;
        background: rgba(124, 58, 237, 0.12);
        color: var(--primary-strong);
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.85rem;
      }

      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        margin-top: 1.4rem;
      }

      .muted {
        color: var(--ink-subtle);
      }

      .small {
        font-size: 0.9rem;
        text-align: center;
        margin-top: 1rem;
      }

      .w-full {
        width: 100%;
      }
    `
  ],
  providers: [MessageService]
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  onLogin() {
    if (this.auth.login(this.username, this.password)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Eroare', detail: 'Date incorecte' });
    }
  }
}
