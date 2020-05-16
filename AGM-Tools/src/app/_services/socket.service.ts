import { Injectable } from "@angular/core";
import * as socketIO from "socket.io-client";
import { BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";
import { AlertService } from "./alert.service";
import { EnvironmentService } from "./environment.service";

@Injectable()
export class SocketService {
    public socket: SocketIOClient.Socket;
    public socketAvailable: BehaviorSubject<boolean> = new BehaviorSubject(false);
    callOfferData: any;
    constructor(
        private alertService: AlertService,
        private router: Router,
        private environmentService: EnvironmentService,
    ) { }

    public init(token) {
        this.socket = socketIO(`${this.environmentService.environment.apiUrl}live`);
        this.socket.emit("test", "servus!");
        this.socket.on("connect", () => {
            this.socketAvailable.next(true);
            this.socket.emit("login", { token });
        });
        this.socket.on("failure", (msg) => {
            this.alertService.error(msg);
        });
        this.socket.on("call-made", (data) => {
            if (!this.callOfferData) {
                // eslint-disable-next-line
                if(confirm("Call made from " + data.user.username + ". Click yes to accept it, no to decline.")) {
                    this.callOfferData = data;
                    this.router.navigate(["call", "receive"]);
                }
            }
        });
    }
}
