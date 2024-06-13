import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
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
import { catchError, switchMap, throwError } from 'rxjs';
import { CookieServiceService } from 'src/app/shared/services/cookieservice/cookieservice.service';
import { CountriesAPIService } from 'src/app/shared/services/countries/countries.service';
import { UsersService } from 'src/app/shared/services/flowboard/users/users.service';
import { WorkspacesService } from 'src/app/shared/services/flowboard/workspaces/workspaces.service';
import Security from 'src/app/shared/services/security/security.service';
import { Country, State } from 'src/app/shared/types/countries';
import { User } from 'src/app/shared/types/user';
import { Files } from 'src/app/shared/types/workspaces';
import { EmailAsyncValidator } from 'src/app/validators/emailValidator';
import { PasswordValidator } from 'src/app/validators/passwordValidator';
import { UsernameAsyncValidator } from 'src/app/validators/usernameValidator';
import {
  passwordLength,
  phoneValidPattern,
  maxImageSize,
} from 'src/constants/input';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  @ViewChild('countrySelect') countrySelect: any;
  @ViewChild('stateSelect') stateSelect: any;
  @ViewChild('imageInput') imageInput: any;
  @ViewChild('avatar') avatar: any;

  public signUpForm: FormGroup;
  public isPasswordVisible: boolean = false;
  public static formStep: number = 1;
  public passwordStrength: number = 1;
  public router: Router = inject(Router);
  public countrySelected: string = 'AF';
  public stateSelected: string = 'BDS';
  public image: Files | any;
  public data: User = {
    name: '',
    lastName: '',
    password: '',
    email: '',
    confirmEmail: '',
    imageid: 0,
    username: '',
    address: '',
    phone: '',
    country: '',
    state: '',
  };
  public location: { countries: Country[]; states: State[] };
  public badFormatImage: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private countriesService: CountriesAPIService,
    private security: Security,
    private usersService: UsersService,
    private imageService: WorkspacesService,
    private cookiesService: CookieServiceService
  ) {
    const savedData = localStorage.getItem('SignUpInfo');
    if (savedData !== null) {
      this.data = JSON.parse(savedData);
    }

    this.signUpForm = this.formBuilder.group({
      name: [this.data.name, [Validators.required]],
      lastname: [this.data.lastName, [Validators.required]],
      password: ['', [Validators.required, PasswordValidator(passwordLength)]],
      confirmPassword: [
        '',
        [Validators.required, PasswordValidator(passwordLength)],
      ],
      email: [
        this.data.email,
        [Validators.required, Validators.email],
        [EmailAsyncValidator(this.usersService)],
      ],
      confirmEmail: [
        this.data.confirmEmail,
        [Validators.required, Validators.email],
        [EmailAsyncValidator(this.usersService)],
      ],
      username: [
        this.data.username,
        [Validators.required],
        [UsernameAsyncValidator(this.usersService)],
      ], //ToDo: Add Validation that checks wether user exist in database
      address: [this.data.address, [Validators.required]],
      phone: [
        this.data.phone,
        [Validators.required, Validators.pattern(phoneValidPattern)], //returns 'pattern' property validation error
      ],
      country: ['', Validators.required],
      state: ['', Validators.required],
    });
    SignupComponent.formStep = +this.activatedRoute.snapshot.params['id'];
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['email'] !== undefined) {
        this.data.email = params['email'];
        this.data.confirmEmail = params['email'];
      }
    });

    this.location = { countries: [], states: [] };
    this.fetchLocationData();
  }

  public async handleSubmit() {
    const password = this.security.decrypt(
      JSON.parse(localStorage.getItem('SignUpInfo')!).password
    );
    let imageId = 1;
    if (this.image !== undefined) {
      imageId = await this.uploadImage(this.image);
    }

    if (imageId === -1) {
      this.showError();
      return;
    }

    const user: User = {
      ...this.data,
      password: password,
      imageid: imageId,
    };

    this.usersService.postUser(user).subscribe(
      (response: User) => {
        localStorage.removeItem('SignUpInfo');
        this.cookiesService.clearTokenFromTokenValue();
        this.router.navigate(['/login']);
      },
      (error) => {
        this.showError();
        console.log(error);
      }
    ); //post new user
  }

  /**
   * Uploads user image to API
   * @returns id of the uploades image, -1 if there was an error
   */
  private uploadImage(file: File): Promise<number> {
    const extensionIndex = file.name.lastIndexOf('.');
    const name = file.name.substring(0, extensionIndex);
    const fileType = file.name.substring(extensionIndex);

    return new Promise<number>((resolve, reject) => {
      const response = this.imageService.postFile({
        data: file,
        fileType: fileType,
        name: name,
      });
      response.subscribe({
        next: (image: Files) => {
          resolve(image.id as number);
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          reject(-1);
        },
      });
    });
  }

  //goes to the next step
  public nextStep() {
    if (this.checkErrors()) {
      this.signUpForm.markAllAsTouched();
      return;
    }
    this.updateData(SignupComponent.formStep);
    if (SignupComponent.formStep === 3) {
      this.handleSubmit();
      //ToDo: navigate to dashboard once signed up
      //this.router.navigate(/*DashboardPAGE*/);
      return;
    }
    SignupComponent.formStep++;
    this.signUpForm.markAsUntouched();
    this.router.navigate([`signup/step/${SignupComponent.formStep}`]);
    this.isPasswordVisible = false;
  }

  //goes to the step before the actual one
  public lastStep() {
    const step: number = +this.activatedRoute.snapshot.params['id'] - 1;
    this.updateData(step);
    this.isPasswordVisible = false;
    this.router.navigate([`signup/step/${step}`]);
  }

  /**
   *
   * @returns true if FormControl has errors depending on the form step
   */
  private checkErrors() {
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
    } else if (SignupComponent.formStep === 3) {
      hasErrors =
        this.signUpForm.get('username')?.errors !== null ||
        this.signUpForm.get('address')?.errors !== null ||
        this.signUpForm.get('phone')?.errors !== null ||
        this.signUpForm.get('country')?.errors !== null ||
        this.signUpForm.get('state')?.errors !== null;
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
    if (password2?.errors?.passwordStrength === undefined) {
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

  private updateData(step: number) {
    if (step === 1) {
      this.data.name = this.signUpForm.get('name')?.value;
      this.data.lastName = this.signUpForm.get('lastname')?.value;
      this.data.password = this.security.encrypt(
        this.signUpForm.get('password')?.value
      );
      //step1
    } else if (step === 2) {
      this.data.email = this.signUpForm.get('email')?.value;
      this.data.confirmEmail = this.signUpForm.get('confirmEmail')?.value;
      //step2
    } else if (step === 3) {
      this.data.address = this.signUpForm.get('address')?.value;
      this.data.username = this.signUpForm.get('username')?.value;
      this.data.phone = this.signUpForm.get('phone')?.value;
      this.data.country = this.signUpForm.get('country')?.value;
      this.data.state = this.signUpForm.get('state')?.value;
      //step3
    }
    localStorage.setItem('SignUpInfo', JSON.stringify(this.data));
  }

  private fetchLocationData() {
    this.countriesService
      .getCountries()
      .pipe(
        switchMap((countries: Country[]) => {
          this.location.countries = countries.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          return this.countriesService.getStates(this.countrySelected);
        }),
        catchError((error) => {
          console.error('Error fetching data:', error);
          return throwError(error);
        })
      )
      .subscribe((states: State[]) => {
        this.location.states = states.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        return this.countriesService.getCities(
          this.countrySelected,
          this.stateSelected
        );
      });
  }

  updateCountry(event: any): string {
    const selectElement = event.target as HTMLSelectElement;
    this.countrySelected = selectElement.value;
    return this.countrySelected;
  }

  updateStates() {
    this.countriesService
      .getStates(this.countrySelected)
      .pipe(
        catchError((error) => {
          console.error('Error fetching states: ', error);
          return throwError(error);
        })
      )
      .subscribe((states: State[]) => {
        this.location.states = states.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      });
  }
  //countriesAPI

  handleImageSubmit() {
    this.imageInput.nativeElement.click();
  }

  handleImageChange(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files![0];
    const fileSize = file.size / 1024 / 1024;

    if (!file || fileSize > maxImageSize) {
      this.showError();
      return;
    }
    //restrict not valid images

    this.image = file;
    //save image in user saved data

    this.avatar.nativeElement.src = URL.createObjectURL(file);
    //read and show image to UI
  }

  showError() {
    this.badFormatImage = true;
  }

  closeError() {
    this.badFormatImage = false;
  }
  //user avatar
}
