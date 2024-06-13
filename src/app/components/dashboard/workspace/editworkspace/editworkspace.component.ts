import { Component, ElementRef, OnInit, ViewChild, model } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { UsersService } from 'src/app/shared/services/flowboard/users/users.service';
import { WorkspacesService } from 'src/app/shared/services/flowboard/workspaces/workspaces.service';
import { UserDataService } from 'src/app/shared/services/userData/user-data.service';
import { Collaborator, Friend, User } from 'src/app/shared/types/user';
import { Workspace } from 'src/app/shared/types/workspaces';

@Component({
  selector: 'app-editworkspace',
  templateUrl: './editworkspace.component.html',
  styleUrl: './editworkspace.component.scss',
})
export class EditWorkspaceComponent implements OnInit {
  @ViewChild('selectMenu') selectMenu?: ElementRef;
  @ViewChild('content') content?: ElementRef;
  @ViewChild('selectInput') selectInput?: ElementRef;
  public workspace?: Workspace;
  public workspaceId: number;
  public user?: User;
  public potentialCollaborators: BehaviorSubject<Friend[]>;
  public filteredPotentialCollaborators: Friend[] = [];
  public collaborators: Collaborator[] = [];
  private beforeSaveCollaborators: Collaborator[] = [];
  private loginCookies: string = '';
  public selectedUser?: User;
  public showNewUser: boolean = false;
  public searchSelectTerms: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  public isInputShowed: boolean = false;

  constructor(
    private workspacesAPI: WorkspacesService,
    private userData: UserDataService,
    private userAPI: UsersService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.workspaceId = this.activatedRoute.snapshot.params['id'];
    this.userData.setSelectedWorkspaceByWorkspaces(this.workspaceId);

    if (this.collaborators.length == 0) this.showNewUser = true;

    this.potentialCollaborators = new BehaviorSubject<Friend[]>([]);
    this.potentialCollaborators.subscribe((collaborators) => {
      this.filteredPotentialCollaborators = collaborators.sort(
        (a: Friend, b: Friend) => a.user.username.localeCompare(b.user.username)
      );
    });

    this.searchSelectTerms.subscribe((terms) => {
      const potentialCollaboratorsValue = this.potentialCollaborators.value;
      this.filteredPotentialCollaborators = potentialCollaboratorsValue.filter(
        (c) => {
          const commonUsername = c.user.username
            .toLowerCase()
            .replaceAll('', '');
          const commonTerms = terms.toLowerCase().replaceAll('', '');
          return commonUsername.includes(commonTerms);
        }
      );
    });
  }

