import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OverviewComponent } from './overview/overview.component';
import { RouterModule, Routes } from '@angular/router';
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { ListComponent } from './workspace/list/list.component';
import { TaskComponent } from './workspace/task/task.component';

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
      },
    ],
  },
];

@NgModule({
  declarations: [
    DashboardComponent,
    OverviewComponent,
    WorkspacesComponent,
    WorkspaceComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ListComponent,
    TaskComponent,
  ],
})
export class DashboardModule {}
