import { Component } from '@angular/core';
import { get4RandomQuestions } from 'src/constants/faqs';

@Component({
  selector: 'app-article4',
  templateUrl: './article4.component.html',
  styleUrl: './article4.component.scss',
})
export class Article4Component {
  public indexQuestion = 0;
  public randomQuestions = get4RandomQuestions();

  public handleClick(faqIndex: number) {
    const alreadySelected = faqIndex === this.indexQuestion;
    this.indexQuestion = alreadySelected ? -1 : faqIndex;
  }
}
