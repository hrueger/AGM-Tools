import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-bugs",
    templateUrl: "./bugs.component.html",
    styleUrls: ["./bugs.component.scss"]
})
export class BugsComponent implements OnInit {
    constructor(private remoteService: RemoteService) {}
    bugs: any;
    ngOnInit() {
        this.remoteService.get("bugsGetBugs").subscribe(data => {
            this.bugs = data;
        });
    }
}
