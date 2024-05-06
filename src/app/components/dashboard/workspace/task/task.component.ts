import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Task } from 'src/app/shared/types/workspaces';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss',
})
export class TaskComponent {
  @Input({ required: true }) public task: Task = {};
  public onFocus: boolean = false;

  constructor() {}

  public editTask() {
    console.log('testeditingtask');
  }
}
