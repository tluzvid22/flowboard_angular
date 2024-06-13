import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from 'src/app/shared/types/workspaces';
import { WorkspaceComponent } from '../workspace.component';
import { WorkspacesService } from 'src/app/shared/services/flowboard/workspaces/workspaces.service';
import { filter } from 'rxjs';
import { DeleteConfirmationEventsService } from 'src/app/shared/services/delete-confirmation-events/delete-confirmation-events.service';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss',
})
export class TaskComponent {
  @Input({ required: true }) public task: Task = {
    id: 0,
    name: 'task',
    listId: 1,
    files: [],
  };
  public onFocus: boolean = false;
  public deletedTask: boolean = false;

  constructor(
    private router: Router,
    private workspacesAPI: WorkspacesService,
    private deleteConfirmation: DeleteConfirmationEventsService
  ) {
    this.deleteConfirmation.sendAskConfirmation$
      .pipe(
        filter(
          (response) =>
            response.typeof.toUpperCase() === 'TASK' &&
            response.deleteId === this.task.id
        )
      )
      .subscribe((response) => {
        this.router.navigate([
          `${this.router.url}/task/${this.task.id}/delete`,
        ]);
      });
    //send to confirmation delete
    this.deleteConfirmation.confirmation$
      .pipe(
        filter(
          (response) =>
            response.confirmation &&
            response.typeof === 'task' &&
            response.deleteId === this.task.id
        )
      )
      .subscribe((response) => {
        this.workspacesAPI
          .deleteTaskById(this.task.id)
          .subscribe((response: boolean) => {
            this.deletedTask = response;
          });
      });
    //receive confirmation
  }

  editTask() {
    this.router.navigate([`${this.router.url}/task/${this.task.id}/edit`]);
    WorkspaceComponent.setIsOverlayOn(true);
  }

  deleteTask() {
    this.deleteConfirmation.setSendAskConfirmation({
      typeof: 'task',
      name: this.task.name,
      deleteId: this.task.id,
    });
  }
}
