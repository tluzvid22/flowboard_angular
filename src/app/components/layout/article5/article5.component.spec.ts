import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Article5Component } from './article5.component';

describe('Article5Component', () => {
  let component: Article5Component;
  let fixture: ComponentFixture<Article5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Article5Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Article5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
