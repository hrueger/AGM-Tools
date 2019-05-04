import { Routes } from '@angular/router';

import { DashboardComponent } from './_components/dashboard/dashboard.component';
import { AuthGuard } from './_guards/auth.guard';
import { UsersComponent } from './_components/users/users.component';
import { ChatComponent } from './_components/chat/chat.component';
import { NotificationsComponent } from './_components/notifications/notifications.component';
import { CalendarComponent } from './_components/calendar/calendar.component';
import { ProjectsComponent } from './_components/projects/projects.component';
import { FilesComponent } from './_components/files/files.component';
import { TemplatesComponent } from './_components/templates/templates.component';
import { BugsComponent } from './_components/bugs/bugs.component';
import { ClientsoftwareComponent } from './_components/clientsoftware/clientsoftware.component';
import { SettingsComponent } from './_components/settings/settings.component';
import { AboutComponent } from './_components/about/about.component';
import { LoginComponent } from './_components/login/login.component';

export const routes: Routes = [
    { path: "", redirectTo: "/dashboard", pathMatch: "full" },
    {
      path: "dashboard",
      component: DashboardComponent,
      canActivate: [AuthGuard]
    },
  
    { path: "users", component: UsersComponent, canActivate: [AuthGuard] },
    { path: "chat", component: ChatComponent, canActivate: [AuthGuard] },
    {
      path: "notifications",
      component: NotificationsComponent,
      canActivate: [AuthGuard]
    },
    { path: "calendar", component: CalendarComponent, canActivate: [AuthGuard] },
    { path: "projects", component: ProjectsComponent, canActivate: [AuthGuard] },
    { path: "files", component: FilesComponent, canActivate: [AuthGuard] },
    {
      path: "templates",
      component: TemplatesComponent,
      canActivate: [AuthGuard]
    },
    { path: "bugs", component: BugsComponent, canActivate: [AuthGuard] },
    {
      path: "clientsoftware",
      component: ClientsoftwareComponent,
      canActivate: [AuthGuard]
    },
    { path: "settings", component: SettingsComponent, canActivate: [AuthGuard] },
    { path: "about", component: AboutComponent, canActivate: [AuthGuard] },
  
    /* Authentication paths*/
    { path: "login", component: LoginComponent },
    // otherwise redirect to home
    { path: "**", redirectTo: "/dashboard" }
  ];