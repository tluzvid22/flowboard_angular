import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DeleteConfirmationEventsService } from 'src/app/shared/services/delete-confirmation-events/delete-confirmation-events.service';
import { WorkspacesService } from 'src/app/shared/services/flowboard/workspaces/workspaces.service';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';
import { List, Workspace } from 'src/app/shared/types/workspaces';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Collaborator, User } from 'src/app/shared/types/user';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit {
  public workspace?: Workspace;
  public user?: User;
  public isAddListClicked: boolean = false;
  public static isOverlayOn: boolean;
  public permissions: {
    isAdmin: boolean;
    canDelete: boolean;
    canModify: boolean;
    canRead: boolean;
  } = { isAdmin: true, canDelete: true, canModify: true, canRead: true };
  private loginCookies?: string;
  @ViewChild('preview') previewContainer!: ElementRef;

  constructor(
    private workspacesAPI: WorkspacesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userData: UserDataService,
    private askConfirmation: DeleteConfirmationEventsService
  ) {
    router.events.subscribe((val) => {
      if (router.url.includes('edit') || router.url.includes('delete')) {
        WorkspaceComponent.setIsOverlayOn(true);
      } else {
        WorkspaceComponent.setIsOverlayOn(false);
      }
    });
    //overlay

    this.askConfirmation.confirmation$.subscribe(
      (response: {
        confirmation: boolean;
        deleteId?: number;
        typeof?: string;
      }) => {
        if (
          !response.confirmation ||
          response.deleteId !== this.workspace?.id ||
          response.typeof?.toUpperCase() !== 'WORKSPACE'
        )
          return;
        this.deleteWorkspace();
        this.askConfirmation.setConfirmation({ confirmation: false });
      }
    );
    //workspace delete handle

    this.userData.selectedWorkspace$.subscribe((response: Workspace[]) => {
      this.workspace = response[0];
      this.getPermissions();
    });
    //getworkspace

    this.userData.user$.subscribe((user) => {
      this.user = user;
      this.getPermissions();
    });
  }

  getPermissions() {
    this.permissions = {
      isAdmin: true,
      canDelete: true,
      canModify: true,
      canRead: true,
    };
    const collaboration = this.user?.collaborations?.find(
      (c) => c.workspaceId === this.workspace?.id
    );
    if (collaboration)
      this.permissions = {
        isAdmin: collaboration.isAdmin ?? false,
        canDelete: collaboration.canDelete ?? false,
        canModify: collaboration.canModify ?? false,
        canRead: collaboration.canRead ?? false,
      };
    this.userData.setPermissionsOnSelectedWorkspace(this.permissions);
  }

  async ngOnInit(): Promise<void> {
    await this.userData.whenInitialized();
    this.activatedRoute.params.subscribe((params) => {
      const newId = params['id'];
      if (newId) this.userData.setSelectedWorkspaceByWorkspaces(newId);
    });
    //to reload component when route changed to other workspace

    this.loginCookies = await firstValueFrom(this.userData.loginCookies$);

    this.workspace = (
      await firstValueFrom(this.userData.selectedWorkspace$)
    )[0];
    this.user = await firstValueFrom(this.userData.user$);

    if (!this.workspace) {
      const actualUrl = this.router.url.split('/');
      const workspacesUrl = actualUrl.splice(0, actualUrl.length - 2).join('/');
      this.router.navigate([workspacesUrl]);
      return;
    }

    this.workspace!.lists! =
      this.workspace!.lists!.sort((a, b) => a.order! - b.order!)! ??
      this.workspace?.lists!;

    this.userData.loginCookies$.subscribe((cookies) => {
      this.loginCookies = cookies;
    });
    //cookies
  }

  deleteWorkspace() {
    this.workspacesAPI
      .deleteWorkspaceById(
        +this.workspace?.id!,
        +this.workspace?.userId!,
        this.loginCookies!
      )
      .subscribe(
        (response: boolean) => {
          if (!response) return;
          this.userData.pullWorkspaces();
          const actualUrl = this.router.url.split('/');
          const workspacesUrl = actualUrl.indexOf('workspaces');
          this.router.navigate([
            actualUrl.splice(0, workspacesUrl + 1).join('/'),
          ]);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getConnectedLists(actualListId: number): string[] {
    return this.workspace!.lists!.map((i: List) =>
      String('LIST' + i.id)
    ).filter((j: string) => j !== String('LIST' + actualListId));
  }

  public addList(listTitle: string) {
    this.workspacesAPI
      .postList({
        id: 0,
        name: listTitle,
        workspaceId: this.workspace!.id!,
      })
      .subscribe(
        (response: List) => {
          this.workspace?.lists!.push(response);
        },
        (error) => {
          this.showError();
          console.log(error);
        }
      );
  }

  drop(event: CdkDragDrop<List[]>) {
    if (!this.permissions?.canModify) return;
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    const containerData = event.container.data;

    moveItemInArray(containerData!, previousIndex, currentIndex);

    const updatedList = {
      ...containerData![currentIndex],
      order: currentIndex,
    };

    /*const response =*/
    this.workspacesAPI.putList(updatedList).subscribe();
  }

  public getIsOverlayOn() {
    return WorkspaceComponent.isOverlayOn;
  }

  public static setIsOverlayOn(isOverlayOn: boolean) {
    WorkspaceComponent.isOverlayOn = isOverlayOn;
  }

  public showError() {
    //ToDo: implement showError
  }
}
