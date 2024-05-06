import { Component } from '@angular/core';
import { List } from 'src/app/shared/types/workspaces';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  public lists: List[] = [
    {
      id: '0',
      name: 'List1',
      tasks: [
        { name: 'hola' },
        { name: 'adios' },
        { name: 'como estas?' },
        { name: 'hola' },
        { name: 'adios' },
        { name: 'como estas?' },
        { name: 'hola' },
        { name: 'adios' },
        { name: 'como estas?' },
        { name: 'hola' },
        { name: 'adios' },
        { name: 'como estas?' },
        { name: 'hola' },
        { name: 'adios' },
        { name: 'como estas?' },
        { name: 'hola' },
        { name: 'adios' },
        { name: 'como estas?' },
        { name: 'hola' },
        { name: 'adios' },
        { name: 'como estas?' },
        { name: 'hola' },
        { name: 'adios' },
        { name: 'como estas?' },
        { name: 'hola' },
        { name: 'adios' },
        { name: 'como estas?' },
        { name: 'hola' },
        { name: 'adios' },
        { name: 'como estas?' },
        { name: 'hola' },
        { name: 'adios' },
        { name: 'como estas?' },
        { name: 'hola' },
        { name: 'adios' },
        { name: 'como estas?' },
      ],
    },
    {
      id: '0',
      name: 'List2',
      tasks: [],
    },
    {
      id: '0',
      name: 'List3',
      tasks: [],
    },
  ];
  public isAddListClicked: boolean = false;

  public addList() {}

  constructor() {}
}
