import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-article5',
  templateUrl: './article5.component.html',
  styleUrl: './article5.component.scss',
})
export class Article5Component {
  public contactForm: FormGroup;
  public formStep: number = 0;
  public textAreaCharacters: number = 0;

  constructor(private formBuilder: FormBuilder) {
    this.contactForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      message: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(150),
        ],
      ],
    });
  }

  public nextStep() {
    if (this.formStep === 0) {
      if (
        this.contactForm.get('email')!.errors ||
        this.contactForm.get('username')!.errors
      ) {
        this.contactForm.get('username')?.markAsTouched();
        this.contactForm.get('email')?.markAsTouched();
        return;
      }
      //validation

      this.formStep++;
      //show next form step by increasing index (*ngIf)
    }
  }

  public handleSubmit() {
    if (this.contactForm.get('message')!.errors) {
      this.contactForm.get('message')?.markAsTouched();
      return;
    }
    //validation

    this.formStep++;
    //show next form step by increasing index (*ngIf)

    //ToDo: Send ContactForm request
  }

  public resetForm() {
    this.formStep = 0;
    this.contactForm.setErrors(null);

    this.contactForm.reset();
  }

  public handleTextAreaChange(event: any) {
    this.textAreaCharacters = event.target?.value.length;
  }
}
