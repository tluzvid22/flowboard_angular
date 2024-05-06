import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { List, Task } from 'src/app/shared/types/workspaces';
import { TaskComponent } from '../task/task.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, TaskComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  @ViewChild('content') content: HTMLElement | any;
  @ViewChild('taskList') taskList: HTMLUListElement | any;
  @Input({ required: true }) list: List = {
    id: '0',
    name: 'h',
    tasks: [],
  };

  constructor() {}
}
