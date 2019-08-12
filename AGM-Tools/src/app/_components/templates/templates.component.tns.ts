import { Component, OnInit, ViewContainerRef, ViewChild } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { SetupItemViewArgs } from "nativescript-angular/directives";
import { AlertService } from "../../_services/alert.service";
import { NavbarService } from "../../_services/navbar.service";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { ListViewEventData } from "nativescript-ui-listview";
import {
    CFAlertDialog,
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertStyle
} from 'nativescript-cfalert-dialog';
import { View } from "tns-core-modules/ui/core/view/view";
import { AuthenticationService } from "../../_services/authentication.service";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { Page } from "tns-core-modules/ui/page/page";
import { PhotoViewer, PhotoViewerOptions, PaletteType, NYTPhotoItem } from "nativescript-photoviewer";

@Component({
    selector: "app-templates",
    templateUrl: "./templates.component.html",
    styleUrls: ["./templates.component.scss"]
})
export class TemplatesComponent implements OnInit {
    @ViewChild("templatesListView", { read: RadListViewComponent, static: false }) templatesListView: RadListViewComponent;
    templates: any[] = [];
    photoViewer: PhotoViewer;

    constructor(
        private remoteService: RemoteService,
        private alertService: AlertService,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private authService: AuthenticationService,
        private _page: Page) {
        this._page.on("loaded", () => {
            this.photoViewer = new PhotoViewer();
        });
    }

    ngOnInit() {
        this.remoteService.get("templatesGetTemplates").subscribe(data => {
            this.templates = data;
        });
    }
    onSetupItemView(args: SetupItemViewArgs) {
        args.view.context.third = args.index % 3 === 0;
        args.view.context.header = (args.index + 1) % this.templates.length === 1;
        args.view.context.footer = args.index + 1 === this.templates.length;
    }

    showTemplate(index) {


        let templates/*: NYTPhotoItem[]*/ = [];
        this.templates.forEach(template => {
            templates.push(/*{
                image: */`https://agmtools.allgaeu-gymnasium.de/AGM-Tools_NEU_API/getTemplate.php?tid=${template.id}&token=${this.authService.currentUserValue.token}`/*,
                title: template.name,
                summary: template.description,
                credit: template.type
            }*/);
        });

        let photoviewerOptions: PhotoViewerOptions = {
            startIndex: index,
            android: {
                paletteType: PaletteType.DarkVibrant,
                showAlbum: false,
            }
        };

        this.photoViewer.showGallery(templates, photoviewerOptions).then(() => { });
    }

    public openNewModal() {
        this.alertService.info("Gibt's am Handy noch nicht!");
        /*let options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef
        };
        this.modal.showModal(NewTemplateModalComponent, options).then(newTemplate => {
            if (newtemplate) {
                this.remoteService
                    .getNoCache("templatesNewTemplate", {
                        templatename: newTemplate.name,
                        email: newTemplate.email,
                        pw: newTemplate.password,
                        pw2: newTemplate.password2
                    })
                    .subscribe(data => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                "Vorlage erfolgreich erstellt"
                            );
                            this.remoteService
                                .get("templatesGetTemplates")
                                .subscribe(data => {
                                    this.templates = data;
                                });
                        }
                    });
            }
    
        });*/
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }




    public onSwipeCellStarted(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        const swipeView = args['object'];
        const rightItem = swipeView.getViewById<View>('delete-view');
        swipeLimits.right = rightItem.getMeasuredWidth();
    }


    public onRightSwipeClick(args) {
        var uid = args.object.bindingContext.id;
        let cfalertDialog = new CFAlertDialog();
        const onNoPressed = response => {
            console.log("nein");
            this.templatesListView.listView.notifySwipeToExecuteFinished();
        };
        const onYesPressed = response => {
            console.log("ja");
            this.templatesListView.listView.notifySwipeToExecuteFinished();
            this.remoteService
                .getNoCache("templatesDeleteTemplate", {
                    id: uid
                })
                .subscribe(data => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Vorlage erfolgreich gelöscht"
                        );
                        this.remoteService
                            .get("templatesGetTemplates")
                            .subscribe(data => {
                                this.templates = data;
                            });
                    } else {
                        console.log(data);
                    }
                });

        };
        cfalertDialog.show({
            dialogStyle: CFAlertStyle.BOTTOM_SHEET,
            title: "Bestätigung",
            message: "Soll diese Vorlage wirklich gelöscht werden?",
            buttons: [
                {
                    text: "Ja",
                    buttonStyle: CFAlertActionStyle.POSITIVE,
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    onClick: onYesPressed


                },
                {
                    text: "Nein",
                    buttonStyle: CFAlertActionStyle.NEGATIVE,
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    onClick: onNoPressed
                }]
        });
    }
}
