import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './_components/login/login.component';
import { DashboardComponent } from './_components/dashboard/dashboard.component';
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
import { NavbarComponent } from './_components/navbar/navbar.component';
import { AlertComponent } from './_components/alert/alert.component';
import { SidebarComponent } from './_components/sidebar/sidebar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from "ng2-charts";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { AvatarModule } from 'ngx-avatar';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    UsersComponent,
    ChatComponent,
    NotificationsComponent,
    CalendarComponent,
    ProjectsComponent,
    FilesComponent,
    TemplatesComponent,
    BugsComponent,
    ClientsoftwareComponent,
    SettingsComponent,
    AboutComponent,
    NavbarComponent,
    AlertComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    ChartsModule,
    AvatarModule
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: "de"
    },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
