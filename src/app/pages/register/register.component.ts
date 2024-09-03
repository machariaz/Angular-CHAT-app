import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  signUpForm!: FormGroup;
  errorMessage: string | null = null;
  showPassword: boolean = false; 

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async handleSignUp() {
    if (this.signUpForm.valid) {
      const { email, password } = this.signUpForm.value;
      try {
        const user = await this.auth.signUpWithEmail(email, password);
        if (!user) {
          this.errorMessage = this.auth.errorMessage;
        } else {
          // Redirect to the login page or home page upon successful signup
          this.router.navigate(['/update']); // Adjust the route as needed
        }
      } catch (error) {
        this.errorMessage = this.auth.errorMessage;
      }
    } else {
      this.errorMessage = 'Please fill in the form correctly.';
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
