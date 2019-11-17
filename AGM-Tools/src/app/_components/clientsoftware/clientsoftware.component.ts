import { Component, OnInit } from "@angular/core";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-clientsoftware",
    styleUrls: ["./clientsoftware.component.scss"],
    templateUrl: "./clientsoftware.component.html",
})
export class ClientsoftwareComponent implements OnInit {
    public apps: any;
    public desktopapps: any;
    constructor(
        private remoteService: RemoteService,
        private navbarService: NavbarService,
    ) { }
    public ngOnInit() {
        this.navbarService.setHeadline("Client-Software");
        this.remoteService.get("post", "clientsoftwareGetMobile").subscribe((data) => {
            // this.apps = data;
        });
    }
}
