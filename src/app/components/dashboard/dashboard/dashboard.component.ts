import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DeleteConfirmationEventsService } from 'src/app/shared/services/delete-confirmation-events/delete-confirmation-events.service';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';
import { User } from 'src/app/shared/types/user';
import { Workspace } from 'src/app/shared/types/workspaces';

const FAVORITES_MAX_NUMBER = 3;

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
  @ViewChild('social') social?: any;
  public isDarkModeOn: boolean = false;
  public isSidebarLeftVisible: boolean = true;
  public isSidebarRightVisible: boolean = true;
  public user?: User;
  public workspaces: Workspace[] = [];
  public selectedItem: string = '';
  public isWorkspaceAbleToDelete: boolean = true;
  public isWorkspaceSelected: boolean = true;
  public initialized: Promise<void>;
  public isLogOutTabVisible: boolean = false;
  public favorites: { linkedTo: string; redirectTo: string }[] = [];
  public isElementSelectedInFavorites: boolean = false;
  public isSocialClicked: boolean = false;
  public selectedElement: { linkedTo: string; redirectTo: string } = {
    linkedTo: 'OVERVIEW',
    redirectTo: './overview',
  };
  private loginCookies?: string;

  constructor(
    public router: Router,
    private userData: UserDataService,
    private askConfirmation: DeleteConfirmationEventsService
  ) {
    if (localStorage.getItem('dark_mode') === 'enabled')
      this.isDarkModeOn = true;

    if (localStorage.getItem('isSidebarLeftVisible') === 'disabled')
      this.isSidebarLeftVisible = false;

    if (localStorage.getItem('isSidebarRightVisible') === 'disabled')
      this.isSidebarRightVisible = false;

    this.askConfirmation.sendAskConfirmation$.subscribe((response) => {
      if (response.typeof.toUpperCase() === 'WORKSPACE')
        this.router.navigate([`${this.router.url}/delete`]);
    });
    //open workspace delete confirmation

    this.askConfirmation.confirmation$.subscribe(
      (response: { confirmation: boolean; name?: string; typeof?: string }) => {
        if (
          !response.confirmation ||
          response.typeof?.toUpperCase() !== 'WORKSPACE'
        )
          return;
        const favorite = this.favorites.find(
          (favorite) =>
            favorite.linkedTo.toLowerCase() === response.name?.toLowerCase()
        );
        if (favorite) this.removeFromFavorites(favorite);
      }
    );
    this.initialized = this.init();
  }

  showSocialBubble(event: Event) {
    this.isSocialClicked = !this.isSocialClicked;
    const element = event.currentTarget as HTMLElement;
    const bounding = element.getBoundingClientRect();
    const position = { x: bounding.x, y: bounding.y };
    console.log(position);
    //relative to position
    const socialComponent = this.social as HTMLElement;
    socialComponent.style.left = `${position.x}`;
    socialComponent.style.top = `${position.y}`;
  }

  addToFavorites(favorite: { linkedTo: string; redirectTo: string }) {
    if (this.favorites.length >= FAVORITES_MAX_NUMBER) return;
    if (
      this.favorites.findIndex(
        (element) => element.redirectTo === favorite.redirectTo
      ) !== -1
    )
      return;
    this.favorites.push(favorite);
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
    this.isElementSelectedInFavorites = true;
    return true;
  }

  removeFromFavorites(favorite: { linkedTo: string; redirectTo: string }) {
    if (!favorite) return;
    const elementIndex = this.favorites.findIndex(
      (element) => element.redirectTo === favorite.redirectTo
    );
    if (elementIndex === -1) return;
    this.favorites = this.favorites.filter(
      (item) => item.linkedTo !== favorite.linkedTo
    );
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
    return true;
  }

  handleFavClick() {
    if (this.isElementSelectedInFavorites) {
      this.isElementSelectedInFavorites = !(
        this.removeFromFavorites(this.selectedElement) ?? true
      );
    } else {
      this.isElementSelectedInFavorites =
        this.addToFavorites(this.selectedElement) ?? false;
    }
  }

  askDeleteConfirmation() {
    const actualUrl = this.selectedElement.redirectTo.split('/');
    const deleteId = +actualUrl[actualUrl.indexOf('workspace') + 1];
    this.askConfirmation.setSendAskConfirmation({
      typeof: 'workspace',
      name: this.selectedElement.linkedTo,
      deleteId: deleteId,
    });
  }

  async init(): Promise<void> {
    await this.userData.whenInitialized();

    this.loginCookies = await firstValueFrom(this.userData.loginCookies$);
    this.user = await firstValueFrom(this.userData.user$);

    const workspaces = await firstValueFrom(this.userData.workspaces$);
    const collaboratingWorkspaces = await firstValueFrom(
      this.userData.collaboratingWorkspaces$
    );
    this.workspaces = [...workspaces, ...collaboratingWorkspaces];

    this.userData.loginCookies$.subscribe((cookies) => {
      this.loginCookies = cookies;
    });
    this.userData.user$.subscribe((user) => {
      this.user = user;
    });
  }

  changeWorkspaceTitle(): boolean {
    const route = this.router.url.split('/');
    const workspaceIdIndex: number = route.indexOf('workspace');
    const title = this.title.nativeElement as HTMLLabelElement;
    this.cleanSelected();
    //clean selected item from navbar

    if (workspaceIdIndex !== -1) {
      this.isWorkspaceAbleToDelete = false;
      const workspaceId = +route[workspaceIdIndex + 1];
      const workspaceName = this.workspaces.find(
        (workspace) => workspace.id == workspaceId
      )?.name;
      //search for name and id

      this.selectedItem = workspaceName ?? 'Workspace';

      const permissions = this.user?.collaborations?.find(
        (c) => c.workspaceId === workspaceId
      );
      if (!permissions || permissions!.isAdmin)
        this.isWorkspaceAbleToDelete = true;
      //gives delete possibility

      this.isWorkspaceSelected = true;

      title.textContent = this.selectedItem;
      return true;
      //change title if exists or default
    }
    return false;
  }

  private cleanSelected() {
    const elements = (
      this.navbar?.nativeElement as HTMLElement
    ).getElementsByClassName('navElement');

    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('nav_selected');
    }
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initialized;

    if (this.user?.username)
      (this.username.nativeElement as HTMLLabelElement).textContent =
        this.user.username;

    if (this.user?.image)
      (this.profilePicture.nativeElement as HTMLImageElement).src =
        this.user.image.contentUrl;

    this.userData.workspaces$.subscribe(async (workspaces) => {
      const collaboratingWorkspaces = await firstValueFrom(
        this.userData.collaboratingWorkspaces$
      );
      this.workspaces = [...workspaces, ...collaboratingWorkspaces];
      this.changeWorkspaceTitle();
    });
    this.userData.collaboratingWorkspaces$.subscribe(async (workspaces) => {
      const ownWorkspaces = await firstValueFrom(this.userData.workspaces$);
      this.workspaces = [...workspaces, ...ownWorkspaces];
      this.changeWorkspaceTitle();
    });

    const favorites = localStorage.getItem('favorites');
    if (favorites)
      (JSON.parse(favorites) as []).forEach((favorite) =>
        this.addToFavorites(favorite)
      );

    this.handleRouteChange(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.handleRouteChange(event.url);
      });
  }

  public logout() {
    this.userData.clearCookies();
    this.router.navigate(['home']);
  }

  private handleRouteChange(routestr: string) {
    const route = routestr.split('/');
    const title = this.title.nativeElement as HTMLLabelElement;

    if (!this.changeWorkspaceTitle() && route.indexOf('workspaces') !== -1) {
      this.isWorkspaceAbleToDelete = false;
      this.isWorkspaceSelected = false;
      title.textContent = 'Workspaces';
      this.selectedItem = 'Workspaces';
    } else if (route.indexOf('overview') !== -1) {
      this.isWorkspaceAbleToDelete = false;
      this.isWorkspaceSelected = false;
      title.textContent = 'Overview';
      this.selectedItem = 'Overview';
    } else if (route.indexOf('social') !== -1) {
      this.isWorkspaceAbleToDelete = false;
      this.isWorkspaceSelected = false;
      title.textContent = 'Social';
      this.selectedItem = 'Social';
    } else if (route.indexOf('myaccount') !== -1) {
      this.isWorkspaceAbleToDelete = false;
      this.isWorkspaceSelected = false;
      title.textContent = 'Mi cuenta';
      this.selectedItem = 'Mi cuenta';
    }

    Array.from(
      document.getElementsByClassName(
        this.selectedItem.replace(' ', '').toLowerCase()
      )
    ).forEach((element) => {
      element.classList.add('nav_selected');
    });

    this.selectedElement = {
      linkedTo: this.selectedItem,
      redirectTo: routestr,
    };
    this.isElementSelectedInFavorites =
      this.favorites.findIndex(
        (favorite) => favorite.linkedTo === this.selectedElement.linkedTo
      ) !== -1;
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

  redirectSocial() {
    this.router.navigateByUrl('dashboard/4/social', {
      skipLocationChange: true,
    });
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
