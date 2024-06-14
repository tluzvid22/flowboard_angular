import { Workspace } from '../../types/workspaces';
import { User } from '../../types/user';
import { WorkspacesService } from '../flowboard/workspaces/workspaces.service';
import { Injectable } from '@angular/core';
import { CookieServiceService } from '../cookieservice/cookieservice.service';
import {
  BehaviorSubject,
  Observable,
  firstValueFrom,
  lastValueFrom,
} from 'rxjs';
import { UsersService } from '../flowboard/users/users.service';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private workspaces: BehaviorSubject<Workspace[]> = new BehaviorSubject<
    Workspace[]
  >([]);
  public workspaces$: Observable<Workspace[]> = this.workspaces.asObservable();

  private collaboratingWorkspaces: BehaviorSubject<Workspace[]> =
    new BehaviorSubject<Workspace[]>([]);
  public collaboratingWorkspaces$: Observable<Workspace[]> =
    this.collaboratingWorkspaces.asObservable();

  private user: BehaviorSubject<User> = new BehaviorSubject<User | any>('');
  public user$: Observable<User> = this.user!.asObservable();
  private loginCookies: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );
  public loginCookies$: Observable<string> = this.loginCookies!.asObservable();
  public initialized: Promise<void>;

  private selectedWorkspace: BehaviorSubject<Workspace[]> = new BehaviorSubject<
    Workspace[]
  >([]);
  public selectedWorkspace$: Observable<Workspace[]> =
    this.selectedWorkspace!.asObservable();

  private permissionsOnSelectedWorkspace: BehaviorSubject<{
    isAdmin: boolean;
    canDelete: boolean;
    canModify: boolean;
    canRead: boolean;
  }> = new BehaviorSubject<{
    isAdmin: boolean;
    canDelete: boolean;
    canModify: boolean;
    canRead: boolean;
  }>({ isAdmin: true, canDelete: true, canModify: true, canRead: true });
  public permissionsOnSelectedWorkspace$: Observable<{
    isAdmin: boolean;
    canDelete: boolean;
    canModify: boolean;
    canRead: boolean;
  }> = this.permissionsOnSelectedWorkspace!.asObservable();

  constructor(
    private workspacesAPI: WorkspacesService,
    private cookies: CookieServiceService,
    private userAPI: UsersService
  ) {
    this.initialized = this.init();
  }

  async init(): Promise<void> {
    this.loginCookies.next(this.cookies.getLocalToken());
    const user = (
      await firstValueFrom(this.userAPI.getUserByToken(this.loginCookies.value))
    )[0];
    this.setUser(user);
    await this.pullCollaboratingWorkspaces(user);
    this.user$.subscribe(async (updatedUser: User) => {
      if (updatedUser) {
        this.setWorkspaces(updatedUser.workspaces!);
        this.pullCollaboratingWorkspaces(updatedUser);
      }
    });
  }

  async pullCollaboratingWorkspaces(user: User) {
    if (!user.id) return;
    const collaboratingWorkspaces = await firstValueFrom(
      this.workspacesAPI.getCollaboratingWorkspacesByUserIdAndToken(
        user.id,
        this.loginCookies.value
      )
    );
    collaboratingWorkspaces.forEach((cw) => {
      cw.collaborating = true;
    });
    this.collaboratingWorkspaces.next(collaboratingWorkspaces);
  }

  async pullWorkspaces() {
    await lastValueFrom(
      this.workspacesAPI.getWorkspacesByUserId(
        this.user?.getValue().id as number,
        this.cookies.getLocalToken()
      )
    ).then(
      (response: Workspace[]) => {
        this.setWorkspaces(
          response.sort(
            (a, b) =>
              new Date(b.updatedAt!).getTime() -
              new Date(a.updatedAt!).getTime()
          )
        );
      },
      (error) => {
        console.log(error);
      }
    );
    //init workspaces
  }

  public clearCookies() {
    this.cookies.clearTokenFromTokenValue();
  }

  public async whenInitialized(): Promise<void> {
    return this.initialized;
  }

  setSelectedWorkspaceByWorkspaces(id: number) {
    const workspace: Workspace = this.workspaces
      .getValue()
      .find((workspace) => +workspace.id! === +id)!;
    const collaboratingWorkspace = this.collaboratingWorkspaces
      .getValue()
      .find((workspace) => +workspace.id! === +id)!;
    if (!workspace && !collaboratingWorkspace) return;
    this.selectedWorkspace.next([workspace ?? collaboratingWorkspace]);
  }

  setPermissionsOnSelectedWorkspace(permissions: {
    isAdmin: boolean;
    canDelete: boolean;
    canModify: boolean;
    canRead: boolean;
  }) {
    this.permissionsOnSelectedWorkspace.next(permissions);
  }

  setSelectedWorkspace(workspace: Workspace) {
    this.selectedWorkspace.next([workspace]);
  }

  setUser(user: User) {
    this.user.next(user);
  }

  setWorkspaces(workspaces: Workspace[]) {
    this.workspaces.next(workspaces);
  }
}
