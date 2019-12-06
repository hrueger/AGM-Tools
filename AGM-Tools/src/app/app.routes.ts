import { Routes } from "@angular/router";
import { AboutComponent } from "./_components/about/about.component";
import { CalendarComponent } from "./_components/calendar/calendar.component";
import { ChatMessagesComponent } from "./_components/chat-messages/chat-messages.component";
import { ChatComponent } from "./_components/chat/chat.component";
import { ClientsoftwareComponent } from "./_components/clientsoftware/clientsoftware.component";
import { DashboardComponent } from "./_components/dashboard/dashboard.component";
import { DoneComponent } from "./_components/done/done.component";
import { EditTutorialComponent } from "./_components/edit-tutorial/edit-tutorial.component";
import { FilesComponent } from "./_components/files/files.component";
import { LoginComponent } from "./_components/login/login.component";
import { NotificationsComponent } from "./_components/notifications/notifications.component";
import { ProjectsComponent } from "./_components/projects/projects.component";
import { SettingsComponent } from "./_components/settings/settings.component";
import { ShareComponent } from "./_components/share/share.component";
import { TemplatesComponent } from "./_components/templates/templates.component";
import { TourComponent } from "./_components/tour/tour.component";
import { TutorialComponent } from "./_components/tutorial/tutorial.component";
import { TutorialsComponent } from "./_components/tutorials/tutorials.component";
import { UpdaterComponent } from "./_components/updater/updater.component";
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
        component: TutorialsComponent,
        path: "tutorials",
    },
    {
        canActivate: [AuthGuard],
        component: TutorialComponent,
        path: "tutorial/:index",
    },
    {
        canActivate: [AuthGuard],
        component: EditTutorialComponent,
        path: "editTutorial/:index",
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
        component: CalendarComponent,
        path: "calendar/:index",
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
    {
        canActivate: [AuthGuard],
        component: UpdaterComponent,
        path: "updater",
    },

    {
        component: ShareComponent,
        path: "share/:link",
    },

    /* Authentication paths*/
    { path: "login", component: LoginComponent },
    { path: "resetPassword/:resetPasswordToken", component: LoginComponent },
    // otherwise redirect to home
    { path: "**", redirectTo: "/dashboard" },
];
