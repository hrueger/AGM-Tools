import { Injectable } from "@angular/core";
import { AuthenticationService } from "./authentication.service";

let OneSignal;

const url = "";

@Injectable()
export class OneSignalService {
    oneSignalInit; // to check if OneSignal is already initialized.
    oneSignalId: any; // store OneSignalId in localStorage

    constructor(private authService: AuthenticationService) {
        console.log("OneSignal Service Init", this.oneSignalInit);
    }

    // Call this method to start the onesignal process.
    public init() {
        this.oneSignalInit = localStorage.getItem("oneSignalInit");
        this.oneSignalId = localStorage.getItem("oneSignalInit");

        this.oneSignalInit
            ? console.log("Already Initialized")
            : this.addScript(
                  "https://cdn.onesignal.com/sdks/OneSignalSDK.js",
                  callback => {
                      console.log("OneSignal Script Loaded");
                      this.initOneSignal();
                  }
              );
    }

    addScript(fileSrc, callback) {
        const head = document.getElementsByTagName("head")[0];
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.onload = callback;
        script.src = fileSrc;
        head.appendChild(script);
    }

    initOneSignal() {
        OneSignal = window["OneSignal"] || [];
        console.log("Init OneSignal");
        OneSignal.push([
            "init",
            {
                appId: "69044d74-01cc-49f8-a32f-91ca715cbba3",
                autoRegister: true,
                allowLocalhostAsSecureOrigin: true,
                notifyButton: {
                    enable: false
                }
            }
        ]);
        console.log("OneSignal Initialized");
        this.checkIfSubscribed();
    }

    subscribe() {
        OneSignal.push(() => {
            console.log("Register For Push");
            OneSignal.push(["registerForPushNotifications"]);
            OneSignal.on("subscriptionChange", isSubscribed => {
                console.log(
                    "The user's subscription state is now:",
                    isSubscribed
                );
                this.listenForNotification();
                OneSignal.getUserId().then(userId => {
                    console.log("User ID is", userId);
                    localStorage.setItem("oneSignalId", userId);
                    this.updateLocalUserProfile();
                });
            });
        });
    }

    listenForNotification() {
        console.log("Initalize Listener");
        OneSignal.on("notificationDisplay", event => {
            console.log("OneSignal notification displayed:", event);
            this.listenForNotification();
        });
    }

    getUserID() {
        OneSignal.getUserId().then(userId => {
            console.log("User ID is", userId);
            localStorage.setItem("oneSignalId", userId);
        });
    }

    checkIfSubscribed() {
        OneSignal.push(() => {
            /* These examples are all valid */
            OneSignal.isPushNotificationsEnabled(
                isEnabled => {
                    if (isEnabled) {
                        console.log("Push notifications are enabled!");
                        this.getUserID();
                    } else {
                        console.log("Push notifications are not enabled yet.");
                        this.subscribe();
                    }
                },
                error => {
                    console.log("Push permission not granted");
                }
            );
        });
    }

    updateLocalUserProfile() {
        // Store OneSignal ID in your server for sending push notificatios.
    }

    updateTags() {
        let userId = this.authService.currentUserValue.id;
        OneSignal = window["OneSignal"] || [];
        OneSignal.sendTag("user_id", userId, tagsSent => {
            // Callback called when tags have finished sending
            console.log("OneSignal Tag Sent", tagsSent);
        });
    }
}
