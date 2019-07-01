import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { NavbarService } from "../../_services/navbar.service";

@Component({
    selector: "app-bugs",
    templateUrl: "./bugs.component.html",
    styleUrls: ["./bugs.component.scss"]
})
export class BugsComponent implements OnInit {
    constructor(
        private remoteService: RemoteService,
        private NavbarService: NavbarService
    ) {}
    bugs: any;
    ngOnInit() {
        this.remoteService.get("bugsGetBugs").subscribe(data => {
            this.bugs = data;
        });
        this.NavbarService.setHeadline("Fehler / Verbesserungen");
    }
}
