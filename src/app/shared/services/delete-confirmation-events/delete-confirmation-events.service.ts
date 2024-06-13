import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DeleteConfirmationEventsService {
  private sendAskConfirmation: BehaviorSubject<{
    typeof: string;
    name: string;
    deleteId: number;
  }> = new BehaviorSubject<{ typeof: string; name: string; deleteId: number }>({
    typeof: '',
    name: '',
    deleteId: -1,
  });
  public sendAskConfirmation$: Observable<{
    typeof: string;
    name: string;
    deleteId: number;
  }> = this.sendAskConfirmation!.asObservable();

  private confirmation: BehaviorSubject<{
    confirmation: boolean;
    typeof?: string;
    deleteId?: number;
    name?: string;
  }> = new BehaviorSubject<{
    confirmation: boolean;
    typeof?: string;
    deleteId?: number;
    name?: string;
  }>({ confirmation: false, typeof: '', deleteId: -1 });
  public confirmation$: Observable<{
    confirmation: boolean;
    typeof?: string;
    deleteId?: number;
    name?: string;
  }> = this.confirmation!.asObservable();

  constructor() {}

  setSendAskConfirmation(value: {
    typeof: string;
    name: string;
    deleteId: number;
  }) {
    this.sendAskConfirmation.next(value);
  }

  setConfirmation(value: {
    confirmation: boolean;
    typeof?: string;
    deleteId?: number;
    name?: string;
  }) {
    this.confirmation.next(value);
  }
}
