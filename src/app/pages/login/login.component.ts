import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private auth = inject(AuthService);
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;

  async handleAuth() {
    const response = await this.auth.signInWithGoogle();
    // Handle the response or redirect the user
  }

  
  async handleEmailAuth() {
    try {
      const user = await this.auth.signInWithEmail(this.email, this.password);
      if (!user) {
        this.errorMessage = this.auth.errorMessage;
      } else {
        // Handle successful login, e.g., redirect the user
      }
    } catch (error) {
      this.errorMessage = this.auth.errorMessage;
    }
  }
}
