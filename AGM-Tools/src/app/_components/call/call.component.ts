import { Component, ElementRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as SocketIO from "socket.io-client";

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
    public socket: SocketIOClient.Socket = SocketIO.connect("http://localhost:3001", {
        transports: ["websocket"],
        upgrade: false,
    });
    public isInitiator = false;
    public remoteIceCandidates = [];
    public inCall = false;

    public constructor(private route: ActivatedRoute) { }
    public ngOnInit(): void {
        if (this.route.snapshot.params.chatType == "user") {
            this.call();
        } else if (this.route.snapshot.params.chatType == "project") {
            this.call();
        } else {
            // Strange
        }
    }

    public call(): void {
        this.me = this.getUUID();
        const iceServers: RTCIceServer[] = [];
        const turnServerOne: RTCIceServer = {
            credential: "28224511:1379330808",
            credentialType: "password",
            urls: ["turn:192.158.29.39:3478?transport=udp"],
            username: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        };
        const turnServerTwo: RTCIceServer = {
            credential: "28224511:1379330808",
            urls: ["turn:192.158.29.39:3478?transport=tcp"],
            username: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        };
        const turnServerThree: RTCIceServer = {
            credential: "webrtc@live.com",
            urls: ["turn:numb.viagenie.ca"],
            username: "muazkh",
        };
        iceServers.push(turnServerOne);
        iceServers.push(turnServerTwo);
        iceServers.push(turnServerThree);
        this.connection = new RTCPeerConnection();
        this.connection.onconnectionstatechange = (): void => {
            // eslint-disable-next-line no-console
            console.log("onconnectionstatechange", this.connection.iceConnectionState);
        };
        this.connection.ontrack = (event): void => {
            const stream = event.streams[0];
            // eslint-disable-next-line no-console
            console.log(`ontrack${stream}`);
            [this.remoteVideo.nativeElement.srcObject] = event.streams;
        };
        this.connection.onicecandidate = (event): void => {
            const { candidate } = event;
            if (!candidate) { return; }
            const object: any = {};
            object.from = this.me;
            object.sdp = candidate.candidate;
            // object.sdpMLineIndex, candidate.sdpMLineIndex;
            // object.sdpMid, candidate.sdpMid;
            // object.serverUrl, candidate.relatedAddress;
            this.socket.emit("iceCandidate", object);
            // eslint-disable-next-line no-console
            console.log(`setOnIceCandidateListener ${candidate}`);
        };
        this.init();
    }

    public getUUID(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c): string => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    public async init(): Promise<void> {
        this.socket.on("call:incoming", (args): void => {
            const object = args;
            const { from } = object;
            const session = object.sdp;
            const { to } = object;
            // eslint-disable-next-line no-console
            console.log(`${"call:incoming to: "}${to} from: ${from}`);
            if (to.indexOf(this.me) > -1) {
                if (this.localStream != null) {
                    for (const track of this.localStream.getVideoTracks()) {
                        this.connection.addTrack(track, this.localStream);
                    }
                    for (const track of this.localStream.getAudioTracks()) {
                        this.connection.addTrack(track, this.localStream);
                    }
                }
                const sdp = new RTCSessionDescription({ sdp: session, type: "offer" });
                this.createAnswerForOfferReceived(sdp);
            }
        });

        this.socket.on("call:answer", (args): void => {
            const object = args;
            const { from } = object;
            const session = object.sdp;
            const { to } = object;
            // eslint-disable-next-line no-console
            console.log("call:answer");
            // eslint-disable-next-line no-console
            console.log(`me : ${this.me} from: ${from} to: ${to}`);
            if (to.indexOf(this.me) > -1) {
                // eslint-disable-next-line no-console
                console.log(this.me);
                const sdp = new RTCSessionDescription({ type: "offer", sdp: session });
                this.createAnswerForOfferReceived(sdp);
            }
        });

        this.socket.on("call:answered", (args): void => {
            const object = args;
            const session = object.sdp;
            const { to } = object;
            if (to.indexOf(this.me) > -1) {
                // eslint-disable-next-line no-console
                console.log("call:answered");
                const sdp = new RTCSessionDescription({ type: "answer", sdp: session });
                this.handleAnswerReceived(sdp);
                // dataChannelCreate("osei");
                // dataChannelSend("osei", "Test", FancyWebRTC.DataChannelMessageType.TEXT);
            }
        });

        this.socket.on("call:iceCandidate", (args): void => {
            // eslint-disable-next-line no-console
            console.log("call:iceCandidate");
            const object = args;

            const session = object.sdp;
            const { to } = object;
            const { sdpMid } = object;
            const { sdpMLineIndex } = object;

            if (to.indexOf(this.me) > -1) {
                const candidate = new RTCIceCandidate({
                    candidate: session,
                    sdpMLineIndex,
                    sdpMid,
                });
                this.connection.addIceCandidate(candidate);
            }
        });

        this.socket.on("connect", (): void => {
            const object: any = {};
            object.id = this.me;
            this.socket.emit("init", object);
        });

        this.socket.connect();

        this.localStream = await (navigator as any).mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });

        this.localVideo.nativeElement.srcObject = this.localStream;
    }
    public async makeCall(): Promise<void> {
        // eslint-disable-next-line no-console
        console.log(`makeCall ${this.connection}`);
        if (this.connection != null) {
            this.isInitiator = true;
            if (this.localStream != null) {
                for (const track of this.localStream.getVideoTracks()) {
                    this.connection.addTrack(track, this.localStream);
                }
                for (const track of this.localStream.getAudioTracks()) {
                    this.connection.addTrack(track, this.localStream);
                }
            }
            const description = await this.connection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });
            this.setInitiatorLocalSdp(description);
        }
    }

    public async setInitiatorLocalSdp(sdp): Promise<void> {
        if (this.connection == null) { return; }
        if (
            this.connection.localDescription != null
            && (this.connection.localDescription.type === "answer" && sdp.type === "answer")
        ) {
            return;
        }
        // eslint-disable-next-line no-console
        console.log("setInitiatorLocalSdp");
        await this.connection.setLocalDescription(sdp);
        // eslint-disable-next-line no-console
        console.log(" setInitiatorLocalSdp : success");
        this.sendInitiatorSdp(sdp);
    }

    public async sendInitiatorSdp(sdp: RTCSessionDescription): Promise<void> {
        // eslint-disable-next-line no-console
        console.log(`${"sendInitiatorSdp type: "}${sdp.type}`);
        const object: any = {};
        object.from = this.me;
        object.sdp = sdp.sdp;
        this.socket.emit("call", object);
    }

    public async createAnswerForOfferReceived(remoteSdp): Promise<void> {
        if (this.connection == null || remoteSdp == null) { return; }
        /* if (connection.getRemoteDescription() != null &&
            (connection.getRemoteDescription().getType() == FancyRTCSdpType.ANSWER
            && remoteSdp.getType() == FancyRTCSdpType.ANSWER))
              return;
          */

        await this.connection.setRemoteDescription(remoteSdp);
        // eslint-disable-next-line no-console
        console.log("createAnswerForOfferReceived: success");
        this.handleRemoteDescriptionSet();
        const description = await this.connection.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
        });
        // eslint-disable-next-line no-console
        console.log("createAnswer: success");
        this.setNonInitiatorLocalSdp(description);
    }

    public async setNonInitiatorLocalSdp(sdp): Promise<void> {
        if (this.connection == null) { return; }
        if (
            this.connection.localDescription != null
            && (this.connection.localDescription.type === "answer" && sdp.type === "answer")
        ) {
            return;
        }
        // eslint-disable-next-line no-console
        console.log(" setNonInitiatorLocalSdp ");
        await this.connection.setLocalDescription(sdp);
        // eslint-disable-next-line no-console
        console.log(" setNonInitiatorLocalSdp : success");
        this.sendNonInitiatorSdp(sdp);
    }
    public async sendNonInitiatorSdp(sdp): Promise<void> {
        // eslint-disable-next-line no-console
        console.log(`${"sendNonInitiatorSdp type: "}${sdp.type}`);
        const object: any = {};
        object.from = this.me;
        object.sdp = sdp.sdp; // ???
        /* handleAnswerReceived(sdp); */
        this.socket.emit("answered", object);
    }

    public handleRemoteDescriptionSet(): void {
        for (const iceCandidate of this.remoteIceCandidates) {
            this.connection.addIceCandidate(iceCandidate);
        }
        this.remoteIceCandidates = [];
    }

    public endCall(): void {
        this.connection.close();
    }

    public async handleAnswerReceived(sdp): Promise<void> {
        if (this.connection == null || sdp == null || this.inCall) { return; }
        // eslint-disable-next-line no-console
        console.log(`handleAnswerReceived ${sdp}`);
        const newSdp = new RTCSessionDescription({ type: "answer", sdp: sdp.sdp });
        await this.connection.setRemoteDescription(newSdp);
        // eslint-disable-next-line no-console
        console.log("handleAnswerReceived: SUCCESS");
        this.inCall = true;
    }
}
