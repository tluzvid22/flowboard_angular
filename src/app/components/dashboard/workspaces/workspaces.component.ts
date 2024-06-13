import { Component, OnInit, ViewChild } from '@angular/core';
import { WorkspacesService } from 'src/app/shared/services/flowboard/workspaces/workspaces.service';
import { Workspace } from 'src/app/shared/types/workspaces';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';
import { User } from 'src/app/shared/types/user';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.scss',
})
export class WorkspacesComponent implements OnInit {
  public user?: User;
  public workspaces?: Workspace[];
  public isAddWorkspaceClicked: boolean = false;
  public static isOverlayOn: boolean = false;
  public isModalOpen: boolean = false;

  constructor(
    private workspacesAPI: WorkspacesService,
    private router: Router,
    private userData: UserDataService,
    public activatedRoute: ActivatedRoute
  ) {
    router.events.subscribe((val) => {
      if (router.url.includes('edit') || router.url.includes('delete')) {
        WorkspacesComponent.setIsOverlayOn(true);
      } else {
        WorkspacesComponent.setIsOverlayOn(false);
      }
    });
    //overlay
  }

  async ngOnInit(): Promise<void> {
    await this.userData.whenInitialized();

    this.user = await firstValueFrom(this.userData.user$);
    this.workspaces = await firstValueFrom(this.userData.workspaces$);

    this.userData.user$.subscribe((user) => {
      this.user = user;
    });
    this.userData.workspaces$.subscribe((workspaces: Workspace[]) => {
      this.workspaces = workspaces;
    });
  }

  addWorkspace(workspaceTitle: string) {
    if (!workspaceTitle) return;

    this.workspacesAPI
      .postWorkspace({
        name: workspaceTitle,
        userId: this.user?.id as number,
      })
      .subscribe(
        (response: Workspace) => {
          this.workspaces?.push(response);
          this.userData.setWorkspaces(this.workspaces as Workspace[]);
          this.router.navigate([`${this.router.url}/workspace/${response.id}`]);
        },
        (error) => {
          this.showError();
          console.log(error);
        }
      );
  }

  public getIsOverlayOn() {
    return WorkspacesComponent.isOverlayOn;
  }

  public static setIsOverlayOn(isOverlayOn: boolean) {
    WorkspacesComponent.isOverlayOn = isOverlayOn;
  }

  public showError() {
    //ToDo: implement showError
  }
}
