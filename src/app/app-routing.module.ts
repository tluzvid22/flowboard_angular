import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './components/user-identification/login/login.component';
import { SignupComponent } from './components/user-identification/signup/signup.component';
import { singUpAuthGuard } from './auth/sing-up-auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  { path: 'home', component: LayoutComponent },

  { path: 'login', component: LoginComponent },
  {
    path: 'signup/step/:id',
    canActivate: [singUpAuthGuard],
    component: SignupComponent,
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
