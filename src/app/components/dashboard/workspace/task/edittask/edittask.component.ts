import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task, Files } from 'src/app/shared/types/workspaces';
import { WorkspaceComponent } from '../../workspace.component';
import { CommonModule } from '@angular/common';
import { WorkspacesService } from 'src/app/shared/services/flowboard/workspaces/workspaces.service';

const maxImageSize = 25;
const validFormats: string[] = [
  '.docx',
  '.doc',
  '.pdf',
  '.csv',
  '.xml',
  '.jpg',
  '.jpeg',
  '.png',
  '.pptx',
  '.ppt',
  '.pdf',
];
@Component({
  selector: 'app-edittask',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edittask.component.html',
  styleUrl: './edittask.component.scss',
})
export class EdittaskComponent implements OnInit {
  @Input({ required: true }) task: Task = {
    id: 0,
    name: 'task',
    listId: 0,
    files: [],
  };
  @ViewChild('taskDescription') public descriptionInput: any;
  @ViewChild('taskTitle') public titleInput: any;
  public editedTask: Task = this.task;
  public isDescriptionClicked: boolean = false;
  public isHeaderClicked: boolean = false;
  public todayDate: string;

  constructor(
    private router: Router,
    private workspacesAPI: WorkspacesService,
    private activatedRoute: ActivatedRoute
  ) {
    this.task.id = +this.activatedRoute.snapshot.params['id'];
    this.todayDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.workspacesAPI.getTaskByTaskId(this.task.id).subscribe(
      (response: Task) => {
        this.task = { ...response, files: this.task.files };
        this.editedTask = this.task;
      },
      (error) => {
        this.showError();
        console.log(error);
      }
    );
    this.workspacesAPI.getFilesByTaskId(this.task.id).subscribe(
      (response: Files[]) => {
        this.task.files = response;
        this.editedTask.files = this.task.files;
      },
      (error) => {
        this.showError();
        console.log(error);
      }
    );
  }

  openFile(file: Files) {
    window.open(file.contentUrl, '_blank');
  }

  handleImageChange(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files![0];
    const extensionIndex = file.name.lastIndexOf('.');
    const name = file.name.substring(0, extensionIndex);
    const fileType = file.name.substring(extensionIndex);

    const fileSize = file.size / 1024 / 1024;

    if (
      !file ||
      fileSize > maxImageSize ||
      validFormats.indexOf(fileType) === -1
    ) {
      this.showError();
      return;
    }
    //restrict not valid images

    this.workspacesAPI
      .postFile({ name: name, fileType: fileType, data: file })
      .subscribe(
        (response: Files) => {
          this.workspacesAPI
            .updateTaskIdOnFile(response.id as number, this.task.id)
            .subscribe(
              (response: Files) => {
                this.task.files.push(response);
                this.editedTask.files = this.task.files;
              },
              (error) => {
                this.showError();
                console.log(error);
              }
            );
        },
        (error) => {
          this.showError();
          console.log(error);
        }
      );
  }

  saveData() {}

  showError() {}

  leaveEditTask(saveData: boolean) {
    const actualUrl = this.router.url;

    const endpoints: string[] = actualUrl.split('/');

    const workspaceUrl = endpoints.slice(0, 6).join('/');
    this.router.navigate([workspaceUrl]);
  }

  handleInputChange() {
    const value = this.titleInput.nativeElement.value;
    this.isHeaderClicked = false;
    this.editedTask.name = value;
  }

  handleDescriptionChange() {
    const value = this.descriptionInput.nativeElement.value;
    this.isDescriptionClicked = false;
    this.editedTask.description = value;
  }

  async enterEditDescriptionMode() {
    this.isDescriptionClicked = true;
    await this.delay(100);
    this.descriptionInput.nativeElement.focus();
  }

  async enterEditNameMode() {
    this.isHeaderClicked = true;
    await this.delay(100);
    this.titleInput.nativeElement.focus();
  }

  debugHTML(string: any) {
    console.log(string);
  }

  getValidFormats() {
    return validFormats;
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
