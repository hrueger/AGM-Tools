import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { NavbarService } from "../../_services/navbar.service";

@Component({
    selector: "app-clientsoftware",
    templateUrl: "./clientsoftware.component.html",
    styleUrls: ["./clientsoftware.component.scss"]
})
export class ClientsoftwareComponent implements OnInit {
    constructor(
        private remoteService: RemoteService,
        private NavbarService: NavbarService
    ) {}
    apps: any;
    desktopapps: any;
    ngOnInit() {
        this.NavbarService.setHeadline("Client-Software");
        this.remoteService.get("clientsoftwareGetMobile").subscribe(data => {
            this.apps = data;
        });
    }
}
