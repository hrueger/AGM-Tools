import {
    NgModule,
    NO_ERRORS_SCHEMA,
    PlatformRef,
    LOCALE_ID
} from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppComponent } from "./app.component";
import { DashboardComponent } from "./_components/dashboard/dashboard.component";
import { LoginComponent } from "./_components/login/login.component";
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
import { NativeScriptUISideDrawerModule } from "nativescript-ui-sidedrawer/angular";
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";
import { NativeScriptUICalendarModule } from "nativescript-ui-calendar/angular";
import { NativeScriptUIChartModule } from "nativescript-ui-chart/angular";
import { NativeScriptUIDataFormModule } from "nativescript-ui-dataform/angular";
import { NativeScriptUIGaugeModule } from "nativescript-ui-gauge/angular";
import { AvatarModule } from "ngx-avatar";
import { NavbarService } from "./_services/navbar.service";
import { ShortWhenPipe } from "./_pipes/short-when.pipe";
import { registerLocaleData } from "@angular/common";
import localeDe from "@angular/common/locales/de";
import { ChatMessagesComponent } from "./_components/chat-messages/chat-messages.component";
import * as platform from "tns-core-modules/platform";
import { MessagesAreaComponent } from "./_components/chat-messages/messages-area/messages-area.component";
import { MessageBoxComponent } from "./_components/chat-messages/message-box/message-box.component";
import { JwtInterceptor } from "./_helpers/jwt.interceptor";
import { ErrorInterceptor } from "./_helpers/error.interceptor";
import { DoneComponent } from "./_components/done/done.component";
registerLocaleData(localeDe);
import { registerElement } from "nativescript-angular/element-registry";
import { Video } from "nativescript-videoplayer";
registerElement("VideoPlayer", () => Video);
import { PDFView } from "nativescript-pdf-view";
registerElement("PDFView", () => PDFView);
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { routes } from "./app.routes";
import { FormBuilder } from "@angular/forms";
import { ModalDialogService } from "nativescript-angular/modal-dialog";
import { NewUserModalComponent } from "./_components/_modals/new-user.modal.tns";
import { EditUserModalComponent } from "./_components/_modals/edit-user.modal.tns";
import { NewNotificationModalComponent } from "./_components/_modals/new-notification.modal.tns";
import { TruncatePipe } from "./_pipes/truncate.pipe";
import { ToIconPipe } from "./_pipes/ToIcon.pipe";
import { ModalDatetimepicker } from "nativescript-modal-datetimepicker"
import { NewCalendarEventModalComponent } from "./_components/_modals/new-calendar-event.modal.tns";
import { NewProjectModalComponent } from "./_components/_modals/new-project.modal.tns";
import { EmojiModule } from './_components/ns-emojipicker/emoji/emoji.module';
import { PickerModule } from './_components/ns-emojipicker/picker/picker.module';

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
        SidebarComponent,
        ShortWhenPipe,
        TruncatePipe,
        ChatMessagesComponent,
        MessagesAreaComponent,
        MessageBoxComponent,
        DoneComponent,
        NewUserModalComponent,
        EditUserModalComponent,
        NewNotificationModalComponent,
        NewCalendarEventModalComponent,
        NewProjectModalComponent
    ],
    imports: [
        NativeScriptModule,
        NativeScriptRouterModule.forRoot(routes),
        NativeScriptHttpClientModule,
        NativeScriptFormsModule,
        NativeScriptUISideDrawerModule,
        NativeScriptUIListViewModule,
        NativeScriptUICalendarModule,
        NativeScriptUIChartModule,
        NativeScriptUIDataFormModule,
        NativeScriptUIGaugeModule,
        AvatarModule,
        PickerModule,
        EmojiModule,
    ],
    providers: [
        FormBuilder,
        NavbarService,
        ModalDialogService,
        ModalDatetimepicker,
        PlatformRef,
        ModalDatetimepicker,
        ToIconPipe,
        { provide: "platform", useValue: platform },
        {
            provide: LOCALE_ID,
            useValue: "de-DE"
        },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA],
    entryComponents: [NewUserModalComponent, EditUserModalComponent, NewNotificationModalComponent, NewCalendarEventModalComponent, NewProjectModalComponent],
})
export class AppModule { }
