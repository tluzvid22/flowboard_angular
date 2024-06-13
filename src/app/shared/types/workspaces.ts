import { User } from './user';

export interface List {
  id?: number;
  name: string;
  order?: number;
  tasks?: Task[];
  workspaceId: number;
}

export interface Task {
  id: number;
  name: string;
  order?: number;
  listId: number;
  assigned_users?: User[];
  due_date?: string;
  files: Files[];
  description?: string;
}

export interface Workspace {
  id?: number;
  name: string;
  userId: number;
  lists?: List[];
  assigned_users?: User[];
  updatedAt?: Date;
  files?: File;
  description?: string;
  showSettings?: boolean;
}

export interface Files {
  id?: number;
  name?: string;
  fileType?: string;
  contentUrl?: string;
  data?: File;
}
