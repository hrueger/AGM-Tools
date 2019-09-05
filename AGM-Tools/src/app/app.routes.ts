import { Routes } from "@angular/router";

import { AboutComponent } from "./_components/about/about.component";
import { BugsComponent } from "./_components/bugs/bugs.component";
import { CalendarComponent } from "./_components/calendar/calendar.component";
import { ChatMessagesComponent } from "./_components/chat-messages/chat-messages.component";
import { ChatComponent } from "./_components/chat/chat.component";
import { ClientsoftwareComponent } from "./_components/clientsoftware/clientsoftware.component";
import { DashboardComponent } from "./_components/dashboard/dashboard.component";
import { DoneComponent } from "./_components/done/done.component";
import { FilesComponent } from "./_components/files/files.component";
import { LoginComponent } from "./_components/login/login.component";
import { NotificationsComponent } from "./_components/notifications/notifications.component";
import { ProjectsComponent } from "./_components/projects/projects.component";
import { SettingsComponent } from "./_components/settings/settings.component";
import { TemplatesComponent } from "./_components/templates/templates.component";
import { TourComponent } from "./_components/tour/tour.component";
import { UsersComponent } from "./_components/users/users.component";
import { AuthGuard } from "./_guards/auth.guard";

export const routes: Routes = [
    {
        canActivate: [AuthGuard],
        component: DashboardComponent,
        path: "dashboard",
    },
    {
        component: TourComponent,
        path: "tour",
    },
    {
        canActivate: [AuthGuard],
        component: UsersComponent,
        path: "users",
    },
    {
        canActivate: [AuthGuard],
        component: ChatComponent,
        path: "chat",
    },
    {
        canActivate: [AuthGuard],
        component: ChatMessagesComponent,
        path: "chat-messages/:index",
    },
    {
        canActivate: [AuthGuard],
        component: NotificationsComponent,
        path: "notifications",
    },
    {
        canActivate: [AuthGuard],
        component: CalendarComponent,
        path: "calendar",
    },
    {
        canActivate: [AuthGuard],
        component: ProjectsComponent,
        path: "projects",
    },
    {
        canActivate: [AuthGuard],
        component: FilesComponent,
        path: "files",
    },
    {
        canActivate: [AuthGuard],
        component: TemplatesComponent,
        path: "templates",
    },
    {
        canActivate: [AuthGuard],
        component: BugsComponent,
        path: "bugs",
    },
    {
        canActivate: [AuthGuard],
        component: ClientsoftwareComponent,
        path: "clientsoftware",
    },
    {
        canActivate: [AuthGuard],
        component: DoneComponent,
        path: "done",
    },
    {
        canActivate: [AuthGuard],
        component: SettingsComponent,
        path: "settings",
    },
    {
        canActivate: [AuthGuard],
        component: AboutComponent,
        path: "about",
    },

    /* Authentication paths*/
    { path: "login", component: LoginComponent },
    // otherwise redirect to home
    { path: "**", redirectTo: "/dashboard" },
];
