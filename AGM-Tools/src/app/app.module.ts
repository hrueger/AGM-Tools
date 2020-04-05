import {
    CommonModule, DatePipe, Location, registerLocaleData,
} from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import { LOCALE_ID, NgModule } from "@angular/core";
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { NgbModule, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { UploaderModule } from "@syncfusion/ej2-angular-inputs";
import { DashboardLayoutModule } from "@syncfusion/ej2-angular-layouts";
import { AccordionModule, TabModule, TreeViewModule } from "@syncfusion/ej2-angular-navigations";
import { DialogModule } from "@syncfusion/ej2-angular-popups";
import { ScheduleModule } from "@syncfusion/ej2-angular-schedule";
import { ChartsModule } from "ng2-charts";
import { AvatarModule } from "ngx-avatar";
import { ContextMenuModule } from "ngx-contextmenu";
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { LightboxModule } from "ngx-lightbox";
import { NgxOnlyOfficeModule } from "ngx-onlyoffice";
import { ToastrModule } from "ngx-toastr";
import { UiSwitchModule } from "ngx-ui-switch";
import { EditorModule } from "@tinymce/tinymce-angular";
import { MarkdownModule } from "ngx-markdown";
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { NgxAdvancedImageEditorModule } from "ngx-advanced-image-editor";
import { environment } from "../environments/environment";
import { CalendarComponent } from "./_components/calendar/calendar.component";
import { CallComponent } from "./_components/call/call.component";
import { ChatMessagesComponent } from "./_components/chat-messages/chat-messages.component";
import { MessageBoxComponent } from "./_components/chat-messages/message-box/message-box.component";
import { MessagesAreaComponent } from "./_components/chat-messages/messages-area/messages-area.component";
import { ChatComponent } from "./_components/chat/chat.component";
import { DashboardComponent } from "./_components/dashboard/dashboard.component";
import { DoneComponent } from "./_components/done/done.component";
import { EditTutorialComponent } from "./_components/edit-tutorial/edit-tutorial.component";
import { FileUploadComponent } from "./_components/file-upload/file-upload.component";
import { FilePickerModalComponent } from "./_components/filePickerModal/filePickerModal";
import { FilesComponent } from "./_components/files/files.component";
import { LoginComponent } from "./_components/login/login.component";
import { NavbarComponent } from "./_components/navbar/navbar.component";
import { NotificationsComponent } from "./_components/notifications/notifications.component";
import { PickerModalComponent } from "./_components/pickerModal/pickerModal";
import { ProjectsComponent } from "./_components/projects/projects.component";
import { SettingsComponent } from "./_components/settings/settings.component";
import { ShareComponent } from "./_components/share/share.component";
import { SidebarComponent } from "./_components/sidebar/sidebar.component";
import { TemplatesComponent } from "./_components/templates/templates.component";
import { TourComponent } from "./_components/tour/tour.component";
import { TutorialComponent } from "./_components/tutorial/tutorial.component";
import { TutorialsComponent } from "./_components/tutorials/tutorials.component";
import { UpdaterComponent } from "./_components/updater/updater.component";
import { UsersComponent } from "./_components/users/users.component";
import { ErrorInterceptor } from "./_helpers/error.interceptor";
import { JwtInterceptor } from "./_helpers/jwt.interceptor";
import { RenewJwtTokenInterceptor } from "./_helpers/renewJwtToken.interceptor";
import { SortableHeader } from "./_helpers/sortable.directive";
import { DiffPipe } from "./_pipes/diff.pipe";
import { DisplayUsernamesPipe } from "./_pipes/displayUsernames.pipe";
import { DateAgoPipe } from "./_pipes/howLongAgo.pipe";
import { SafePipe } from "./_pipes/safe.pipe";
import { ShortWhenPipe } from "./_pipes/short-when.pipe";
import { ToIconPipe } from "./_pipes/ToIcon.pipe";
import { TruncatePipe } from "./_pipes/truncate.pipe";
import { NavbarService } from "./_services/navbar.service";
import { PushService } from "./_services/push.service";
import { AppComponent } from "./app.component";
import { routes } from "./app.routes";
import { TinyConfigService } from "./_services/tiny-config.service";
import { MarkdownService } from "./_services/markdown.service";
import { AddImageComponent, ImageEditorComponent } from "./_components/add-image/add-image.component";


registerLocaleData(localeDe);

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, `${environment.appUrl.replace("/#/", "")}/assets/i18n/`, ".json");
}

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
};

@NgModule({
    bootstrap: [AppComponent],
    declarations: [
        AppComponent,
        LoginComponent,
        SafePipe,
        DisplayUsernamesPipe,
        DashboardComponent,
        UsersComponent,
        ChatComponent,
        NotificationsComponent,
        CalendarComponent,
        SortableHeader,
        ProjectsComponent,
        FilesComponent,
        TemplatesComponent,
        SettingsComponent,
        NavbarComponent,
        SidebarComponent,
        ChatMessagesComponent,
        PickerModalComponent,
        FilePickerModalComponent,
        ShortWhenPipe,
        TruncatePipe,
        DateAgoPipe,
        CallComponent,
        ToIconPipe,
        MessagesAreaComponent,
        MessageBoxComponent,
        DoneComponent,
        ImageEditorComponent,
        AddImageComponent,
        FileUploadComponent,
        TourComponent,
        UpdaterComponent,
        TutorialsComponent,
        TutorialComponent,
        EditTutorialComponent,
        DiffPipe,
        ShareComponent,
    ],
    entryComponents: [
        PickerModalComponent,
        FilePickerModalComponent,
    ],
    imports: [
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        NgxAdvancedImageEditorModule,
        AngularFireMessagingModule,
        NgxOnlyOfficeModule,
        TreeViewModule,
        UiSwitchModule.forRoot({}),
        AngularFireModule.initializeApp(environment),
        RouterModule.forRoot(routes, { useHash: true, enableTracing: false }),
        ContextMenuModule.forRoot({
            useBootstrap4: true,
        }),
        BrowserAnimationsModule,
        DashboardLayoutModule,
        PerfectScrollbarModule,
        BrowserModule,
        EditorModule,
        MarkdownModule.forRoot(),
        TabModule,
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
        NgxExtendedPdfViewerModule,
        ToastrModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                deps: [HttpClient],
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
            },
        }),
    ],
    providers: [
        Location,
        NavbarService,
        PushService,
        DatePipe,
        TinyConfigService,
        MarkdownService,
        {
            provide: LOCALE_ID,
            useValue: `${environment.defaultLanguage}-${environment.defaultLanguage.toUpperCase}`,
        },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: RenewJwtTokenInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
        },
    ],
})
export class AppModule { }
