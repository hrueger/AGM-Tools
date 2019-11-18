import { CommonModule } from "@angular/common";
import { Location } from "@angular/common";
import { registerLocaleData } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import { LOCALE_ID, NgModule } from "@angular/core";
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { ReactiveFormsModule } from "@angular/forms";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { JwtModule } from "@auth0/angular-jwt";
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { UploaderModule } from "@syncfusion/ej2-angular-inputs";
import { DashboardLayoutModule } from "@syncfusion/ej2-angular-layouts";
import { AccordionModule, TabModule } from "@syncfusion/ej2-angular-navigations";
import { DialogModule } from "@syncfusion/ej2-angular-popups";
import { ScheduleModule } from "@syncfusion/ej2-angular-schedule";
import { ChartsModule } from "ng2-charts";
import { PdfJsViewerModule } from "ng2-pdfjs-viewer";
import { AvatarModule } from "ngx-avatar";
import { ContextMenuModule } from "ngx-contextmenu";
import { LightboxModule } from "ngx-lightbox";
import { ToastrModule } from "ngx-toastr";
import { environment } from "../environments/environment";
import { AboutComponent } from "./_components/about/about.component";
import { BugsComponent } from "./_components/bugs/bugs.component";
import { CalendarComponent } from "./_components/calendar/calendar.component";
import { ChatMessagesComponent } from "./_components/chat-messages/chat-messages.component";
import { MessageBoxComponent } from "./_components/chat-messages/message-box/message-box.component";
import { MessagesAreaComponent } from "./_components/chat-messages/messages-area/messages-area.component";
import { ChatComponent } from "./_components/chat/chat.component";
import { ClientsoftwareComponent } from "./_components/clientsoftware/clientsoftware.component";
import { DashboardComponent } from "./_components/dashboard/dashboard.component";
import { DoneComponent } from "./_components/done/done.component";
import { EditTutorialComponent } from "./_components/edit-tutorial/edit-tutorial.component";
import { FileUploadComponent } from "./_components/file-upload/file-upload.component";
import { FilesComponent } from "./_components/files/files.component";
import { LoginComponent } from "./_components/login/login.component";
import { NavbarComponent } from "./_components/navbar/navbar.component";
import { NotificationsComponent } from "./_components/notifications/notifications.component";
import { ProjectsComponent } from "./_components/projects/projects.component";
import { SettingsComponent } from "./_components/settings/settings.component";
import { SidebarComponent } from "./_components/sidebar/sidebar.component";
import { TemplatesComponent } from "./_components/templates/templates.component";
import { TourComponent } from "./_components/tour/tour.component";
import { TutorialComponent } from "./_components/tutorial/tutorial.component";
import { TutorialsComponent } from "./_components/tutorials/tutorials.component";
import { UpdaterComponent } from "./_components/updater/updater.component";
import { UsersComponent } from "./_components/users/users.component";
import { ErrorInterceptor } from "./_helpers/error.interceptor";
import { SafePipe } from "./_pipes/safe.pipe";
import { ShortWhenPipe } from "./_pipes/short-when.pipe";
import { ToIconPipe } from "./_pipes/ToIcon.pipe";
import { TruncatePipe } from "./_pipes/truncate.pipe";
import { NavbarService } from "./_services/navbar.service";
import { PushService } from "./_services/push.service";
import { AppComponent } from "./app.component";
import { routes } from "./app.routes";

registerLocaleData(localeDe);

export function getJWT() {
    return sessionStorage.getItem("jwt_token");
}

@NgModule({
    bootstrap: [AppComponent],
    declarations: [
        AppComponent,
        LoginComponent,
        SafePipe,
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
        FileUploadComponent,
        TourComponent,
        UpdaterComponent,
        TutorialsComponent,
        TutorialComponent,
        EditTutorialComponent,
    ],
    imports: [
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        AngularFireMessagingModule,
        AngularFireModule.initializeApp(environment.firebase),
        RouterModule.forRoot(routes, { useHash: true, enableTracing: false }),
        ContextMenuModule.forRoot({
            useBootstrap4: true,
        }),
        JwtModule.forRoot({
            config: {
                tokenGetter: getJWT,
                whitelistedDomains: ["localhost:3000"],
            },
        }),
        BrowserAnimationsModule,
        DashboardLayoutModule,
        BrowserModule,
        TabModule,
        HttpClientModule,
        NgbModule,
        LightboxModule,
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
        PickerModule,
        BrowserAnimationsModule,
        AccordionModule,
        PdfJsViewerModule,
        ToastrModule.forRoot(),
    ],
    providers: [
        Location,
        NavbarService,
        PushService,
        {
            provide: LOCALE_ID,
            useValue: "de-DE",
        },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
})
export class AppModule { }
