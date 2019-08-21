import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EmitType, L10n } from "@syncfusion/ej2-base";
import { SelectedEventArgs } from "@syncfusion/ej2-inputs";
import config from "../../_config/config";
import { Project } from "../../_models/project.model";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

// import { MenuItemModel, MenuEventArgs } from "@syncfusion/ej2-navigations";

@Component({
    selector: "app-files",
    templateUrl: "./files.component.html",
    styleUrls: ["./files.component.scss"],
})
export class FilesComponent implements OnInit {
    public renameItemName: string;
    public renameItemForm: FormGroup;
    public newFolderModalInvalidMessage: boolean = false;
    public renameItemFormInvalidMessage: boolean = false;
    public selectProject: boolean = true;
    public viewFile: boolean = false;
    public projects: Project[];
    public imageSource: string;
    public pid: number;
    public settings = {
        chunkSize: 1024 * 1024, saveUrl: config.apiUrl +
            "resumableUploadHandler.php",
    };

    public currentPath: any = [];
    public lastFolder: any;
    public lastItem: any;
    public items: any[];
    public newFolderName: string;
    public newFolderForm: FormGroup;
    public shareLink: string = "";
    constructor(
        private remoteService: RemoteService,
        private authenticationService: AuthenticationService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private NavbarService: NavbarService,
        private cdr: ChangeDetectorRef,
    ) { }

    public onFileUpload: EmitType<SelectedEventArgs> = (args: any) => {
        // add addition data as key-value pair.

        args.customFormData = [
            {
                pid: this.pid,
            },
            { fid: this.currentPath[this.currentPath.length - 1].id.toString() },
            { token: this.authenticationService.currentUserValue.token },

        ];
    }
    public onUploadSuccess(args: any): void {
        if (args.operation === "upload") {
            this.reloadHere();
            this.alertService.success("Die Datei wurde erfolgreich hochgeladen.");
        }
    }

