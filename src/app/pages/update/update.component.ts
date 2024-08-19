import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent {
  fullName: string = '';
  avatarUrl: string = '';
  errorMessage: string | null = null;

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async updateProfile() {
    try {
      const supabaseClient = this.supabaseService.getClient();
      const { data: { user } } = await supabaseClient.auth.getUser();

      if (!user) {
        this.errorMessage = 'User not authenticated';
        return;
      }

      // Set a default avatar URL from the assets folder if none is provided
      const defaultAvatarUrl = 'assets/images/default-avatar.png';
      const avatarToUse = this.avatarUrl || defaultAvatarUrl;

      const { error } = await supabaseClient
        .from('users')
        .update({ full_name: this.fullName, avatar_url: avatarToUse })
        .eq('id', user.id);

      if (error) {
        this.errorMessage = error.message;
      } else {
        // Show a toast notification for successful update
        this.showToast('Profile updated successfully!');

        // Redirect to home after showing the toast
        setTimeout(() => {
          this.router.navigate(['/home']); // Adjust this route as needed
        }, 2000); // Adjust the delay time as needed
      }
    } catch (error) {
      this.errorMessage = 'Error updating profile';
      console.error('Error:', error);
    }
  }

  showToast(message: string) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000); // Duration for which the toast is visible
  }
}
