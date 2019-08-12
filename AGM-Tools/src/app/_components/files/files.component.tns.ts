import { RemoteService } from "../../_services/remote.service";
import { Project } from "../../_models/project.model";
import { Component, OnInit, ViewChild, NgZone } from "@angular/core";
import config from "../../_config/config";
import { AuthenticationService } from "../../_services/authentication.service";
import { AlertService } from "../../_services/alert.service";
import { MultiSelect, AShowType } from 'nativescript-multi-select';
import { MSOption } from 'nativescript-multi-select';
import { NavbarService } from "../../_services/navbar.service";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { View, EventData } from "tns-core-modules/ui/core/view";
import { layout } from "tns-core-modules/utils/utils";
import { ListViewEventData } from "nativescript-ui-listview";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import { openUrl } from "tns-core-modules/utils/utils";
import * as dialog from "tns-core-modules/ui/dialogs";
import * as app from "tns-core-modules/application";
import * as clipboard from "nativescript-clipboard";
import {
    CFAlertDialog,
    DialogOptions,
    CFAlertGravity,
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertStyle
} from 'nativescript-cfalert-dialog';
import { ObservableArray } from "tns-core-modules/data/observable-array/observable-array";


@Component({
    selector: "app-files",
    templateUrl: "./files.component.html",
    styleUrls: ["./files.component.scss"]
})
export class FilesComponent implements OnInit {
    showProgressbar: boolean;
    constructor(
        private remoteService: RemoteService,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private NavbarService: NavbarService,
        private zone: NgZone,
    ) {
        this._MSelect = new MultiSelect();
    }
    @ViewChild("itemsListView", { read: RadListViewComponent, static: false }) itemsListView: RadListViewComponent;
    selectProject: boolean = true;
    viewFile: boolean = false;
    projects: Project[];
    imageSource: string;
    pid: number;
    private _MSelect: MultiSelect;


    tags = [
        { id: 1, name: "Fertig" },
        { id: 4, name: "Zu verbessern" },
        { id: 2, name: "In Arbeit" },
        { id: 3, name: "Wichtig" }
    ]

    currentPath: any = [];
    lastFolder: any;
    lastItem: any;
    items: ObservableArray<any>;
    shareLink: string = "";


    private leftItem: View;
    private rightItem: View;
    private mainView: View;


