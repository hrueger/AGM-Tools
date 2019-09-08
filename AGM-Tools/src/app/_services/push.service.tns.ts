import { ApplicationRef, ChangeDetectorRef, Injectable, NgZone } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { LocalNotifications } from "nativescript-local-notifications";
import { Message, messaging } from "nativescript-plugin-firebase/messaging";
import { Subject } from "rxjs";
import * as applicationSettings from "tns-core-modules/application-settings";
import { alert, confirm } from "tns-core-modules/ui/dialogs";
import { MessagesAreaComponent } from "../_components/chat-messages/messages-area/messages-area.component.tns";
import { RemoteService } from "./remote.service";

@Injectable({
    providedIn: "root",
})
export class PushService {
    private static APP_REGISTERED_FOR_NOTIFICATIONS = "APP_REGISTERED_FOR_NOTIFICATIONS";

    public chatActionSubject = new Subject<any>();
    public calendarActionSubject = new Subject<any>();
    private MESSAGE_CACHE_PREFIX: string = "MESSAGECACHE_";

    constructor(private remoteService: RemoteService, private router: RouterExtensions, private zone: NgZone) { }

    public getChatActions() {
        return this.chatActionSubject.asObservable();
    }
    public getCalendarActions() {
        return this.calendarActionSubject.asObservable();
    }

    public reregisterCallbacks() {
        this.registerOnClickCallback();
        this.registerOnReceivedCallback();
        this.registerOnReceivedCallback2();
    }
    public init() {
        this.registerOnClickCallback();

        this.doRegisterPushHandlers();
        this.doRegisterForPushNotifications();
        if (!applicationSettings.getBoolean(PushService.APP_REGISTERED_FOR_NOTIFICATIONS, false)) {
            this.doRequestConsent(() => {
                LocalNotifications.hasPermission().then((result) => {
                    if (!result) {
                        LocalNotifications.requestPermission().then((res) => {
                            if (res) {
                                applicationSettings.setBoolean(PushService.APP_REGISTERED_FOR_NOTIFICATIONS, true);
                                this.doRegisterForPushNotifications();
                            }
                        });
                    } else {
                        applicationSettings.setBoolean(PushService.APP_REGISTERED_FOR_NOTIFICATIONS, true);
                        this.doRegisterForPushNotifications();
                    }
                });
            });
        }

    }

    public doRequestConsent(cb: any): void {
        confirm({
            cancelButtonText: "Vielleicht später",
            message: "Ist das in Ordnung? Wir werden dir keinen Spam schicken. Versprochen!",
            okButtonText: "Ja, gerne",
            title: "Bleibe über Pushnachrichten immer auf dem Laufenden.",
        }).then((pushAllowed) => {
            if (pushAllowed) {
                cb();
            }
        });
    }

    public doGetCurrentPushToken(): void {
        messaging.getCurrentPushToken()
            .then((token) => {
                alert({
                    message: (!token ? "Not received yet (note that on iOS this does not work on a simulator)" :
                        token + ("\n\nSee the console.log if you want to copy-paste it.")),
                    okButtonText: "OK, thx",
                    title: "Current Push Token",
                });
            })
            // tslint:disable-next-line: no-console
            .catch((err) => console.log("Error in doGetCurrentPushToken: " + err));
    }

    public doRegisterPushHandlers(): void {
        // note that this will implicitly register for push notifications,
        // so there's no need to call 'registerForPushNotifications'
        messaging.addOnPushTokenReceivedCallback(
            (token) => {
                // tslint:disable-next-line: no-console
                console.log("Firebase plugin received a push token: " + token);
                this.remoteService.getNoCache("updatePushToken", { pushToken: token }).subscribe();
            },
        );
        this.registerOnReceivedCallback();
    }

    public doUnregisterForPushNotifications(): void {
        messaging.unregisterForPushNotifications().then(
            () => {
                alert({
                    message: "If you were registered, that is.",
                    okButtonText: "Got it, thanks!",
                    title: "Unregistered",
                });
            });
    }

    public doRegisterForPushNotifications(): void {
        this.registerOnReceivedCallback2();
    }

    private messageRecieved(message: Message) {
        switch (message.data.action) {
            case "newMessage":
                applicationSettings.setString(this.MESSAGE_CACHE_PREFIX +
                    this.handleNewChatMessage(message), JSON.stringify(message));
                break;
            case "calendarEvent":
                applicationSettings.setString(this.MESSAGE_CACHE_PREFIX +
                    this.handleCalendarEventMessage(message), JSON.stringify(message));
                break;
            default:
                applicationSettings.setString(this.MESSAGE_CACHE_PREFIX +
                    this.handleUnknownMessage(message), JSON.stringify(message));
                break;
        }
    }

