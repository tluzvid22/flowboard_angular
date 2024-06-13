import { TestBed } from '@angular/core/testing';

import { DeleteConfirmationEventsService } from './delete-confirmation-events.service';

describe('DeleteConfirmationEventsService', () => {
  let service: DeleteConfirmationEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeleteConfirmationEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
