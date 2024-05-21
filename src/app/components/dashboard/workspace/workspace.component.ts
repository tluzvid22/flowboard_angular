import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { WorkspacesService } from 'src/app/shared/services/flowboard/workspaces/workspaces.service';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';
import { List, Workspace } from 'src/app/shared/types/workspaces';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit {
  public lists: List[] | any;
  public isAddListClicked: boolean = false;
  public workspace_id: number = 0;
  public static isOverlayOn: boolean;
  public isModalOpen: boolean = false;

  constructor(
    private workspacesAPI: WorkspacesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userData: UserDataService
  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.workspace_id = +params['id'];
      this.workspacesAPI.getListsByWorkspaceId(this.workspace_id).subscribe(
        (response: List[]) => {
          this.lists = response;
        },
        (error) => {
          const routerEndpoints = this.router.url.split('/');
          console.log(error);
        }
      );
      //init lists
    });
    //init workspace id

    router.events.subscribe((val) => {
      if (router.url.includes('edit')) {
        WorkspaceComponent.setIsOverlayOn(true);
      } else {
        WorkspaceComponent.setIsOverlayOn(false);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.userData.whenInitialized();

    const workspaceList: Workspace[] = await firstValueFrom(
      this.userData.workspaces$
    );

    if (
      workspaceList.findIndex((element) => (element.id = this.workspace_id)) ===
      -1
    ) {
      const actualUrl = this.router.url.split('/');
      const workspacesUrl = actualUrl.splice(0, actualUrl.length - 2).join('/');
      this.router.navigate([workspacesUrl]);
      return;
    }
  }

  openSettingsWorkspace() {
    this.isModalOpen = true;
  }
  closeSettings() {
    this.isModalOpen = false;
  }

  deleteWorkspace() {}

  public addList(listTitle: string) {
    this.workspacesAPI
      .postList({
        id: 0,
        name: listTitle,
        workspaceId: this.workspace_id,
      })
      .subscribe(
        (response: List) => {
          this.lists.push(response);
        },
        (error) => {
          this.showError();
          console.log(error);
        }
      );
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
