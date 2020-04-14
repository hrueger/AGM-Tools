import { Component, HostListener } from "@angular/core";
import {
    OpenVidu, Publisher, Session, StreamEvent, StreamManager, Subscriber,
} from "openvidu-browser";
import { RemoteService } from "../../_services/remote.service";
import { AuthenticationService } from "../../_services/authentication.service";

@Component({
    selector: "app-call",
    styleUrls: ["./call.component.scss"],
    templateUrl: "./call.component.html",
})
export class CallComponent {
    public status: { type: string; currentStep: number; totalSteps: number; text: string } = {
        type: "primary",
        currentStep: 1,
        totalSteps: 1,
        text: "",
    };

    public OV: OpenVidu;
    public session: Session;
    public publisher: StreamManager;
    public subscribers: StreamManager[] = [];

    // Join form
    private mySessionId: string;
    private myUserName: string;

    // Main video of the page, will be 'publisher' or one of the 'subscribers',
    // updated by click event in UserVideoComponent children
    public mainStreamManager: StreamManager;

    constructor(private remoteService: RemoteService,
        private authService: AuthenticationService) { }

    public ngOnInit() {
        this.mySessionId = "SessionA";
        this.myUserName = `Participant${Math.floor(Math.random() * 100)}`;
    }

    @HostListener("window:beforeunload")
    public beforeunloadHandler() {
        // On window closed leave session
        this.leaveSession();
    }

    public ngOnDestroy() {
        // On component destroyed leave session
        this.leaveSession();
    }

    public joinSession() {
        this.OV = new OpenVidu();
        this.session = this.OV.initSession();

        this.session.on("streamCreated", (event: StreamEvent) => {
            const subscriber: Subscriber = this.session.subscribe(event.stream, undefined);
            this.subscribers.push(subscriber);
        });

        this.session.on("streamDestroyed", (event: StreamEvent) => {
            const index = this.subscribers.indexOf(event.stream.streamManager, 0);
            if (index > -1) {
                this.subscribers.splice(index, 1);
            }
        });

        this.getToken().then((token) => {
            const clientData = {
                id: this.authService.currentUserValue.id,
                username: this.authService.currentUserValue.username,
            };
            this.session.connect(token, { clientData })
                .then(() => {
                    const publisher: Publisher = this.OV.initPublisher(undefined, {
                        audioSource: undefined,
                        videoSource: undefined,
                        publishAudio: true,
                        publishVideo: true,
                        resolution: "640x480",
                        frameRate: 30,
                        insertMode: "APPEND",
                        mirror: false,
                    });

                    this.session.publish(publisher);

                    this.mainStreamManager = publisher;
                    this.publisher = publisher;
                })
                .catch((error) => {
                    // eslint-disable-next-line
                    alert("There was an error connecting to the session:" + error.code + " - " + error.message);
                });
        });
    }

    public leaveSession() {
        if (this.session) { this.session.disconnect(); }
        this.subscribers = [];
        delete this.publisher;
        delete this.session;
        delete this.OV;
    }

    private updateMainStreamManager(streamManager: StreamManager) {
        this.mainStreamManager = streamManager;
    }


    private getToken(): Promise<string> {
        return this.createSession(this.mySessionId).then(
            (sessionId) => this.createToken(sessionId),
        );
    }

    private createSession(sessionId) {
        return new Promise((resolve) => {
            this.remoteService.getNoCache("post", "call/session", {
                customSessionId: sessionId,
            }).subscribe((data) => {
                if (data) {
                    resolve(data.id);
                }
            });
        });
    }

    createToken(sessionId): Promise<string> {
        return new Promise((resolve) => {
            this.remoteService.getNoCache("post", "call/token", {
                session: sessionId,
            }).subscribe((data) => {
                if (data) {
                    resolve(data.token);
                }
            });
        });
    }
}
