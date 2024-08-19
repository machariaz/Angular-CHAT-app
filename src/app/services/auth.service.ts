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

  public loader = false; // Add this line
  public isAuthenticated = false;
  public errorMessage: string | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.loader = false;
      this.isAuthenticated = !!session?.user;
      localStorage.setItem('session', JSON.stringify(session?.user));

      this._ngZone.run(() => {
        if (this.isAuthenticated) {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/login']);
        }
      });
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

  async signInWithEmail(email: string, password: string) {
    try {
      this.loader = true;
      this.errorMessage = null;
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

      if (error) {
        this.errorMessage = error.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : 'An error occurred during login. Please try again.';
        throw error;
      }

      return data?.user;
    } catch (error: any) {
      console.error('Error signing in with email:', error.message || error);
      return null;
    } finally {
      this.loader = false;
    }
  }



  
  async signUpWithEmail(email: string, password: string): Promise<any> {
    const { data, error } = await this.supabase.auth.signUp({ 
      email,
      password
    });

    if (error) {
      this.errorMessage = error.message;
      return null;
    }

    // Assuming the user is registered successfully
    this.router.navigate(['/update']);
    return data.user;
  }
  async updateProfile(userId: string, fullName: string, avatarUrl: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')  // Use 'users' table instead of 'profiles'
      .update({ full_name: fullName, avatar_url: avatarUrl })
      .eq('id', userId);
  
    if (error) {
      throw new Error(`Profile Update Error: ${error.message}`);
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
