// auth.service.ts
import { Injectable, NgZone, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;
  private router = inject(Router);
  private _ngZone = inject(NgZone);

  public loader = false;
  public isAuthenticated = false;
  public errorMessage: string | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.loader = false;
      this.isAuthenticated = !!session?.user;
      localStorage.setItem('session', JSON.stringify(session?.user));

      if (this.isAuthenticated) {
        this._ngZone.run(() => this.router.navigate(['/home']));
      } else {
        this._ngZone.run(() => this.router.navigate(['/login']));
      }
    });
  }

  get isLoggedIn(): boolean {
    const user = localStorage.getItem('session');
    return user !== 'undefined' && user !== null;
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('session');
    return user ? JSON.parse(user) : null;
  }

  async signInWithGoogle(): Promise<void> {
    try {
      this.loader = true;
      this.errorMessage = null;
      const { error } = await this.supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (error: any) {
      this.errorMessage = 'Failed to sign in with Google. Please try again.';
      console.error('Error signing in with Google:', error.message || error);
    } finally {
      this.loader = false;
    }
  }

  async signOut(): Promise<void> {
    try {
      this.loader = true;
      this.errorMessage = null;
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      localStorage.removeItem('session');
      this.isAuthenticated = false;
      this._ngZone.run(() => this.router.navigate(['/login']));
    } catch (error: any) {
      this.errorMessage = 'Failed to sign out. Please try again.';
      console.error('Error signing out:', error.message || error);
    } finally {
      this.loader = false;
    }
  }
}
