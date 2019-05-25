import { RemoteService } from "../../_services/remote.service";
import { Project } from "../../_models/project.model";
import { Component, OnInit } from "@angular/core";
import config from "../../_config/config";
import { AuthenticationService } from "../../_services/authentication.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
    FormGroup,
    FormBuilder,
    FormControl,
    Validators
} from "@angular/forms";
import { AlertService } from "../../_services/alert.service";

@Component({
    selector: "app-files",
    templateUrl: "./files.component.html",
    styleUrls: ["./files.component.scss"]
})
export class FilesComponent implements OnInit {
    constructor(
        private remoteService: RemoteService,
        private authenticationService: AuthenticationService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService
    ) {}
    newFolderModalInvalidMessage: boolean = false;
    selectProject: boolean = true;
    viewFile: boolean = false;
    projects: Project[];
    imageSource: string;
    pid: number;
    currentPath: any = [];
    lastFolder: any;
    items: any[];
    newFolderName: string;
    newFolderForm: FormGroup;
    ngOnInit() {
        //console.log("Headline change requested");
        this.remoteService.get("projectsGetProjects").subscribe(data => {
            this.projects = data;
        });
        this.newFolderForm = this.fb.group({
            newFolderName: [this.newFolderName, [Validators.required]]
        });
    }
    goTo(item: any) {
        this.currentPath.push(item);
        //console.warn("Pushed folder");
        if (item.type == "folder") {
            this.navigate(item);
        } else {
            this.viewFile = true;
            this.imageSource =
                "https://agmtools.allgaeu-gymnasium.de/AGM-Tools/getFile.php?fid=" +
                item.id;

            /*this.base64ImageSource = fromBase64();*/
        }
    }
    getIcon(item: any) {
        let basepath = "/assets/icons/";
        let iconPath = basepath + "large/";
        if (item.type == "folder") {
            return basepath + "folder.png";
        } else {
            return (
                iconPath +
                item.name
                    .split(".")
                    .pop()
                    .toLowerCase() +
                ".png"
            );
        }
    }
    goToProject(project: Project) {
        this.selectProject = false;
        this.pid = project.id;
        this.currentPath = [];
        //console.warn(this.currentPath);
        //console.warn("Pushed project");
        this.navigate({ id: -1, name: project.name });
    }
    goToFiles() {
        if (this.viewFile) {
            this.viewFile = false;
        }
        this.selectProject = true;
        this.currentPath = [];
    }
    upTo(id) {
        if (this.viewFile) {
            this.viewFile = false;
        }
        let item = null;
        do {
            item = this.currentPath.pop();
        } while (item.id != id);
        this.navigate(item);
    }
    up() {
        if (this.viewFile) {
            this.viewFile = false;
        } else {
            if (this.currentPath.length == 1) {
                this.selectProject = true;
            } else {
                this.currentPath.pop();
                this.remoteService
                    .get("filesGetFolder", {
                        pid: this.pid,
                        fid: this.currentPath[this.currentPath.length - 1].id
                    })
                    .subscribe(data => {
                        this.items = data;
                        this.lastFolder = this.items[0].folder;
                        //console.log(this.items[0]);
                    });
            }
        }
    }
    navigate(item) {
        console.log(this.currentPath);
        this.remoteService
            .get("filesGetFolder", {
                pid: this.pid,
                fid: item.id
            })
            .subscribe(data => {
                console.log(this.currentPath);
                if (
                    this.currentPath.length == 0 ||
                    this.currentPath[this.currentPath.length - 1].id != item.id
                ) {
                    this.currentPath.push(item);
                }
                this.items = data;
            });
    }
    getSrc() {
        let file = this.currentPath[this.currentPath.length - 1];
        return (
            config.apiUrl +
            "getFile.php?fid=" +
            file.id +
            "&token=" +
            this.authenticationService.currentUserValue.token
        );
    }
    openNewFolderModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                result => {
                    this.remoteService
                        .getNoCache("filesNewFolder", {
                            name: this.newFolderForm.get("newFolderName").value,
                            pid: this.pid,
                            fid: this.currentPath[this.currentPath.length-1].id
                        })
                        .subscribe(data => {
                            if (data && data.status == true) {
                                this.alertService.success(
                                    "Ordner erfolgreich erstellt")
                                );
                            }
                        });
                },
                reason => {}
            );
    }
    getType() {
        let filename = this.currentPath[this.currentPath.length - 1].name;
        var videoFileExtensions = ["mp4", "mov", "avi"];
        var imageFileExtensions = ["jpg", "jpeg", "gif", "png"];
        for (let ext of videoFileExtensions) {
            if (filename.endsWith(ext)) {
                return "video";
            }
        }
        for (let ext of imageFileExtensions) {
            if (filename.endsWith(ext)) {
                return "image";
            }
        }
        return "other";
    }
}

/*

import { RemoteService } from "../../_services/remote.service";
import { Project } from "../../_models/project.model";
import { Component, OnInit } from "@angular/core";

@Component({
    selector: "app-files",
    templateUrl: "./files.component.html",
    styleUrls: ["./files.component.scss"]
})
export class FilesComponent implements OnInit {
    constructor(private remoteService: RemoteService) {}
    selectProject: boolean = true;
    viewFile: boolean = false;
    projects: Project[];
    imageSource: string;
    //pid: number;
    //currentFolder: any;
    //lastFolder: any;
    path: string = "";
    project: string;
    items: any[];
    ngOnInit() {
        //console.log("Headline change requested");
        this.remoteService.get("projectsGetProjects").subscribe(data => {
            this.projects = data;
        });
    }
    goTo(item: any) {
        //this.lastFolder = this.currentFolder;
        //this.currentFolder = item.id;
        if (item.type == "folder") {
            this.navigate();
        } else {
            this.viewFile = true;
            this.imageSource =
                "https://agmtools.allgaeu-gymnasium.de/AGM-Tools/getFile.php?fid=" +
                item.id;
            //this.currentFolder.re;
            
        }
    }
    getIcon(item: any) {
        let basepath = "/assets/icons/";
        let iconPath = basepath + "large/";
        if (item.type == "folder") {
            return basepath + "folder.png";
        } else {
            return iconPath + item.name.split(".").pop() + ".png";
        }
    }
    goToProject(project: Project) {
        this.selectProject = false;
       
        this.project = project.name;
        this.path = "";
        this.navigate();
    }

    up() {
        if (this.viewFile) {
            this.viewFile = false;
        } else {
            
            this.selectProject = true;
            
        }
    }
    navigate() {
        this.remoteService
            .get("filesGetFolder", {
                project: this.project,
                path: this.path
            })
            .subscribe(data => {
                this.items = data;
            });
    }
}

*/
