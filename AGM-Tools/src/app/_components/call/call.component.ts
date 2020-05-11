import {
    Component,
} from "@angular/core";
import * as RTCMultiConnection from "rtcmulticonnection";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketService } from "../../_services/socket.service";
import { RemoteService } from "../../_services/remote.service";

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
    public videos: { video: string; user: any }[] = [];

    constructor(
        private socketService: SocketService,
        private route: ActivatedRoute,
        private router: Router,
        private remoteService: RemoteService,
    ) { }

    public ngOnInit() {
        if (this.router.url.indexOf("incoming")) {
            // incoming
            // :chatType/:id/:callType",
        } else {
            this.remoteService.get("post", `/call/${this.route.snapshot.params.chatType}/${this.route.snapshot.params.id}/${this.route.snapshot.params.callType}`).subscribe((data) => {
                if (data) {
                    const { roomId } = data;
                    const connection = new RTCMultiConnection();
                    // this line is VERY_important
                    connection.socketURL = "https://rtcmulticonnection.herokuapp.com:443/";
                    const that = this;
                    connection.onstream = (event) => {
                        console.log(event);
                        that.videos.push({
                            video: event.mediaElement.srcObject,
                            user: "Test",
                        });
                    };

                    // if you want audio+video conferencing
                    connection.session = {
                        audio: true,
                        video: true,
                    };

                    connection.openOrJoin(roomId);
                }
            });
        }
    }
}
