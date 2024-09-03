// import { Component } from '@angular/core';

// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { AuthService } from '../../services/auth.service';
// @Component({
//   selector: 'app-navbar',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './navbar.component.html',
//   styleUrl: './navbar.component.css'
// })
// export class NavbarComponent {
//   constructor(private router: Router, private authService: AuthService) {}

  
//   logout(): void {
//     this.authService.signOut();
//     this.router.navigate(['/login']);
//   }

// }


import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service'; // Import SupabaseService
import { AuthService } from '../../services/auth.service';
import { User } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  member: any = {}; // Adjust the type if you have a specific type

  constructor(
    private router: Router,
    private authService: AuthService,
    public themeService: ThemeService,
    private supabaseService: SupabaseService // Inject SupabaseService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  async loadUser() {
    try {
      const user = await this.authService.getCurrentUser();
      if (user?.id) {
        const { data, error } = await this.supabaseService.getClient()
          .from('users') // Adjust table name if needed
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw new Error(`Error fetching user profile: ${error.message}`);
        }

        this.member = data;
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  logout(): void {
    this.supabaseService.getClient().auth.signOut().then(() => {
      // Clear additional session data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Redirect to login page
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Error signing out:', error.message);
    });
  }
  
}
