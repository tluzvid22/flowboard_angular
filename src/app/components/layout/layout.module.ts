import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { Article1Component } from './article1/article1.component';
import { Article2Component } from './article2/article2.component';
import { Article3Component } from './article3/article3.component';
import { Article4Component } from './article4/article4.component';
import { Article5Component } from './article5/article5.component';
import { FooterComponent } from './footer/footer.component';
import { LayoutComponent } from './layout.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    Article1Component,
    Article2Component,
    Article3Component,
    Article4Component,
    Article5Component,
    FooterComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule],
  bootstrap: [LayoutComponent],
})
export class LayoutModule {}
