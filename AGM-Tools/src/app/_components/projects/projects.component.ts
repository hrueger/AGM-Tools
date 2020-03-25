import {
    Component, ElementRef, OnInit, ViewChild,
} from "@angular/core";
import {
    FormBuilder,
    FormGroup,
    Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "../../../environments/environment";
import { AuthenticationService } from "../../_services/authentication.service";
import { Project } from "../../_models/project.model";
import { User } from "../../_models/user.model";
import { AlertService } from "../../_services/alert.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";
import { FilePickerModalComponent } from "../filePickerModal/filePickerModal";
import { PickerModalComponent } from "../pickerModal/pickerModal";
import { TinyConfigService } from "../../_services/tiny-config.service";
import { MarkdownService } from "../../_services/markdown.service";

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
    public newTaskForm: FormGroup;
    public name: string;
    public users: number[];
    public description: string;
    public taskTitle: string;
    public taskDescription: string;
    public taskUsers: number[];
    public taskDue: string;
    public invalidMessage = false;
    public updateProjectInvalidMessage = false;
    public newTaskFormInvalidMessage = false;
    public currentProject: any;
    public currentProjectChat: any;
    public tasks: any[] = [];
    public currentTask: any;
    @ViewChild("chatMessages") private chatMessagesComponent: ElementRef;
    public TINYCONFIG = {};
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
        private tinyConfigService: TinyConfigService,
        private markdownService: MarkdownService,
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
        this.newTaskForm = this.fb.group({
            taskDescription: [this.taskDescription, [Validators.required]],
            taskDue: [this.taskDue, [Validators.required]],
            taskTitle: [this.taskTitle, [Validators.required]],
            taskUsers: [this.taskUsers, [Validators.required]],
        });
        this.TINYCONFIG = this.tinyConfigService.get();
    }

    public goToProject(project) {
        this.currentProject = project;
        this.router.navigate(["/", "projects", project.id]);
        this.currentProjectChat = {
            id: this.currentProject.id,
            isUser: false,
        };
        setTimeout(() => {
            const el = document.getElementsByClassName("chat-messages")[0];
            el.scrollTop = el.scrollHeight;
        }, 500);
    }

    public getFileExtension(file) {
        if (file.isFolder) {
            return "folder";
        }
        const name = file.name.split(".");
        return name[name.length - 1];
    }

    public displayTasks(tasksModal, tasks) {
        this.tasks = tasks;
        this.modalService.open(tasksModal, { size: "lg" });
    }

    public displayTask(taskModal, task) {
        this.currentTask = task;
        this.modalService.open(taskModal, { size: "lg" });
    }

    public openNewTaskModal(content) {
        this.modalService.open(content, { size: "lg" }).result.then(() => {
            const due = this.newTaskForm.get("taskDue").value;
            this.newTaskFormInvalidMessage = false;
            this.remoteService.getNoCache("post", `tasks/${this.currentProject.id}`, {
                description: this.markdownService.from(this.newTaskForm.get("taskDescription").value),
                due: new Date(`${due.year}-${due.month}-${due.day}`),
                title: this.newTaskForm.get("taskTitle").value,
                users: this.newTaskForm.get("taskUsers").value,
            }).subscribe((r) => {
                if (r && r.status) {
                    this.ngOnInit();
                }
            });
        }).catch(() => undefined);
    }

    public async linkTutorial() {
        const tutorials = await this.remoteService.get("get", "tutorials").toPromise();
        const modal = this.modalService.open(PickerModalComponent);
        modal.componentInstance.title = await this.fts.t("projects.pickTutorialToLink");
        modal.componentInstance.items = tutorials;
        modal.componentInstance.multiple = true;
        modal.result.then((res) => {
            this.remoteService.get("post", `projects/${this.currentProject.id}/linkTutorials`,
                { tutorials: res.map((tutorial) => tutorial.id) }).subscribe((r) => {
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
            if (ids != "Close click" && Array.isArray(ids)) {
                this.remoteService.get("post", `projects/${this.currentProject.id}/linkFiles`,
                    { files: ids }).subscribe((r) => {
                    if (r && r.status) {
                        this.getProjects();
                    }
                });
            }
        }).catch(() => undefined);
    }

    public getProjectImageSrc(project) {
        return `${environment.apiUrl}projects/${project.id}?authorization=${this.authenticationService.currentUserValue.token}`;
    }

    public joinWithComma(items, prop) {
        return items.map((item) => item[prop]).join(", ");
    }

    public async delete(project) {
        // eslint-disable-next-line
        if (confirm(await this.fts.t("projects.confirmDelete"))) {
            this.remoteService.get("delete", `projects/${project.id}`).subscribe(async (data) => {
                if (data && data.status == true) {
                    this.alertService.success(await this.fts.t("projects.projectDeletedSuccessfully"));
                    this.remoteService.get("get", "projects").subscribe((d) => {
                        this.projects = d;
                    });
                }
            });
        }
    }

    public update(project, modal) {
        this.updateProjectForm.setValue({
            description: this.markdownService.to(project.description),
            name: project.name,
            users: project.users.map((user) => user.id),
        });
        this.modalService
            .open(modal, { size: "lg" })
            .result.then(
                () => {
                    this.updateProjectInvalidMessage = false;
                    this.remoteService
                        .getNoCache("post", `projects/${project.id}`, {
                            description: this.markdownService.from(this.updateProjectForm.get("description").value),
                            name: this.updateProjectForm.get("name").value,
                            users: this.updateProjectForm.get("users").value,
                        })
                        .subscribe(async (data) => {
                            if (data && data.status == true) {
                                this.alertService.success(await this.fts.t("projects.projectUpdatedSuccessfully"));
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
            .open(content, { size: "lg" })
            .result.then(
                () => {
                    this.invalidMessage = false;

                    this.remoteService
                        .getNoCache("post", "projects", {
                            description: this.markdownService.from(this.newProjectForm.get("description").value),
                            name: this.newProjectForm.get("name").value,
                            users: this.newProjectForm.get("users").value,
                        })
                        .subscribe(async (data) => {
                            if (data && data.status == true) {
                                this.alertService.success(await this.fts.t("projects.projectCreatedSuccessfully"));
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
                this.goToProject(this.projects.filter(
                    (project) => project.id == this.route.snapshot.params.id,
                )[0]);
            }
        });
    }
}
