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
  isVisible: boolean = true;
  selectedFile: File | null = null;

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async updateProfile() {
    try {
      const supabaseClient = this.supabaseService.getClient();
      const { data: { user } } = await supabaseClient.auth.getUser();
  
      if (!user) {
        this.errorMessage = 'User not authenticated';
        return;
      }
  
      if (!this.fullName.trim()) {
        this.errorMessage = 'Full name is required';
        return;
      }
  
      console.log('User ID:', user.id);
      console.log('Full Name:', this.fullName);
      
      let avatarToUse = this.avatarUrl;
    
      // If a file is selected, upload it to Supabase Storage
      if (this.selectedFile) {
        const filePath = `public/${user.id}/${this.selectedFile.name}`;
        console.log('Uploading file to:', filePath);
        
        const { data, error } = await supabaseClient.storage
          .from('avatar') // replace with your bucket name
          .upload(filePath, this.selectedFile);
  
        if (error) {
          this.errorMessage = `Upload failed: ${error.message}`;
          console.error('Upload Error:', error.message);
          return;
        }
  
        avatarToUse = supabaseClient.storage
          .from('avatar')
          .getPublicUrl(filePath).data.publicUrl;
    
        console.log('Uploaded Avatar URL:', avatarToUse);
      }
    
      // Use a default avatar if none is provided
      const defaultAvatarUrl = 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png';
      avatarToUse = avatarToUse || defaultAvatarUrl;
    
      console.log('Final Avatar URL:', avatarToUse);
    
      // Update the user's profile in the 'users' table
      const { error } = await supabaseClient
        .from('users')
        .update({ full_name: this.fullName, avatar_url: avatarToUse })
        .eq('id', user.id);
    
      if (error) {
        this.errorMessage = error.message;
        console.error('Update Error:', error.message);
      } else {
        console.log('Profile updated successfully for user:', user.id);
        this.showToast('Profile updated successfully!');
        this.isVisible = false;
    
        setTimeout(() => {
          this.router.navigate(['/home']); // Adjust this route as needed
        }, 2000);
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
