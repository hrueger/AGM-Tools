import { Component, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NodeSelectEventArgs, TreeViewComponent } from "@syncfusion/ej2-angular-navigations";
import { EmitType, L10n } from "@syncfusion/ej2-base";
import { SelectedEventArgs } from "@syncfusion/ej2-inputs";
import { environment } from "../../../environments/environment";
import { compare, ISortEvent, SortableHeader } from "../../_helpers/sortable.directive";
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
    public newFolderModalInvalidMessage: boolean = false;
    public renameItemFormInvalidMessage: boolean = false;
    public imageSource: string;
    public pid: number;
    public settings = {
        chunkSize: 1024 * 1024, saveUrl: `${environment.apiUrl}files/upload`,
    };

    public currentPath: any[] = [];
    public lastItem: any;
    public items: any[];
    public newFolderName: string;
    public newFolderForm: FormGroup;
    public shareLink: string = "";
    public tags: any[] = [];
    public currentFile: any;
    public documentEditorConfig: any;
    public fileTree: any[];
    public treeConfig: any;
    public allFiles: any[] = [];
    @ViewChild("treeView", {static: false}) public treeView: TreeViewComponent;
    @ViewChildren(SortableHeader) public headers: QueryList<SortableHeader>;

    private currentModalWindow: NgbModalRef;
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

    public onSort({column, direction}: ISortEvent) {

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

    public async ngOnInit() {
        this.navbarService.setHeadline(await this.fts.t("files.files"));
        if (this.route.snapshot.params.projectId && this.route.snapshot.params.projectName) {
            this.pid = this.route.snapshot.params.projectId;
            this.navigate({ id: -1, name: this.route.snapshot.params.projectName});
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
            newFolderName: [this.newFolderName, [Validators.required]],
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
                    this.navigate({id: -1}, item.id, modal);
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
            this.currentModalWindow = this.modalService.open(viewFile, {size: "xl", scrollable: true});
            this.currentModalWindow.result.then(() => {
                this.currentModalWindow = undefined;
            }).catch(() => {
                this.currentModalWindow = undefined;
            });
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
            archive: ["zip"],
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
                    {newParent: ids[0]});
                }
                req.subscribe((r) => {
                        if (r && r.status) {
                            this.reloadHere();
                        }
                });
            }
        }).catch(() => undefined);
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
            if (parseInt(node.id, undefined) === parseInt(id, undefined)) {
                return node;
            }
            if (node.files) {
                const child = this.findNode(id, node.files);
                if (child) {
                    return child;
                }
            }
        }
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
        b.push({id: -1, name: this.route.snapshot.params.projectName});
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
