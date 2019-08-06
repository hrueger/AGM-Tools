import { RemoteService } from "../../_services/remote.service";
import { Project } from "../../_models/project.model";
import { Component, OnInit, ViewChild, ChangeDetectorRef, NgZone } from "@angular/core";
import config from "../../_config/config";
import { AuthenticationService } from "../../_services/authentication.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AlertService } from "../../_services/alert.service";
import { MultiSelect, AShowType } from 'nativescript-multi-select';
import { MSOption } from 'nativescript-multi-select';
import { NavbarService } from "../../_services/navbar.service";

import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { View, EventData } from "tns-core-modules/ui/core/view";
import { layout } from "tns-core-modules/utils/utils";
import { ListViewEventData } from "nativescript-ui-listview";

//import { MenuItemModel, MenuEventArgs } from "@syncfusion/ej2-navigations";

@Component({
    selector: "app-files",
    templateUrl: "./files.component.html",
    styleUrls: ["./files.component.scss"]
})
export class FilesComponent implements OnInit {
    renameItemName: string;
    renameItemForm: FormGroup;
    constructor(
        private remoteService: RemoteService,
        private authenticationService: AuthenticationService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private NavbarService: NavbarService,
        private cdr: ChangeDetectorRef,
        private zone: NgZone,
    ) {
        this._MSelect = new MultiSelect();
    }
    @ViewChild("itemsListView", { read: RadListViewComponent, static: false }) itemsListView: RadListViewComponent;
    newFolderModalInvalidMessage: boolean = false;
    renameItemFormInvalidMessage: boolean = false;
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
    items: any[];
    newFolderName: string;
    newFolderForm: FormGroup;
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
                this.items = data;



                this.lastItem = item;
            });
    }
    getSrc() {
        let file = this.currentPath[this.currentPath.length - 1];
        return (
            config.apiUrl +
            "?get=" +
            file.id +
            "&type=file" +
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
                                this.alertService.success("Der neue Ordner wurde erfolgreich erstellt.");
                                this.reloadHere();
                            }
                        });
                },
                reason => { }
            );
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
    editTags($event) {
        var tags = $event.object.bindingContext.tags;
        console.log(tags);
        console.log(this.tags);
        const options: MSOption = {
            title: "Tags auswählen",
            selectedItems: tags,
            items: this.tags,
            bindValue: "id",
            displayLabel: "name",
            onConfirm: selectedItems => {
                this.zone.run(() => {
                    console.log("SELECTED ITEMS => ", selectedItems);
                })
            },

            android: {
                titleSize: 25,
                cancelButtonTextColor: "#252323",
                confirmButtonTextColor: "#70798C",
            },
            ios: {
                cancelButtonBgColor: "#252323",
                confirmButtonBgColor: "#70798C",
                cancelButtonTextColor: "#ffffff",
                confirmButtonTextColor: "#ffffff",
                showType: AShowType.TypeBounceIn
            }
        };

        this._MSelect.show(options);
        console.log(tags);
        return;
        this.remoteService
            .getNoCache("filesToggleTag", {
                type: item.type,
                fid: item.id,
                tagid: tagid
            })
            .subscribe(data => {
                if (data.status == true) {
                    //this.goTo(this.lastItem);
                    this.reloadHere();
                }
            });
    }
    download(item) {
        window.open(
            config.apiUrl +
            "?get=" +
            item.id +
            "&type=" +
            item.type +
            "&token=" +
            this.authenticationService.currentUserValue.token +
            "&download"
        );
    }
    share(item, shareModal) {
        this.shareLink = "";
        this.modalService
            .open(shareModal)
            .result.then(result => { }, reason => { });
        this.remoteService
            .getNoCache("filesCreateShare", { type: item.type, fid: item.id })
            .subscribe(data => {
                if (data.status == true) {
                    this.shareLink = config.apiUrl + "share/?l=" + data.link
                }
            });
    }
    rename(item, renameModal) {
        this.renameItemForm.get("renameItemName").setValue(item.name);
        this.modalService
            .open(renameModal)
            .result.then(result => {
                this.remoteService
                    .getNoCache("filesRename", { type: item.type, fid: item.id, name: this.renameItemForm.get("renameItemName").value })
                    .subscribe(data => {
                        if (data.status == true) {
                            this.alertService.success("Das Element wurde erfolgreich umbenannt.");
                            this.reloadHere();
                        }
                    });
            }, reason => { });

    }
    delete(item) {
        if (confirm("Soll dieses Element wirklich gelöscht werden?")) {
            this.remoteService.getNoCache("filesDelete", { type: item.type, fid: item.id }).subscribe(data => {
                if (data.status == true) {
                    this.alertService.success("Das Element wurde erfolgreich gelöscht.");
                    this.reloadHere();
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

    copyShareLink(inputField) {
        inputField.select();
        document.execCommand('copy');
        inputField.setSelectionRange(0, 0);
        this.alertService.success("Link in die Zwischenablage kopiert!");
    }
    openShareLinkInNewTab() {
        var win = window.open(this.shareLink, '_blank');
        win.focus();
    }
    reloadHere() {
        if (this.lastItem.id == -1) {
            this.navigate({ id: -1 });
        } else {
            this.goTo(this.lastItem, true);
        }
    }

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
}
