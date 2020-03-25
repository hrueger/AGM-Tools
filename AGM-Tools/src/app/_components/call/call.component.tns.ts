import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Quality, WebRTC, WebRTCView } from "nativescript-webrtc-plugin";

@Component({
    selector: "app-call",
    styleUrls: ["./call.component.scss"],
    templateUrl: "./call.component.html",
})
export class CallComponent {
    @ViewChild("remoteVideoView", { static: false }) public remoteVideoView: WebRTCView;
    public remoteStream: any;
    public localStream: any;

    public constructor(private route: ActivatedRoute) {}
    public ngOnInit(): void {
        if (this.route.snapshot.params.chatType == "user") {
            this.call();
        } else if (this.route.snapshot.params.chatType == "project") {
            this.call();
        } else {
            // Strange
        }
    }

    public async call(): Promise<void> {
        const webrtc = new WebRTC({
            enableAudio: true,
            enableVideo: false,
            iceServers: [
                {
                    url: "stun:stun.l.google.com:19302",
                },
            ],
        });
        webrtc.on("webRTCClientDidReceiveRemoteVideoTrackStream", (args): void => {
            const { object } = args;
            const remoteVideoTrack = object.get("remoteVideoTrack");
            this.remoteStream = object.get("stream");
            const video = this.remoteVideoView;
            video.videoTrack = remoteVideoTrack;
        });

        webrtc.on("webRTCClientStartCallWithSdp", (args): void => {
            const sdp = args.object.get("sdp");
            const type = args.object.get("type");
            if (type === "answer") {
                webrtc.handleAnswerReceived({
                    sdp,
                    type,
                });
            } else {
                // send data to signaling server
                // eslint-disable-next-line no-console
                console.log("type:", type);
                // eslint-disable-next-line no-console
                console.log("sdp:", sdp);
            }
        });

        webrtc.on("webRTCClientDidGenerateIceCandidate", (args): void => {
            const iceCandidate = args.object.get("iceCandidate");
            // send data to signaling server
            // eslint-disable-next-line no-console
            console.log("iceCandidate:", iceCandidate);
        });

        if (!WebRTC.hasPermissions()) {
            try {
                await WebRTC.requestPermissions();
                this.localStream = await webrtc.getUserMedia(Quality.HIGHEST);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        }

        webrtc.connect();
        webrtc.addLocalStream(this.localStream);
        webrtc.makeOffer();
    }
}
