import { Workspace } from './workspaces';

export interface User {
  id?: number;
  name: string;
  lastName: string;
  password: string;
  email: string;
  confirmEmail?: string;
  username: string;
  imageid: number;
  image?: { contentUrl: string };
  workspaces?: Workspace[];
  address: string;
  phone: string;
  country: string;
  state: string;
  isFriend?: boolean;
  requestedBeFriend?: boolean;
  wantsToBeFriend?: boolean;
}

export interface Friend {
  userId: number;
  user: User;
}

export interface Collaborator {
  userId: number;
  user: User;
  workspaceId?: number;
  workspace?: Workspace;
  canModify?: boolean;
  canDelete?: boolean;
  canRead?: boolean;
  isAdmin?: boolean;
}

export interface Request {
  userId: number;
  user: User;
  requestedByUserId: number;
}

export enum Status {
  Accepted,
  Waiting,
  Declined,
}

export interface Token {
  id?: number;
  value: string;
  expiryDate?: Date;
  userId: number;
}
