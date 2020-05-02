import {
    Component,
} from "@angular/core";
import * as RTCMultiConnection from "rtcmulticonnection";

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

    constructor() { }

    public ngOnInit() {
        const connection = new RTCMultiConnection();

        // this line is VERY_important
        connection.socketURL = "https://rtcmulticonnection.herokuapp.com:443/";

        // if you want audio+video conferencing
        connection.session = {
            audio: true,
            video: true,
        };

        connection.openOrJoin("aoijdiueiqwöaopxeapowejaöowejalxejnkhflwifcnhwel");
    }
}
