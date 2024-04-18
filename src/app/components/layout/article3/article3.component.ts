import { Component } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CASES } from 'src/constants/cases';

@Component({
  selector: 'app-article3',
  templateUrl: './article3.component.html',
  styleUrl: './article3.component.scss',
  animations: [
    trigger('animacionHover', [
      state(
        'selected',
        style({
          opacity: '1',
          padding: '0.4rem 2.4rem 0.4rem 0.4rem',
          borderRadius: '20px',
        })
      ),
      state(
        'not_selected',
        style({
          opacity: '0.6',
          padding: '0.4rem',
          borderRadius: '20px',
        })
      ),
      transition('selected <=> not_selected', animate('200ms ease-in-out')),
    ]),
  ],
})
export class Article3Component {
  public indexCase: number = 0;
  public CASES = CASES;

  public claseSelected: string[] = this.calcClases();

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
    this.claseSelected = this.calcClases();
  }

  private calcClases(): string[] {
    let clases = new Array(CASES.length);
    for (let i = 0; i < CASES.length; i++) {
      clases[i] = 'not_selected';
      if (i === this.indexCase) {
        clases[i] = 'selected';
      }
    }
    return clases;
  }
}
