import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] // Note the correct spelling here: styleUrls
})
export class HomeComponent {
  constructor(private router: Router, private authService: AuthService) {}

  logout(): void {
    this.authService.signOut();
    this.router.navigate(['/login']);
  }

  getTimeRemaining(endtime: Date): { total: number; days: number; hours: number; minutes: number; seconds: number } {
    const total = Date.parse(endtime.toString()) - Date.parse(new Date().toString());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  }

  initializeClock(id: string, endtime: Date): void {
    const clock = document.getElementById(id);

    if (!clock) {
      console.error(`Element with id '${id}' not found`);
      return;
    }

    const daysSpan = clock.querySelector('.days') as HTMLSpanElement;
    const hoursSpan = clock.querySelector('.hours') as HTMLSpanElement;
    const minutesSpan = clock.querySelector('.minutes') as HTMLSpanElement;
    const secondsSpan = clock.querySelector('.seconds') as HTMLSpanElement;

    const updateClock = (): void => {
      const t = this.getTimeRemaining(endtime);

      if (daysSpan) daysSpan.innerHTML = t.days.toString();
      if (hoursSpan) hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
      if (minutesSpan) minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
      if (secondsSpan) secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

      if (t.total <= 0) {
        clearInterval(timeinterval);
      }
    };

    updateClock();
    const timeinterval = setInterval(updateClock, 1000);
  }

  ngOnInit(): void {
    const deadline = new Date(Date.parse(new Date().toString()) + 28 * 24 * 60 * 60 * 1000);
    this.initializeClock('countdown-clock', deadline);
  }
}
