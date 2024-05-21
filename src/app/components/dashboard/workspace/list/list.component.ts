import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { List, Task } from 'src/app/shared/types/workspaces';
import { TaskComponent } from '../task/task.component';
import { WorkspacesService } from 'src/app/shared/services/flowboard/workspaces/workspaces.service';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, TaskComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  @Input({ required: true }) list: List = {
    name: 'hola',
    workspaceId: 1,
  };
  public isAddTaskClicked: boolean = false;

  constructor(
    private workspacesAPI: WorkspacesService,
    private userDataService: UserDataService
  ) {}

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

  addTask(taskTitle: string) {
    this.workspacesAPI
      .postTask({
        id: 0,
        name: taskTitle,
        listId: this.list.id as number,
        files: [],
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
