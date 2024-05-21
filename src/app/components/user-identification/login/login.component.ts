import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { catchError, map, mergeMap, of } from 'rxjs';
import { CookieServiceService } from 'src/app/shared/services/cookieservice/cookieservice.service';
import { UsersService } from 'src/app/shared/services/flowboard/users/users.service';
import { User } from 'src/app/shared/types/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public contactForm: FormGroup;
  public isPasswordVisible: boolean = false;
  public isLoginFailed: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UsersService,
    private router: Router,
    private cookiesService: CookieServiceService
  ) {
    this.contactForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  public async handleSubmit() {
    const email = this.contactForm.get('email')?.value;
    const password = this.contactForm.get('password')?.value;
    if (!email || !password) {
      this.isLoginFailed = true;
      return;
    }

    this.userService
      .getUser(email, password)
      .pipe(
        mergeMap(async (response: User) => {
          if (response !== undefined) {
            const id: number = response.id as number;
            await this.cookiesService.generateToken(id);
            return id;
          }
          return -1;
        })
      )
      .subscribe((response: number) => {
        if (response !== -1) {
          this.router.navigate([`/dashboard/${response}`]);
        }
      });
  }

  showError() {}
}
