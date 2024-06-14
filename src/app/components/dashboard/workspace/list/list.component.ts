import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { List, Task } from 'src/app/shared/types/workspaces';
import { TaskComponent } from '../task/task.component';
import { WorkspacesService } from 'src/app/shared/services/flowboard/workspaces/workspaces.service';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { filter, firstValueFrom } from 'rxjs';
import { DeleteConfirmationEventsService } from 'src/app/shared/services/delete-confirmation-events/delete-confirmation-events.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, TaskComponent, CdkDropList, CdkDrag],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  @Input({ required: true }) connectedLists: string[] = [];
  @Input({ required: true }) permissions: {
    isAdmin: boolean;
    canDelete: boolean;
    canModify: boolean;
    canRead: boolean;
  } = { isAdmin: true, canDelete: true, canModify: true, canRead: true };
  @Input({ required: true }) list: List = {
    name: '',
    workspaceId: 1,
  };
  @ViewChild('preview') previewContainer!: ElementRef;
  public onFocus: boolean = false;
  public isAddTaskClicked: boolean = false;

  constructor(
    private router: Router,
    private workspacesAPI: WorkspacesService,
    private userDataService: UserDataService,
    private deleteConfirmation: DeleteConfirmationEventsService
  ) {
    this.deleteConfirmation.sendAskConfirmation$
      .pipe(
        filter(
          (response) =>
            response.typeof.toUpperCase() === 'LIST' &&
            response.deleteId === this.list.id
        )
      )
      .subscribe((response) => {
        this.router.navigate([
          `${this.router.url}/list/${this.list.id}/delete`,
        ]);
      });
    //send to confirmation delete
    this.deleteConfirmation.confirmation$
      .pipe(
        filter(
          (response) =>
            response.confirmation &&
            response.typeof === 'list' &&
            response.deleteId === this.list.id
        )
      )
      .subscribe((response) => {
        this.workspacesAPI
          .deleteListById(this.list.id!)
          .subscribe(async (response: boolean) => {
            if (!response) return;
            const workspace = await firstValueFrom(
              this.userDataService.selectedWorkspace$
            );
            workspace[0].lists = workspace[0].lists?.filter(
              (list) => list.id !== this.list.id
            );
            this.userDataService.setSelectedWorkspace(workspace[0]);
          });
      });
    //receive confirmation
  }

  ngOnInit(): void {
    this.workspacesAPI.getTasksByListId(this.list.id as number).subscribe(
      (response: Task[]) => {
        this.list.tasks = response;
      },
      (error) => {
        this.showError();
        console.log(error);
      }
    );
    //init tasks
  }

  debugHtml(value: string) {
    console.log(value);
  }

  drop(event: CdkDragDrop<Task[] | undefined>) {
    if (!this.permissions?.canModify) return;
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    const containerData = event.container.data;

    if (event.previousContainer === event.container) {
      moveItemInArray(containerData!, previousIndex, currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data!,
        containerData!,
        previousIndex,
        currentIndex
      );
    }

    const updatedTask = {
      ...containerData![currentIndex],
      listId: this.list.id!,
      order: currentIndex,
    };

    /*const response =*/
    firstValueFrom(this.workspacesAPI.putTask(updatedTask));
  }

  deleteList() {
    this.deleteConfirmation.setSendAskConfirmation({
      typeof: 'list',
      name: this.list.name,
      deleteId: this.list.id!,
    });
  }

  addTask(taskTitle: string) {
    this.workspacesAPI
      .postTask({
        id: 0,
        name: taskTitle,
        listId: this.list.id as number,
        files: [],
        dueDate: '',
      })
      .subscribe(
        (response: Task) => {
          this.list.tasks?.push(response);
          this.userDataService.pullWorkspaces();
        },
        (error) => {
          this.showError();
          console.log(error);
        }
      );
  }

  showError() {}
}
