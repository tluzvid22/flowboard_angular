import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Article3Component } from './article3.component';

describe('Article3Component', () => {
  let component: Article3Component;
  let fixture: ComponentFixture<Article3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Article3Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Article3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
