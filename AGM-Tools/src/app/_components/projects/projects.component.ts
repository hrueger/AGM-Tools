import { Component, OnInit } from "@angular/core";
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Project } from "../../_models/project.model";
import { User } from "../../_models/user.model";
import { AlertService } from "../../_services/alert.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-projects",
    styleUrls: ["./projects.component.scss"],
    templateUrl: "./projects.component.html",
})
export class ProjectsComponent implements OnInit {
    public projects: Project[] = [];
    public allusers: User[] = [];
    public newProjectForm: FormGroup;
    public name: string;
    public members: number[];
    public description: string;
    public invalidMessage: boolean = false;
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private navbarService: NavbarService,
    ) { }

    public ngOnInit() {
        this.navbarService.setHeadline("Projekte");
        this.remoteService.get("post", "projectsGetProjects").subscribe((data) => {
            this.projects = data;
        });
        this.remoteService.get("post", "usersGetUsers").subscribe((data) => {
            this.allusers = data;
        });
        this.newProjectForm = this.fb.group({
            description: [this.description, [Validators.required]],
            members: [this.members, [Validators.required]],
            name: [this.name, [Validators.required]],
        });
    }
    public openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                (result) => {
                    this.invalidMessage = false;

                    this.remoteService
                        .getNoCache("post", "projectsNewProject", {
                            description: this.newProjectForm.get("description").value,
                            members: this.newProjectForm.get("members").value,
                            name: this.newProjectForm.get("name").value,
                        })
                        .subscribe((data) => {
                            if (data && data.status == true) {
                                this.alertService.success(
                                    "Projekt erfolgreich erstellt, folgende Dateien wurden hinzugefügt:<br><br>" +
                                    data.commitMessage.join("<br>"),
                                );
                            }
                        });
                },
            );
    }
}
