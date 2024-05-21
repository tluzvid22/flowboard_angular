import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, firstValueFrom, lastValueFrom, map } from 'rxjs';
import { CookieServiceService } from 'src/app/shared/services/cookieservice/cookieservice.service';
import { WorkspacesService } from 'src/app/shared/services/flowboard/workspaces/workspaces.service';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';
import { User } from 'src/app/shared/types/user';
import { Workspace } from 'src/app/shared/types/workspaces';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('profilePicture') profilePicture?: any;
  @ViewChild('username') username?: any;
  @ViewChild('title') title?: any;
  @ViewChild('navbar') navbar?: any;
  public isDarkModeOn: boolean = false;
  public isSidebarLeftVisible: boolean = true;
  public isSidebarRightVisible: boolean = true;
  public user?: User;
  public workspaces: Workspace[] = [];
  public isWorkspaceAbleToDelete: boolean = true;
  public initialized: Promise<void>;
  public isLogOutTabVisible: boolean = false;

  constructor(
    private router: Router,
    private userData: UserDataService,
    private workspaceService: WorkspacesService,
    private cookies: CookieServiceService
  ) {
    if (localStorage.getItem('dark_mode') === 'enabled')
      this.isDarkModeOn = true;

    if (localStorage.getItem('isSidebarLeftVisible') === 'disabled')
      this.isSidebarLeftVisible = false;

    if (localStorage.getItem('isSidebarRightVisible') === 'disabled')
      this.isSidebarRightVisible = false;

    this.initialized = this.init();
  }

  async init(): Promise<void> {
    await this.userData.whenInitialized();

    this.user = await firstValueFrom(this.userData.user$);
    this.workspaces = await firstValueFrom(this.userData.workspaces$);

    this.userData.user$.subscribe((user) => {
      this.user = user;
    });
    this.userData.workspaces$.subscribe((workspaces) => {
      this.workspaces = workspaces;
    });
  }

  handleNavSelect(event: any) {
    const elements = (
      this.navbar?.nativeElement as HTMLElement
    ).getElementsByClassName('navElement');

    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('nav_selected');
    }

    event.currentTarget.classList.add('nav_selected');
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initialized;
    (this.username.nativeElement as HTMLLabelElement).textContent =
      this.user!.username;

    this.changeTitleByActualRoute(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.changeTitleByActualRoute(event.url);
      });
  }

  public logout() {
    this.cookies.clearTokenFromTokenValue();
    this.router.navigate(['home']);
  }

  private changeTitleByActualRoute(routestr: string) {
    const route = routestr.split('/');
    const workspaceIdIndex: number = route.indexOf('workspace');
    const workspaceId = +route[workspaceIdIndex + 1];
    const title = this.title.nativeElement as HTMLLabelElement;

    if (route.indexOf('workspace') !== -1) {
      this.isWorkspaceAbleToDelete = true;
      title.textContent =
        this.workspaces.find((workspace) => workspace.id === workspaceId)
          ?.name ?? 'Workspace';
    } else if (route.indexOf('workspaces') !== -1) {
      this.isWorkspaceAbleToDelete = false;
      title.textContent = 'Workspaces';
    } else if (route.indexOf('overview') !== -1) {
      this.isWorkspaceAbleToDelete = false;
      title.textContent = 'Overview';
    } else if (route.indexOf('social') !== -1) {
      this.isWorkspaceAbleToDelete = false;
      title.textContent = 'Social';
    }
  }

  redirectToWorkspace(id: number) {
    const userIdIndexUrl =
      this.router.url.split('/').findIndex((string) => string === 'dashboard') +
      1;
    const dashboardUrl = this.router.url
      .split('/')
      .slice(0, userIdIndexUrl + 1)
      .join('/');
    this.router.navigate([`${dashboardUrl}/workspaces/workspace/${id}`]);
  }

  deleteWorkspace() {
    const route = this.router.url.split('/');
    const workspaceIdIndex: number = route.indexOf('workspace');
    const workspaceId = +route[workspaceIdIndex + 1];

    this.workspaceService
      .deleteWorkspaceById(
        workspaceId,
        this.user?.id as number,
        this.cookies.getLocalToken()
      )
      .subscribe(
        (response: boolean) => {
          if (!response) return;
          this.userData.pullWorkspaces();
          this.router.navigate([
            `${route.slice(0, workspaceIdIndex).join('/')}`,
          ]);
        },
        (error) => {}
      );
  }

  changeLightMode() {
    this.isDarkModeOn = !this.isDarkModeOn;
    localStorage.setItem(
      'dark_mode',
      this.isDarkModeOn ? 'enabled' : 'disabled'
    );
  }

  showSidebarLeft() {
    this.isSidebarLeftVisible = !this.isSidebarLeftVisible;
    localStorage.setItem(
      'isSidebarLeftVisible',
      this.isSidebarLeftVisible ? 'enabled' : 'disabled'
    );
  }

  showSidebarRight() {
    this.isSidebarRightVisible = !this.isSidebarRightVisible;
    localStorage.setItem(
      'isSidebarRightVisible',
      this.isSidebarRightVisible ? 'enabled' : 'disabled'
    );
  }
}
