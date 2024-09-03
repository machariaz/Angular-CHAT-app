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
        this.errorMessage = error.message ;
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
      .from('users')
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

  // Auction Methods

  // Create a new auction item
  async createAuctionItem(name: string, description: string, image: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('auction_items')
      .insert([{ name, description, image, current_bid: 0, highest_bid: 0, highest_bidder: '' }]);

    if (error) {
      this.errorMessage = error.message;
      throw new Error(`Create Auction Item Error: ${error.message}`);
    }

    return data;
  }

  // Update an existing auction item
  async updateAuctionItem(id: string, currentBid: number, highestBid: number, highestBidder: string): Promise<void> {
    const { error } = await this.supabase
      .from('auction_items')
      .update({ current_bid: currentBid, highest_bid: highestBid, highest_bidder: highestBidder })
      .eq('id', id);

    if (error) {
      this.errorMessage = error.message;
      throw new Error(`Update Auction Item Error: ${error.message}`);
    }
  }

  // Fetch auction items
  async getAuctionItems(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('auction_items')
      .select('*');

    if (error) {
      this.errorMessage = error.message;
      throw new Error(`Fetch Auction Items Error: ${error.message}`);
    }

    return data;
  }

  // Fetch bids for a specific auction item
  async getBids(itemId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('bids')
      .select('*')
      .eq('item_id', itemId);

    if (error) {
      this.errorMessage = error.message;
      throw new Error(`Fetch Bids Error: ${error.message}`);
    }

    return data;
  }

  // Place a new bid
  async placeBid(itemId: string, bidAmount: number, bidderId: string): Promise<void> {
    const { error } = await this.supabase
      .from('bids')
      .insert([{ item_id: itemId, bid_amount: bidAmount, bidder: bidderId }]);

    if (error) {
      this.errorMessage = error.message;
      throw new Error(`Place Bid Error: ${error.message}`);
    }
  }
}
