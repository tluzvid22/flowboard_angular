import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CountriesAPIService } from 'src/app/shared/services/countries/countries.service';
import { UsersService } from 'src/app/shared/services/flowboard/users/users.service';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';
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
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrl: './myaccount.component.scss',
})
export class MyAccountComponent implements OnInit {
  @ViewChild('imageInput') imageInput: any;
  @ViewChild('avatar') avatar: any;

  public signUpForm?: FormGroup;
  private data?: User;
  public image?: Files;
  public location: { countries: Country[]; states: State[] } = {
    countries: [],
    states: [],
  };
  public countrySelected: string = 'AF';
  public stateSelected: string = 'BDS';

  constructor(
    private formBuilder: FormBuilder,
    private countriesService: CountriesAPIService,
    private userData: UserDataService,
    private usersService: UsersService
  ) {}

  async ngOnInit(): Promise<void> {
    this.data = await firstValueFrom(this.userData.user$);

    this.signUpForm = this.formBuilder.group({
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
      username: [
        this.data.username,
        [Validators.required],
        [UsernameAsyncValidator(this.usersService)],
      ],
      address: [this.data.address, [Validators.required]],
      phone: [
        this.data.phone,
        [Validators.required, Validators.pattern(phoneValidPattern)], //returns 'pattern' property validation error
      ],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
    });
  }

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

  updateCountry(event: any): string {
    const selectElement = event.target as HTMLSelectElement;
    this.countrySelected = selectElement.value;
    return this.countrySelected;
  }

  updateStates() {
    this.countriesService.getStates(this.countrySelected).subscribe(
      (states: State[]) => {
        this.location.states = states.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      },
      (error) => {
        console.error('Error fetching states: ', error);
      }
    );
  }
  //countriesAPI

  showError() {}
}
