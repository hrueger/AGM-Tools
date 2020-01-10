    import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
    import { SetupItemViewArgs } from "nativescript-angular/directives";
    import { ModalDialogService } from "nativescript-angular/directives/dialogs";
    import { PageChangeEventData } from "nativescript-image-swipe";
    import { ListViewEventData } from "nativescript-ui-listview";
    import { RadListViewComponent } from "nativescript-ui-listview/angular/listview-directives";
    import * as app from "tns-core-modules/application";
    import * as dialogs from "tns-core-modules/ui/dialogs";
    import { Page } from "tns-core-modules/ui/page/page";
    import { environment } from "../../../environments/environment";
    import { AlertService } from "../../_services/alert.service";
    import { AuthenticationService } from "../../_services/authentication.service";
    import { FastTranslateService } from "../../_services/fast-translate.service";
    import { RemoteService } from "../../_services/remote.service";

    @Component({
    selector: "app-tutorials",
    styleUrls: ["./tutorials.component.css"],
    templateUrl: "./tutorials.component.html",
    })
    export class TutorialsComponent implements OnInit {
    @ViewChild("tutorialsListView", { read: RadListViewComponent, static: false })
    public tutorialsListView: RadListViewComponent;
    @ViewChild("tutorialStepsListView", { read: RadListViewComponent, static: false })
    public tutorialStepsListView: RadListViewComponent;
    public tutorials: any[] = [];
    public pageNumber: number;
    public stepsImages: any[] = [];
    public currentTutorial: any = {};
    public showingTutorial: boolean = false;
    public showingTutorialImage: boolean = false;
    public currentStepImages: any[] = [];
    public loading: boolean = false;
    public currentStep: any;
    public currentStepIdx: number;

    constructor(
        private remoteService: RemoteService,
        private alertService: AlertService,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private authService: AuthenticationService,
        private fts: FastTranslateService,
        private page: Page) {
    }

    public ngOnInit() {
    this.page.actionBarHidden = true;
    this.remoteService.get("get", "tutorials").subscribe((data) => {
        this.tutorials = data;
    });
    }
    public onPageChanged(e: PageChangeEventData) {
        //
    }
    public onSetupItemView(args: SetupItemViewArgs) {
        args.view.context.third = args.index % 3 === 0;
        args.view.context.header = (args.index + 1) % this.tutorials.length === 1;
        args.view.context.footer = args.index + 1 === this.tutorials.length;
    }

    public getFileSrc(file) {
        return `${environment.apiUrl}tutorials/files/${file}?authorization=${this.authService.currentUserValue.token}`;
    }

    public openStepImage(step, i, imageUrl) {
        this.showingTutorialImage = true;
        this.currentStepImages = this.stepsImages[i];
        this.pageNumber = this.currentStepImages.findIndex((n) => n.imageUrl == this.getFileSrc(imageUrl));
        this.currentStep = step;
        this.currentStepIdx = i;
    }

    public showTutorial(tutorial) {
        this.loading = true;
        this.remoteService.get("get", `tutorials/${tutorial.id}`).subscribe((t) => {
            if (t) {
                this.stepsImages = [];
                this.loading = false;
                this.showingTutorial = true;
                this.currentTutorial = t;
                this.currentTutorial.editable = tutorial.editable;
                this.currentTutorial.steps.forEach((step) => {
                    const s = [];
                    if (step.image1) {
                        s.push({
                            imageUrl: `${environment.apiUrl}tutorials/files/${step.image1}?authorization=${this.authService.currentUserValue.token}`,
                        });
                    }
                    if (step.image2) {
                        s.push({
                            imageUrl: `${environment.apiUrl}tutorials/files/${step.image2}?authorization=${this.authService.currentUserValue.token}`,
                        });
                    }
                    if (step.image3) {
                        s.push({
                            imageUrl: `${environment.apiUrl}tutorials/files/${step.image3}?authorization=${this.authService.currentUserValue.token}`,
                        });
                    }
                    this.stepsImages.push(s);
                });
            }
        });
    }
    public back(): void {
        if (this.showingTutorialImage) {
            this.showingTutorialImage = false;
            this.currentStep = undefined;
            this.currentStepIdx = 0;
        } else {
            this.showingTutorial = false;
            this.currentTutorial = false;
        }
    }

    public async openNewModal() {
        this.alertService.info(await this.fts.t("general.avalibleInFutureVersion"));
        /*let options = {
            animated: true,
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef
        };
        this.modal.showModal(NewtutorialModalComponent, options).then(newtutorial => {
            if (newtutorial) {
                this.remoteService
                    .getNoCache("tutorialsNewtutorial", {
                        tutorialname: newtutorial.name,
                        email: newtutorial.email,
                        pw: newtutorial.password,
                        pw2: newtutorial.password2
                    })
                    .subscribe(data => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                "Vorlage erfolgreich erstellt"
                            );
                            this.remoteService
                                .get("tutorialsGettutorials")
                                .subscribe(data => {
                                    this.tutorials = data;
                                });
                        }
                    });
            }

        });*/
    }

    public onDrawerButtonTap(): void {
        // @ts-ignore
        const sideDrawer = app.getRootView() as RadSideDrawer;
        sideDrawer.showDrawer();
    }

    public onSwipeCellStarted(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        const swipeView = args.object;
        // @ts-ignore
        const rightItem = swipeView.getViewById<View>("delete-view");
        swipeLimits.right = rightItem.getMeasuredWidth();
    }

    public async onRightSwipeClick(args) {
        const id = args.object.bindingContext.id;
        if (await dialogs.confirm(await this.fts.t("tutorials.confirmDelete"))) {
            this.remoteService
                .getNoCache("delete", `tutorials/${id}`)
                .subscribe(async (data) => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            await this.fts.t("tutorials.tutorialDeletedSuccessfully"),
                        );
                        this.remoteService
                            .get("get", "tutorial")
                            .subscribe((res) => {
                                this.tutorials = res;
                            });
                    }
                });
        }
    }
}
