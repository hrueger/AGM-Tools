import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EmitType, L10n } from "@syncfusion/ej2-base";
import { SelectedEventArgs } from "@syncfusion/ej2-inputs";
import { environment } from "../../../environments/environment";
import { Project } from "../../_models/project.model";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-files",
    styleUrls: ["./files.component.scss"],
    templateUrl: "./files.component.html",
})
export class FilesComponent implements OnInit {
    public renameItemName: string;
    public renameItemForm: FormGroup;
    public newFolderModalInvalidMessage: boolean = false;
    public renameItemFormInvalidMessage: boolean = false;
    public selectProject: boolean = true;
    public projects: Project[];
    public imageSource: string;
    public pid: number;
    public settings = {
        chunkSize: 1024 * 1024, saveUrl: `${environment.apiUrl}files/upload`,
    };

    public currentPath: any = [];
    public lastFolder: any;
    public lastItem: any;
    public items: any[];
    public newFolderName: string;
    public newFolderForm: FormGroup;
    public shareLink: string = "";
    public tags: any[] = [];
    public currentFile: any;
    constructor(
        private remoteService: RemoteService,
        private authenticationService: AuthenticationService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private navbarService: NavbarService,
        private cdr: ChangeDetectorRef,
    ) { }

    public onFileUpload: EmitType<SelectedEventArgs> = (args: any) => {
        // add addition data as key-value pair.
        args.customFormData = [
            {
                pid: this.pid,
            },
            { fid: this.currentPath[this.currentPath.length - 1].id.toString() },

        ];
        args.currentRequest.setRequestHeader("Authorization", this.authenticationService.currentUserValue.token);
    }
    public onUploadSuccess(args: any): void {
        if (args.operation === "upload") {
            this.reloadHere();
            this.alertService.success("Die Datei wurde erfolgreich hochgeladen.");
        }
    }

