import { Component, OnInit } from '@angular/core';
import { error } from 'console';
import {
  BehaviorSubject,
  Subject,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  switchMap,
} from 'rxjs';
import { UsersService } from 'src/app/shared/services/flowboard/users/users.service';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';
import { Friend, Request, Status, User } from 'src/app/shared/types/user';

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrl: './social.component.scss',
})
export class SocialComponent implements OnInit {
  private searchTerms = new BehaviorSubject<string>('');
  public requestsUsers: Request[] = [];
  public friendsUsers: Friend[] = [];
  public shownUsers: User[] = [];
  public user?: User;

  constructor(
    private userAPI: UsersService,
    private userData: UserDataService
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = await firstValueFrom(this.userData.user$);

    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.userAPI.getUsersByUsername(term))
      )
      .subscribe((searchResults: User[]) => {
        const filteredResults = searchResults.filter(
          (u) => u.id !== this.user!.id!
        );
        const friends = this.friendsUsers.map((f) => f.user);
        const requests = this.requestsUsers.map((r) => r.user);

        const unmatchingUsers: User[] = [];
        filteredResults.forEach((result) => {
          const matchingFriendIndex = friends.find((f) => f.id === result.id);
          const matchingRequestUserIndex = requests.find(
            (f) => f.id === result.id
          );
          if (!matchingRequestUserIndex && !matchingFriendIndex)
            unmatchingUsers.push(result);
        });

        this.shownUsers = friends;
        this.shownUsers.push(...requests);
        this.shownUsers.push(...unmatchingUsers);
      });

    this.searchUsers('');
    this.friendsUsers = await firstValueFrom(
      this.userAPI.getFriends(this.user.id!)
    );
    this.friendsUsers.forEach((f) => (f.user.isFriend = true));
    this.requestsUsers = await firstValueFrom(
      this.userAPI.getRequests(this.user.id!)
    );
    this.requestsUsers.forEach((r) => {
      const user = r.user;
      user.requestedBeFriend = r.requestedByUserId === this.user?.id;
      user.wantsToBeFriend = !user.requestedBeFriend;
    });
  }

  deleteFriend(user: User) {
    this.userAPI
      .deleteFriend(user.id!, this.user?.id!)
      .subscribe((response: boolean) => {
        if (!response) return;
        this.friendsUsers = this.friendsUsers.filter(
          (f) => f.userId !== user.id
        );
        user.isFriend = false;
      });
  }

  deleteFriendRequest(user: User) {
    this.userAPI
      .deleteRequest(user.id!, this.user?.id!)
      .subscribe((response: boolean) => {
        if (!response) return;
        this.requestsUsers = this.requestsUsers.filter(
          (r) => r.userId !== user.id
        );
        user.requestedBeFriend = false;
      });
  }

  sendFriendRequest(user: User) {
    this.userAPI
      .createRequests(this.user?.id!, user.id!)
      .subscribe((response: Request) => {
        if (!response) return;
        this.requestsUsers.push(response);
        user.requestedBeFriend = true;
      });
  }

  acceptFriendRequest(user: User) {
    this.userAPI
      .putRequests(this.user?.id!, user.id!, Status.Accepted)
      .subscribe((response: Request) => {
        if (!response) return;
        this.requestsUsers = this.requestsUsers.filter(
          (r) => r.userId !== user.id
        );
        this.friendsUsers.push({
          userId: user.id!,
          user: this.user!,
        });
        user.isFriend = true;
        user.wantsToBeFriend = false;
      });
  }

  declineFriendRequest(user: User) {
    this.userAPI
      .putRequests(this.user?.id!, user.id!, Status.Declined)
      .subscribe((response: Request) => {
        if (!response) return;
        this.requestsUsers = this.requestsUsers.filter(
          (r) => r.userId !== user.id
        );
        user.wantsToBeFriend = false;
      });
  }

  searchUsers(value: string) {
    if (value === '') value = 'empty';
    this.searchTerms.next(value);
  }
}
