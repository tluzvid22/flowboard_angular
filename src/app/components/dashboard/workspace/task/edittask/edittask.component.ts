import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task, Files, Workspace } from 'src/app/shared/types/workspaces';
import { WorkspaceComponent } from '../../workspace.component';
import { CommonModule } from '@angular/common';
import { WorkspacesService } from 'src/app/shared/services/flowboard/workspaces/workspaces.service';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Collaborator, User, UserTask } from 'src/app/shared/types/user';
import { FormsModule, NgModel } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './edittask.component.html',
  styleUrl: './edittask.component.scss',
})
export class EdittaskComponent implements OnInit, OnDestroy {
  public task: Task = {
    id: 0,
    name: 'task',
    listId: 0,
    files: [],
    dueDate: '',
  };
  @ViewChild('taskDescription') public descriptionInput: any;
  @ViewChild('taskTitle') public titleInput: any;
  @ViewChild('content') content?: ElementRef;
  @ViewChild('selectInput') selectInput?: ElementRef;
  @ViewChild('selectMenu') selectMenu?: ElementRef;
  public editedTask: Task = this.task;
  public user?: User;
  public workspace?: Workspace;
  public isDescriptionClicked: boolean = false;
  public isHeaderClicked: boolean = false;
  public isInputShowed: boolean = false;
  public assignedUsers: UserTask[] = [];
  public searchSelectTerms: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  public filteredPotentialUsers: Collaborator[] = [];
  public potentialUsers: BehaviorSubject<Collaborator[]> = new BehaviorSubject<
    Collaborator[]
  >([]);
  public todayDate: string;
  public permissions: {
    isAdmin: boolean;
    canDelete: boolean;
    canModify: boolean;
    canRead: boolean;
  } = { isAdmin: true, canDelete: true, canModify: true, canRead: true };

  constructor(
    private router: Router,
    private workspacesAPI: WorkspacesService,
    private activatedRoute: ActivatedRoute,
    private userData: UserDataService
  ) {
    this.task.id = +this.activatedRoute.snapshot.params['id'];
    this.todayDate = new Date().toISOString().split('T')[0];
    this.userData.permissionsOnSelectedWorkspace$.subscribe((psw) => {
      this.permissions = psw;
    });

    this.potentialUsers.subscribe((users) => {
      this.filteredPotentialUsers = users.sort(
        (a: Collaborator, b: Collaborator) =>
          a.user.username.localeCompare(b.user.username)
      );
    });

    this.searchSelectTerms.subscribe((terms) => {
      const potentialUsersValue = this.potentialUsers.value;
      this.filteredPotentialUsers = potentialUsersValue.filter((c) => {
        const commonUsername = c.user.username.toLowerCase().replaceAll('', '');
        const commonTerms = terms.toLowerCase().replaceAll('', '');
        return commonUsername.includes(commonTerms);
      });
    });
  }

