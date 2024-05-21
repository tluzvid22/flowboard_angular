import { Injectable } from '@angular/core';
import { environment } from 'environments/development';
import { ApiService } from '../../api/api.service';
import { Files, List, Task, Workspace } from 'src/app/shared/types/workspaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkspacesService {
  private BASE_URL = environment.flowboardAPI.base_url;
  private WORKSPACE_ENDPOINT = environment.flowboardAPI.endpoints.workspace;
  private LIST_ENDPOINT = environment.flowboardAPI.endpoints.list;
  private TASK_ENDPOINT = environment.flowboardAPI.endpoints.task;
  private FILE_ENDPOINT = environment.flowboardAPI.endpoints.file;
  private API_KEY = environment.flowboardAPI.apikey.key;
  private headers: Headers;

  constructor(private api: ApiService) {
    this.headers = new Headers();
    if (this.API_KEY.key === '') return; // if there is no apikey then don't add it
    this.headers.append(this.API_KEY.key, this.API_KEY.value);
  }

  public postWorkspace(workspace: Workspace): Observable<Workspace> {
    const url = `${this.BASE_URL}${this.WORKSPACE_ENDPOINT.workspace}`;
    return this.api.post(url, workspace, this.headers);
  }

  public getWorkspacesByUserId(
    userId: number,
    token: string
  ): Observable<Workspace[]> {
    const url = `${this.BASE_URL}${this.WORKSPACE_ENDPOINT.workspacesByUser}${userId}/${token}`;
    return this.api.get(url, this.headers);
  }

  public deleteWorkspaceById(
    workspaceId: number,
    userId: number,
    token: string
  ): Observable<boolean> {
    const url = `${this.BASE_URL}${this.WORKSPACE_ENDPOINT.workspace}/${workspaceId}/${userId}/${token}`;
    return this.api.delete(url, this.headers);
  }

  public postList(list: List): Observable<List> {
    const url = `${this.BASE_URL}${this.LIST_ENDPOINT.list}`;
    return this.api.post(url, list, this.headers);
  }

  public getListsByWorkspaceId(workspace_id: number): Observable<List[]> {
    const url = `${this.BASE_URL}${this.LIST_ENDPOINT.listsByWorkspace}${workspace_id}`;
    return this.api.get(url, this.headers);
  }

  public postTask(task: Task): Observable<Task> {
    const url = `${this.BASE_URL}${this.TASK_ENDPOINT.task}`;
    return this.api.post(url, task, this.headers);
  }

  public getTasksByListId(list_id: number): Observable<Task[]> {
    const url = `${this.BASE_URL}${this.TASK_ENDPOINT.tasksByList}${list_id}`;
    return this.api.get(url, this.headers);
  }

  public getTaskByTaskId(task_id: number): Observable<Task> {
    const url = `${this.BASE_URL}${this.TASK_ENDPOINT.task}/${task_id}`;
    return this.api.get(url, this.headers);
  }

  public postFile(file: Files): Observable<Files> {
    const formData: FormData = new FormData();
    formData.append('data', file.data as File);
    const url = `${this.BASE_URL}${this.FILE_ENDPOINT.file}?name=${file.name}&fileType=${file.fileType}`;
    return this.api.post(url, formData, this.headers);
  }

  public updateTaskIdOnFile(
    file_id: number,
    task_id: number
  ): Observable<Files> {
    const url = `${this.BASE_URL}${this.FILE_ENDPOINT.file}`;
    const params = { id: file_id, taskId: task_id };
    return this.api.put(url, params, this.headers);
  }

  public getFilesByTaskId(task_id: number): Observable<Files[]> {
    const url = `${this.BASE_URL}${this.FILE_ENDPOINT.filesByTask}${task_id}`;
    return this.api.get(url, this.headers);
  }
}
