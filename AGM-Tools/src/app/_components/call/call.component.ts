import { Component, HostListener } from "@angular/core";
import {
    OpenVidu, Publisher, Session, StreamEvent, StreamManager, Subscriber,
} from "openvidu-browser";
import { RemoteService } from "../../_services/remote.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { UserModel } from "./user-model";
import { AlertService } from "../../_services/alert.service";

interface Device {
    label: string;
    device: string;
    type: string;
}

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
    private mySessionId: string;
    public mainStreamManager: StreamManager;

    cameras: Device[] = [{ label: "None", device: null, type: "" }];
    microphones: Device[] = [{ label: "None", device: null, type: "" }];
    screenActive: "None" | "Screen" = "None";
    camValue: Device;
    micValue: Device;
    isVideoActive = true;
    isAudioActive = true;
    isScreenShareActive = false;
    volumeValue = 0;

    localUsers: UserModel[] = [];
    private userCamDeleted: UserModel;

    constructor(private remoteService: RemoteService, private alertService: AlertService,
        private authService: AuthenticationService) { }

    public ngOnInit() {
        this.mySessionId = "SessionA";
        this.OV = new OpenVidu();
        if (!localStorage.debug) {
            this.OV.enableProdMode();
        }
        this.localUsers.push(new UserModel());
        this.initPublisher().then((publisher) => {
            this.setDevicesValue(publisher);
        // eslint-disable-next-line no-console
        }).catch((error) => console.log(error));
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
                    for (let i = 0; i < this.localUsers.length; i++) {
                        this.destroyPublisher(i);
                    }
                    this.initPublisher().then((publisher) => {
                        this.session.publish(publisher);

                        this.mainStreamManager = publisher;
                        this.publisher = publisher;
                    });
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

    toggleCam(value) {
        this.isVideoActive = value;
        if (this.localUsers.length === 2) {
            this.destroyPublisher(0);
            this.userCamDeleted = this.localUsers.shift();
            this.setAudio(this.isAudioActive);
            this.subscribeToVolumeChange(this.localUsers[0].getStreamManager() as Publisher);
        } else if (this.localUsers[0].isScreen()) {
            this.setAudio(false);
            (this.localUsers[0].getStreamManager() as Publisher).off("streamAudioVolumeChange");
            this.localUsers.unshift(this.userCamDeleted);
            this.initPublisher();
        } else {
            this.localUsers[0].setVideoActive(this.isVideoActive);
            (this.localUsers[0].getStreamManager() as Publisher).publishVideo(this.isVideoActive);
        }
    }

    camChanged(label: string) {
        const initPublisherRequired = this.camValue.label !== "None" && label !== "None";
        const option = this.cameras.filter((opt: Device) => opt.label === label)[0];
        this.camValue = option;
        this.isVideoActive = this.camValue.label !== "None";
        if (this.localUsers[0].isLocal()) {
            this.localUsers[0].setVideoActive(this.isVideoActive);
            (this.localUsers[0].getStreamManager() as Publisher).publishVideo(this.isVideoActive);
            if (initPublisherRequired) {
                this.launchNewPublisher(0);
            }
        } else {
            this.localUsers.unshift(this.userCamDeleted);
            this.initPublisher();
        }
    }

    toggleScreenShare(value) {
        if (this.isScreenShareActive) {
            if (this.localUsers[0].isScreen()) {
                this.localUsers.unshift(this.userCamDeleted);
                this.initPublisher();
            }
            this.destroyPublisher(1);
            this.localUsers.pop();
            this.localUsers[0].setScreenShareActive(false);
            this.screenActive = "None";
            this.isScreenShareActive = value;
            this.localUsers[0].setScreenShareActive(this.isScreenShareActive);
        } else {
            this.initScreenPublisher();
        }
    }

    toggleMic(value) {
        this.isAudioActive = value;
        this.localUsers.forEach((user) => {
            user.setAudioActive(this.isAudioActive);
            (user.getStreamManager() as Publisher).publishAudio(this.isAudioActive);
        });
    }

    micChanged(label: string) {
        const initPublisherRequired = this.micValue.label !== "None" && label !== "None";
        const option = this.microphones.filter((opt: Device) => opt.label === label)[0];
        this.micValue = option;
        this.isAudioActive = this.micValue.label !== "None";
        this.localUsers[0].setAudioActive(this.isAudioActive);
        this.localUsers.forEach((user) => {
            (user.getStreamManager() as Publisher).publishAudio(this.isAudioActive);
        });
        if (initPublisherRequired) {
            this.launchNewPublisher(0);
        }
    }

    subscribeToVolumeChange(publisher: Publisher) {
        publisher.on("streamAudioVolumeChange", (event: any) => {
            if (this.isAudioActive) {
                this.volumeValue = 100 - Math.round(Math.abs(event.value.newValue));
            } else if (this.volumeValue != 0) {
                this.volumeValue = 0;
            }
        });
    }

    public updateVolumeColor(): string {
        if (this.volumeValue <= 50) {
            return "success";
        }
        if (this.volumeValue <= 80) {
            return "warning";
        }
        return "danger";
    }

    public call() {
        this.localUsers.forEach((user) => {
            user.getStreamManager().off("streamAudioVolumeChange");
        });
        // this.join.emit({ localUsers: this.localUsers, sessionId: this.mySessionId });
        this.joinSession();
    }

    public close() {
        this.localUsers.forEach((user, index) => {
            this.destroyPublisher(index);
        });
        this.localUsers = [];
    }

    private setDevicesValue(publisher: Publisher) {
        this.OV.getDevices().then((devices: any) => {
            const defaultDeviceId = publisher.stream.getMediaStream()
                .getVideoTracks()[0].getSettings().deviceId;
            devices.forEach((device: any) => {
                if (device.kind === "audioinput") {
                    this.microphones.push({ label: device.label, device: device.deviceId, type: "" });
                } else {
                    const element = { label: device.label, device: device.deviceId, type: "" };
                    if (device.deviceId === defaultDeviceId) {
                        element.type = "FRONT";
                        this.camValue = element;
                    } else {
                        element.type = "BACK";
                    }
                    this.cameras.push(element);
                }
            });

            this.camValue = this.camValue ? this.camValue : this.cameras[0];
            this.micValue = this.microphones[1] ? this.microphones[1] : this.microphones[0];
        // eslint-disable-next-line no-console
        }).catch((error) => console.error(error));
    }

    private initPublisher(): Promise<Publisher> {
        return new Promise((resolve, reject) => {
            this.OV.initPublisherAsync(undefined, {
                audioSource: this.micValue ? this.micValue.device : undefined,
                videoSource: this.camValue ? this.camValue.device : undefined,
                publishAudio: this.isAudioActive,
                publishVideo: this.isVideoActive,
                mirror: this.camValue && this.camValue.type === "FRONT",
            }).then((publisher: Publisher) => {
                this.subscribeToVolumeChange(publisher);
                this.localUsers[0].setStreamManager(publisher);
                /* if (this.ovSettings.autopublish) {
                    this.accept();
                } */
                resolve(publisher);
            }).catch((error) => {
                this.alertService.error(`${error.message} - ${error.name}`);
                reject(error);
            });
        });
    }

    private initScreenPublisher() {
        const videoSource = navigator.userAgent.indexOf("Firefox") !== -1 ? "window" : "screen";
        const hasAudio = this.localUsers[0].isLocal()
            && this.localUsers[0].isVideoActive() ? false : this.isAudioActive;
        const publisherProperties = {
            videoSource,
            publishAudio: hasAudio,
            publishVideo: true,
            mirror: false,
        };

        this.OV.initPublisherAsync(undefined, publisherProperties)
            .then((publisher: Publisher) => {
                this.localUsers.push(new UserModel());
                this.localUsers[1].setStreamManager(publisher);
                this.localUsers[1].setScreenShareActive(true);
                this.localUsers[1].setAudioActive(hasAudio);
                this.localUsers[1].setType("screen");
                this.isScreenShareActive = !this.isScreenShareActive;
                this.screenActive = "Screen";
                this.localUsers[0].setScreenShareActive(this.isScreenShareActive);
                if (this.localUsers[0].isLocal() && !this.localUsers[0].isVideoActive()) {
                    this.setAudio(true);
                    this.destroyPublisher(0);
                    this.userCamDeleted = this.localUsers.shift();
                    this.subscribeToVolumeChange(publisher);
                }
            }).catch((error) => {
                if (error && error.name === "SCREEN_EXTENSION_NOT_INSTALLED") {
                    // eslint-disable-next-line no-alert
                    alert("Screen extension not installed!");
                } else {
                    // this.apiSrv.handlerScreenShareError(error);
                }
            });
    }

    private launchNewPublisher(index: number) {
        this.destroyPublisher(index);
        this.initPublisher();
    }

    private destroyPublisher(index: number) {
        (this.localUsers[index].getStreamManager() as Publisher).off("streamAudioVolumeChange");
        this.localUsers[index].getStreamManager().stream.disposeWebRtcPeer();
        this.localUsers[index].getStreamManager().stream.disposeMediaStream();
    }

    private setAudio(value: boolean) {
        this.localUsers[0].setAudioActive(value);
        ((this.localUsers[0].getStreamManager()) as Publisher).publishAudio(value);
    }
}
