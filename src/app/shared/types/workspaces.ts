import { User } from './user';

export interface List {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Task {
  id?: string;
  name?: string;
  list_id?: string;
  assigned_users?: User[];
  due_date?: Date;
  files?: File;
  description?: string;
}
