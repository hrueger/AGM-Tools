import {
    Component, OnInit, QueryList, ViewChild, ViewChildren,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NodeSelectEventArgs, TreeViewComponent } from "@syncfusion/ej2-angular-navigations";
import { EmitType, L10n } from "@syncfusion/ej2-base";
import { SelectedEventArgs } from "@syncfusion/ej2-inputs";
import { DatePipe } from "@angular/common";
import { environment } from "../../../environments/environment";
import { compare, SortEvent, SortableHeader } from "../../_helpers/sortable.directive";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";
import { FilePickerModalComponent } from "../filePickerModal/filePickerModal";

@Component({
    selector: "app-files",
    styleUrls: ["./files.component.scss"],
    templateUrl: "./files.component.html",
})
export class FilesComponent implements OnInit {
    public renameItemName: string;
    public renameItemForm: FormGroup;
    public newFolderModalInvalidMessage = false;
    public renameItemFormInvalidMessage = false;
    public imageSource: string;
    public pid: number;
    public settings = {
        chunkSize: 1024 * 1024, saveUrl: `${environment.apiUrl}files/upload`,
    };

    public currentPath: any[] = [];
    public lastItem: any;
    public items: any[];
    public sharingDropFolder: boolean = false;
    public newFolderForm: FormGroup;
    public shareLink = "";
    public tags: any[] = [];
    public currentFile: any;
    public documentEditorConfig: any;
    public fileTree: any[];
    public treeConfig: any;
    public allFiles: any[] = [];
    public isFullScreen = false;
    @ViewChild("treeView") public treeView: TreeViewComponent;
    @ViewChildren(SortableHeader) public headers: QueryList<SortableHeader>;

    private currentModalWindow: NgbModalRef;
    private documentExtensions = ["doc", "docm", "docx", "dot", "dotm", "dotx", "epub", "fodt", "htm", "html", "mht", "odt", "ott", "pdf", "rtf", "txt", "djvu", "xps"];
    private spreadsheetExtensions = ["csv", "fods", "ods", "ots", "xls", "xlsm", "xlsx", "xlt", "xltm", "xltx"];
    private presentationExtensions = ["fodp", "odp", "otp", "pot", "potm", "potx", "pps", "ppsm", "ppsx", "ppt", "pptm", "pptx"];
    public constructor(
        private remoteService: RemoteService,
        private authenticationService: AuthenticationService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private navbarService: NavbarService,
        private route: ActivatedRoute,
        private router: Router,
        private fts: FastTranslateService,
        private datePipe: DatePipe,
    ) { }

    public onSort({ column, direction }: SortEvent) {
        // resetting other headers
        this.headers.forEach((header) => {
            if (header.sortable !== column) {
                header.direction = "";
            }
        });

        // sorting countries
        if (direction === "") {
            // this.items = items;
        } else {
            this.items = [...this.items].sort((a, b) => {
                const res = compare(a[column], b[column]);
                return direction === "asc" ? res : -res;
            });
        }
    }

    public onFileUpload: EmitType<SelectedEventArgs> = (args: any) => {
        // add addition data as key-value pair.
        args.customFormData = [
            { pid: this.pid },
            { fid: this.currentPath[this.currentPath.length - 1].id.toString() },
            { userId: this.authenticationService.currentUserValue.id },
        ];
        args.currentRequest.setRequestHeader("Authorization", this.authenticationService.currentUserValue.token);
    }
    public async onUploadSuccess(args: any): Promise<void> {
        if (args.operation === "upload") {
            this.reloadHere();
            this.alertService.success(await this.fts.t("files.fileUploadedSuccessfully"));
        }
    }

    public canExtractItem(item) {
        return !item.isFolder && item.name.endsWith(".zip");
    }

    public async extract(item) {
        if (this.currentModalWindow) {
            this.currentModalWindow.close();
        }
        this.alertService.info(await this.fts.t("files.extractingStarted"));
        this.remoteService.getNoCache("post", `files/${item.id}/extract`).subscribe(async (data) => {
            if (data && data.status) {
                this.alertService.success(await this.fts.t("files.fileExtractedSuccessfully"));
                this.reloadHere();
            }
        });
    }

