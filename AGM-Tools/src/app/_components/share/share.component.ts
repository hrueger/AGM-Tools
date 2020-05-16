import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RemoteService } from "../../_services/remote.service";
import { EnvironmentService } from "../../_services/environment.service";

@Component({
    selector: "app-share",
    styleUrls: ["./share.component.css"],
    templateUrl: "./share.component.html",
})
export class ShareComponent {
    public file;
    public year: number = new Date().getFullYear();
    constructor(
        private remoteService: RemoteService,
        private route: ActivatedRoute,
        private environmentService: EnvironmentService,
    ) { }
    public ngOnInit() {
        this.remoteService.get("get", `files/share/${this.route.snapshot.params.link}`).subscribe((data) => {
            this.file = data;
        });
    }
    public getSrc() {
        return `${this.environmentService.environment.apiUrl}files/share/${this.route.snapshot.params.link}/download`;
    }
}
