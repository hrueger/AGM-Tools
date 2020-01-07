import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertDialog,
    CFAlertGravity,
    CFAlertStyle,
    DialogOptions,
} from "nativescript-cfalert-dialog";
import * as clipboard from "nativescript-clipboard";
import { MultiSelect } from "nativescript-multi-select";
import { ListViewEventData } from "nativescript-ui-listview";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";
import { EventData, View } from "tns-core-modules/ui/core/view";
import * as dialog from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page/page";
import { ScrollView } from "tns-core-modules/ui/scroll-view/scroll-view";
import { layout } from "tns-core-modules/utils/utils";
import { openUrl } from "tns-core-modules/utils/utils";
import { environment } from "../../../environments/environment";
import { Project } from "../../_models/project.model";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-files",
    styleUrls: ["./files.component.scss"],
    templateUrl: "./files.component.html",
})
export class FilesComponent implements OnInit {
    public showProgressbar: boolean;
    @ViewChild("itemsListView", { read: RadListViewComponent, static: false })
    public itemsListView: RadListViewComponent;
    @ViewChild("breadcrumbsScrollView", { static: false })
    public breadcrumbsScrollView: ElementRef<ScrollView>;
    public selectProject: boolean = true;
    public viewFile: boolean = false;
    public projects: Project[];
    public imageSource: string;
    public pid: number;
    public documentEditorConfig: any;

    public tags = [];

    public currentPath: any = [];
    public lastFolder: any;
    public lastItem: any;
    public items: ObservableArray<any> = new ObservableArray<any>();
    public shareLink: string = "";
    public currentFile: any;

    private multiSelect: MultiSelect;
    private leftItem: View;
    private rightItem: View;
    private mainView: View;

    constructor(
        private remoteService: RemoteService,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private route: ActivatedRoute,
        private router: Router,
        private fts: FastTranslateService,
        private page: Page,
    ) {
        this.multiSelect = new MultiSelect();
    }

    public ngOnInit() {
        this.page.actionBarHidden = true;
        if (this.route.snapshot.params.projectId && this.route.snapshot.params.projectName) {
            this.pid = this.route.snapshot.params.projectId;
            this.navigate({ id: -1, name: this.route.snapshot.params.projectName});
        }
        this.remoteService.get("get", "files/tags").subscribe((data) => {
            this.tags = data;
        });
    }
    public goTo(item: any, triggeredByPullToRefresh = false) {
        if (item.isFolder) {
            this.navigate(item, triggeredByPullToRefresh);
        } else {
            this.currentFile = item;
            // ToDo
            // this.modalService.open(viewFile, {size: "xl", scrollable: true});
        }
    }

    public getIcon(item: any) {

        const basepath = "~/assets/icons/";

        const iconPath = basepath + "extralarge/";
        if (item.isFolder == true) {
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

    public goBackToProjects() {
        this.router.navigate(["/", "projects"]);
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

    public navigate(item, triggeredByPullToRefresh = false) {
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
                setTimeout(() => {
                    this.breadcrumbsScrollView.nativeElement.scrollToHorizontalOffset(
                        this.breadcrumbsScrollView.nativeElement.scrollableWidth, false);
                }, 0);
            }
            this.items = new ObservableArray<any>();
            this.items.push(...data);
            this.lastItem = item;
            if (triggeredByPullToRefresh) {
                this.itemsListView.listView.notifyPullToRefreshFinished();
            }
        });
    }

    public getFileSrc(file, download = false) {
        return `${environment.apiUrl}files/${file.id}${(download ? "/download" : "")}?authorization=${this.authenticationService.currentUserValue.token}`;
    }

    public getCurrentFileSrc() {
        return this.getFileSrc(this.currentFile);
    }