    public ngOnInit() {
        this.navbarService.setHeadline("Dateien");
        L10n.load({
            de: {
                uploader: {
                    Browse: "Auswählen",
                    Clear: "Leeren",
                    Upload: "Hochladen",
                    cancel: "Abbrechen",
                    delete: "Löschen",
                    dropFilesHint: "oder Dateien hierher ziehen",
                    inProgress: "in Bearbeitung",
                    invalidFileType: "Diese Datei besitzt keinen der erlabubten Dateitypen.",
                    invalidMaxFileSize: "Diese Datei ist größer als die erlaubte Dateigröße.",
                    invalidMinFileSize: "Diese Datei ist zu klein, um hochgeladen zu werden.",
                    readyToUploadMessage: "Klicke zum Hochladen",
                    remove: "Entfernen",
                    removedFailedMessage: "Die Datei konnte nicht gelöscht werden.",
                    removedSuccessMessage: "Die Datei wurde erfolgreich gerlöscht.",
                    uploadFailedMessage: "Der Upload konnte nicht erfolgreich beendet werden.",
                    uploadSuccessMessage: "Die Datei(en) wurde(n) erfolgreich hochgeladen.",
                },
            },
        });

        // console.log("Headline change requested");
        this.remoteService.get("get", "projects").subscribe((data) => {
            this.projects = data;
        });
        this.remoteService.get("get", "files/tags").subscribe((data) => {
            this.tags = data;
        });
        this.newFolderForm = this.fb.group({
            newFolderName: [this.newFolderName, [Validators.required]],
        });
        this.renameItemForm = this.fb.group({
            renameItemName: [this.renameItemName, [Validators.required]],
        });
        // this.cdr.detectChanges();
    }
    public goTo(item: any, viewFile?, reload = false) {
        if (item.isFolder) {
            this.navigate(item);
            if (!reload) {
                this.currentPath.push(item);
            }
        } else {
            this.currentFile = item;
            this.modalService.open(viewFile, {size: "xl", scrollable: true});
        }
    }
    public getIcon(item: any) {
        const basepath = "assets/icons/";
        const iconPath = basepath + "extralarge/";
        if (item.isFolder) {
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
        this.selectProject = true;
        this.currentPath = [];
    }
    public upTo(id) {
        let item = null;
        do {
            item = this.currentPath.pop();
        } while (item.id != id);
        this.navigate(item);
    }
    public navigate(item) {
        let r;
        if (item.id == -1) {
            r = this.remoteService.get("get", `files/projects/${this.pid}`);
        } else {
            r = this.remoteService.get("get", `files/${item.id}`);
        }
        r.subscribe((data) => {
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
    public openNewFolderModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                (result) => {
                    this.remoteService
                        .getNoCache("post", "files", {
                            fid: this.currentPath[this.currentPath.length - 1].id,
                            name: this.newFolderForm.get("newFolderName").value,
                            pid: this.pid,
                        })
                        .subscribe((data) => {
                            if (data && data.status == true) {
                                this.alertService.success("Der neue Ordner wurde erfolgreich erstellt.");
                                this.reloadHere();
                            }
                        });
                },
            );
    }

    public getCurrentFileSrc() {
        return `${environment.apiUrl}files/${this.currentFile.id}?authorization=${this.authenticationService.currentUserValue.token}`;
    }

    public changeCurrentFile(add: number) {
        let idx = this.items.findIndex((i) => i.id == this.currentFile.id);
        do {
            idx += add;
            if (idx >= this.items.length) {
                idx = 0;
            }
            if (idx < 0) {
                idx = this.items.length - 1;
            }
        } while (this.items[idx].isFolder == true);
        this.currentFile = this.items[idx];
    }

    public getType() {
        const filename: string = this.currentFile.name.toLowerCase();
        const knownExtensions = {
            audio: ["mp3", "wav", "m4a"],
            image: ["jpg", "jpeg", "gif", "png", "svg"],
            pdf: ["pdf"],
            video: ["mp4", "mov", "avi"],

        };
        for (const [type, extensions] of Object.entries(knownExtensions)) {
            for (const ext of extensions) {
                if (filename.endsWith(ext)) {
                    return type;
                }
            }
        }
        return "other";
    }
    public toggleTag(tagId, item) {
        this.remoteService
            .getNoCache("post", `files/${item.id}/tags`, {
                tagId,
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
            environment.apiUrl +
            "?get=" +
            item.id +
            "&token=" +
            this.authenticationService.currentUserValue.token +
            "&download",
        );
    }
    public share(item, shareModal) {
        this.shareLink = "";
        this.modalService
            .open(shareModal)
            .result.then();
        this.remoteService
            .getNoCache("post", "filesCreateShare", { fid: item.id })
            .subscribe((data) => {
                if (data.status == true) {
                    this.shareLink = environment.apiUrl + "share/?l=" + data.link;
                }
            });
    }
    public rename(item, renameModal) {
        this.renameItemForm.get("renameItemName").setValue(item.name);
        this.modalService
            .open(renameModal)
            .result.then((result) => {
                this.remoteService
                    .getNoCache("post", `files/${item.id}`, {
                        name: this.renameItemForm.get("renameItemName").value,
                    })
                    .subscribe((data) => {
                        if (data.status == true) {
                            this.alertService.success(`${(item.isFolder ? "Der Ordner" : "Die Datei")} wurde erfolgreich umbenannt.`);
                            this.reloadHere();
                        }
                    });
            });

    }
    public delete(item) {
        if (confirm("Soll dieses Element wirklich gelöscht werden?")) {
            this.remoteService.getNoCache("delete", `files/${item.id}`).subscribe((data) => {
                if (data.status == true) {
                    this.alertService.success(`${(item.isFolder ? "Der Ordner" : "Die Datei")} wurde erfolgreich gelöscht.`);
                    this.reloadHere();
                }
            });
        }
    }
    public move(item) {
        this.alertService.info("Diese Funktion wird in einer zukünftigen Version hinzugefügt.\
        Wenn sie jetzt dringend benötigt wird, bitte bei Hannes melden!");
    }
    public copy(item) {
        this.alertService.info("Diese Funktion wird in einer zukünftigen Version hinzugefügt.\
        Wenn sie jetzt dringend benötigt wird, bitte bei Hannes melden!");
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
            this.goTo(this.lastItem, undefined, true);
        }
    }
}
