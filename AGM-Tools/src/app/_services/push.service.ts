import { Injectable } from "@angular/core";
import { AngularFireMessaging } from "@angular/fire/messaging";
import { DeviceDetectorService } from "ngx-device-detector";
import { RemoteService } from "./remote.service";
import { ElectronService } from "./electron.service";

@Injectable()
export class PushService {
    constructor(
        private angularFireMessaging: AngularFireMessaging,
        private remoteService: RemoteService,
        private electronService: ElectronService,
        private deviceDetectorService: DeviceDetectorService,
    ) {
        /* this.angularFireMessaging.messaging.subscribe(
            (messaging) => {
                messaging.onMessage = messaging.onMessage.bind(messaging);
                messaging.onTokenRefresh = messaging.onTokenRefresh.bind(messaging);
                messaging.setBackgroundMessageHandler = () => new Promise(() => undefined);
            },
        ); */
    }

    public init() {
        // only that ts of vscode doesn't complain, because it won't parse the .tns file...
    }

    // eslint-disable-next-line
    public updateToken(_, token: string) {
        if ((window as any).loggedIn) {
            this.remoteService.getNoCache("post", "push/devices", {
                token,
                software: this.electronService.isElectron ? "Electron" : this.deviceDetectorService.browser,
                os: this.deviceDetectorService.os,
                device: this.deviceDetectorService.isDesktop() ? "Desktop" : this.deviceDetectorService.isMobile() ? "Mobile" : this.deviceDetectorService.isTablet() ? "Tablet" : "Unknown",
            }).subscribe(() => {
                //
            });
        }
    }

    public requestPermission(userId) {
        this.angularFireMessaging.requestToken.subscribe(
            (token) => {
                // eslint-disable-next-line no-console
                console.log("token ", token);
                this.updateToken(userId, token);
            },
            (err) => {
                // eslint-disable-next-line no-console
                console.error("Unable to get permission to notify.", err);
            },
        );
    }
    public receiveMessage() {
        this.angularFireMessaging.messages.subscribe(
            (payload) => {
                // eslint-disable-next-line no-console
                console.log("new message received. ", payload);
            },
        );
    }
}
