import { Component, ElementRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketService } from "../../_services/socket.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { AlertService } from "../../_services/alert.service";

@Component({
    selector: "app-call",
    styleUrls: ["./call.component.scss"],
    templateUrl: "./call.component.html",
})
export class CallComponent {
    @ViewChild("localVideo") public localVideo: ElementRef;
    @ViewChild("remoteVideo") public remoteVideo: ElementRef;
    public remoteStream: any;
    public localStream: any;
    public localTracksAdded = false;
    public me: string;
    public connection: RTCPeerConnection;
    public isInitiator = false;
    public remoteIceCandidates = [];
    public inCall = false;
    public userToCall: number;
    public activeUsers = [];
    public isAlreadyCalling: boolean;
    public status: {
        type: string;
        currentStep: number;
        totalSteps: number;
        text: string;
    } = {
        type: "primary",
        currentStep: 1,
        totalSteps: 1,
        text: "",
    };
    public peerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302",
            },
            {
                urls: "turn:numb.viagenie.ca:3478",
                credential: "testertest",
                username: "testertest@tm.in-ulm.de",
            },
            {
                urls: "stun:numb.viagenie.ca:3478",
                credential: "testertest",
                username: "testertest@tm.in-ulm.de",
            },
            /* {
                urls: "turn:192.158.29.39:3478?transport=udp",
                credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
                username: "28224511:1379330808",
            },
            {
                urls: "turn:192.158.29.39:3478?transport=tcp",
                credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
                username: "28224511:1379330808",
            }, */
        ],
    });
    public incomingCall: any = undefined;

    public constructor(private route: ActivatedRoute,
        private socketService: SocketService,
        private alertService: AlertService,
        private router: Router,
        private authenticationService: AuthenticationService) { }

    public ngOnInit(): void {
        if (this.route.snapshot.url.join("/").indexOf("call/receive") != -1) {
            // we are at that url
            if (this.socketService.callOfferData) {
                // it is an incoming call
                this.incomingCall = this.socketService.callOfferData;
                this.status = {
                    currentStep: 1,
                    totalSteps: 3,
                    text: "Waiting for Camera permissions",
                    type: "success",
                };
                this.init(false);
            } else {
                this.router.navigate(["chat"]);
            }
        } else {
            // not an incoming call, trying to call someone
            this.status = {
                currentStep: 1,
                totalSteps: 5,
                text: "Waiting for connection",
                type: "success",
            };
            this.socketService.socketAvailable.subscribe((isAvailable) => {
                if (isAvailable == true) {
                    this.userToCall = parseInt(this.route.snapshot.params.id);
                    if (this.route.snapshot.params.chatType == "user") {
                        this.init();
                    } else if (this.route.snapshot.params.chatType == "project") {
                        this.init();
                    } else {
                    // Strange
                    }
                }
            });
        }
    }
    public init(setupSocketConnectionListeners = true) {
        navigator.mediaDevices.getUserMedia(
            { video: true, audio: true },
        ).then(
            (s) => {
                this.localVideo.nativeElement.srcObject = s;
                s.getTracks().forEach((track) => this.peerConnection.addTrack(track, s));
                this.peerConnection.ontrack = ({ streams: [stream] }) => {
                    this.remoteVideo.nativeElement.srcObject = stream;
                };
                this.socketService.socket.on("call.error", (error) => {
                    this.alertService.error(error);
                    this.status.text = error;
                    this.status.currentStep = this.status.totalSteps;
                    this.status.type = "danger";
                });
                this.socketService.socket.on("call-made", async (data) => {
                    this.callMade(data);
                });
                this.socketService.socket.on("answer-made", async (data) => {
                    await this.peerConnection.setRemoteDescription(
                        new RTCSessionDescription(data.answer),
                    );
                    if (!this.isAlreadyCalling) {
                        this.callUser();
                        this.isAlreadyCalling = true;
                    }
                });
                if (setupSocketConnectionListeners) {
                    this.callUser();
                } else {
                    this.status.text = "Accepting offer";
                    this.status.currentStep = 2;
                    this.callMade(this.incomingCall);
                }
            },
            () => {
                //
            },
        );
    }

    private async callMade(data: any) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(new RTCSessionDescription(answer));
        // answer.sdp = answer.sdp.replace("a=setup:active", "a=setup:passive");
        this.socketService.socket.emit("make-answer", {
            answer,
            to: data.socket,
        });
    }

    public async callUser() {
        this.status.text = "call user and make offer";
        this.status.currentStep = 2;
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(new RTCSessionDescription(offer));

        this.socketService.socket.emit("call-user", {
            offer,
            to: this.userToCall,
        });
    }
}
