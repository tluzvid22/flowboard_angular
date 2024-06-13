import { Workspace } from '../../types/workspaces';
import { User } from '../../types/user';
import { WorkspacesService } from '../flowboard/workspaces/workspaces.service';
import { Injectable } from '@angular/core';
import { CookieServiceService } from '../cookieservice/cookieservice.service';
import { BehaviorSubject, Observable, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private workspaces: BehaviorSubject<Workspace[]> = new BehaviorSubject<
    Workspace[]
  >([]);
  public workspaces$: Observable<Workspace[]> = this.workspaces.asObservable();

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

  constructor(
    private workspacesAPI: WorkspacesService,
    private cookies: CookieServiceService
  ) {
    this.initialized = this.init();
  }

  async init(): Promise<void> {
    this.loginCookies.next(this.cookies.getLocalToken());
    this.user$.subscribe((updatedUser: User) => {
      if (updatedUser) this.setWorkspaces(updatedUser.workspaces!);
    });
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
    if (!workspace) return;
    this.selectedWorkspace.next([workspace]);
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
