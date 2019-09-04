import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { SetupItemViewArgs } from "nativescript-angular/directives";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import {
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertDialog,
    CFAlertStyle,
} from "nativescript-cfalert-dialog";
import { NYTPhotoItem, PaletteType, PhotoViewer, PhotoViewerOptions } from "nativescript-photoviewer";
import { ListViewEventData } from "nativescript-ui-listview";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { View } from "tns-core-modules/ui/core/view/view";
import { Page } from "tns-core-modules/ui/page/page";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-templates",
    styleUrls: ["./templates.component.scss"],
    templateUrl: "./templates.component.html",
})
export class TemplatesComponent implements OnInit {
    @ViewChild("templatesListView", { read: RadListViewComponent, static: false })
    public templatesListView: RadListViewComponent;
    public templates: any[] = [];
    public photoViewer: PhotoViewer;

    constructor(
        private remoteService: RemoteService,
        private alertService: AlertService,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private authService: AuthenticationService,
        private page: Page) {
        this.page.on("loaded", () => {
            this.photoViewer = new PhotoViewer();
        });
    }

    public ngOnInit() {
        this.remoteService.get("templatesGetTemplates").subscribe((data) => {
            this.templates = data;
        });
    }
    public onSetupItemView(args: SetupItemViewArgs) {
        args.view.context.third = args.index % 3 === 0;
        args.view.context.header = (args.index + 1) % this.templates.length === 1;
        args.view.context.footer = args.index + 1 === this.templates.length;
    }

    public showTemplate(index) {

        const templates /*: NYTPhotoItem[]*/ = [];
        this.templates.forEach((template) => {
            templates.push(/*{
                image: */`https://agmtools.allgaeu-gymnasium.de/AGM-Tools_NEU_API/\
                getTemplate.php?tid=${template.id}&token=${this.authService.currentUserValue.token}`, /*,
                title: template.name,
                summary: template.description,
                credit: template.type
            }*/);
        });

        const photoviewerOptions: PhotoViewerOptions = {
            android: {
                paletteType: PaletteType.DarkVibrant,
                showAlbum: false,
            },
            startIndex: index,
        };

        this.photoViewer.showGallery(templates, photoviewerOptions).then(() => { /* leer */ });
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

    public onDrawerButtonTap(): void {
        const sideDrawer =  app.getRootView() as RadSideDrawer;
        sideDrawer.showDrawer();
    }

    public onSwipeCellStarted(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        const swipeView = args.object;
        const rightItem = swipeView.getViewById<View>("delete-view");
        swipeLimits.right = rightItem.getMeasuredWidth();
    }

    public onRightSwipeClick(args) {
        const uid = args.object.bindingContext.id;
        const cfalertDialog = new CFAlertDialog();
        const onNoPressed = (response) => {
            this.templatesListView.listView.notifySwipeToExecuteFinished();
        };
        const onYesPressed = (response) => {
            this.templatesListView.listView.notifySwipeToExecuteFinished();
            this.remoteService
                .getNoCache("templatesDeleteTemplate", {
                    id: uid,
                })
                .subscribe((data) => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Vorlage erfolgreich gelöscht",
                        );
                        this.remoteService
                            .get("templatesGetTemplates")
                            .subscribe((res) => {
                                this.templates = res;
                            });
                    }
                });

        };
        cfalertDialog.show({
            buttons: [
                {
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    buttonStyle: CFAlertActionStyle.POSITIVE,
                    onClick: onYesPressed,
                    text: "Ja",

                },
                {
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    buttonStyle: CFAlertActionStyle.NEGATIVE,
                    onClick: onNoPressed,
                    text: "Nein",
                }],
            dialogStyle: CFAlertStyle.BOTTOM_SHEET,
            message: "Soll diese Vorlage wirklich gelöscht werden?",
            title: "Bestätigung",
        });
    }
}
