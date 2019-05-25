import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-clientsoftware",
    templateUrl: "./clientsoftware.component.html",
    styleUrls: ["./clientsoftware.component.scss"]
})
export class ClientsoftwareComponent implements OnInit {
    constructor(private remoteService: RemoteService) {}
    apps: any;
    desktopapps: any;
    ngOnInit() {
        this.remoteService.get("clientsoftwareGetMobile").subscribe(data => {
            this.apps = data;
        });
    }
}
