import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWorkspaceComponent } from './editworkspace.component';

describe('EditworkspaceComponent', () => {
  let component: EditWorkspaceComponent;
  let fixture: ComponentFixture<EditWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditWorkspaceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
