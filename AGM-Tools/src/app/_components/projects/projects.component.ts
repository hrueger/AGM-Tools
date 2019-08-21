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
    templateUrl: "./projects.component.html",
    styleUrls: ["./projects.component.scss"],
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
        private NavbarService: NavbarService,
    ) {}

    public ngOnInit() {
        this.NavbarService.setHeadline("Projekte");
        this.remoteService.get("projectsGetProjects").subscribe((data) => {
            this.projects = data;
        });
        this.remoteService.get("usersGetUsers").subscribe((data) => {
            this.allusers = data;
        });
        this.newProjectForm = this.fb.group({
            name: [this.name, [Validators.required]],
            description: [this.description, [Validators.required]],
            members: [this.members, [Validators.required]],
        });
    }
    public openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                (result) => {
                    this.invalidMessage = false;

                    this.remoteService
                        .getNoCache("projectsNewProject", {
                            name: this.newProjectForm.get("name").value,
                            description: this.newProjectForm.get("description")
                                .value,
                            members: this.newProjectForm.get("members").value,
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
                (reason) => {},
            );
    }
}
