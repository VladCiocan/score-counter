import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersKey = 'users';
  private currentUserKey = 'currentUser';

  constructor() {}

  register(user: User): boolean {
    const users = this.getUsers();
    if (users.some(u => u.username === user.username)) return false;

    users.push(user);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return true;
  }

  login(username: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.currentUserKey);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.currentUserKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  private getUsers(): User[] {
    const usersStr = localStorage.getItem(this.usersKey);
    return usersStr ? JSON.parse(usersStr) : [];
  }
}
