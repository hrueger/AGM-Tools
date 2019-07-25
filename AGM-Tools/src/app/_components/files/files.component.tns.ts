import { RemoteService } from "../../_services/remote.service";
import { Project } from "../../_models/project.model";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import config from "../../_config/config";
import { AuthenticationService } from "../../_services/authentication.service";
@Component({
    selector: "app-files",
    templateUrl: "./files.component.html",
    styleUrls: ["./files.component.scss"]
})
export class FilesComponent implements OnInit {
    currentProject: string;
    constructor(
        private remoteService: RemoteService,
        private authService: AuthenticationService,
        private cdr: ChangeDetectorRef
    ) {}
    selectProject: boolean = true;
    viewFile: boolean = false;
    projects: Project[];
    fileSourceUrl: string;
    pid: number;
    currentPath: any = [];
    lastFolder: any;
    items: any[];
    ngOnInit() {
        //console.log("Headline change requested");
        this.remoteService.get("projectsGetProjects").subscribe(data => {
            this.projects = data;
        });
    }
    goTo(item: any) {
        this.currentPath.push(item);
        if (item.type == "folder") {
            this.navigate(item);
        } else {
            this.viewFile = true;
            this.fileSourceUrl =
                config.apiUrl +
                "getFile.php?fid=" +
                item.id +
                "&token=" +
                this.authService.currentUserValue.token;
            //console.log(this.fileSourceUrl);
            //this.currentFolder.re;
            /*this.base64ImageSource = fromBase64();*/
        }
    }
    getIcon(item: any) {
        let basepath = "~/assets/icons/";
        let iconPath = basepath + "extralarge/";
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
        this.currentProject = project.name;
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
    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
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
                this.cdr.detectChanges();
                console.log("Current Path from up:", this.currentPath);
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
        //console.log(this.currentPath);
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
    getType() {
        let filename = this.currentPath[
            this.currentPath.length - 1
        ].name.toLowerCase();
        var videoFileExtensions = ["mp4", "mov", "avi"];
        var imageFileExtensions = ["jpg", "jpeg", "gif", "png"];
        var pdfExtensions = ["pdf"];
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
        for (let ext of pdfExtensions) {
            if (filename.endsWith(ext)) {
                return "pdf";
            }
        }
        return "other";
    }
}
