import { registerLocaleData } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import {
    LOCALE_ID,
    NgModule,
    NO_ERRORS_SCHEMA,
    PlatformRef,
} from "@angular/core";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptUICalendarModule } from "nativescript-ui-calendar/angular";
import { NativeScriptUIChartModule } from "nativescript-ui-chart/angular";
import { NativeScriptUIDataFormModule } from "nativescript-ui-dataform/angular";
import { NativeScriptUIGaugeModule } from "nativescript-ui-gauge/angular";
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";
import { NativeScriptUISideDrawerModule } from "nativescript-ui-sidedrawer/angular";
import { AvatarModule } from "ngx-avatar";
import * as platform from "tns-core-modules/platform";
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
import { FilesComponent } from "./_components/files/files.component";
import { LoginComponent } from "./_components/login/login.component";
import { NavbarComponent } from "./_components/navbar/navbar.component";
import { NotificationsComponent } from "./_components/notifications/notifications.component";
import { ProjectsComponent } from "./_components/projects/projects.component";
import { SettingsComponent } from "./_components/settings/settings.component";
import { SidebarComponent } from "./_components/sidebar/sidebar.component";
import { TemplatesComponent } from "./_components/templates/templates.component";
import { UsersComponent } from "./_components/users/users.component";
import { ErrorInterceptor } from "./_helpers/error.interceptor";
import { ShortWhenPipe } from "./_pipes/short-when.pipe";
import { NavbarService } from "./_services/navbar.service";
import { AppComponent } from "./app.component";
registerLocaleData(localeDe);
import { registerElement } from "nativescript-angular/element-registry";
import { Video } from "nativescript-videoplayer";
registerElement("VideoPlayer", () => Video);
import { PDFView } from "nativescript-pdf-view";
registerElement("PDFView", () => PDFView);
registerElement("PullToRefresh", () => require("@nstudio/nativescript-pulltorefresh").PullToRefresh);
import { Carousel, CarouselItem } from "nativescript-carousel";
registerElement("Carousel", () => Carousel);
registerElement("CarouselItem", () => CarouselItem);
import { FormBuilder } from "@angular/forms";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { EmojiPickerModule } from "nativescript-emoji-picker/angular";
import { LetterAvatarModule } from "nativescript-letter-avatar/angular";
import { ModalDatetimepicker } from "nativescript-modal-datetimepicker";
import { ContactPickerComponent } from "./_components/_modals/contact-picker.modal.tns";
import { EditUserModalComponent } from "./_components/_modals/edit-user.modal.tns";
import { NewCalendarEventModalComponent } from "./_components/_modals/new-calendar-event.modal.tns";
import { NewNotificationModalComponent } from "./_components/_modals/new-notification.modal.tns";
import { NewProjectModalComponent } from "./_components/_modals/new-project.modal.tns";
import { NewUserModalComponent } from "./_components/_modals/new-user.modal.tns";
import { EditTutorialComponent } from "./_components/edit-tutorial/edit-tutorial.component";
import { TourComponent } from "./_components/tour/tour.component";
import { TutorialComponent } from "./_components/tutorial/tutorial.component";
import { TutorialsComponent } from "./_components/tutorials/tutorials.component";
import { UpdaterComponent } from "./_components/updater/updater.component";
import { ToIconPipe } from "./_pipes/ToIcon.pipe";
import { TruncatePipe } from "./_pipes/truncate.pipe";
import { PushService } from "./_services/push.service";
import { routes } from "./app.routes";
registerElement("ImageSwipe", () => require("nativescript-image-swipe/image-swipe").ImageSwipe);
registerElement("AnimatedCircle", () => require("nativescript-animated-circle").AnimatedCircle);
import { JwtModule } from "@auth0/angular-jwt";
import { getString, setString } from "tns-core-modules/application-settings";

export function getJWT() {
    return getString("jwt_token", "");
}

@NgModule({
    bootstrap: [AppComponent],
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
        ContactPickerComponent,
        NewNotificationModalComponent,
        NewCalendarEventModalComponent,
        NewProjectModalComponent,
        TourComponent,
        UpdaterComponent,
        TutorialsComponent,
        TutorialComponent,
        EditTutorialComponent,
    ],
    entryComponents: [
        NewUserModalComponent,
        EditUserModalComponent,
        NewNotificationModalComponent,
        NewCalendarEventModalComponent,
        NewProjectModalComponent,
        ContactPickerComponent,
    ],
    imports: [
        NativeScriptModule,
        NativeScriptRouterModule.forRoot(routes),
        JwtModule.forRoot({
            config: {
                tokenGetter: getJWT,
            },
        }),
        NativeScriptHttpClientModule,
        NativeScriptFormsModule,
        NativeScriptUISideDrawerModule,
        NativeScriptUIListViewModule,
        NativeScriptUICalendarModule,
        NativeScriptUIChartModule,
        NativeScriptUIDataFormModule,
        NativeScriptUIGaugeModule,
        LetterAvatarModule,
        AvatarModule,
        EmojiPickerModule,
    ],
    providers: [
        FormBuilder,
        NavbarService,
        PushService,
        ModalDatetimepicker,
        PlatformRef,
        ModalDatetimepicker,
        ToIconPipe,
        { provide: "platform", useValue: platform },
        {
            provide: LOCALE_ID,
            useValue: "de-DE",
        },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
    schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule { }
