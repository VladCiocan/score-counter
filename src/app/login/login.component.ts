import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  standalone: true, // ✅
  imports: [
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    ToastModule,
    FormsModule
  ],
  template: `
    <p-toast></p-toast> <!-- ✅ Afișează mesajele -->
    <div class="flex justify-content-center align-items-center h-screen">
      <div class="card p-4 w-25">
        <h2 class="text-center mb-3">Login</h2>
        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <p-inputGroup class="mb-3">
            <p-inputGroupAddon>
              <i class="pi pi-user"></i>
            </p-inputGroupAddon>
            <input pInputText type="text" [(ngModel)]="username" name="username" placeholder="Username" required />
          </p-inputGroup>

          <p-inputGroup class="mb-3">
            <p-inputGroupAddon>
              <i class="pi pi-lock"></i>
            </p-inputGroupAddon>
            <input pInputText type="password" [(ngModel)]="password" name="password" placeholder="Password" required />
          </p-inputGroup>

          <button pButton type="submit" label="Login" class="w-full"></button>
        </form>
        <a routerLink="/register" class="block text-center mt-3">Create account</a>
      </div>
    </div>
  `,
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
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid credentials' });
    }
  }
}
