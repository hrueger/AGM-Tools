import {
    Component, OnInit, ViewChild, ViewContainerRef,
} from "@angular/core";
import { SetupItemViewArgs } from "nativescript-angular/directives";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { PageChangeEventData } from "nativescript-image-swipe";
import { ListViewEventData } from "nativescript-ui-listview";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { View } from "tns-core-modules/ui/core/view/view";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page/page";
import { environment } from "../../../environments/environment";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import * as DownloadService from "../../_services/download.service.tns";
import { FastTranslateService } from "../../_services/fast-translate.service";
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
    public showingTemplate = false;
    public pageNumber: number;
    public templatesToShow: any[] = [];
    public currentTemplateName: string;
    public currentTemplateDescription: any;
    private currentPageIdx: number;

    constructor(
        private remoteService: RemoteService,
        private alertService: AlertService,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private authService: AuthenticationService,
        private fts: FastTranslateService,
        private downloadService: DownloadService.DownloadService,
        private page: Page,
    ) {
    }

    public ngOnInit() {
        this.remoteService.get("get", "templates").subscribe((data) => {
            this.templates = data;
            this.templatesToShow = [];
            if (this.templates) {
                this.templates.forEach((template) => {
                    this.templatesToShow.push({
                        imageUrl: `${environment.apiUrl}templates/${template.filename}?authorization=${this.authService.currentUserValue.token}`,
                    });
                });
            }
        });
    }
    public onPageChanged(e: PageChangeEventData) {
        this.currentTemplateName = this.templates[e.page].name;
        this.currentTemplateDescription = this.templates[e.page].description;
        this.currentPageIdx = e.page;
    }

    public async downloadCurrentTemplate() {
        this.downloadService.download(
            this.templatesToShow[this.currentPageIdx].imageUrl,
            "downloads",
            `${this.templates[this.currentPageIdx].name}.${this.templates[this.currentPageIdx].filename.split(".").pop()}`,
            true,
            this.currentTemplateName,
        );
    }

    public onSetupItemView(args: SetupItemViewArgs) {
        args.view.context.third = args.index % 3 === 0;
        args.view.context.header = (args.index + 1) % this.templates.length === 1;
        args.view.context.footer = args.index + 1 === this.templates.length;
    }

    public showTemplate(index: number) {
        this.pageNumber = index;
        this.currentPageIdx = index;
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

    public async openNewModal() {
        this.alertService.info(await this.fts.t("general.avalibleInFutureVersion"));
        /* let options = {
            animated: true,
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

        }); */
    }

    public onDrawerButtonTap(): void {
        // @ts-ignore
        const sideDrawer = app.getRootView() as RadSideDrawer;
        sideDrawer.showDrawer();
    }

    public onSwipeCellStarted(args: ListViewEventData) {
        const { swipeLimits } = args.data;
        const swipeView = args.object;
        // @ts-ignore
        const rightItem = swipeView.getViewById<View>("delete-view");
        swipeLimits.right = rightItem.getMeasuredWidth();
    }

    public async onRightSwipeClick(args) {
        const { id } = args.object.bindingContext;
        if (await dialogs.confirm(await this.fts.t("templates.confirmDelete"))) {
            this.remoteService
                .getNoCache("delete", `templates/${id}`)
                .subscribe(async (data) => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            await this.fts.t("templates.templateDeletedSuccessfully"),
                        );
                        this.remoteService
                            .get("get", "template")
                            .subscribe((res) => {
                                this.templates = res;
                            });
                    }
                });
        }
    }
}
