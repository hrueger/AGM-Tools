import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Lightbox } from "ngx-lightbox";
import { environment } from "../../../environments/environment";
import { AuthenticationService } from "../../_services/authentication.service";
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
              private remoteService: RemoteService) { }

  public ngOnInit() {
    this.navbarService.setHeadline("Tutorial");
    this.route.params.subscribe((params) => {
      this.remoteService.get("get", `tutorials/${params.index}`).subscribe((tutorial) => {
        this.gotNewTutorialData(tutorial);
      });
    });
  }
  public getContent(content: string) {
    return content.replace("\n", "<br>");
  }

  public async showImage(i, n) {
    const that = this;
    if (this.allImageSources.length == 0) {
        for (const step of this.tutorial.steps) {
            if (step.image1) {
                that.allImageSources.push({
                    caption: step.title,
                    name: step.image1,
                    src: await that.getBlob(`tutorials/files/${step.image1}`),
                });
            }
            if (step.image2) {
              that.allImageSources.push({
                  caption: step.title,
                  name: step.image2,
                  src: await that.getBlob(`tutorials/files/${step.image2}`),
              });
            }
            if (step.image3) {
              that.allImageSources.push({
                  caption: step.title,
                  name: step.image3,
                  src: await that.getBlob(`tutorials/files/${step.image3}`),
              });
          }
        }
    }
    const toCompare = (n == 1 ? that.tutorial.steps[i].image1 :
      (n == 2 ? that.tutorial.steps[i].image2 : that.tutorial.steps[i].image3));
    const index = this.allImageSources.findIndex((img) => img.name == toCompare);
    this.lightbox.open(this.allImageSources, index, {
      albumLabel: "Bild %1 von %2",
      showImageNumberLabel: true,
    });
  }

  private async getBlob(imgSrc: string) {
    try {
      const imageBlob = await this.http.get(`${environment.apiUrl}${imgSrc}`, {responseType: "blob"}).toPromise();
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageBlob);
      });
    } catch (e) {
        return "assets/loading.gif";
    }
  }

  private gotNewTutorialData(tutorial: any) {
    if (tutorial) {
      this.navbarService.setHeadline(`Tutorial: ${tutorial.title}`);
    }
    this.tutorial = tutorial;
  }
}
