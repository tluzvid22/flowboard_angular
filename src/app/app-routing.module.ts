import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './components/user-identification/login/login.component';
import { SignupComponent } from './components/user-identification/signup/signup.component';
import { singUpAuthGuard } from './auth/sing-up-auth.guard';
import { tokenCookiesAuthGuard } from './auth/cookies/tokenCookiesAuthGuard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  { path: 'home', component: LayoutComponent },
  {
    path: 'login',
    canActivate: [tokenCookiesAuthGuard],
    component: LoginComponent,
  },
  {
    path: 'signup/step/:id',
    canActivate: [singUpAuthGuard],
    component: SignupComponent,
  },
  {
    path: 'dashboard/:id',
    canActivate: [tokenCookiesAuthGuard],
    loadChildren: () =>
      import('./components/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)],
})
export class AppRoutingModule {}
