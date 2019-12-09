import { Component, OnInit } from "@angular/core";
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "../../../environments/environment";
import { AuthenticationService } from "../..//_services/authentication.service";
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
    public updateProjectForm: FormGroup;
    public name: string;
    public users: number[];
    public description: string;
    public invalidMessage: boolean = false;
    public updateProjectInvalidMessage: boolean = false;
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private authenticationService: AuthenticationService,
        private navbarService: NavbarService,
    ) { }

    public ngOnInit() {
        this.navbarService.setHeadline("Projekte");
        this.remoteService.get("get", "projects").subscribe((data) => {
            this.projects = data;
        });
        this.remoteService.get("get", "users").subscribe((data) => {
            this.allusers = data;
        });
        this.newProjectForm = this.fb.group({
            description: [this.description, [Validators.required]],
            name: [this.name, [Validators.required]],
            users: [this.users, [Validators.required]],
        });
        this.updateProjectForm = this.fb.group({
            description: ["", [Validators.required]],
            name: ["", [Validators.required]],
            users: [null, [Validators.required]],
        });
    }

    public getProjectImageSrc(project) {
        return `${environment.apiUrl}projects/${project.id}?authorization=${this.authenticationService.currentUserValue.token}`;
    }

    public delete(project) {
        if (confirm("Soll dieses Projekt wirklich gelöscht werden?")) {
            this.remoteService.get("delete", `projects/${project.id}`).subscribe((data) => {
                if (data && data.status == true) {
                    this.alertService.success("Projekt erfolgreich gelöscht!");
                    this.remoteService.get("get", "projects").subscribe((d) => {
                        this.projects = d;
                    });
                }
            });
        }
    }

    public update(project, modal) {
        this.updateProjectForm.setValue({
            description: project.description,
            name: project.name,
            users: project.users.map((user) => user.id),
        });
        this.modalService
            .open(modal)
            .result.then(
                (result) => {
                    this.updateProjectInvalidMessage = false;
                    this.remoteService
                        .getNoCache("post", `projects/${project.id}`, {
                            description: this.updateProjectForm.get("description").value,
                            name: this.updateProjectForm.get("name").value,
                            users: this.updateProjectForm.get("users").value,
                        })
                        .subscribe((data) => {
                            if (data && data.status == true) {
                                this.alertService.success("Projekt erfolgreich aktualisiert");
                                this.remoteService.get("get", "projects").subscribe((d) => {
                                    this.projects = d;
                                });
                            }
                        });
                },
            );
    }

    public openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                (result) => {
                    this.invalidMessage = false;

                    this.remoteService
                        .getNoCache("post", "projects", {
                            description: this.newProjectForm.get("description").value,
                            name: this.newProjectForm.get("name").value,
                            users: this.newProjectForm.get("users").value,
                        })
                        .subscribe((data) => {
                            if (data && data.status == true) {
                                this.alertService.success("Projekt erfolgreich erstellt");
                                this.remoteService.get("get", "projects").subscribe((d) => {
                                    this.projects = d;
                                });
                            }
                        });
                },
            );
    }
}
