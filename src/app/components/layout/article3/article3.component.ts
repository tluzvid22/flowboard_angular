import { Component } from '@angular/core';
import { CASES } from 'src/constants/cases';

@Component({
  selector: 'app-article3',
  templateUrl: './article3.component.html',
  styleUrl: './article3.component.scss',
})
export class Article3Component {
  public indexCase: number = 0;
  public CASES = CASES;

  handleClick(event: any) {
    let newIndex = event.target.getAttribute('data-key');
    const lastIndex = this.indexCase;

    if (newIndex === 'back') {
      newIndex = lastIndex - 1;
      if (newIndex < 0) {
        newIndex = 4;
      }
    } else if (newIndex === 'next') {
      newIndex = lastIndex + 1;
      if (newIndex > CASES.length - 1) {
        newIndex = 0;
      }
    }
    this.indexCase = +newIndex;
  }
}