    public canDownloadAs(item) {
        const officeExtensions = [
            "doc", "docm", "docx", "dot", "dotm", "dotx", "epub", "fodt", "htm", "html", "mht", "odt", "ott", "pdf", "rtf", "txt", "djvu", "xps",
            "fodp", "odp", "otp", "pot", "potm", "potx", "pps", "ppsm", "ppsx", "ppt", "pptm", "pptx",
            "csv", "fods", "ods", "ots", "xls", "xlsm", "xlsx", "xlt", "xltm", "xltx",
        ];
        return officeExtensions.includes(item.name.split(".").pop());
    }

    public async downloadAs(item, format) {
        const url = this.getFileSrc(item);
        const filetype = item.name.split(".").pop();
        if (filetype == format) {
            window.open(url, "_blank");
            return;
        }
        this.alertService.info(await this.fts.t("files.conversionStarted"));
        let title = item.name.split(".");
        title.pop();
        title = `${title.join(".")}.${format}`;
        this.remoteService.get("post", "files/convert", {
            filetype,
            outputtype: format,
            title,
            url,
        }).subscribe((data) => {
            if (data && data.endConvert && data.fileUrl) {
                window.open(data.fileUrl, "_blank");
            }
        });
    }

    public isText(item) {
        const documentExtensions = ["doc", "docm", "docx", "dot", "dotm", "dotx", "epub", "fodt", "htm", "html", "mht", "odt", "ott", "pdf", "rtf", "txt", "djvu", "xps"];
        return documentExtensions.includes(item.name.split(".").pop());
    }
    public isSpreadsheet(item) {
        const spreadsheetExtensions = ["csv", "fods", "ods", "ots", "xls", "xlsm", "xlsx", "xlt", "xltm", "xltx"];
        return spreadsheetExtensions.includes(item.name.split(".").pop());
    }
    public isPresentation(item) {
        const presentationExtensions = ["fodp", "odp", "otp", "pot", "potm", "potx", "pps", "ppsm", "ppsx", "ppt", "pptm", "pptx"];
        return presentationExtensions.includes(item.name.split(".").pop());
    }

    public isDropFolder(item) {
        return item.dropFolder?.title && item.dropFolder?.description ? true : false;
    }

    public fullscreenEventHandler() {
        if (!document.fullscreen) {
            this.isFullScreen = false;
        }
    }

