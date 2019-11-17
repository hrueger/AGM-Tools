import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { SetupItemViewArgs } from "nativescript-angular/directives";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import {
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertDialog,
    CFAlertStyle,
} from "nativescript-cfalert-dialog";
import { PageChangeEventData } from "nativescript-image-swipe";
import { ListViewEventData } from "nativescript-ui-listview";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { View } from "tns-core-modules/ui/core/view/view";
import { Page } from "tns-core-modules/ui/page/page";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
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
    public showingTemplate: boolean = false;
    public pageNumber: number;
    public templatesToShow: any[] = [];
    public currentTemplateName: string;
    public currentTemplateDescription: any;

    constructor(
        private remoteService: RemoteService,
        private alertService: AlertService,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private authService: AuthenticationService,
        private page: Page) {
    }

    public ngOnInit() {
        this.remoteService.get("post", "templatesGetTemplates").subscribe((data) => {
            this.templates = data;
            this.templatesToShow = [];
            this.templates.forEach((template) => {
                this.templatesToShow.push({
                    // credit: template.type,
                    imageUrl: `https://agmtools.allgaeu-gymnasium.de/AGM-Tools_NEU_API/\
getTemplate.php?tid=${template.id}&token=${this.authService.currentUserValue.token}`,
                    // summary: template.description,
                    // title: template.name,
                });
            });
        });
    }
    public onPageChanged(e: PageChangeEventData) {
        this.currentTemplateName = this.templates[e.page].name;
        this.currentTemplateDescription = this.templates[e.page].description;
    }
    public downloadCurrentTemplate() {
        alert("Herunterladen von Vorlagen wird noch nicht unterstützt!");
    }
    public onSetupItemView(args: SetupItemViewArgs) {
        args.view.context.third = args.index % 3 === 0;
        args.view.context.header = (args.index + 1) % this.templates.length === 1;
        args.view.context.footer = args.index + 1 === this.templates.length;
    }

    public showTemplate(index: number) {
        this.pageNumber = index;
        this.showingTemplate = true;
        this.page.actionBarHidden = true;
        this.currentTemplateName = this.templates[index].name;
        this.currentTemplateDescription = this.templates[index].description;
    }
    public back(): void {
        this.showingTemplate = false;
        this.page.actionBarHidden = false;
        this.currentTemplateName = "";
        this.currentTemplateDescription = "";
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
        const sideDrawer = app.getRootView() as RadSideDrawer;
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
                .getNoCache("post", "templatesDeleteTemplate", {
                    id: uid,
                })
                .subscribe((data) => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Vorlage erfolgreich gelöscht",
                        );
                        this.remoteService
                            .get("post", "templatesGetTemplates")
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
