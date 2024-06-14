import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { ListComponent } from './workspace/list/list.component';
import { TaskComponent } from './workspace/task/task.component';
import { EdittaskComponent } from './workspace/task/edittask/edittask.component';
import { MyAccountComponent } from './myaccount/myaccount.component';
import { SocialComponent } from './social/social.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { DeleteConfirmationComponent } from './delete-confirmation/delete-confirmation.component';
import { EditWorkspaceComponent } from './workspace/editworkspace/editworkspace.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BrowserModule } from '@angular/platform-browser';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'workspaces',
        component: WorkspacesComponent,
        children: [{ path: ':id/edit', component: EditWorkspaceComponent }],
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'workspaces/workspace/:id',
        component: WorkspaceComponent,
        children: [
          { path: 'edit', component: EditWorkspaceComponent },
          { path: 'delete', component: DeleteConfirmationComponent },
          { path: 'list/:id/delete', component: DeleteConfirmationComponent },
          { path: 'task/:id/delete', component: DeleteConfirmationComponent },
          { path: 'task/:id/edit', component: EdittaskComponent },
        ],
      },
      { path: 'myaccount', component: MyAccountComponent },
    ],
  },
];

@NgModule({
  declarations: [
    DashboardComponent,
    WorkspacesComponent,
    WorkspaceComponent,
    MyAccountComponent,
    SocialComponent,
    EditWorkspaceComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ListComponent,
    DeleteConfirmationComponent,
    TaskComponent,
    ReactiveFormsModule,
    CdkDropList,
    CdkDrag,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    FormsModule,
    MatCheckboxModule,
  ],
})
export class DashboardModule {}
