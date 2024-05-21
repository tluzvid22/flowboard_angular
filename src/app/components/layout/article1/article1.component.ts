import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-article1',
  standalone: false,
  templateUrl: './article1.component.html',
  styleUrl: './article1.component.scss',
})
export class Article1Component {
  constructor(private router: Router) {}

  redirectToLogin(email: string) {
    this.router.navigate(['/signup/step/1'], { queryParams: { email: email } });
  }
}
