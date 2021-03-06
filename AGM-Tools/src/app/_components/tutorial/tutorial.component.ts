import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Lightbox } from "ngx-lightbox";
import { getApiUrl } from "../../_helpers/getApiUrl";
import { AuthenticationService } from "../../_services/authentication.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-tutorial",
    styleUrls: ["./tutorial.component.css"],
    templateUrl: "./tutorial.component.html",
})
export class TutorialComponent implements OnInit {
    public tutorialId: any;
    public tutorial: any;
    public allImageSources: any = [];

    constructor(private navbarService: NavbarService,
        private route: ActivatedRoute,
        private http: HttpClient,
        private lightbox: Lightbox,
        private authenticationService: AuthenticationService,
        private fts: FastTranslateService,
        private remoteService: RemoteService) { }

    public async ngOnInit() {
        this.navbarService.setHeadline(await this.fts.t("tutorials.tutorials"));
        this.route.params.subscribe((params) => {
            this.remoteService.get("get", `tutorials/${params.index}`).subscribe((tutorial) => {
                this.gotNewTutorialData(tutorial);
            });
        });
    }

    public async showImage(i, n) {
        const that = this;
        if (this.allImageSources.length == 0) {
            for (const step of this.tutorial.steps) {
                if (step.image1) {
                    that.allImageSources.push({
                        caption: step.title,
                        name: step.image1,
                        src: this.getFileSrc(step.image1),
                    });
                }
                if (step.image2) {
                    that.allImageSources.push({
                        caption: step.title,
                        name: step.image2,
                        src: this.getFileSrc(step.image2),
                    });
                }
                if (step.image3) {
                    that.allImageSources.push({
                        caption: step.title,
                        name: step.image3,
                        src: this.getFileSrc(step.image3),
                    });
                }
            }
        }
        const toCompare = (n == 1 ? that.tutorial.steps[i].image1
            : (n == 2 ? that.tutorial.steps[i].image2 : that.tutorial.steps[i].image3));
        const index = this.allImageSources.findIndex((img) => img.name == toCompare);
        this.lightbox.open(this.allImageSources, index, {
            albumLabel: await this.fts.t("tutorials.imageXofY"),
            showImageNumberLabel: true,
        });
    }

    public getFileSrc(file) {
        return `${getApiUrl()}tutorials/files/${file}?authorization=${this.authenticationService.currentUserValue.token}`;
    }

    private async gotNewTutorialData(tutorial: any) {
        if (tutorial) {
            this.navbarService.setHeadline(`${await this.fts.t("general.tutorial")}: ${tutorial.title}`);
        }
        this.tutorial = tutorial;
    }
}