  async ngOnInit(): Promise<void> {
    await this.userData.whenInitialized();
    this.workspacesAPI.getTaskByTaskId(this.task.id).subscribe(
      (response: Task) => {
        this.task = { ...response, files: this.task.files };
        this.task.dueDate = new Date(this.task.dueDate)
          .toISOString()
          .slice(0, 10);
        this.editedTask = this.task;
      },
      (error) => {
        this.showError();
        console.log(error);
      }
    );

    this.workspace = (
      await firstValueFrom(this.userData.selectedWorkspace$)
    )[0];
    this.user = await firstValueFrom(this.userData.user$);

    this.userData.selectedWorkspace$.subscribe((w) => {
      this.workspace = w[0];
    });
    this.userData.user$.subscribe((u) => {
      this.user = u;
    });
    const loginCookies = await firstValueFrom(this.userData.loginCookies$);

    this.assignedUsers = await firstValueFrom(
      this.workspacesAPI.getUserTaskByTaskId(this.task.id)
    );

    const workspaceCollaborators = await firstValueFrom(
      this.workspacesAPI.getCollaboratorsByWorkspaceAndUserId(
        this.workspace.id!,
        this.user.id!,
        loginCookies
      )
    );
    this.potentialUsers.next(
      workspaceCollaborators.filter(
        (wc) => !this.assignedUsers.find((au) => au.userId === wc.userId)
      )
    );

    this.permissions = await firstValueFrom(
      await this.userData.permissionsOnSelectedWorkspace$
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

    window.addEventListener('resize', this.onWindowChange.bind(this));
    this.content?.nativeElement.addEventListener(
      'scroll',
      this.onWindowChange.bind(this)
    );
    //select window change
  }

  updateTask() {
    this.workspacesAPI.putTask(this.editedTask).subscribe(
      (response) => {
        if (!response) return;
        this.userData.setSelectedWorkspace(this.workspace!);
        this.task = this.editedTask;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowChange.bind(this));
    this.content?.nativeElement.removeEventListener(
      'scroll',
      this.onWindowChange.bind(this)
    );
  }

  onWindowChange() {
    this.updateMenuPosition();
  }

  updateMenuPosition() {
    const selectMenu = this.selectMenu?.nativeElement;
    if (!selectMenu) return;
    const btnRect = selectMenu
      .querySelector('.select-btn')
      .getBoundingClientRect();
    const options = selectMenu.querySelector('.options');

    options.style.top = `${btnRect.bottom}px`;
    options.style.left = `${btnRect.left}px`;
    options.style.width = `${btnRect.width}px`;
  }

  deleteUserTask(userTask: UserTask) {
    this.workspacesAPI
      .deleteUserTask(userTask.userId, this.task.id!)
      .subscribe((response: boolean) => {
        if (!response) return;
        const potentialUsersValue = this.potentialUsers.value;
        const assignedUserMatch = this.assignedUsers.find(
          (pu) => pu.userId === userTask.userId
        )!;
        this.assignedUsers = this.assignedUsers.filter(
          (au) => au.userId !== userTask.userId
        );
        this.potentialUsers.next([...potentialUsersValue, assignedUserMatch]);
      });
    this.onWindowChange();
  }

  addUserTask(userTask: Collaborator) {
    this.workspacesAPI
      .postUserTask({
        userId: userTask.userId,
        taskId: this.task.id!,
        user: null!,
        task: null!,
      })
      .subscribe((addedUserTask: UserTask) => {
        const potentialUsersValue = this.potentialUsers.value;
        const potentialCollaboratorMatch = potentialUsersValue.find(
          (pu) => pu.userId === addedUserTask.userId
        )!;
        this.potentialUsers.next(
          potentialUsersValue.filter(
            (pu) => pu.userId !== potentialCollaboratorMatch.userId
          )
        );
        this.assignedUsers.push({
          ...addedUserTask,
          ...potentialCollaboratorMatch,
        });
        this.updateMenuPosition();
      });
  }

  handleMenuClick() {
    this.selectInput?.nativeElement.focus();
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

  searchOnSelect(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    this.searchSelectTerms.next(inputValue);
  }

  handleSelectBtnClick() {
    this.selectMenu?.nativeElement.classList.toggle('active');
    this.updateMenuPosition();
    this.isInputShowed = !this.isInputShowed;
    this.selectInput?.nativeElement.focus();
  }

  saveData() {}

  showError() {}

  leaveEditTask(saveData: boolean) {
    const actualUrl = this.router.url;

    const endpoints: string[] = actualUrl.split('/');

    const workspaceUrl = endpoints.slice(0, 6).join('/');
    this.router.navigate([workspaceUrl]);
    if (saveData) this.updateTask();
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
    if (!this.permissions.canModify) return;
    this.isDescriptionClicked = true;
    await this.delay(100);
    this.descriptionInput.nativeElement.focus();
  }

  async enterEditNameMode() {
    if (!this.permissions.canModify) return;
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