    public ngOnInit() {
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
                    dropFilesHint: "oder Dateien hierher ziehen",
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
                    delete: "Löschen",
                },
            },
        });

        // console.log("Headline change requested");
        this.remoteService.get("projectsGetProjects").subscribe((data) => {
            this.projects = data;
        });
        this.newFolderForm = this.fb.group({
            newFolderName: [this.newFolderName, [Validators.required]],
        });
        this.renameItemForm = this.fb.group({
            renameItemName: [this.renameItemName, [Validators.required]],
        });
        // this.cdr.detectChanges();
    }
    public goTo(item: any, reload = false) {
        if (!reload) {
            this.currentPath.push(item);
        }

        // console.warn("Pushed folder");
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
    public getIcon(item: any) {
        const basepath = "assets/icons/";
        const iconPath = basepath + "extralarge/";
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
    public goToProject(project: Project) {
        this.selectProject = false;
        this.pid = project.id;
        this.currentPath = [];
        // console.warn(this.currentPath);
        // console.warn("Pushed project");

        this.navigate({ id: -1, name: project.name });
    }
    public goToFiles() {
        if (this.viewFile) {
            this.viewFile = false;
        }
        this.selectProject = true;
        this.currentPath = [];
    }
    public upTo(id) {
        if (this.viewFile) {
            this.viewFile = false;
        }
        let item = null;
        do {
            item = this.currentPath.pop();
        } while (item.id != id);
        this.navigate(item);
    }
    public navigate(item) {
        // console.log(this.currentPath);
        this.remoteService
            .get("filesGetFolder", {
                pid: this.pid,
                fid: item.id,
            })
            .subscribe((data) => {
                console.log(this.currentPath);
                if (
                    this.currentPath.length == 0 ||
                    this.currentPath[this.currentPath.length - 1].id != item.id
                ) {
                    this.currentPath.push(item);
                }
                this.items = data;

                this.lastItem = item;
            });
    }
    public getSrc() {
        const file = this.currentPath[this.currentPath.length - 1];
        return (
            config.apiUrl +
            "?get=" +
            file.id +
            "&type=file" +
            "&token=" +
            this.authenticationService.currentUserValue.token
        );
    }
    public openNewFolderModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                (result) => {
                    this.remoteService
                        .getNoCache("filesNewFolder", {
                            name: this.newFolderForm.get("newFolderName").value,
                            pid: this.pid,
                            fid: this.currentPath[this.currentPath.length - 1]
                                .id,
                        })
                        .subscribe((data) => {
                            if (data && data.status == true) {
                                this.alertService.success("Der neue Ordner wurde erfolgreich erstellt.");
                                this.reloadHere();
                            }
                        });
                },
                (reason) => { },
            );
    }
    public getType() {
        const filename = this.currentPath[
            this.currentPath.length - 1
        ].name.toLowerCase();
        const videoFileExtensions = ["mp4", "mov", "avi"];
        const imageFileExtensions = ["jpg", "jpeg", "gif", "png"];
        const pdfFileExtensions = ["pdf"];
        for (const ext of videoFileExtensions) {
            if (filename.endsWith(ext)) {
                return "video";
            }
        }
        for (const ext of pdfFileExtensions) {
            if (filename.endsWith(ext)) {
                return "pdf";
            }
        }
        for (const ext of imageFileExtensions) {
            if (filename.endsWith(ext)) {
                return "image";
            }
        }
        return "other";
    }
    public toggleTag(tagid, item) {
        this.remoteService
            .getNoCache("filesToggleTag", {
                type: item.type,
                fid: item.id,
                tagid,
            })
            .subscribe((data) => {
                if (data.status == true) {
                    // this.goTo(this.lastItem);
                    this.reloadHere();
                }
            });
    }
    public download(item) {
        window.open(
            config.apiUrl +
            "?get=" +
            item.id +
            "&type=" +
            item.type +
            "&token=" +
            this.authenticationService.currentUserValue.token +
            "&download",
        );
    }
    public share(item, shareModal) {
        this.shareLink = "";
        this.modalService
            .open(shareModal)
            .result.then((result) => { }, (reason) => { });
        this.remoteService
            .getNoCache("filesCreateShare", { type: item.type, fid: item.id })
            .subscribe((data) => {
                if (data.status == true) {
                    this.shareLink = config.apiUrl + "share/?l=" + data.link;
                }
            });
    }
    public rename(item, renameModal) {
        this.renameItemForm.get("renameItemName").setValue(item.name);
        this.modalService
            .open(renameModal)
            .result.then((result) => {
                this.remoteService
                    .getNoCache("filesRename", { type: item.type, fid: item.id, name: this.renameItemForm.get("renameItemName").value })
                    .subscribe((data) => {
                        if (data.status == true) {
                            this.alertService.success("Das Element wurde erfolgreich umbenannt.");
                            this.reloadHere();
                        }
                    });
            }, (reason) => { });

    }
    public delete(item) {
        if (confirm("Soll dieses Element wirklich gelöscht werden?")) {
            this.remoteService.getNoCache("filesDelete", { type: item.type, fid: item.id }).subscribe((data) => {
                if (data.status == true) {
                    this.alertService.success("Das Element wurde erfolgreich gelöscht.");
                    this.reloadHere();
                }
            });
        }
    }
    public move(item) {
        this.alertService.info("Diese Funktion wird in einer zukünftigen Version hinzugefügt. Wenn sie jetzt dringend benötigt wird, bitte bei Hannes melden!");
    }
    public copy(item) {
        this.alertService.info("Diese Funktion wird in einer zukünftigen Version hinzugefügt. Wenn sie jetzt dringend benötigt wird, bitte bei Hannes melden!");
    }

    public copyShareLink(inputField) {
        inputField.select();
        document.execCommand("copy");
        inputField.setSelectionRange(0, 0);
        this.alertService.success("Link in die Zwischenablage kopiert!");
    }
    public openShareLinkInNewTab() {
        const win = window.open(this.shareLink, "_blank");
        win.focus();
    }
    public reloadHere() {
        if (this.lastItem.id == -1) {
            this.navigate({ id: -1 });
        } else {
            this.goTo(this.lastItem, true);
        }
    }
}
