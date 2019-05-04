import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './_components/dashboard/dashboard.component';
import { LoginComponent } from './_components/login/login.component';
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
import { NativeScriptUISideDrawerModule } from "nativescript-ui-sidedrawer/angular";
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";
import { NativeScriptUICalendarModule } from "nativescript-ui-calendar/angular";
import { NativeScriptUIChartModule } from "nativescript-ui-chart/angular";
import { NativeScriptUIDataFormModule } from "nativescript-ui-dataform/angular";
import { NativeScriptUIGaugeModule } from "nativescript-ui-gauge/angular";



// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from 'nativescript-angular/forms';

// Uncomment and add to NgModule imports  if you need to use the HTTP wrapper
// import { NativeScriptHttpClientModule } from 'nativescript-angular/http-client';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
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
    NativeScriptModule,
    AppRoutingModule,
    HttpClientModule,
    NativeScriptFormsModule,
    NativeScriptUISideDrawerModule,
    NativeScriptUIListViewModule,
    NativeScriptUICalendarModule,
    NativeScriptUIChartModule,
    NativeScriptUIDataFormModule,
    NativeScriptUIGaugeModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
