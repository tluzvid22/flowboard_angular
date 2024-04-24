import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private router: Router = new Router();

  public navigateTo(page: string) {
    this.router.navigate([page]);
  }
}
