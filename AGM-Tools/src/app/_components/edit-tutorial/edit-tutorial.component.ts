import { Component, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { environment } from "../../../environments/environment";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
  selector: "app-edit-tutorial",
  styleUrls: ["./edit-tutorial.component.css"],
  templateUrl: "./edit-tutorial.component.html",
})
export class EditTutorialComponent implements OnInit {

  public tutorial: any;

  public tutorialForm: FormGroup;
  public title: string;
  public description: string;
  public invalidMessage: boolean;

  constructor(private remoteService: RemoteService,
              private navbarService: NavbarService,
              private fb: FormBuilder,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private fts: FastTranslateService,
              private route: ActivatedRoute) { }

  public async ngOnInit() {
    this.tutorialForm = this.fb.group({
      description: [this.description, [Validators.required]],
      title: [this.title, [Validators.required]],
    });
    this.navbarService.setHeadline(await this.fts.t("general.tutorial"));
    this.route.params.subscribe((params) => {
      this.remoteService.get("get", `tutorials/${params.index}`).subscribe((tutorial) => {
        this.gotNewTutorialData(tutorial);
      });
    });
  }

  public updateGeneral() {
    this.invalidMessage = false;
    this.remoteService
      .getNoCache("post", `tutorials/${this.tutorial.id}`, {
        description: this.tutorialForm.get("description").value,
        title: this.tutorialForm.get("title").value,
      })
      .subscribe(async (data) => {
        if (data && data.status == true) {
          this.alertService.success(await this.fts.t("tutorials.changesSavedSuccessfully"));
          this.remoteService
            .get("get", `tutorials/${this.tutorial.id}`)
            .subscribe((tutorial) => {
              this.gotNewTutorialData(tutorial);
            });
        }
      });
    this.updateSteps();
  }

  public getFileSrc(file) {
    return `${environment.apiUrl}tutorials/files/${file}?authorization=${this.authenticationService.currentUserValue.token}`;
  }

  public addStep() {
    this.remoteService
      .getNoCache("post", `tutorials/${this.tutorial.id}/steps`)
      .subscribe(async (data) => {
        if (data && data.status == true) {
          this.alertService.success(await this.fts.t("tutorials.stepAddedSuccessfully"));
          this.remoteService
            .get("get", `tutorials/${this.tutorial.id}`)
            .subscribe((tutorial) => {
              this.tutorial = tutorial;
              this.tutorialForm.get("description").setValue(tutorial.description);
              this.tutorialForm.get("title").setValue(tutorial.title);
            });
        }
      });
  }

  public async updateSteps() {
    this.tutorial.steps.forEach((step) => {
      this.remoteService
        .getNoCache("post", `tutorials/${this.tutorial.id}/steps/${step.id}`, {
          content: step.content,
          image1: step.image1,
          image2: step.image2,
          image3: step.image3,
          title: step.title,
        })
        .subscribe(async (data) => {
          if (!data || data.status != true) {
            this.alertService.error(await this.fts.t("errors.errorWhileSaving"));
          }
        });
    });
    this.alertService.success(await this.fts.t("tutorials.stepsSavedSuccessfully"));
  }

  public uploadImage(files, stepIdx, n) {
    if (n == 1) {
      this.tutorial.steps[stepIdx].uploadingImage1 = true;
    } else if (n == 2) {
      this.tutorial.steps[stepIdx].uploadingImage2 = true;
    } else {
      this.tutorial.steps[stepIdx].uploadingImage3 = true;
    }
    this.remoteService.uploadFile(`tutorials/${this.tutorial.id}/steps/${stepIdx}/files`,
    "file", files.item(0)).subscribe((data) => {
      if (data.status == true) {
        if (n == 1) {
          this.tutorial.steps[stepIdx].uploadingImage1 = false;
          this.tutorial.steps[stepIdx].image1 = data.image;
        } else if (n == 2) {
          this.tutorial.steps[stepIdx].uploadingImage2 = false;
          this.tutorial.steps[stepIdx].image2 = data.image;
        } else {
          this.tutorial.steps[stepIdx].uploadingImage3 = false;
          this.tutorial.steps[stepIdx].image3 = data.image;
        }
      }
    });
  }

  public async deleteStep(index) {
    if (confirm(await this.fts.t("tutorials.confirmStepDelete"))) {
      this.remoteService
        .getNoCache("delete", `tutorials/${this.tutorial.id}/steps/${this.tutorial.steps[index].id}`)
        .subscribe(async (data) => {
          if (data && data.status == true) {
            this.tutorial.steps.splice(index, 1);
            this.alertService.success(await this.fts.t("tutorials.stepDeletedSuccessfully"));
          }
        });
    }
  }

  public deleteImage(i, n) {
    if (n == 1) {
      this.tutorial.steps[i].image1 = null;
    } else if (n == 2) {
      this.tutorial.steps[i].image2 = null;
    } else {
      this.tutorial.steps[i].image3 = null;
    }
  }

  private gotNewTutorialData(tutorial: any) {
    if (tutorial) {
      this.tutorial = tutorial;
      this.tutorialForm.get("description").setValue(tutorial.description);
      this.tutorialForm.get("title").setValue(tutorial.title);
      this.navbarService.setHeadline(`${this.fts.t("tutorials.editTutorial")}: ${tutorial.title}`);
    }
  }

}
