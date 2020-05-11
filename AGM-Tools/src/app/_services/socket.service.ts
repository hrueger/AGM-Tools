import { Injectable } from "@angular/core";
import * as socketIO from "socket.io-client";
import { BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { AlertService } from "./alert.service";

@Injectable()
export class SocketService {
    public socket: SocketIOClient.Socket;
    public socketAvailable: BehaviorSubject<boolean> = new BehaviorSubject(false);
    callIncoming: any;
    constructor(private alertService: AlertService, private router: Router) {}

    public init(token) {
        this.socket = socketIO(`${environment.apiUrl}live`, { path: "./socket.io" });
        this.socket.on("connect", () => {
            this.socketAvailable.next(true);
            this.socket.emit("login", { token });
        });
        this.socket.on("failure", (msg) => {
            this.alertService.error(msg);
        });
        this.socket.on("incoming-call", (data) => {
            if (!this.callIncoming) {
                // eslint-disable-next-line
                if(confirm("Call made from " + data.user.username + ". Click yes to accept it, no to decline.")) {
                    this.callIncoming = data;
                    this.router.navigate(["call", "incoming", data.chatType, data.id, data.callType]);
                }
            }
        });
    }
}
