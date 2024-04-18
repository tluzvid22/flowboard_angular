import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Article2Component } from './article2.component';

describe('Article2Component', () => {
  let component: Article2Component;
  let fixture: ComponentFixture<Article2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Article2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Article2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
