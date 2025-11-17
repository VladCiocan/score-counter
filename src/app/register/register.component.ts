import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    ToastModule,
    FormsModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="flex justify-content-center align-items-center h-screen">
      <div class="card p-4 w-25">
        <h2 class="text-center mb-3">Register</h2>
        <form (ngSubmit)="onRegister()" #regForm="ngForm">
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

          <button pButton type="submit" label="Register" class="w-full"></button>
        </form>
        <a routerLink="/login" class="block text-center mt-3">Back to login</a>
      </div>
    </div>
  `,
  providers: [MessageService]
})
export class RegisterComponent {
  username = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  onRegister() {
    if (this.auth.register({ username: this.username, password: this.password })) {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Account created! Login now.' });
      this.router.navigate(['/login']);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Username already exists' });
    }
  }
}