    ngOnInit() {
        this.NavbarService.setHeadline("Dateien");

        this.remoteService.get("projectsGetProjects").subscribe(data => {
            this.projects = data;
        });
    }
    goTo(item: any, reload = false) {
        if (!reload) {
            this.currentPath.push(item);
        }
        if (item.type == "folder") {
            this.navigate(item);
        } else {
            this.viewFile = true;
            this.imageSource =
                "https://agmtools.allgaeu-gymnasium.de/AGM-Tools/getFile.php?fid=" +
                item.id;


        }
    }
    getIcon(item: any) {

        var basepath = "~/assets/icons/";


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
    getSrc() {
        let file = this.currentPath[this.currentPath.length - 1];
        const path = config.apiUrl +
            "?get=" +
            file.id +
            "&type=file" +
            "&token=" +
            this.authenticationService.currentUserValue.token;
        return path;
    }
    openNewFolderModal(content) {
        var that = this;
        dialog.prompt({
            title: "Neuer Ordner",
            message: "in /" + this.currentPath.map(item => item.name).join("/") + "/",
            okButtonText: "Erstellen",
            cancelButtonText: "Abbrechen",
            defaultText: "Neuer Ordner",
            inputType: dialog.inputType.text

        }).then(function (r) {
            if (r.result) {
                that.remoteService
                    .getNoCache("filesNewFolder", {
                        name: r.text,
                        pid: that.pid,
                        fid: that.currentPath[that.currentPath.length - 1]
                            .id
                    })
                    .subscribe(data => {
                        if (data && data.status == true) {
                            that.alertService.success("Der neue Ordner wurde erfolgreich erstellt.");
                            //this.reloadHere();
                        }
                    });
            }

        });

    }
    getType() {
        let filename = this.currentPath[
            this.currentPath.length - 1
        ].name.toLowerCase();
        var videoFileExtensions = ["mp4", "mov", "avi"];
        var imageFileExtensions = ["jpg", "jpeg", "gif", "png"];
        var pdfFileExtensions = ["pdf"];
        for (let ext of videoFileExtensions) {
            if (filename.endsWith(ext)) {
                return "video";
            }
        }
        for (let ext of pdfFileExtensions) {
            if (filename.endsWith(ext)) {
                return "pdf";
            }
        }
        for (let ext of imageFileExtensions) {
            if (filename.endsWith(ext)) {
                return "image";
            }
        }
        return "other";
    }


    editTags(item) {
        this.itemsListView.listView.notifySwipeToExecuteFinished();
        var itemTags = item.tags;
        var allTags = this.tags.map(tag => tag.id);
        var allTagNames = this.tags.map(tag => tag.name);
        var preselected = [];
        allTags.forEach(tag => {
            if (itemTags.map(tag => tag.id).includes(tag.toString())) {
                preselected.push(true);
            } else {
                preselected.push(false);
            }
        });
        let cfalertDialog = new CFAlertDialog();
        const options: DialogOptions = {
            dialogStyle: CFAlertStyle.ALERT,
            title: "Tags auswählen",
            multiChoiceList: {
                items: allTagNames,
                selectedItems: preselected,
                onClick: (dialogInterface, index) => {
                    this.remoteService
                        .getNoCache("filesToggleTag", {
                            type: item.type,
                            fid: item.id,
                            tagid: this.tags[index].id
                        })
                        .subscribe(data => {
                            if (data.status == true) {
                                this.alertService.success("Gespeichert!");
                                //this.reloadHere();
                            }
                        });
                }
            }
        }
        cfalertDialog.show(options);
        return;

    }
    download(item) {
        var url = config.apiUrl +
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

    share(item) {
        this.remoteService
            .getNoCache("filesCreateShare", { type: item.type, fid: item.id })
            .subscribe(data => {
                if (data.status == true) {
                    var shareLink = config.apiUrl + "share/?l=" + data.link
                    let cfalertDialog = new CFAlertDialog();
                    let options: DialogOptions = {
                        // Options go here
                        dialogStyle: CFAlertStyle.ALERT,
                        title: "Freigeben",
                        message: "Ein Link wurde generiert:\n" + shareLink,
                        textAlignment: CFAlertGravity.START,
                        cancellable: true,
                        buttons: [{
                            text: "Abbrechen",
                            buttonStyle: CFAlertActionStyle.DEFAULT,
                            buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                            onClick: () => { }
                        }, {
                            text: "Kopieren",
                            buttonStyle: CFAlertActionStyle.POSITIVE,
                            buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                            onClick: () => {
                                clipboard.setText(shareLink);
                                this.alertService.success("Link kopiert!");
                            }
                        }]
                    }
                    cfalertDialog.show(options);
                }
            });
        this.itemsListView.listView.notifySwipeToExecuteFinished();
    }
    rename(item, renameModal) {
        var that = this;
        dialog.prompt({
            title: (item.type == "file" ? "Datei" : "Ordner") + " umbenennen",
            message: "in /" + this.currentPath.map(item => item.name).join("/") + "/" + item.name,
            okButtonText: "Umbenennen",
            cancelButtonText: "Abbrechen",
            defaultText: item.name,
            inputType: dialog.inputType.text

        }).then(function (r) {
            if (r.result) {
                that.remoteService
                    .getNoCache("filesRename", { type: item.type, fid: item.id, name: r.text })
                    .subscribe(data => {
                        if (data.status == true) {
                            that.alertService.success("Das Element wurde erfolgreich umbenannt.");
                            //this.reloadHere();
                        }
                    });
            }
        });


    }
    delete(item) {
        if (confirm("Soll dieses Element wirklich gelöscht werden?")) {
            this.remoteService.getNoCache("filesDelete", { type: item.type, fid: item.id }).subscribe(data => {
                if (data.status == true) {
                    this.alertService.success("Das Element wurde erfolgreich gelöscht.");
                    //this.reloadHere();
                }
            });
        }
    }
    move(item) {
        this.alertService.info("Diese Funktion wird in einer zukünftigen Version hinzugefügt. Wenn sie jetzt dringend benötigt wird, bitte bei Hannes melden!");
    }
    copy(item) {
        this.alertService.info("Diese Funktion wird in einer zukünftigen Version hinzugefügt. Wenn sie jetzt dringend benötigt wird, bitte bei Hannes melden!");
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
        const swipeView = args['swipeView'];
        this.mainView = args['mainView'];
        this.leftItem = swipeView.getViewById('left-stack');
        this.rightItem = swipeView.getViewById('right-stack');

        if (args.data.x > 0) {
            const leftDimensions = View.measureChild(
                <View>this.leftItem.parent,
                this.leftItem,
                layout.makeMeasureSpec(Math.abs(args.data.x), layout.EXACTLY),
                layout.makeMeasureSpec(this.mainView.getMeasuredHeight(), layout.EXACTLY));
            View.layoutChild(<View>this.leftItem.parent, this.leftItem, 0, 0, leftDimensions.measuredWidth, leftDimensions.measuredHeight);
            this.hideOtherSwipeTemplateView("left");
        } else {
            const rightDimensions = View.measureChild(
                <View>this.rightItem.parent,
                this.rightItem,
                layout.makeMeasureSpec(Math.abs(args.data.x), layout.EXACTLY),
                layout.makeMeasureSpec(this.mainView.getMeasuredHeight(), layout.EXACTLY));

            View.layoutChild(<View>this.rightItem.parent, this.rightItem, this.mainView.getMeasuredWidth() - rightDimensions.measuredWidth, 0, this.mainView.getMeasuredWidth(), rightDimensions.measuredHeight);
            this.hideOtherSwipeTemplateView("right");
        }
    }

    private hideOtherSwipeTemplateView(currentSwipeView: string) {
        switch (currentSwipeView) {
            case "left":
                if (this.rightItem.getActualSize().width !== 0) {
                    View.layoutChild(<View>this.rightItem.parent, this.rightItem, this.mainView.getMeasuredWidth(), 0, this.mainView.getMeasuredWidth(), 0);
                }
                break;
            case "right":
                if (this.leftItem.getActualSize().width !== 0) {
                    View.layoutChild(<View>this.leftItem.parent, this.leftItem, 0, 0, 0, 0);
                }
                break;
            default:
                break;
        }
    }

    public onSwipeCellStarted(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        const swipeView = args.object;
        swipeLimits.left = swipeView.getViewById<View>('swipeTags').getMeasuredWidth() + swipeView.getViewById<View>('swipeDownload').getMeasuredWidth() + swipeView.getViewById<View>('swipeShare').getMeasuredWidth();
        swipeLimits.right = swipeView.getViewById<View>('swipeRename').getMeasuredWidth() + swipeView.getViewById<View>('swipeMove').getMeasuredWidth() + swipeView.getViewById<View>('swipeCopy').getMeasuredWidth() + swipeView.getViewById<View>('swipeDelete').getMeasuredWidth();
        //swipeLimits.threshold = leftItem.getMeasuredWidth() / 2;
    }

    public onLeftSwipeClick(args: EventData) {
        let itemView = args.object as View;
        console.log("Button clicked: " + itemView.id + " for item with index: " + this.itemsListView.listView.items.indexOf(itemView.bindingContext));
        this.itemsListView.listView.notifySwipeToExecuteFinished();
    }

    public onRightSwipeClick(args: EventData) {
        let itemView = args.object as View;
        console.log("Button clicked: " + itemView.id + " for item with index: " + this.itemsListView.listView.items.indexOf(itemView.bindingContext));
        this.itemsListView.listView.notifySwipeToExecuteFinished();
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
}
