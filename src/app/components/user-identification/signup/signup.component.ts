import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { PasswordValidator } from 'src/app/validators/passwordValidator';

const passwordLength: number = 8;
const phoneValidPattern: string =
  '^[+]?[(]?[0-9]{2,3}[)]?[-. ]?[0-9]{3}[-. ]?[0-9]{3,6}$';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  public signUpForm: FormGroup;
  public isPasswordVisible: boolean = false;
  public static formStep: number = 3;
  public passwordStrength: number = 1;
  public router: Router = inject(Router);
  public data = {
    name: '',
    lastname: '',
    password: '',
    confirmPassword: '',
    email: '',
    confirmEmail: '',
    username: '',
    address: '',
    phone: '',
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    const savedData = localStorage.getItem('SignUpInfo');
    if (savedData !== null) {
      this.data = JSON.parse(savedData);
    }

    this.signUpForm = this.formBuilder.group({
      name: [this.data.name, [Validators.required]],
      lastname: [this.data.lastname, [Validators.required]],
      password: [
        this.data.password,
        [Validators.required, PasswordValidator(passwordLength)],
      ],
      confirmPassword: [
        this.data.confirmPassword,
        [Validators.required, PasswordValidator(passwordLength)],
      ],
      email: [this.data.email, [Validators.required, Validators.email]],
      confirmEmail: [
        this.data.confirmEmail,
        [Validators.required, Validators.email],
      ],
      username: [this.data.username, [Validators.required]], //ToDo: Add Validation that checks wether user exist in database
      address: [this.data.address, [Validators.required]],
      phone: [
        this.data.phone,
        [Validators.required, Validators.pattern(phoneValidPattern)], //returns 'pattern' property validation error
      ],
    });
    SignupComponent.formStep = +this.activatedRoute.snapshot.params['id'];
  }

  public handleSubmit() {}

  public nextStep() {
    if (this.checkErrors()) {
      this.signUpForm.markAllAsTouched();
      return;
    }
    this.signUpForm.markAsUntouched();
    SignupComponent.formStep++;
    this.updateData();
    localStorage.setItem('SignUpInfo', JSON.stringify(this.data));
    this.router.navigate([`signup/step/${SignupComponent.formStep}`]);
    this.isPasswordVisible = false;
  }

  public lastStep() {
    this.updateData();
    localStorage.setItem('SignUpInfo', JSON.stringify(this.data));
    this.router.navigate([
      `signup/step/${+this.activatedRoute.snapshot.params['id'] - 1}`,
    ]);
  }

  /**
   *
   * @returns true if FormControl has errors depending on the form step
   */
  private checkErrors() {
    this.calcPasswordStrength();
    this.compareEmails();
    let hasErrors: boolean = false;
    if (SignupComponent.formStep === 1) {
      hasErrors =
        this.signUpForm.get('password')?.errors !== null ||
        this.signUpForm.get('confirmPassword')?.errors !== null ||
        this.signUpForm.get('name')?.errors !== null ||
        this.signUpForm.get('lastname')?.errors !== null;
    } else if (SignupComponent.formStep === 2) {
      hasErrors =
        this.signUpForm.get('email')?.errors !== null ||
        this.signUpForm.get('confirmEmail')?.errors !== null;
    }
    return hasErrors;
  }

  public calcPasswordStrength() {
    let password1 = this.signUpForm.get('password');
    let password2 = this.signUpForm.get('confirmPassword');
    if (password1?.value !== password2?.value) {
      this.passwordStrength = 1;
      let errors = password1?.errors;
      password1?.setErrors({ ...errors, differentPasswords: true });
      return;
      //handle different passwords case (addding different passwords attribute)
    } else {
      let errors = password1?.errors;
      delete errors?.differentPasswords;
      if (Object.keys(!errors).length === 0) {
        password1?.setErrors(null);
      } else {
        password1?.setErrors({ ...errors });
      }
      //handle same passwords case (deleting different passwords attribute)
    }
    //different passwords (low security password)

    if (password1?.errors?.passwordStrength === undefined) {
      this.passwordStrength = 2;
      //no validation errors (medium security password)
    } else {
      this.passwordStrength = 1;
      return;
      //validation errors present (low security password)
    }

    if (password1?.value.length >= 12) {
      this.passwordStrength = 3;
      return;
    }
    // >= 12 length password + passes previous test (high security password)
  }

  public compareEmails() {
    let email1 = this.signUpForm.get('email');
    let email2 = this.signUpForm.get('confirmEmail');

    if (email1?.value !== email2?.value) {
      let errors = email1?.errors;
      email1?.setErrors({ ...errors, differentEmails: true });
      return;
      //handle different emails case (addding differentEmails attribute)
    } else {
      let errors = email1?.errors;
      delete errors?.differentEmails;
      if (Object.keys(!errors).length === 0) {
        email1?.setErrors(null);
      } else {
        email1?.setErrors({ ...errors });
      }
      //handle same emails case (deleting differentEmails attribute)
    }
    //different passwords (low security password)
  }

  public getFormStep() {
    return SignupComponent.formStep;
  }

  private updateData() {
    this.data.name = this.signUpForm.get('name')?.value;
    this.data.lastname = this.signUpForm.get('lastname')?.value;
    this.data.email = this.signUpForm.get('email')?.value;
    this.data.confirmEmail = this.signUpForm.get('confirmEmail')?.value;
  }

  public debugHTML(toDebug: any) {
    console.log(toDebug);
  }
}
