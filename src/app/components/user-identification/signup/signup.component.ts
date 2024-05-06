import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, inject } from '@angular/core';
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
import { Sign } from 'crypto';
import {
  Observable,
  catchError,
  delay,
  switchMap,
  throwError,
  timer,
} from 'rxjs';
import { CountriesAPIService } from 'src/app/shared/services/countries/countries.service';
import { ImagesService } from 'src/app/shared/services/flowboard/images/images.service';
import { UsersService } from 'src/app/shared/services/flowboard/users/users.service';
import Security from 'src/app/shared/services/security/security.service';
import { City, Country, State } from 'src/app/shared/types/countries';
import { Image } from 'src/app/shared/types/images';
import { User } from 'src/app/shared/types/user';
import { PasswordValidator } from 'src/app/validators/passwordValidator';

const passwordLength: number = 8;
const phoneValidPattern: string =
  '^[+]?[(]?[0-9]{2,3}[)]?[-. ]?[0-9]{3}[-. ]?[0-9]{3,6}$';
const maxImageSize = 5;

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
  public static formStep: number = 3;
  public passwordStrength: number = 1;
  public router: Router = inject(Router);
  public countrySelected: string = 'AF';
  public stateSelected: string = 'BDS';
  public data: User = {
    name: '',
    lastName: '',
    password: '',
    email: '',
    confirmEmail: '',
    imageid: '',
    username: '',
    address: '',
    phone: '',
    country: '',
    state: '',
    city: '',
  };
  public image: Image = { id: 0, file: new File([], '', undefined) };
  public location: { countries: Country[]; states: State[]; cities: City[] };
  public badFormatImage: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private countriesService: CountriesAPIService,
    private security: Security,
    private usersService: UsersService,
    private imageService: ImagesService
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
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
    });
    SignupComponent.formStep = +this.activatedRoute.snapshot.params['id'];

    this.location = { countries: [], states: [], cities: [] };
    this.fetchLocationData();
  }

  public async handleSubmit() {
    const password = this.security.decrypt(
      JSON.parse(localStorage.getItem('SignUpInfo')!).password
    );
    const imageId: number = await this.uploadImage(this.image.file);

    if (imageId === -1) {
      this.showError();
      return;
    }

    const user: User = {
      ...this.data,
      password: password,
      imageid: imageId,
    };

    this.usersService.postUser(user);
    //post new user
  }

  /**
   * Uploads user image to API
   * @returns id of the uploades image, -1 if there was an error
   */
  private uploadImage(file: File): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const formData: FormData = new FormData();
      formData.append('file', file);
      const response = this.imageService.postImage(formData);
      response.subscribe({
        next: (image: Image) => {
          resolve(image.id);
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
        this.signUpForm.get('state')?.errors !== null ||
        this.signUpForm.get('city')?.errors !== null;
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
      this.data.city = this.signUpForm.get('city')?.value;
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
        switchMap((states: State[]) => {
          this.location.states = states.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          return this.countriesService.getCities(
            this.countrySelected,
            this.stateSelected
          );
        }),
        catchError((error) => {
          console.error('Error fetching data:', error);
          return throwError(error);
        })
      )
      .subscribe((cities: City[]) => {
        this.location.cities = cities.sort((a, b) =>
          a.name.localeCompare(b.name)
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

        this.updateCities(null);
      });
  }

  updateCities(event: any) {
    if (!event) {
      this.stateSelected = this.location.states[1].iso2;
    } else {
      const selectElement = event.target as HTMLSelectElement;
      this.stateSelected = selectElement.value;
    }
    //handle cases when cities are updated from a change on city select / state select

    this.countriesService
      .getCities(this.countrySelected, this.stateSelected)
      .pipe(
        catchError((error) => {
          console.error('Error fetching cities:', error);
          return throwError(error);
        })
      )
      .subscribe((cities: City[]) => {
        this.location.cities = cities.sort((a, b) =>
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

    this.image.file = file;
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
