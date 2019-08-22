import { Injectable } from "@angular/core";
import { LocalNotifications } from "nativescript-local-notifications";
import { Message, messaging } from "nativescript-plugin-firebase/messaging";
import * as applicationSettings from "tns-core-modules/application-settings";
import * as platform from "tns-core-modules/platform";
import { alert, confirm } from "tns-core-modules/ui/dialogs";
import { RemoteService } from "./remote.service";

const getCircularReplacer = () => {
    const seen = new WeakSet<any>();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};

@Injectable()
export class FirebaseService {
    private static APP_REGISTERED_FOR_NOTIFICATIONS = "APP_REGISTERED_FOR_NOTIFICATIONS";

    constructor(private remoteService: RemoteService) { }

    public init() {
        applicationSettings.clear();
        if (!applicationSettings.getBoolean(FirebaseService.APP_REGISTERED_FOR_NOTIFICATIONS, false)) {
            this.doRegisterPushHandlers();
            this.doRequestConsent(() => {
                LocalNotifications.hasPermission().then((result) => {
                    if (!result) {
                        LocalNotifications.requestPermission().then((res) => {
                            if (res) {
                                applicationSettings.setBoolean(FirebaseService.APP_REGISTERED_FOR_NOTIFICATIONS, true);
                                this.doRegisterForPushNotifications();
                            }
                        });
                    } else {
                        applicationSettings.setBoolean(FirebaseService.APP_REGISTERED_FOR_NOTIFICATIONS, true);
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
                alert(">>>>>>>>>>>>>>>>>>>Wie kommt die hier raus???" + message);
            },
        ).then(() => {
            // tslint:disable-next-line: no-console
            console.log("Added addOnMessageReceivedCallback");
        }, (err) => {
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
                // tslint:disable-next-line: no-console
                console.log(">>>> Push message received", message);
                console.log(message.data);
                LocalNotifications.schedule([{
                    at: new Date(new Date().getTime() + (1 * 50)),
                    badge: 1,
                    body: message.body,
                    id: 1,
                    title: message.title,
                    actions: [{
                        id: "answer",
                        type: "input",
                        title: "Antworten",
                        placeholder: "Nachricht",
                        submitLabel: "Senden",
                        launch: false,
                        editable: true,
                        // choices: ["Red", "Yellow", "Green"] // TODO Android only, but yet to see it in action
                    }],
                    // tslint:disable-next-line: no-empty
                }]).then(() => { },
                    (error) => {
                        // tslint:disable-next-line: no-console
                        console.log("scheduling error: " + error);
                    });
                LocalNotifications.addOnMessageReceivedCallback((data) => {
                    alert(JSON.stringify({
                        message: `id: '${data.id}', title: '${data.title}'.`,
                        okButtonText: "Ok, thanks for the info.",
                        title: "Local Notification received",
                    }));
                });
            },

            showNotifications: true,
            showNotificationsWhenInForeground: false,
        })
            // tslint:disable-next-line: no-console
            .catch((err) => console.log(">>>> Failed to register for push notifications"));
    }

}
