import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EmitType, L10n } from "@syncfusion/ej2-base";
import { SelectedEventArgs } from "@syncfusion/ej2-inputs";
import { environment } from "../../../environments/environment";
import { Project } from "../../_models/project.model";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
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
    public imageSource: string;
    public pid: number;
    public settings = {
        chunkSize: 1024 * 1024, saveUrl: `${environment.apiUrl}files/upload`,
    };

    public currentPath: any = [];
    public lastItem: any;
    public items: any[];
    public newFolderName: string;
    public newFolderForm: FormGroup;
    public shareLink: string = "";
    public tags: any[] = [];
    public currentFile: any;
    public documentEditorConfig: any;
    constructor(
        private remoteService: RemoteService,
        private authenticationService: AuthenticationService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private navbarService: NavbarService,
        private route: ActivatedRoute,
        private router: Router,
        private fts: FastTranslateService,
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
    public async onUploadSuccess(args: any): Promise<void> {
        if (args.operation === "upload") {
            this.reloadHere();
            this.alertService.success(await this.fts.t("files.fileUploadedSuccessfully"));
        }
    }

    public async ngOnInit() {
        this.navbarService.setHeadline(await this.fts.t("files.files"));
        if (this.route.snapshot.params.projectId && this.route.snapshot.params.projectName) {
            this.pid = this.route.snapshot.params.projectId;
            this.navigate({ id: -1, name: this.route.snapshot.params.projectName});
        }
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
        this.remoteService.get("get", "files/tags").subscribe((data) => {
            this.tags = data;
        });
        this.newFolderForm = this.fb.group({
            newFolderName: [this.newFolderName, [Validators.required]],
        });
        this.renameItemForm = this.fb.group({
            renameItemName: [this.renameItemName, [Validators.required]],
        });
    }

    public goBackToProjects() {
        this.router.navigate(["/", "projects"]);
    }

    public goTo(item: any, viewFile?) {
        if (item.isFolder) {
            this.navigate(item);
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
                        .subscribe(async (data) => {
                            if (data && data.status == true) {
                                this.alertService.success(await this.fts.t("files.folderCreatedSuccessfully"));
                                this.reloadHere();
                            }
                        });
                },
            );
    }

    public getFileSrc(file, download = false) {
        return `${environment.apiUrl}files/${file.id}${(download ? "/download" : "")}?authorization=${this.authenticationService.currentUserValue.token}`;
    }

    public getCurrentFileSrc() {
        return this.getFileSrc(this.currentFile);
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

        const documentExtensions = ["doc", "docm", "docx", "dot", "dotm", "dotx", "epub", "fodt", "htm", "html", "mht", "odt", "ott", "pdf", "rtf", "txt", "djvu", "xps"];
        const spreadsheetExtensions = ["csv", "fods", "ods", "ots", "xls", "xlsm", "xlsx", "xlt", "xltm", "xltx"];
        const presentationExtensions = ["fodp", "odp", "otp", "pot", "potm", "potx", "pps", "ppsm", "ppsx", "ppt", "pptm", "pptx"];

        const knownExtensions = {
            audio: ["mp3", "wav", "m4a"],
            document: documentExtensions.concat(spreadsheetExtensions).concat(presentationExtensions),
            image: ["jpg", "jpeg", "gif", "png", "svg"],
            pdf: ["pdf"],
            video: ["mp4", "mov", "avi"],

        };
        for (const [type, extensions] of Object.entries(knownExtensions)) {
            for (const ext of extensions) {
                if (filename.endsWith(ext)) {
                    if (type == "document") {
                        let t;
                        if (documentExtensions.includes(ext)) {
                            t = "text";
                        } else if (spreadsheetExtensions.includes(ext)) {
                            t = "spreadsheet";
                        } else if (presentationExtensions.includes(ext)) {
                            t = "presentation";
                        }
                        this.setupDocumentEditorConfig(ext, t);
                    }
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
        window.open(this.getFileSrc(item, true));
    }
    public share(item, shareModal) {
        this.shareLink = "";
        this.modalService
            .open(shareModal);
        this.remoteService
            .getNoCache("post", `files/${item.id}/share`)
            .subscribe((data) => {
                if (data.status == true) {
                    this.shareLink = `${environment.appUrl}share/${data.link}`;
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
                    .subscribe(async (data) => {
                        if (data.status == true) {
                            this.alertService.success(
                                await this.fts.t(item.isFolder ? "files.folderRenamedSuccessfully" : "files.fileRenamedSuccessfully"));
                            this.reloadHere();
                        }
                    });
            });

    }
    public async delete(item) {
        if (confirm(await this.fts.t(item.isFolder ? "files.confirmFolderDelete" : "files.confirmFileDelete"))) {
            this.remoteService.getNoCache("delete", `files/${item.id}`).subscribe(async (data) => {
                if (data.status == true) {
                    this.alertService.success(
                        await this.fts.t(item.isFolder ? "files.folderDeletedSuccessfully" : "files.fileDeletedSuccessfully"));
                    this.reloadHere();
                }
            });
        }
    }
    public async move(item) {
        this.alertService.info(await this.fts.t("general.avalibleInFutureVersion"));
    }
    public async copy(item) {
        this.alertService.info(await this.fts.t("general.avalibleInFutureVersion"));
    }

    public async copyShareLink(inputField) {
        inputField.select();
        document.execCommand("copy");
        inputField.setSelectionRange(0, 0);
        this.alertService.success(await this.fts.t("files.linkCopied"));
    }
    public openShareLinkInNewTab() {
        const win = window.open(this.shareLink, "_blank");
        win.focus();
    }
    public reloadHere() {
        if (this.lastItem.id == -1) {
            this.navigate({ id: -1 });
        } else {
            this.goTo(this.lastItem, undefined);
        }
    }

    private async setupDocumentEditorConfig(ext, type) {
        this.documentEditorConfig = {
            editorConfig: {
              document: {
                fileType: ext,
                info: {
                  author: this.currentFile.creator.username,
                  folder: this.lastItem.name,
                  owner: this.currentFile.creator.username,
                  uploaded: this.currentFile.createdAt,
                },
                key: "3277238458",
                permissions: {
                    comment: true,
                    download: true,
                    edit: true,
                    fillForms: true,
                    print: true,
                    review: true,
                },
                title: this.currentFile.name,
                url: this.getCurrentFileSrc(),
              },
              documentType: type,
              editorConfig: {
                // callbackUrl: `${environment.apiUrl}files/documents/save`,
                /*createUrl: "https://example.com/url-to-create-document/",*/
                customization: {
                    autosave: true,
                    chat: true,
                    commentAuthorOnly: false,
                    comments: true,
                    compactHeader: false,
                    compactToolbar: false,
                    customer: {
                        address: await this.fts.t("about.hostedOnGitHub"),
                        info: await this.fts.t("about.description") + "(https://hrueger.github.io/AGM-Tools)",
                        /* logo: "https://example.com/logo-big.png", ToDo */
                        name: "AGM-Tools",
                        www: "https://github.com/hrueger/AGM-Tools",
                    },
                    feedback: {
                        url: "https://github.com/hrueger/AGM-Tools/issues/new",
                        visible: true,
                    },
                    forcesave: false,
                    goback: {
                        blank: true,
                        text: "Dokumente",
                        url: "https://example.com",
                    },
                    help: true,
                    hideRightMenu: false,
                    logo: {
                        image: "https://example.com/logo.png",
                        imageEmbedded: "https://example.com/logo_em.png",
                        url: "https://example.com",
                    },
                    showReviewChanges: false,
                    toolbarNoTabs: false,
                    zoom: 100,
                },
                embedded: {
                    embedUrl: "https://example.com/embedded?doc=exampledocument1.docx",
                    fullscreenUrl: "https://example.com/embedded?doc=exampledocument1.docx#fullscreen",
                    saveUrl: "https://example.com/download?doc=exampledocument1.docx",
                    shareUrl: "https://example.com/view?doc=exampledocument1.docx",
                    toolbarDocked: "top",
                },
                lang: "de",
                mode: "edit",
                recent: [
                    {
                        folder: "Example Files",
                        title: "exampledocument1.docx",
                        url: "https://example.com/exampledocument1.docx",
                    },
                    {
                        folder: "Example Files",
                        title: "exampledocument2.docx",
                        url: "https://example.com/exampledocument2.docx",
                    },
                ],
                region: "de-DE",
                user: {
                    id: this.authenticationService.currentUserValue.id,
                    name: this.authenticationService.currentUserValue.id,
                },
            },
              events: {
                // tslint:disable-next-line: no-console
                onBack: console.log,
                // tslint:disable-next-line: no-console
                onDocumentStateChange: console.log,
                // tslint:disable-next-line: no-console
                onError: console.log,
                // tslint:disable-next-line: no-console
                onReady: console.log,
                // tslint:disable-next-line: no-console
                onRequestEditRights: console.log,
                // tslint:disable-next-line: no-console
                onSave: console.log,
              },
              height: "100%",
              type: "desktop",
              width: "100%",
            },
            script: "https://agmtools.allgaeu-gymnasium.de:8080/web-apps/apps/api/documents/api.js",
          };
    }
}
