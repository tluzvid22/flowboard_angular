import { Component, OnInit, ViewChild } from '@angular/core';
import { WorkspacesService } from 'src/app/shared/services/flowboard/workspaces/workspaces.service';
import { Workspace } from 'src/app/shared/types/workspaces';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';
import { User } from 'src/app/shared/types/user';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.scss',
})
export class WorkspacesComponent implements OnInit {
  @ViewChild('modal') modalSettings: any;
  public user?: User;
  public workspaces?: Workspace[];
  public isAddWorkspaceClicked: boolean = false;
  public isModalOpen: boolean = false;

  constructor(
    private workspacesAPI: WorkspacesService,
    private router: Router,
    private userService: UserDataService
  ) {}

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });
    this.userService.workspaces$.subscribe((workspaces) => {
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
          this.userService.setWorkspaces(this.workspaces as Workspace[]);
          this.router.navigate([`${this.router.url}/workspace/${response.id}`]);
        },
        (error) => {
          this.showError();
          console.log(error);
        }
      );
  }

  public showError() {
    //ToDo: implement showError
  }
}
