import { NgModule, LOCALE_ID } from "@angular/core";
import { Location } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./_components/login/login.component";
import { DashboardComponent } from "./_components/dashboard/dashboard.component";
import { UsersComponent } from "./_components/users/users.component";
import { ChatComponent } from "./_components/chat/chat.component";
import { NotificationsComponent } from "./_components/notifications/notifications.component";
import { CalendarComponent } from "./_components/calendar/calendar.component";
import { ProjectsComponent } from "./_components/projects/projects.component";
import { FilesComponent } from "./_components/files/files.component";
import { TemplatesComponent } from "./_components/templates/templates.component";
import { BugsComponent } from "./_components/bugs/bugs.component";
import { ClientsoftwareComponent } from "./_components/clientsoftware/clientsoftware.component";
import { SettingsComponent } from "./_components/settings/settings.component";
import { AboutComponent } from "./_components/about/about.component";
import { NavbarComponent } from "./_components/navbar/navbar.component";
import { SidebarComponent } from "./_components/sidebar/sidebar.component";
import { ReactiveFormsModule } from "@angular/forms";
import { ChartsModule } from "ng2-charts";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { JwtInterceptor } from "./_helpers/jwt.interceptor";
import { ErrorInterceptor } from "./_helpers/error.interceptor";
import { AvatarModule } from "ngx-avatar";
import { ChatMessagesComponent } from "./_components/chat-messages/chat-messages.component";
import { MessagesAreaComponent } from "./_components/chat-messages/messages-area/messages-area.component";
import { MessageBoxComponent } from "./_components/chat-messages/message-box/message-box.component";
import { NavbarService } from "./_services/navbar.service";
import { ShortWhenPipe } from "./_pipes/short-when.pipe";
import { CommonModule } from "@angular/common";
import { NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import localeDe from "@angular/common/locales/de";
import { registerLocaleData } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DoneComponent } from "./_components/done/done.component";
import { ScheduleModule } from "@syncfusion/ej2-angular-schedule";
import { DialogModule } from "@syncfusion/ej2-angular-popups";
import { UploaderModule } from "@syncfusion/ej2-angular-inputs";
import { AccordionModule } from "@syncfusion/ej2-angular-navigations";
//import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { OneSignalService } from "./_services/onesignal.service";
import { FileUploadComponent } from "./_components/file-upload/file-upload.component";
import { ToastrModule } from "ngx-toastr";
import { ContextMenuModule } from "ngx-contextmenu";
import { RouterModule } from "@angular/router";
import { routes } from "./app.routes";
import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';
import { PdfJsViewerModule } from "ng2-pdfjs-viewer";
import { TruncatePipe } from "./_pipes/truncate.pipe";
import { ToIconPipe } from "./_pipes/ToIcon.pipe";

registerLocaleData(localeDe);

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
        SidebarComponent,
        ChatMessagesComponent,
        ShortWhenPipe,
        TruncatePipe,
        ToIconPipe,
        MessagesAreaComponent,
        MessageBoxComponent,
        DoneComponent,
        FileUploadComponent
    ],
    imports: [
        RouterModule.forRoot(routes, { useHash: true, enableTracing: true }),

        ContextMenuModule.forRoot({
            useBootstrap4: true
        }),
        BrowserAnimationsModule,
        DashboardLayoutModule,
        BrowserModule,
        HttpClientModule,
        NgbModule,
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        ChartsModule,
        AvatarModule,
        CommonModule,
        FormsModule,
        NgbModalModule,
        ScheduleModule,
        DialogModule,
        UploaderModule,
        FormsModule,
        ReactiveFormsModule,
        //PickerModule,
        BrowserAnimationsModule,
        AccordionModule,
        PdfJsViewerModule,
        ToastrModule.forRoot()
    ],
    providers: [
        Location,
        NavbarService,
        OneSignalService,
        {
            provide: LOCALE_ID,
            useValue: "de-DE"
        },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
