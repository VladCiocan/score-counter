import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class LandingGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): UrlTree {
    if (this.auth.isAuthenticated()) {
      return this.router.parseUrl('/dashboard');
    }
    return this.router.parseUrl('/login');
  }
}
