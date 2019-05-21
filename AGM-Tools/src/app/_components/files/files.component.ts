import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";
import { Project } from "../../_models/project.model";
import { Component, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import config from "../../_config/config";

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
    pid: number;
    currentFolder: any;
    lastFolder: any;
    items: any[];
    ngOnInit() {
        //console.log("Headline change requested");
        this.remoteService.get("projectsGetProjects").subscribe(data => {
            this.projects = data;
        });
    }
    goTo(item: any) {
        this.lastFolder = this.currentFolder;
        this.currentFolder = item.id;
        if (item.type == "folder") {
            this.navigate();
        } else {
            this.viewFile = true;
            this.imageSource =
                "https://agmtools.allgaeu-gymnasium.de/AGM-Tools/getFile.php?fid=" +
                item.id;
            this.currentFolder.re;
            this.base64ImageSource = fromBase64();
        }
    }
    getIcon(item: any) {
        let basepath = "~/assets/icons/";
        let iconPath = basepath + "large/";
        if (item.type == "folder") {
            return basepath + "folder.png";
        } else {
            return iconPath + item.name.split(".").pop() + ".png";
        }
    }
    goToProject(project: Project) {
        this.selectProject = false;
        this.pid = project.id;
        this.currentFolder = -1;
        this.navigate();
    }
    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
    up() {
        if (this.viewFile) {
            this.viewFile = false;
        } else {
            if (this.currentFolder == -1 || this.currentFolder == "-1") {
                this.selectProject = true;
            } else {
                this.currentFolder = this.lastFolder;
                this.remoteService
                    .get("filesGetFolder", {
                        pid: this.pid,
                        fid: this.currentFolder
                    })
                    .subscribe(data => {
                        this.items = data;
                        this.lastFolder = this.items[0].folder;
                        console.log(this.items[0]);
                    });
            }
        }
    }
    navigate() {
        this.remoteService
            .get("filesGetFolder", {
                pid: this.pid,
                fid: this.currentFolder
            })
            .subscribe(data => {
                this.items = data;
            });
    }
}