  async ngOnInit(): Promise<void> {
    this.user = await firstValueFrom(this.userData.user$);
    this.workspace = (
      await firstValueFrom(this.userData.selectedWorkspace$)
    )[0];
    //workspace and user

    this.loginCookies = await firstValueFrom(this.userData.loginCookies$);
    this.collaborators = await firstValueFrom(
      this.workspacesAPI.getCollaboratorsByWorkspaceAndUserId(
        this.workspace.id!,
        this.user.id!,
        this.loginCookies
      )
    );
    this.collaborators = this.collaborators.filter(
      (c) => c.userId !== this.user?.id
    );
    this.beforeSaveCollaborators = JSON.parse(
      JSON.stringify(this.collaborators)
    );
    //collaborators

    const potentialCollaborators = (
      await firstValueFrom(this.userAPI.getFriends(this.user.id!))
    ).filter((pc) => !this.collaborators.find((c) => c.userId === pc.userId));
    this.potentialCollaborators.next(potentialCollaborators);
    //potential collaborators

    window.addEventListener('resize', this.onWindowChange.bind(this));
    this.content?.nativeElement.addEventListener(
      'scroll',
      this.onWindowChange.bind(this)
    );
    //select window change
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onWindowChange.bind(this));
    this.content?.nativeElement.removeEventListener(
      'scroll',
      this.onWindowChange.bind(this)
    );
  }

  canSave() {
    const changes = this.compareModifiedCollaborators();
    let canSave = false;
    if (
      changes.addedCollaborators.length !== 0 ||
      changes.modifiedCollaborators.length !== 0 ||
      changes.deletedCollaborators.length !== 0
    )
      canSave = true;

    return !canSave;
  }

  compareModifiedCollaborators(): {
    addedCollaborators: Collaborator[];
    deletedCollaborators: Collaborator[];
    modifiedCollaborators: Collaborator[];
  } {
    const addedCollaborators: Collaborator[] = [];
    const deletedCollaborators: Collaborator[] =
      this.beforeSaveCollaborators.filter(
        (bc) => !this.collaborators.find((c) => c.userId === bc.userId)
      );
    const modifiedCollaborators: Collaborator[] = [];

    this.collaborators.forEach((c) => {
      if (!this.beforeSaveCollaborators.find((bc) => bc.userId === c.userId))
        addedCollaborators.push(c);
      //for added collaborators
      else if (
        !this.beforeSaveCollaborators.find(
          (bc) =>
            bc.userId === c.userId &&
            bc.canDelete === c.canDelete &&
            bc.canModify === c.canModify
        )
      )
        modifiedCollaborators.push(c);
      //for modified collaborators
    });

    return { addedCollaborators, deletedCollaborators, modifiedCollaborators };
  }

  handleSelectBtnClick() {
    this.selectMenu?.nativeElement.classList.toggle('active');
    this.updateMenuPosition();
    this.isInputShowed = !this.isInputShowed;
    this.selectInput?.nativeElement.focus();
  }

  handleMenuClick() {
    this.selectInput?.nativeElement.focus();
  }

  updateMenuPosition() {
    const selectMenu = this.selectMenu?.nativeElement;
    if (!selectMenu) return;
    const btnRect = selectMenu
      .querySelector('.select-btn')
      .getBoundingClientRect();
    const options = selectMenu.querySelector('.options');

    options.style.top = `${btnRect.bottom}px`;
    options.style.left = `${btnRect.left}px`;
    options.style.width = `${btnRect.width}px`;

    const optionsRect = options.getBoundingClientRect();
    const contentRect = this.content?.nativeElement.getBoundingClientRect();
    if (optionsRect.top > contentRect.bottom) {
      options.classList.add('overflow');
    } else {
      options.classList.remove('overflow');
    }
  }

  // @HostListener('window:resize')
  // @HostListener('window:scroll')
  onWindowChange() {
    this.updateMenuPosition();
  }

  unshowNewUser() {
    if (this.selectMenu?.nativeElement.classList.value.includes('active')) {
      this.selectMenu?.nativeElement.classList.remove('active');
      this.isInputShowed = false;
      return;
    }
    if (this.collaborators.length !== 0) this.showNewUser = false;
  }

  deleteUser(collaborator: Collaborator) {
    this.selectMenu?.nativeElement.classList.remove('active');
    const potentialCollaboratorsValue = this.potentialCollaborators.value;
    const searchedFriend = this.collaborators.indexOf(collaborator);
    this.potentialCollaborators.next([
      ...potentialCollaboratorsValue,
      collaborator,
    ]);
    if (searchedFriend !== -1) this.collaborators.splice(searchedFriend, 1);
    if (this.collaborators.length === 0) this.showNewUser = true;
  }

  saveChanges() {
    const changes = this.compareModifiedCollaborators();
    changes.addedCollaborators.forEach((ac) => {
      this.workspacesAPI
        .postCollaborator(this.user?.id!, this.loginCookies, ac)
        .subscribe();
    });
    //add
    changes.modifiedCollaborators.forEach((mc) => {
      this.workspacesAPI
        .updateCollaborator(this.user?.id!, this.loginCookies, mc)
        .subscribe();
    });
    //modify
    changes.deletedCollaborators.forEach((dc) => {
      this.workspacesAPI.deleteCollaboratorByWorkspaceAndUserId(
        this.user?.id!,
        this.loginCookies,
        dc.userId,
        dc.workspaceId!
      );
    });
    //delete
    this.beforeSaveCollaborators = this.collaborators;
  }

  searchOnSelect(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    this.searchSelectTerms.next(inputValue);
  }

  addCollaborator(collaborator: Collaborator) {
    this.selectMenu?.nativeElement.classList.remove('active');
    this.collaborators.push({ ...collaborator, workspaceId: this.workspaceId });
    const potentialCollaboratorsValue = this.potentialCollaborators.value;
    const searchedFriend = potentialCollaboratorsValue.indexOf(collaborator);
    if (searchedFriend !== -1)
      this.potentialCollaborators.next(
        potentialCollaboratorsValue.filter((c) => c !== collaborator)
      );
    this.showNewUser = false;
    this.isInputShowed = false;
  }

  leave() {
    const url = this.router.url;
    const splittedUrl = url.split('/');
    let workspacesUrl = splittedUrl.slice(0, splittedUrl.length - 2).join('/');
    if (url.includes('workspaces/workspace')) {
      workspacesUrl = splittedUrl.slice(0, splittedUrl.length - 1).join('/');
    }
    //case comes from specific workspace
    this.router.navigate([workspacesUrl]);
  }
}
