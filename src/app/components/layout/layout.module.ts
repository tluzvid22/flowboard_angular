import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { Article1Component } from './article1/article1.component';
import { Article2Component } from './article2/article2.component';
import { Article3Component } from './article3/article3.component';

@NgModule({
  declarations: [
    HeaderComponent,
    Article1Component,
    Article2Component,
    Article3Component,
  ],
  imports: [CommonModule],
  exports: [
    HeaderComponent,
    Article1Component,
    Article2Component,
    Article3Component,
  ],
})
export class LayoutModule {}
