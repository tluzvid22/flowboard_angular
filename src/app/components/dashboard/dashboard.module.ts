import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OverviewComponent } from './overview/overview.component';
import { RouterModule, Routes } from '@angular/router';
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { ListComponent } from './workspace/list/list.component';
import { TaskComponent } from './workspace/task/task.component';
import { EdittaskComponent } from './workspace/task/edittask/edittask.component';
import { SocialComponent } from './social/social.component';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'overview', component: OverviewComponent },
      {
        path: 'workspaces',
        component: WorkspacesComponent,
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'workspaces/workspace/:id',
        component: WorkspaceComponent,
        children: [{ path: 'task/:id/edit', component: EdittaskComponent }],
      },
      { path: 'social', component: SocialComponent },
    ],
  },
];

@NgModule({
  declarations: [
    DashboardComponent,
    OverviewComponent,
    WorkspacesComponent,
    WorkspaceComponent,
    SocialComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ListComponent,
    TaskComponent,
    ReactiveFormsModule,
  ],
})
export class DashboardModule {}
