import { Injectable } from '@angular/core';
import { SupabaseClient, createClient, } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Bid {
  item_id: string;
  bid_amount: number;
  bidder: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async getItems(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.from('auction_items').select('*');
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching auction items:', error.message || error);
      throw new Error('Unable to fetch auction items. Please try again later.');
    }
  }

  async getBids(itemId: string): Promise<Bid[]> {
    try {
      const { data, error } = await this.supabase.from('bids').select('*').eq('item_id', itemId);
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching bids:', error.message || error);
      throw new Error('Unable to fetch bids. Please try again later.');
    }
  }

  async addBid(itemId: string, bidAmount: number, bidderId: string): Promise<void> {
    try {
      const { error } = await this.supabase.from('bids').insert([{ item_id: itemId, bid_amount: bidAmount, bidder: bidderId }]);
      if (error) throw error;
    } catch (error: any) {
      console.error('Error adding bid:', error.message || error);
      throw new Error('Unable to place bid. Please try again later.');
    }
  }

  getBidsObservable(): Observable<any> {
    return new Observable((observer) => {
      // const subscription = this.supabase
      //   .from('bids')
      //   .on('INSERT', (payload) => {
      //     observer.next(payload.new); // Adjust according to your data structure
      //   })
      //   .subscribe();

      // return () => subscription.unsubscribe(); // Cleanup subscription
    }).pipe(
      catchError((err) => {
        console.error('Real-time subscription error:', err);
        return throwError(() => new Error('Error with real-time updates. Please try again later.'));
      })
    );
  }
}
