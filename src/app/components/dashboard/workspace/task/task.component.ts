import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { List, Task } from 'src/app/shared/types/workspaces';
import { WorkspaceComponent } from '../workspace.component';

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

  constructor(private router: Router) {}

  public editTask() {
    this.router.navigate([`${this.router.url}/task/${this.task.id}/edit`]);
    WorkspaceComponent.setIsOverlayOn(true);
  }
}
