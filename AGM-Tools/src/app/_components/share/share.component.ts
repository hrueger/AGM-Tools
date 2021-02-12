import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { getApiUrl } from "../../_helpers/getApiUrl";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-share",
    styleUrls: ["./share.component.css"],
    templateUrl: "./share.component.html",
})
export class ShareComponent {
    public file;
    public year: number = new Date().getFullYear();
    constructor(private remoteService: RemoteService, private route: ActivatedRoute) {}
    public ngOnInit() {
        this.remoteService.get("get", `files/share/${this.route.snapshot.params.link}`).subscribe((data) => {
            this.file = data;
        });
    }
    public getSrc() {
        return `${getApiUrl()}files/share/${this.route.snapshot.params.link}/download`;
    }
}
