import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
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

  public form?: FormGroup;
  public user?: User;
  public beforeSavingUser?: User;
  public image?: Files;
  public location: { countries: Country[]; states: State[] } = {
    countries: [],
    states: [],
  };
  public countrySelected: BehaviorSubject<number> = new BehaviorSubject<number>(
    10
  );

  constructor(
    private countriesService: CountriesAPIService,
    private userData: UserDataService,
    private usersService: UsersService
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = await firstValueFrom(this.userData.user$);
    this.beforeSavingUser = JSON.parse(JSON.stringify(this.user));

    this.form = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        PasswordValidator(passwordLength),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        PasswordValidator(passwordLength),
      ]),

      email: new FormControl(
        this.user.email,
        [Validators.required, Validators.email],
        [EmailAsyncValidator(this.usersService)]
      ),
      username: new FormControl(
        this.user.username,
        [Validators.required],
        [UsernameAsyncValidator(this.usersService)]
      ),

      address: new FormControl(this.user.address, [Validators.required]),
      phone: new FormControl(
        this.user.phone,
        [Validators.required, Validators.pattern(phoneValidPattern)] //returns 'pattern' property validation error
      ),
      country: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
    });

    this.location.countries = await firstValueFrom(
      this.countriesService.getCountries()
    );
    this.countrySelected.next(
      this.location.countries.findIndex((c) => c.iso2 === this.user?.country)
    );
    this.countrySelected.subscribe(async (selectedCountry) => {
      this.location.states = await firstValueFrom(
        this.countriesService.getStates(
          this.location.countries[selectedCountry].iso2
        )
      );
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

  onCountryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.countrySelected.next(selectElement.selectedIndex);
  }

  showError() {}
}
