import { Injectable, signal } from '@angular/core';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SupabaseService } from '../services/supabase.service';
import { Ichat } from '../interface/chat-response';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private supabase: SupabaseClient;
  public savedChat = signal({});

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
    this.testSupabaseConnection();
  }

  private async testSupabaseConnection() {
    try {
      const { data, error } = await this.supabase.from('chat').select('*');
      if (error) {
        console.error('Error testing Supabase connection:', error.message);
      } else {
        console.log('Supabase connection successful:', data);
      }
    } catch (err) {
      console.error('Unexpected error during connection test:', err);
    }
  }

  // Get the current user
  private async getCurrentUser(): Promise<User> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
        throw new Error(`Supabase auth error: ${error.message}`);
      }
      if (!user) {
        console.error('User is not authenticated');
        throw new Error('User is not authenticated');
      }
      console.log('Fetched user:', user);
      return user;
    } catch (err) {
      console.error('Error in getCurrentUser:', (err as Error).message);
      throw err;
    }
  }

  // Send a chat message
  async chatMessage(text: string, receiverId: string): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      const { data, error } = await this.supabase.from('chat').insert({
        text,
        sender: user.id,
        receiver: receiverId,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error sending message:', error.message);
        throw new Error('Failed to send message.');
      }
    } catch (error) {
      console.error('Unexpected error in chatMessage:', (error as Error).message);
      throw new Error('An unexpected error occurred while sending the message.');
    }
  }

  // List chat messages between the current user and another user
  async listChat(receiverId: string): Promise<Ichat[]> {
    try {
      const user = await this.getCurrentUser();

      const { data, error } = await this.supabase
        .from('chat')
        .select('*')
        .or(`(sender.eq.${user.id},receiver.eq.${user.id})`)
        .or(`(sender.eq.${receiverId},receiver.eq.${receiverId})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat messages:', error.message);
        return []; // Return an empty array if there's an error
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in listChat:', (error as Error).message);
      return []; // Return an empty array if there's an unexpected error
    }
  }

  // Delete a chat message
  async deleteChat(id: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.from('chat').delete().eq('id', id);

      if (error) {
        console.error('Error deleting chat message:', error.message);
        throw new Error('Failed to delete message.');
      }
    } catch (error) {
      console.error('Unexpected error in deleteChat:', (error as Error).message);
      throw new Error('An unexpected error occurred while deleting the message.');
    }
  }

  // Save selected chat message (e.g., for options or actions)
  selectedChats(msg: Ichat): void {
    this.savedChat.set(msg);
  }

  // Get all users
  async getUsers(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.from('users').select('*');
      if (error) {
        console.error('Error fetching users:', error.message);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Unexpected error in getUsers:', (error as Error).message);
      throw error;
    }
  }
}
