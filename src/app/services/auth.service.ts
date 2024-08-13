// import { Injectable, NgZone, inject } from '@angular/core';
// import { SupabaseClient, createClient } from '@supabase/supabase-js';
// import { environment } from '../../environments/environment.development';
// import { Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private supabase!: SupabaseClient;

//   private router = inject(Router);
//   private _ngZone = inject(NgZone);


//   public loader = false
//   public isAuthenticated = false;

//   constructor() {
//     this.supabase = createClient(
//       environment.supabaseUrl,
//       environment.supabaseKey
//     );

//     this.supabase.auth.onAuthStateChange((event, session) => {
//       console.log('event', event);
//       console.log('session', session);

//       localStorage.setItem('session', JSON.stringify(session?.user));

//       if (session?.user) {
//         this._ngZone.run(() => {
//           this.router.navigate(['/home']);
//         });
//       }
//     });
//   }

//   get isLoggedIn(): boolean {
//     const user = localStorage.getItem('session') as string;

//     return user === 'undefined' ? false : true;
//   }
//   getCurrentUser() {
//     const user = localStorage.getItem('session');
//     return user ? JSON.parse(user) : null;
//   }


//   async signInWithGoogle() {
//     await this.supabase.auth.signInWithOAuth({
//       provider: 'google',
//     });
//   }

//   async signOut() {
//     await this.supabase.auth.signOut();
//   }
// }
import { Injectable, NgZone, inject } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase!: SupabaseClient;

  private router = inject(Router);
  private _ngZone = inject(NgZone);

  public loader = false;
  public isAuthenticated = false;
  public errorMessage: string | null = null;  // Error message state

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.loader = false; // Stop loader once auth state is determined
      this.isAuthenticated = !!session?.user;
      localStorage.setItem('session', JSON.stringify(session?.user));

      if (this.isAuthenticated) {
        this._ngZone.run(() => {
          this.router.navigate(['/home']);
        });
      } else {
        this._ngZone.run(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }


  
  get isLoggedIn(): boolean {
    const user = localStorage.getItem('session') as string;

    return user === 'undefined' ? false : true;
  }
  getCurrentUser() {
    const user = localStorage.getItem('session');
    return user ? JSON.parse(user) : null;
  }
  async signInWithGoogle() {
    try {
      this.loader = true;
      this.errorMessage = null; // Clear previous errors
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      this.errorMessage = 'Failed to sign in with Google. Please try again.'; // Set error message
      console.error('Error signing in with Google:', error);
    } finally {
      this.loader = false;
    }
  }

  async signOut() {
    try {
      this.loader = true;
      this.errorMessage = null;
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      localStorage.removeItem('session');
      this.isAuthenticated = false;
      this._ngZone.run(() => {
        this.router.navigate(['/login']);
      });
    } catch (error) {
      this.errorMessage = 'Failed to sign out. Please try again.'; // Set error message
      console.error('Error signing out:', error);
    } finally {
      this.loader = false;
    }
  }
}
