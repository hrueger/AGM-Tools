import { Injectable, NgZone, ChangeDetectorRef, ApplicationRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { LocalNotifications } from "nativescript-local-notifications";
import { Message, messaging } from "nativescript-plugin-firebase/messaging";
import { Subject } from "rxjs";
import * as applicationSettings from "tns-core-modules/application-settings";
import { alert, confirm } from "tns-core-modules/ui/dialogs";
import { MessagesAreaComponent } from "../_components/chat-messages/messages-area/messages-area.component.tns";
import { RemoteService } from "./remote.service";

@Injectable({
    providedIn: MessagesAreaComponent,
})
export class PushService {
    private static APP_REGISTERED_FOR_NOTIFICATIONS = "APP_REGISTERED_FOR_NOTIFICATIONS";
    public newMesssageCallback: (body: string, fromMe: boolean) => void;
    private messageStorage: Message[] = [];

    constructor(private remoteService: RemoteService, private router: RouterExtensions, private zone: NgZone) { }

    public setNewMesssageCallback(cb: (body: string, fromMe: boolean) => any): void {
        this.newMesssageCallback = cb;
        console.log("Updated to ", cb);
    }

    public init() {
        const cb = this;
        LocalNotifications.addOnMessageReceivedCallback((data: any) => {
            const message = this.messageStorage[data.id];
            switch (data.channel) {
                case "newMessage":
                    if (data.event == "button") {
                        console.log("als gelesen markiert!");
                    } else if (data.event == "input") {
                        this.remoteService
                            .getNoCache("chatSendMessage", {
                                message: data.response,
                                rid: message.data.chatID,
                            })
                            .subscribe(() => {
                                console.log("Gesendet!");
                            });

                        console.log(cb);

                    } else {
                        // Angetippt
                        this.zone.run(() => {
                            this.router.navigate(["chat-messages", message.data.chatID]);
                        });
                    }
                    break;
                default:
                    console.log("unbekannte nachricht angetippt!");
            }

        });

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
        messaging.addOnMessageReceivedCallback(
            (message) => {
                this.messageRecieved(message);
            },
            // tslint:disable-next-line: no-empty
        ).then(() => { }, (err) => {
            // tslint:disable-next-line: no-console
            console.log("Failed to add addOnMessageReceivedCallback: " + err);
        });
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

    private messageRecieved(message: Message) {
        // tslint:disable-next-line: no-console
        console.log(">>>> Push message received", message);
        switch (message.data.action) {
            case "newMessage":
                this.messageStorage[this.handleNewChatMessage(message)] = message;
                break;
            case "calendarEvent":
                this.messageStorage[this.handleCalendarEventMessage(message)] = message;
                break;
            default:
                this.messageStorage[this.handleUnknownMessage(message)] = message;
                break;
        }
    }
    private handleUnknownMessage(message: Message): number {
        console.log("Method not implemented.");
        return 0;
    }
    private handleCalendarEventMessage(message: Message): number {
        throw new Error("Method not implemented.");
        return 0;
    }
    private handleNewChatMessage(message: Message): number {
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

}
