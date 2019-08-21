import { Component, OnInit } from "@angular/core";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-clientsoftware",
    templateUrl: "./clientsoftware.component.html",
    styleUrls: ["./clientsoftware.component.scss"],
})
export class ClientsoftwareComponent implements OnInit {
    public apps: any;
    public desktopapps: any;
    constructor(
        private remoteService: RemoteService,
        private NavbarService: NavbarService,
    ) {}
    public ngOnInit() {
        this.NavbarService.setHeadline("Client-Software");
        this.remoteService.get("clientsoftwareGetMobile").subscribe((data) => {
            // this.apps = data;
        });
    }
}
