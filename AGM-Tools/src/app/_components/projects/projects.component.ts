import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { Project } from "../../_models/project.model";
import { SetupItemViewArgs } from "nativescript-angular/directives";

@Component({
    selector: "app-projects",
    templateUrl: "./projects.component.html",
    styleUrls: ["./projects.component.scss"]
})
export class ProjectsComponent implements OnInit {
    projects: Project[] = [];
    constructor(private remoteService: RemoteService) {}

    ngOnInit() {
        this.remoteService.get("projectsGetProjects").subscribe(data => {
            this.projects = data;
        });
    }
}
