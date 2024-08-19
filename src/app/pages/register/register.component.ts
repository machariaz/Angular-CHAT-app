import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  
  errorMessage: string | null = null;
  showPassword: boolean = false; 

  constructor(private auth: AuthService, private router: Router) {}

  async handleSignUp() {
    try {
      const user = await this.auth.signUpWithEmail(this.email, this.password,);
      if (!user) {
        this.errorMessage = this.auth.errorMessage;
      } else {
        // Redirect to the login page or home page upon successful signup
        
        this.router.navigate(['/update']); // Adjust the route as needed
      }
    } catch (error) {
      this.errorMessage = this.auth.errorMessage;
    }
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    if (passwordField) {
      passwordField.type = this.showPassword ? 'text' : 'password';
    }
  }
}
