import { Injectable } from "@angular/core";
import { AngularFireMessaging } from "@angular/fire/messaging";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class PushService {
    public currentMessage = new BehaviorSubject(null);

    constructor(
        private angularFireMessaging: AngularFireMessaging) {
        this.angularFireMessaging.messaging.subscribe(
            (messaging) => {
            messaging.onMessage = messaging.onMessage.bind(messaging);
            messaging.onTokenRefresh = messaging.onTokenRefresh.bind(messaging);
        },
    );
  }

  public init() {
    // only that ts of vscode doesnt complain, because it won't parse the .tns file...
  }

  public updateToken(userId, token) {
    // Update Token
  }

  public requestPermission(userId) {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        // tslint:disable-next-line: no-console
        console.log("token ", token);
        this.updateToken(userId, token);
      },
      (err) => {
        // tslint:disable-next-line: no-console
        console.error("Unable to get permission to notify.", err);
      },
    );
  }

  public receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        // tslint:disable-next-line: no-console
        console.log("new message received. ", payload);
        this.currentMessage.next(payload);
      });
  }
}