    private handleUnknownMessage(message: Message): number {
        const id = Math.round(Math.random() * 10000);
        LocalNotifications.schedule([{
            at: new Date(new Date().getTime() + (1 * 50)),
            badge: 1,
            body: message.body,
            channel: "unknownNotification",
            id,
            title: message.title,
            // tslint:disable-next-line: no-empty
        }]).then(() => { },
            (error) => {
                // tslint:disable-next-line: no-console
                console.log("scheduling error: " + error);
            });
        return id;
    }

    private handleCalendarEventMessage(message: Message): number {
        const id = Math.round(Math.random() * 10000);
        LocalNotifications.schedule([{
            at: new Date(new Date().getTime() + (1 * 50)),
            badge: 1,
            body: message.body,
            channel: "calendarEvent",
            id,
            title: message.title,
            // tslint:disable-next-line: no-empty
        }]).then(() => { },
            (error) => {
                // tslint:disable-next-line: no-console
                console.log("scheduling error: " + error);
            });
        return id;
    }

    private handleNewChatMessage(message: Message): number {
        this.chatActionSubject.next({
            action: "newMessage",
            data: message,
            fromMe: false,
        });
        const id = Math.round(Math.random() * 10000);
        LocalNotifications.schedule([{
            actions: [{
                id: "markAsRead",
                title: "Als gelesen markieren",
                type: "button",
            }, {
                editable: true,
                id: "answer",
                launch: false,
                placeholder: "Nachricht",
                submitLabel: "Senden",
                title: "Antworten",
                type: "input",
            }],
            at: new Date(new Date().getTime() + (1 * 50)),
            badge: 1,
            body: message.body,
            channel: "newMessage",
            id,
            title: message.title,
            // tslint:disable-next-line: no-empty
        }]).then(() => { },
            (error) => {
                // tslint:disable-next-line: no-console
                console.log("scheduling error: " + error);
            });
        return id;

    }

    private registerOnClickCallback() {
        const that = this;
        LocalNotifications.addOnMessageReceivedCallback((data: any) => {
            const message = JSON.parse(applicationSettings.getString(that.MESSAGE_CACHE_PREFIX + data.id));
            switch (data.channel) {
                case "newMessage":
                    if (data.event == "button") {
                        that.chatActionSubject.next({
                            action: "markAsRead",
                            data: {
                                body: message,
                            },
                        });
                    } else if (data.event == "input") {
                        this.remoteService
                            .getNoCache("chatSendMessage", {
                                message: data.response,
                                rid: message.data.chatID,
                            })
                            .subscribe(() => {
                                that.chatActionSubject.next({
                                    action: "newMessage",
                                    data: {
                                        body: data.response,
                                    },
                                    fromMe: true,
                                });
                            });

                    } else {
                        // Angetippt
                        this.zone.run(() => {
                            this.router.navigate(["chat-messages", message.data.chatID]);
                        });
                    }
                    break;
                case "calendarEvent":
                    this.zone.run(() => {
                        this.router.navigate(["calendar"]);
                    });
                    break;
                default:
                    // tslint:disable-next-line: no-console
                    console.log("Unbekannte nachricht angetippt!");
                    this.zone.run(() => {
                        this.router.navigate(["dashboard"]);
                    });
            }

        });
    }

    private registerOnReceivedCallback() {
        messaging.addOnMessageReceivedCallback((message) => {
            this.messageRecieved(message);
        }).then(() => { /* */ }, (err) => {
            // tslint:disable-next-line: no-console
            console.log("Failed to add addOnMessageReceivedCallback: " + err);
        });
    }

    private registerOnReceivedCallback2() {
        messaging.registerForPushNotifications({
            onPushTokenReceivedCallback: (token: string): void => {
                // tslint:disable-next-line: no-console
                console.log(">>>> Firebase plugin received a push token: " + token);
                this.remoteService.getNoCache("updatePushToken", { pushToken: token }).subscribe();
            },
            onMessageReceivedCallback: (message: Message) => {
                this.messageRecieved(message);
            },
            showNotifications: true,
            showNotificationsWhenInForeground: false,
        })
            // tslint:disable-next-line: no-console
            .catch((err) => console.log(">>>> Failed to register for push notifications"));
    }
}
