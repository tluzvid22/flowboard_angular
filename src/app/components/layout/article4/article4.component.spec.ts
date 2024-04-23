import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Article4Component } from './article4.component';

describe('Article4Component', () => {
  let component: Article4Component;
  let fixture: ComponentFixture<Article4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Article4Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Article4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