    public changeCurrentFile(add: number) {
        let idx = this.items.indexOf(this.currentFile);
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
        // @ts-ignore
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

    public reloadHere(triggeredByPullToRefresh = false) {
        if (this.lastItem.id == -1) {
            this.navigate({ id: -1 }, triggeredByPullToRefresh);
        } else {
            this.goTo(this.lastItem, triggeredByPullToRefresh);
        }
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

    public getSrc() {
        const file = this.currentPath[this.currentPath.length - 1];
        const path = environment.apiUrl +
            "?get=" +
            file.id +
            "&type=file" +
            "&token=" +
            this.authenticationService.currentUserValue.token;
        return path;
    }
    public onPullToRefresh() {
        this.reloadHere(true);
    }
    public openNewFolderModal(content) {
        const that = this;
        dialog.prompt({
            cancelButtonText: "Abbrechen",
            defaultText: "Neuer Ordner",
            inputType: dialog.inputType.text,
            message: "in /" + this.currentPath.map((item) => item.name).join("/") + "/",
            okButtonText: "Erstellen",
            title: "Neuer Ordner",

        }).then((r) => {
            if (r.result) {
                that.remoteService
                    .getNoCache("post", "files", {
                        fid: that.currentPath[that.currentPath.length - 1].id,
                        name: r.text,
                        pid: that.pid,
                    })
                    .subscribe((data) => {
                        if (data && data.status == true) {
                            that.alertService.success("Der neue Ordner wurde erfolgreich erstellt.");
                            this.reloadHere();
                        }
                    });
            }

        });

    }

    public editTags(item) {
        this.itemsListView.listView.notifySwipeToExecuteFinished();
        const itemTags = item.tags;
        const allTags = this.tags.map((tag) => tag.id);
        const allTagNames = this.tags.map((tag) => tag.name);
        const preselected = [];
        allTags.forEach((tag) => {
            if (itemTags.map((ntag) => ntag.id).includes(tag.toString())) {
                preselected.push(true);
            } else {
                preselected.push(false);
            }
        });
        const cfalertDialog = new CFAlertDialog();
        const options: DialogOptions = {
            dialogStyle: CFAlertStyle.ALERT,
            multiChoiceList: {
                items: allTagNames,
                onClick: (dialogInterface, index) => {
                    this.remoteService
                        .getNoCache("post", "filesToggleTag", {
                            fid: item.id,
                            tagid: this.tags[index].id,
                            type: item.type,
                        })
                        .subscribe((data) => {
                            if (data.status == true) {
                                this.alertService.success("Gespeichert!");
                                // this.reloadHere();
                            }
                        });
                },
                selectedItems: preselected,
            },
            title: "Tags auswählen",
        };
        cfalertDialog.show(options);
        return;

    }
    public download(item) {
        const url = environment.apiUrl +
            "?get=" +
            item.id +
            "&type=" +
            item.type +
            "&token=" +
            this.authenticationService.currentUserValue.token +
            "&download";
        this.itemsListView.listView.notifySwipeToExecuteFinished();
        openUrl(url);
    }

    public share(item) {
        this.remoteService
            .getNoCache("post", "filesCreateShare", { type: item.type, fid: item.id })
            .subscribe((data) => {
                if (data.status == true) {
                    const shareLink = environment.apiUrl + "share/?l=" + data.link;
                    const cfalertDialog = new CFAlertDialog();
                    const options: DialogOptions = {
                        buttons: [{
                            buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                            buttonStyle: CFAlertActionStyle.DEFAULT,
                        onClick: () => { /* Clicked */ },
                            text: "Abbrechen",
                        }, {
                            buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                            buttonStyle: CFAlertActionStyle.POSITIVE,
                            onClick: () => {
                                clipboard.setText(shareLink);
                                this.alertService.success("Link kopiert!");
                            },
                            text: "Kopieren",
                        }],
                        cancellable: true,
                        dialogStyle: CFAlertStyle.ALERT,
                        message: "Ein Link wurde generiert:\n" + shareLink,
                        textAlignment: CFAlertGravity.START,
                        title: "Freigeben",
                    };
                    cfalertDialog.show(options);
                }
            });
        this.itemsListView.listView.notifySwipeToExecuteFinished();
    }
    public rename(item, renameModal) {
        const that = this;
        dialog.prompt({
            cancelButtonText: "Abbrechen",
            defaultText: item.name,
            inputType: dialog.inputType.text,
            message: "in /" + this.currentPath.map((itm) => itm.name).join("/") + "/" + item.name,
            okButtonText: "Umbenennen",
            title: (item.type == "file" ? "Datei" : "Ordner") + " umbenennen",

        }).then((r) => {
            if (r.result) {
                that.remoteService
                    .getNoCache("post", "filesRename", { type: item.type, fid: item.id, name: r.text })
                    .subscribe((data) => {
                        if (data.status == true) {
                            that.alertService.success("Das Element wurde erfolgreich umbenannt.");
                            // this.reloadHere();
                        }
                    });
            }
        });

    }
    public delete(item) {
        if (confirm("Soll dieses Element wirklich gelöscht werden?")) {
            this.remoteService.getNoCache("post", "filesDelete", {
                fid: item.id,
                type: item.type,
            }).subscribe((data) => {
                if (data.status == true) {
                    this.alertService.success("Das Element wurde erfolgreich gelöscht.");
                    // this.reloadHere();
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

    /*reloadHere() {
        if (this.lastItem.id == -1) {
            this.navigate({ id: -1 });
        } else {
            this.goTo(this.lastItem, true);
        }
    }*/

    public onCellSwiping(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        // @ts-ignore
        const swipeView = args.swipeView;
        // @ts-ignore
        this.mainView = args.mainView;
        this.leftItem = swipeView.getViewById("left-stack");
        this.rightItem = swipeView.getViewById("right-stack");

        if (args.data.x > 0) {
            const leftDimensions = View.measureChild(
                 this.leftItem.parent as View,
                this.leftItem,
                layout.makeMeasureSpec(Math.abs(args.data.x), layout.EXACTLY),
                layout.makeMeasureSpec(this.mainView.getMeasuredHeight(), layout.EXACTLY));
            View.layoutChild( this.leftItem.parent as View, this.leftItem, 0, 0,
                leftDimensions.measuredWidth, leftDimensions.measuredHeight);
            this.hideOtherSwipeTemplateView("left");
        } else {
            const rightDimensions = View.measureChild(
                 this.rightItem.parent as View,
                this.rightItem,
                layout.makeMeasureSpec(Math.abs(args.data.x), layout.EXACTLY),
                layout.makeMeasureSpec(this.mainView.getMeasuredHeight(), layout.EXACTLY));

            View.layoutChild( this.rightItem.parent as View, this.rightItem,
                this.mainView.getMeasuredWidth() - rightDimensions.measuredWidth, 0,
                this.mainView.getMeasuredWidth(), rightDimensions.measuredHeight);
            this.hideOtherSwipeTemplateView("right");
        }
    }

    public onSwipeCellStarted(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        const swipeView = args.object;
        swipeLimits.left = swipeView.getViewById<View>("swipeTags").getMeasuredWidth() +
        swipeView.getViewById<View>("swipeDownload").getMeasuredWidth() +
        swipeView.getViewById<View>("swipeShare").getMeasuredWidth();
        swipeLimits.right = swipeView.getViewById<View>("swipeRename").getMeasuredWidth() +
        swipeView.getViewById<View>("swipeMove").getMeasuredWidth() +
        swipeView.getViewById<View>("swipeCopy").getMeasuredWidth() +
        swipeView.getViewById<View>("swipeDelete").getMeasuredWidth();
        // swipeLimits.threshold = leftItem.getMeasuredWidth() / 2;
    }

    public onLeftSwipeClick(args: EventData) {
        const itemView = args.object as View;
        this.itemsListView.listView.notifySwipeToExecuteFinished();
    }

    public onRightSwipeClick(args: EventData) {
        const itemView = args.object as View;
        this.itemsListView.listView.notifySwipeToExecuteFinished();
    }

    public onDrawerButtonTap(): void {
        const sideDrawer =  app.getRootView() as RadSideDrawer;
        sideDrawer.showDrawer();
    }

    private hideOtherSwipeTemplateView(currentSwipeView: string) {
        switch (currentSwipeView) {
            case "left":
                if (this.rightItem.getActualSize().width !== 0) {
                    View.layoutChild( this.rightItem.parent as View,
                        this.rightItem, this.mainView.getMeasuredWidth(), 0, this.mainView.getMeasuredWidth(), 0);
                }
                break;
            case "right":
                if (this.leftItem.getActualSize().width !== 0) {
                    View.layoutChild( this.leftItem.parent as View, this.leftItem, 0, 0, 0, 0);
                }
                break;
            default:
                break;
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
