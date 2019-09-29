import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Lightbox } from "ngx-lightbox";
import { switchMap } from "rxjs/operators";
import config from "../../_config/config";
import { AuthenticationService } from "../../_services/authentication.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";
import { messageType } from "tns-core-modules/trace/trace";

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
              private authService: AuthenticationService,
              private lightbox: Lightbox,
              private remoteService: RemoteService) { }

  public ngOnInit() {
    this.navbarService.setHeadline("Tutorial");
    this.route.params.subscribe((params) => {
      this.remoteService.get("tutorialsGetTutorial", { id: params.index }).subscribe((tutorial) => {
        this.gotNewTutorialData(tutorial);
      });
    });
  }
  public getSrc(img) {
    return config.apiUrl +
      "?getTutorialFile=" +
      img +
      "&token=" +
      this.authService.currentUserValue.token;
  }
  public getContent(content: string) {
    return content.replace("\n", "<br>");
  }

  public showImage(i, n) {
    const that = this;
    if (this.allImageSources.length == 0) {
        this.tutorial.steps.forEach((step) => {
            if (step.image1) {
                that.allImageSources.push({
                    caption: step.title,
                    name: step.image1,
                    src: that.getSrc(step.image1),
                });
            }
            if (step.image2) {
              that.allImageSources.push({
                  caption: step.title,
                  name: step.image2,
                  src: that.getSrc(step.image2),
              });
            }
            if (step.image3) {
              that.allImageSources.push({
                  caption: step.title,
                  name: step.image3,
                  src: that.getSrc(step.image3),
              });
          }
        });
    }
    const toCompare = (n == 1 ? that.tutorial.steps[i].image1 :
      (n == 2 ? that.tutorial.steps[i].image2 : that.tutorial.steps[i].image3));
    const index = this.allImageSources.findIndex((img) => img.name == toCompare);
    this.lightbox.open(this.allImageSources, index, {
      albumLabel: "Bild %1 von %2",
      showImageNumberLabel: true,
    });
  }

  private gotNewTutorialData(tutorial: any) {
    this.tutorial = tutorial;
    this.navbarService.setHeadline(`Tutorial: ${tutorial.title}`);
  }
}