    public async ngOnInit() {
        document.addEventListener("fullscreenchange", this.fullscreenEventHandler, false);
        document.addEventListener("mozfullscreenchange", this.fullscreenEventHandler, false);
        document.addEventListener("MSFullscreenChange", this.fullscreenEventHandler, false);
        document.addEventListener("webkitfullscreenchange", this.fullscreenEventHandler, false);
        this.navbarService.setHeadline(await this.fts.t("files.files"));
        if (this.route.snapshot.params.projectId && this.route.snapshot.params.projectName) {
            this.pid = this.route.snapshot.params.projectId;
            this.navigate({ id: -1, name: this.route.snapshot.params.projectName });
            this.remoteService.get("get",
                `files/tree/${this.route.snapshot.params.projectId}`).subscribe((data: any[]) => {
                this.allFiles = data;
                this.makeFileTreeConfig(data);
            });
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
            newFolderName: ["", [Validators.required]],
            isDropFolder: [""],
            dropFolderTitle: ["", ],
            dropFolderDescription: [""],
        });
        const title = this.newFolderForm.get("dropFolderTitle");
        const description = this.newFolderForm.get("dropFolderDescription");
        this.newFolderForm.get('isDropFolder').valueChanges.subscribe((isDropFolder) => {
        if (isDropFolder) {
          title.setValidators([Validators.required]);
          description.setValidators([Validators.required]);
        } else {
          title.setValidators(null);
          description.setValidators(null);
        }
        this.newFolderForm.get("dropFolderTitle").updateValueAndValidity();
        this.newFolderForm.get("dropFolderDescription").updateValueAndValidity();
      });
        this.renameItemForm = this.fb.group({
            renameItemName: [this.renameItemName, [Validators.required]],
        });
    }

    public goBackToProjects() {
        this.router.navigate(["/", "projects"]);
    }

    public fileTreeItemClicked(event: NodeSelectEventArgs, modal) {
        const item = this.findNode(event.nodeData.id, this.allFiles);
        if (item) {
            if (item.isFolder) {
                this.goTo(item, modal);
            } else {
                const parent = this.findParent(item.id, this.allFiles);
                if (parent) {
                    this.goTo(parent, modal, item.id);
                } else {
                    this.navigate({ id: -1 }, item.id, modal);
                }
            }
        }
    }

    public goTo(item: any, viewFile?, thenOpenFileId?) {
        if (item.isFolder) {
            this.navigate(item, thenOpenFileId, viewFile);
        } else {
            this.currentFile = item;
            if (this.currentModalWindow) {
                this.currentModalWindow.close();
            }
            this.currentModalWindow = this.modalService.open(viewFile, { size: "xl", scrollable: true, windowClass: "fullscreenModal" });
            this.currentModalWindow.result.then(() => {
                this.currentModalWindow = undefined;
            }).catch(() => {
                this.currentModalWindow = undefined;
            });
        }
    }
    public getIcon(item: any) {
        const basepath = "assets/icons/";
        const iconPath = `${basepath}extralarge/`;
        if (item.isFolder) {
            if (this.isDropFolder(item)) {
                return `${basepath}dropFolder.png`;
            }
            return `${basepath}folder.png`;
        }
        return (
            `${iconPath
                + item.name
                    .split(".")
                    .pop()
                    .toLowerCase()
            }.png`
        );
    }
    public upTo(id) {
        let item = null;
        do {
            item = this.currentPath.pop();
        } while (item.id != id);
        this.navigate(item);
    }
    public navigate(item, thenOpenFileId?, thenOpenFileModal?) {
        let r;
        if (item.id == -1) {
            r = this.remoteService.get("get", `files/projects/${this.pid}`);
        } else {
            r = this.remoteService.get("get", `files/${item.id}`);
        }
        r.subscribe((data) => {
            this.currentPath = this.buildBreadcrumbs(item);
            this.items = data;
            this.lastItem = item;
            if (thenOpenFileId) {
                this.goTo(this.items.filter((i) => i.id == thenOpenFileId)[0], thenOpenFileModal);
            }
        });
    }
    public openNewFolderModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                () => {
                    this.remoteService
                        .getNoCache("post", "files", {
                            fid: this.currentPath[this.currentPath.length - 1].id,
                            pid: this.pid,
                            name: this.newFolderForm.get("newFolderName").value,
                            isDropFolder: this.newFolderForm.get("isDropFolder").value,
                            dropFolderTitle: this.newFolderForm.get("dropFolderTitle").value,
                            dropFolderDescription: this.newFolderForm.get("dropFolderDescription").value,
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

        const knownExtensions = {
            archive: ["zip"],
            audio: ["mp3", "wav", "m4a"],
            document: this.documentExtensions.concat(this.spreadsheetExtensions)
                .concat(this.presentationExtensions),
            image: ["jpg", "jpeg", "gif", "png", "svg"],
            pdf: ["pdf"],
            video: ["mp4", "mov", "avi"],

        };
        for (const [type, extensions] of Object.entries(knownExtensions)) {
            for (const ext of extensions) {
                if (filename.endsWith(ext)) {
                    if (type == "document") {
                        let t;
                        if (this.documentExtensions.includes(ext)) {
                            t = "text";
                        } else if (this.spreadsheetExtensions.includes(ext)) {
                            t = "spreadsheet";
                        } else if (this.presentationExtensions.includes(ext)) {
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
    public share(item, shareModal, shareDropFolder=false) {
        this.shareLink = "";
        this.sharingDropFolder = shareDropFolder;
        this.modalService
            .open(shareModal);
        if (shareDropFolder) {
            this.shareLink = `${environment.appUrl}upload/${item.id}/${item.dropFolder.title.replace(/ /g, "-")}`;
        } else {
            this.remoteService
            .getNoCache("post", `files/${item.id}/share${shareDropFolder ? "DropFolder" : ""}`)
            .subscribe((data) => {
                if (data.status == true) {
                    this.shareLink = `${environment.appUrl}share/${data.link}`;
                }
            });
        }
    }
    public rename(item, renameModal) {
        this.renameItemForm.get("renameItemName").setValue(item.name);
        this.modalService
            .open(renameModal)
            .result.then(() => {
                this.remoteService
                    .getNoCache("post", `files/${item.id}`, {
                        name: this.renameItemForm.get("renameItemName").value,
                    })
                    .subscribe(async (data) => {
                        if (data.status == true) {
                            this.alertService.success(
                                await this.fts.t(item.isFolder ? "files.folderRenamedSuccessfully" : "files.fileRenamedSuccessfully"),
                            );
                            this.reloadHere();
                        }
                    });
            });
    }
    public async delete(item) {
        // eslint-disable-next-line
        if (confirm(await this.fts.t(item.isFolder ? "files.confirmFolderDelete" : "files.confirmFileDelete"))) {
            this.remoteService.getNoCache("delete", `files/${item.id}`).subscribe(async (data) => {
                if (data.status == true) {
                    this.alertService.success(
                        await this.fts.t(item.isFolder ? "files.folderDeletedSuccessfully" : "files.fileDeletedSuccessfully"),
                    );
                    this.reloadHere();
                }
            });
        }
    }
    public async move(item) {
        const modal = this.modalService.open(FilePickerModalComponent);
        modal.componentInstance.title = await this.fts.t("files.moveTo");
        modal.componentInstance.projectId = this.pid;
        modal.componentInstance.multiple = false;
        modal.componentInstance.displayRoot = true;
        modal.componentInstance.rootName = this.route.snapshot.params.projectName;
        modal.result.then((ids) => {
            if (ids != "Close click" && Array.isArray(ids)) {
                let req;
                if (ids[0] == -1) {
                    req = this.remoteService.get("post", `files/${item.id}/moveToRoot`);
                } else {
                    req = this.remoteService.get("post", `files/${item.id}/move`,
                        { newParent: ids[0] });
                }
                req.subscribe((r) => {
                    if (r && r.status) {
                        this.reloadHere();
                    }
                });
            }
        }).catch(() => undefined);
    }
    public async copy() {
        this.alertService.info(await this.fts.t("general.availableInFutureVersion"));
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
        this.remoteService
            .getNoCache("get", `files/tree/${this.route.snapshot.params.projectId}`).subscribe((data: any[]) => {
                this.remoteService.get("get", `files/tree/${this.route.snapshot.params.projectId}`).subscribe();
                this.allFiles = data;
                this.makeFileTreeConfig(data);
                if (this.lastItem.id == -1) {
                    this.navigate({ id: -1 });
                } else {
                    this.goTo(this.lastItem, undefined);
                }
            });
    }

    public toggleFullscreen() {
        const modals = document.getElementsByClassName("fullscreenModal");
        if (modals && modals[0]) {
            const modal = modals[0].firstElementChild;
            if (this.isFullScreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    // @ts-ignore
                } else if (document.mozCancelFullScreen) { /* Firefox */
                    // @ts-ignore
                    document.mozCancelFullScreen();
                    // @ts-ignore
                } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
                    // @ts-ignore
                    document.webkitExitFullscreen();
                    // @ts-ignore
                } else if (document.msExitFullscreen) { /* IE/Edge */
                    // @ts-ignore
                    document.msExitFullscreen();
                }
                this.isFullScreen = false;
            } else {
                if (modal.requestFullscreen) {
                    modal.requestFullscreen();
                    // @ts-ignore
                } else if (modal.mozRequestFullScreen) { /* Firefox */
                    // @ts-ignore
                    modal.mozRequestFullScreen();
                    // @ts-ignore
                } else if (modal.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                    // @ts-ignore
                    modal.webkitRequestFullscreen();
                    // @ts-ignore
                } else if (modal.msRequestFullscreen) { /* IE/Edge */
                    // @ts-ignore
                    modal.msRequestFullscreen();
                }
                this.isFullScreen = true;
            }
        }
    }

    private async setupDocumentEditorConfig(ext, type) {
        this.documentEditorConfig = {
            editorConfig: {
                document: {
                    fileType: ext,
                    info: {
                        folder: `${this.currentPath.map((i) => i.name).join(" / ")} / ${this.currentFile.name}`,
                        owner: this.currentFile.creator.username,
                        uploaded: `${this.datePipe.transform(this.currentFile.createdAt, "shortDate")}, ${this.datePipe.transform(this.currentFile.createdAt, "shortTime")}`,
                    },
                    key: this.currentFile.editKey,
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
                    customization: {
                        autosave: true,
                        chat: true,
                        commentAuthorOnly: false,
                        comments: true,
                        compactHeader: false,
                        compactToolbar: false,
                        feedback: {
                            url: "https://github.com/hrueger/AGM-Tools/issues/new",
                            visible: true,
                        },
                        forcesave: false,
                        help: true,
                        hideRightMenu: false,
                        showReviewChanges: false,
                        toolbarNoTabs: false,
                        zoom: 100,
                    },
                    callbackUrl: `${environment.apiUrl}files/track`,
                    /* embedded: {
                    embedUrl: "https://example.com/embedded?doc=exampledocument1.docx",
                    fullscreenUrl: "https://example.com/embedded?doc=exampledocument1.docx#fullscreen",
                    saveUrl: "https://example.com/download?doc=exampledocument1.docx",
                    shareUrl: "https://example.com/view?doc=exampledocument1.docx",
                    toolbarDocked: "top",
                }, */
                    lang: this.fts.getLang(),
                    mode: "edit",
                    /* recent: [
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
                ], */
                    region: `${this.fts.getLang()}-${this.fts.getLang().toUpperCase()}`,
                    user: {
                        id: (Math.random() * 100000).toString(),
                        // this.authenticationService.currentUserValue.id,
                        name: this.authenticationService.currentUserValue.username,
                    },
                },
                events: {
                // eslint-disable-next-line no-console
                    onBack: console.log,
                    // eslint-disable-next-line no-console
                    onDocumentStateChange: console.log,
                    // eslint-disable-next-line no-console
                    onError: console.log,
                    // eslint-disable-next-line no-console
                    onReady: console.log,
                    // eslint-disable-next-line no-console
                    onRequestEditRights: console.log,
                    // eslint-disable-next-line no-console
                    onSave: console.log,
                },
                height: "100%",
                type: "desktop",
                width: "100%",
            },
            script: `${environment.documentServerUrl}/web-apps/apps/api/documents/api.js`,
        };
    }

    private addIconUrls(itemTree) {
        for (const item of itemTree) {
            if (item.isFolder) {
                item.iconUrl = "assets/icons/folder.png";
            } else {
                const parts = item.name.split(".");
                const ext = parts[parts.length - 1];
                item.iconUrl = `assets/icons/extralarge/${ext}.png`;
            }
            if (item.files.length > 0) {
                item.files = this.addIconUrls(item.files);
            }
        }
        return itemTree;
    }

    private findNode(id, array) {
        for (const node of array) {
            if (parseInt(node.id) === parseInt(id)) {
                return node;
            }
            if (node.files) {
                const child = this.findNode(id, node.files);
                if (child) {
                    return child;
                }
            }
        }
        return undefined;
    }

    private findParent(id, array, parent?) {
        for (const node of array) {
            if (node.id === id) {
                return parent;
            }
            if (node.files) {
                const p = this.findParent(id, node.files, node);
                if (p) {
                    return p;
                }
            }
        }
        return undefined;
    }

    private findParents(id, array) {
        const parents = [];
        let parent;
        let parentId = id;
        while (true) {
            parent = this.findParent(parentId, array);
            if (parent) {
                parentId = parent.id;
                parents.push(parent);
            } else {
                break;
            }
        }
        return parents.reverse();
    }

    private buildBreadcrumbs(item) {
        const b = [];
        b.push({ id: -1, name: this.route.snapshot.params.projectName });
        b.push(...this.findParents(item.id, this.allFiles));
        if (item.id != -1) {
            b.push(item);
        }
        return b;
    }

    private makeFileTreeConfig(data: any[]) {
        setTimeout(() => {
            this.fileTree = this.addIconUrls(data);
            this.treeConfig = {
                child: "files",
                dataSource: this.fileTree,
                id: "id",
                imageUrl: "iconUrl",
                text: "name",
            };
        }, 0);
    }
}
