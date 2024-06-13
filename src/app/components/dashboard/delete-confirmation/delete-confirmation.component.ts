import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceComponent } from '../workspace/workspace.component';
import { DeleteConfirmationEventsService } from 'src/app/shared/services/delete-confirmation-events/delete-confirmation-events.service';

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [],
  templateUrl: './delete-confirmation.component.html',
  styleUrl: './delete-confirmation.component.scss',
})
export class DeleteConfirmationComponent {
  public componentToDeleteName: string = '';
  public componentToDelete: string = '';
  public deleteId: number = -1;

  constructor(
    private router: Router,
    private sendConfirmation: DeleteConfirmationEventsService
  ) {
    this.sendConfirmation.sendAskConfirmation$.subscribe(
      (response: { typeof: string; name: string; deleteId: number }) => {
        this.componentToDelete = response.typeof;
        this.componentToDeleteName = response.name;
        this.deleteId = response.deleteId;
        if (response.typeof === '' || response.name === '')
          this.leaveConfirmation();
      }
    );
  }

  deleteComponent() {
    this.sendConfirmation.setConfirmation({
      confirmation: true,
      deleteId: this.deleteId,
      typeof: this.componentToDelete,
      name: this.componentToDeleteName,
    });
    this.leaveConfirmation();
  }

  leaveConfirmation() {
    const actualUrl = this.router.url;

    const endpoints: string[] = actualUrl.split('/');

    const workspaceUrl = endpoints.slice(0, 6).join('/');
    this.router.navigate([workspaceUrl]);
  }
}
