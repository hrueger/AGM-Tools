import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { Project } from "../../_models/project.model";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { User } from "../../_models/user.model";
import { NavbarService } from "../../_services/navbar.service";
import {
    FormGroup,
    FormBuilder,
    FormControl,
    Validators
} from "@angular/forms";
import { AlertService } from "../../_services/alert.service";

@Component({
    selector: "app-projects",
    templateUrl: "./projects.component.html",
    styleUrls: ["./projects.component.scss"]
})
export class ProjectsComponent implements OnInit {
    projects: Project[] = [];
    allusers: User[] = [];
    newProjectForm: FormGroup;
    name: string;
    members: number[];
    description: string;
    invalidMessage: boolean = false;
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private NavbarService: NavbarService
    ) {}

    ngOnInit() {
        this.NavbarService.setHeadline("Projekte");
        this.remoteService.get("projectsGetProjects").subscribe(data => {
            this.projects = data;
        });
        this.remoteService.get("usersGetUsers").subscribe(data => {
            this.allusers = data;
        });
        this.newProjectForm = this.fb.group({
            name: [this.name, [Validators.required]],
            description: [this.description, [Validators.required]],
            members: [this.members, [Validators.required]]
        });
    }
    openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                result => {
                    this.invalidMessage = false;

                    this.remoteService
                        .getNoCache("projectsNewProject", {
                            name: this.newProjectForm.get("name").value,
                            description: this.newProjectForm.get("description")
                                .value,
                            members: this.newProjectForm.get("members").value
                        })
                        .subscribe(data => {
                            if (data && data.status == true) {
                                this.alertService.success(
                                    "Projekt erfolgreich erstellt, folgende Dateien wurden hinzugefügt:<br><br>" +
                                        data.commitMessage.join("<br>")
                                );
                            }
                        });
                },
                reason => {}
            );
    }
}
