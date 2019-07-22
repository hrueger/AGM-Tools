import { RemoteService } from "../../_services/remote.service";
import { Project } from "../../_models/project.model";
import { Component, OnInit } from "@angular/core";
import config from "../../_config/config";
import { AuthenticationService } from "../../_services/authentication.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AlertService } from "../../_services/alert.service";
import { L10n, EmitType } from "@syncfusion/ej2-base";
import { SelectedEventArgs } from "@syncfusion/ej2-inputs";
import { NavbarService } from "../../_services/navbar.service";

import { MenuItemModel, MenuEventArgs } from "@syncfusion/ej2-navigations";

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
        private alertService: AlertService,
        private NavbarService: NavbarService
    ) {}
    newFolderModalInvalidMessage: boolean = false;
    selectProject: boolean = true;
    viewFile: boolean = false;
    projects: Project[];
    imageSource: string;
    pid: number;
    public settings = { chunkSize: 1024 * 1024, saveUrl: "" };
    currentPath: any = [];
    lastFolder: any;
    items: any[];
    newFolderName: string;
    newFolderForm: FormGroup;
    public contextMenuItems: MenuItemModel[] = [
        {
            text: "Öffnen",
            iconCss: "far fa-circle"
        },
        {
            text: "Tags",
            iconCss: "fas fa-tags",
            items: [
                {
                    text: "Fertig"
                },
                {
                    text: "Zu verbessern"
                },
                {
                    text: "In Bearbeitung"
                },
                {
                    text: "Wichtig"
                }
            ]
        },
        {
            separator: true
        },
        {
            text: "Herunterladen",
            iconCss: "fas fa-cloud-download-alt"
        },
        {
            text: "Freigeben",
            iconCss: "far fa-share-square"
        },
        {
            separator: true
        },
        {
            text: "Umbenennen",
            iconCss: "fas fa-pen"
        },
        {
            text: "Kopieren",
            iconCss: "far fa-copy"
        },
        {
            text: "Verschieben",
            iconCss: "fas fa-arrows-alt"
        },
        {
            text: "Löschen",
            iconCss: "fas fa-trash"
        }
    ];

    public onFileUpload: EmitType<SelectedEventArgs> = (args: any) => {
        // add addition data as key-value pair.

        args.customFormData = [
            {
                pid: this.pid,
                fid: this.currentPath[this.currentPath.length - 1].id.toString()
            }
        ];
    };
    ngOnInit() {
        this.NavbarService.setHeadline("Dateien");
        L10n.load({
            de: {
                uploader: {
                    invalidMinFileSize:
                        "Diese Datei ist zu klein, um hochgeladen zu werden.",
                    invalidMaxFileSize:
                        "Diese Datei ist größer als die erlaubte Dateigröße.",
                    invalidFileType:
                        "Diese Datei besitzt keinen der erlabubten Dateitypen.",
                    Browse: "Auswählen",
                    Clear: "Leeren",
                    Upload: "Hochladen",
                    dropFilesHint: "Dateien hierher ziehen",
                    uploadFailedMessage:
                        "Der Upload konnte nicht erfolgreich beendet werden.",
                    uploadSuccessMessage:
                        "Die Datei(en) wurde(n) erfolgreich hochgeladen.",
                    removedSuccessMessage:
                        "Die Datei wurde erfolgreich gerlöscht.",
                    removedFailedMessage:
                        "Die Datei konnte nicht gelöscht werden.",
                    inProgress: "in Bearbeitung",
                    readyToUploadMessage: "Klicke zum Hochladen",
                    remove: "Entfernen",
                    cancel: "Abbrechen",
                    delete: "Löschen"
                }
            }
        });

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
                this.settings.saveUrl =
                    config.apiUrl +
                    "resumableUploadHandler.php?fid=" +
                    item.id +
                    "&pid=" +
                    this.pid +
                    "&token=" +
                    this.authenticationService.currentUserValue.token;
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
                            fid: this.currentPath[this.currentPath.length - 1]
                                .id
                        })
                        .subscribe(data => {
                            if (data && data.status == true) {
                                this.alertService.success(
                                    "Ordner erfolgreich erstellt"
                                );
                            }
                        });
                },
                reason => {}
            );
    }
    getType() {
        let filename = this.currentPath[
            this.currentPath.length - 1
        ].name.toLowerCase();
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

    public itemSelect(args: MenuEventArgs): void {
        console.log(args);
        if (args.item.text === "Öffnen") {
        } else if (args.item.text === "Fertig") {
        } else if (args.item.text === "Zu verbessern") {
        } else if (args.item.text === "In Bearbeitung") {
        } else if (args.item.text === "Herunterladen") {
        } else if (args.item.text === "Freigeben") {
        } else if (args.item.text === "Umbenennen") {
        } else if (args.item.text === "Kopieren") {
        } else if (args.item.text === "Verschieben") {
        } else if (args.item.text === "Löschen") {
        } else {
            console.log("Fehler: Kontextmenü-Item nicht registriert!");
        }
    }

    public opened($event) {
        console.log($event);
    }
}
