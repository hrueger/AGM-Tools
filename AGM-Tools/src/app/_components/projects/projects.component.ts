import { Component, OnInit } from "@angular/core";
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "../../../environments/environment";
import { AuthenticationService } from "../..//_services/authentication.service";
import { Project } from "../../_models/project.model";
import { User } from "../../_models/user.model";
import { AlertService } from "../../_services/alert.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";
import { FilePickerModalComponent } from "../filePickerModal/filePickerModal";
import { PickerModalComponent } from "../pickerModal/pickerModal";

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
    public currentProject: any;
    public currentProjectChat: any;
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private fts: FastTranslateService,
        private authenticationService: AuthenticationService,
        private navbarService: NavbarService,
        private router: Router,
        private route: ActivatedRoute,
    ) { }

    public async ngOnInit() {
        this.navbarService.setHeadline(await this.fts.t("projects.projects"));
        this.getProjects();
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

    public goToProject(project) {
        this.currentProject = project;
        this.router.navigate(["/", "projects", project.id]);
        this.currentProjectChat = {
            id: this.currentProject.id,
            isUser: false,
        };
    }

    public getFileExtension(file) {
        if (file.isFolder) {
            return "folder";
        }
        const name = file.name.split(".");
        return name[name.length - 1];
    }

    public async linkTutorial() {
        const tutorials = await this.remoteService.get("get", "tutorials").toPromise();
        const modal = this.modalService.open(PickerModalComponent);
        modal.componentInstance.title = await this.fts.t("projects.pickTutorialToLink");
        modal.componentInstance.items = tutorials;
        modal.componentInstance.multiple = true;
        modal.result.then((res) => {
            this.remoteService.get("post", `projects/${this.currentProject.id}/linkTutorials`,
                {tutorials: res.map((tutorial) => tutorial.id)}).subscribe((r) => {
                    if (r && r.status) {
                        this.getProjects();
                    }
            });
        }).catch(() => undefined);
    }

    public async linkFile() {
        const modal = this.modalService.open(FilePickerModalComponent);
        modal.componentInstance.title = await this.fts.t("projects.pickFileToLink");
        modal.componentInstance.projectId = this.currentProject.id;
        modal.componentInstance.multiple = true;
        modal.result.then((ids) => {
            this.remoteService.get("post", `projects/${this.currentProject.id}/linkFiles`,
                {files: ids}).subscribe((r) => {
                    if (r && r.status) {
                        this.getProjects();
                    }
            });
        }).catch(() => undefined);
    }

    public getProjectImageSrc(project) {
        return `${environment.apiUrl}projects/${project.id}?authorization=${this.authenticationService.currentUserValue.token}`;
    }

    public joinWithComma(items, prop) {
        return items.map((item) => item[prop]).join(", ");
    }

    public async delete(project) {
        if (confirm(await this.fts.t("projects.confirmDelete"))) {
            this.remoteService.get("delete", `projects/${project.id}`).subscribe(async (data) => {
                if (data && data.status == true) {
                    this.alertService.success(await this.fts.t("projects.projectDeletedSucessfully"));
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
                        .subscribe(async (data) => {
                            if (data && data.status == true) {
                                this.alertService.success(await this.fts.t("projects.projectUpdatedSucessfully"));
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
                        .subscribe(async (data) => {
                            if (data && data.status == true) {
                                this.alertService.success(await this.fts.t("projects.projectsCreatedSucessfully"));
                                this.remoteService.get("get", "projects").subscribe((d) => {
                                    this.projects = d;
                                });
                            }
                        });
                },
            );
    }

    private getProjects() {
        this.remoteService.get("get", "projects").subscribe((data) => {
            this.projects = data;
            if (this.route.snapshot.params.id) {
                this.goToProject(this.projects.filter((project) => project.id == this.route.snapshot.params.id)[0]);
            }
        });
    }
}
