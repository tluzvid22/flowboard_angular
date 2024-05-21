import { List, Workspace } from '../../types/workspaces';
import { User } from '../../types/user';
import { WorkspacesService } from '../flowboard/workspaces/workspaces.service';
import { Injectable, OnInit } from '@angular/core';
import { UsersService } from '../flowboard/users/users.service';
import { CookieServiceService } from '../cookieservice/cookieservice.service';
import {
  BehaviorSubject,
  Observable,
  firstValueFrom,
  lastValueFrom,
  map,
  mergeMap,
  of,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private workspaces: BehaviorSubject<Workspace[]> = new BehaviorSubject<
    Workspace[]
  >([]);
  public workspaces$: Observable<Workspace[]> = this.workspaces.asObservable();

  private user: BehaviorSubject<User | any> = new BehaviorSubject<User | any>(
    ''
  );
  public user$: Observable<User> = this.user!.asObservable();

  private list: BehaviorSubject<List | any> = new BehaviorSubject<List | any>(
    ''
  );
  public list$: Observable<List> = this.user!.asObservable();
  public initialized: Promise<void>;

  constructor(
    private workspacesAPI: WorkspacesService,
    private userService: UsersService,
    private cookies: CookieServiceService
  ) {
    this.initialized = this.init();
  }

  async init(): Promise<void> {
    this.user.next(
      (
        await lastValueFrom(
          this.userService.getUserByToken(this.cookies.getLocalToken())
        )
      )[0]
    );

    if (!this.user.getValue()) return;

    await this.pullWorkspaces();
  }

  async pullWorkspaces() {
    await lastValueFrom(
      this.workspacesAPI.getWorkspacesByUserId(
        this.user?.getValue().id as number,
        this.cookies.getLocalToken()
      )
    ).then(
      (response: Workspace[]) => {
        this.workspaces.next(
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

  public async whenInitialized(): Promise<void> {
    return this.initialized;
  }

  setUser(user: User) {
    this.user.next(user);
  }

  setWorkspaces(workspaces: Workspace[]) {
    this.workspaces.next(workspaces);
  }
}
