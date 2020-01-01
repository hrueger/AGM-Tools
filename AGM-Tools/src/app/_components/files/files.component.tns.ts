import { Component, NgZone, OnInit, ViewChild } from "@angular/core";
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
import { layout } from "tns-core-modules/utils/utils";
import { openUrl } from "tns-core-modules/utils/utils";
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
    public showProgressbar: boolean;
    @ViewChild("itemsListView", { read: RadListViewComponent, static: false })
    public itemsListView: RadListViewComponent;
    public selectProject: boolean = true;
    public viewFile: boolean = false;
    public projects: Project[];
    public imageSource: string;
    public pid: number;

    public tags = [
        { id: 1, name: "Fertig" },
        { id: 4, name: "Zu verbessern" },
        { id: 2, name: "In Arbeit" },
        { id: 3, name: "Wichtig" },
    ];

    public currentPath: any = [];
    public lastFolder: any;
    public lastItem: any;
    public items: ObservableArray<any>;
    public shareLink: string = "";
    private multiSelect: MultiSelect;

    private leftItem: View;
    private rightItem: View;
    private mainView: View;
    constructor(
        private remoteService: RemoteService,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private navbarService: NavbarService,
        private zone: NgZone,
    ) {
        this.multiSelect = new MultiSelect();
    }

    public ngOnInit() {
        this.navbarService.setHeadline("Dateien");

        this.remoteService.get("post", "projectsGetProjects").subscribe((data) => {
            this.projects = data;
        });
    }
    public goTo(item: any, reload = false) {
        if (!reload) {
            this.currentPath.push(item);
        }
        if (item.type == "folder") {
            this.navigate(item);
        } else {
            this.viewFile = true;
            this.imageSource = `${environment.apiUrl}getFile.php?fid=${item.id}`;

        }
    }
    public getIcon(item: any) {

        const basepath = "~/assets/icons/";

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
            .get("post", "filesGetFolder", {
                fid: item.id,
                pid: this.pid,
            })
            .subscribe((data) => {
                if (
                    this.currentPath.length == 0 ||
                    this.currentPath[this.currentPath.length - 1].id != item.id
                ) {
                    this.currentPath.push(item);
                }

                /*data.forEach(item, index => {
                    this.items.splice(index, 0, item);
                });
                if (data.length < this.items.length) {
                    for (var i = data.length; i < this.items.length; i++) {
                        this.items.splice(i, 1);
                    }
                }*/
                this.items = data;

                this.lastItem = item;
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
                    .getNoCache("post", "filesNewFolder", {
                        fid: that.currentPath[that.currentPath.length - 1].id,
                        name: r.text,
                        pid: that.pid,
                    })
                    .subscribe((data) => {
                        if (data && data.status == true) {
                            that.alertService.success("Der neue Ordner wurde erfolgreich erstellt.");
                            // this.reloadHere();
                        }
                    });
            }

        });

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
}
