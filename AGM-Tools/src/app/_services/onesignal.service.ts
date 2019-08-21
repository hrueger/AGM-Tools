import { Injectable } from "@angular/core";
import { AuthenticationService } from "./authentication.service";

let OneSignal;

const url = "";

@Injectable()
export class OneSignalService {
    public oneSignalInit; // to check if OneSignal is already initialized.
    public oneSignalId: any; // store OneSignalId in localStorage

    constructor(private authService: AuthenticationService) {
        alert("OneSignal Service Init" + JSON.stringify(this.oneSignalInit));
    }

    // Call this method to start the onesignal process.
    public init() {
        this.oneSignalInit = localStorage.getItem("oneSignalInit");
        this.oneSignalId = localStorage.getItem("oneSignalInit");

        this.oneSignalInit
            ? alert("Already Initialized")
            : this.addScript(
                "https://cdn.onesignal.com/sdks/OneSignalSDK.js",
                (callback) => {
                    alert("OneSignal Script Loaded");
                    this.initOneSignal();
                },
            );
    }

    public addScript(fileSrc, callback) {
        const head = document.getElementsByTagName("head")[0];
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.onload = callback;
        script.src = fileSrc;
        head.appendChild(script);
    }

    public initOneSignal() {
        // @ts-ignore
        OneSignal = window.OneSignal || [];
        alert("Init OneSignal");
        OneSignal.push([
            "init",
            {
                allowLocalhostAsSecureOrigin: true,
                appId: "69044d74-01cc-49f8-a32f-91ca715cbba3",
                autoRegister: true,
                notifyButton: {
                    enable: false,
                },
            },
        ]);
        // console.log("OneSignal Initialized");
        this.checkIfSubscribed();
    }

    public subscribe() {
        OneSignal.push(() => {
            alert("Register For Push");
            OneSignal.push(["registerForPushNotifications"]);
            OneSignal.on("subscriptionChange", (isSubscribed) => {
                alert(
                    "The user's subscription state is now:" +
                    isSubscribed,
                );
                this.listenForNotification();
                OneSignal.getUserId().then((userId) => {
                    alert("User ID is" + userId);
                    localStorage.setItem("oneSignalId", userId);
                    this.updateLocalUserProfile();
                });
            });
        });
    }

    public listenForNotification() {
        alert("Initalize Listener");
        OneSignal.on("notificationDisplay", (event) => {
            alert("OneSignal notification displayed:" + event);
            this.listenForNotification();
        });
    }

    public getUserID() {
        OneSignal.getUserId().then((userId) => {
            alert("User ID is" + userId);
            localStorage.setItem("oneSignalId", userId);
        });
    }

    public checkIfSubscribed() {
        OneSignal.push(() => {
            /* These examples are all valid */
            OneSignal.isPushNotificationsEnabled(
                (isEnabled) => {
                    if (isEnabled) {
                        alert("Push notifications are enabled!");
                        this.getUserID();
                    } else {
                        alert("Push notifications are not enabled yet.");
                        this.subscribe();
                    }
                },
                (error) => {
                    alert("Push permission not granted");
                },
            );
        });
    }

    public updateLocalUserProfile() {
        // Store OneSignal ID in your server for sending push notificatios.
    }

    public updateTags() {
        const userId = this.authService.currentUserValue.id;
        // @ts-ignore
        OneSignal = window.OneSignal || [];
        OneSignal.sendTag("user_id", userId, (tagsSent) => {
            // Callback called when tags have finished sending
            alert("OneSignal Tag Sent" + tagsSent);
        });
    }
}
