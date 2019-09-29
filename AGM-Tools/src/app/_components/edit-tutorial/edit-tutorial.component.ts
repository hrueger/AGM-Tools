import { Component, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import config from "../../_config/config";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
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
              private authService: AuthenticationService,
              private route: ActivatedRoute) { }

  public ngOnInit() {
    this.tutorialForm = this.fb.group({
      description: [this.description, [Validators.required]],
      title: [this.title, [Validators.required]],
    });
    this.navbarService.setHeadline("Tutorial");
    this.route.params.subscribe((params) => {
      this.remoteService.get("tutorialsGetTutorial", { id: params.index }).subscribe((tutorial) => {
        this.gotNewTutorialData(tutorial);
      });
    });
  }

  public updateGeneral() {
    this.invalidMessage = false;

    this.remoteService
      .getNoCache("tutorialsUpdateTutorial", {
        description: this.tutorialForm.get("description").value,
        id: this.tutorial.id,
        title: this.tutorialForm.get("title").value,
      })
      .subscribe((data) => {
        if (data && data.status == true) {
          this.alertService.success(
            "Änderungen erfolgreich gespeichert",
          );
          this.remoteService
            .get("tutorialsGetTutorial", {id: this.tutorial.id})
            .subscribe((tutorial) => {
              this.gotNewTutorialData(tutorial);
            });
        }
      });
      this.updateSteps();
  }

  public addStep() {
    this.remoteService
      .getNoCache("tutorialsAddStep", {
        id: this.tutorial.id,
      })
      .subscribe((data) => {
        if (data && data.status == true) {
          this.alertService.success(
            "Schritt erfolgreich hinzugefügt",
          );
          this.remoteService
            .get("tutorialsGetTutorial", {id: this.tutorial.id})
            .subscribe((tutorial) => {
              this.tutorial = tutorial;
              this.tutorialForm.get("description").setValue(tutorial.description);
              this.tutorialForm.get("title").setValue(tutorial.title);
            });
        }
      });
  }

  public updateSteps() {
    this.tutorial.steps.forEach((step) => {
      this.remoteService
        .getNoCache("tutorialsUpdateStep", {
          content: step.content,
          id: step.id,
          image1: step.image1,
          image2: step.image2,
          image3: step.image3,
          title: step.title,
        })
        .subscribe((data) => {
          if (!data || data.status != true) {
            this.alertService.error(
              "Fehler beim Speichern...",
            );
          }
        });
    });
    this.alertService.success(
      "Schritte erfolgreich gespeichert",
    );
  }

  public uploadImage(files, i, n) {
    if (n == 1) {
      this.tutorial.steps[i].uploadingImage1 = true;
    } else if (n == 2) {
      this.tutorial.steps[i].uploadingImage2 = true;
    } else {
      this.tutorial.steps[i].uploadingImage3 = true;
    }
    this.remoteService.uploadTutorialFileNoCache(files.item(0)).subscribe((data) => {
      if (data.status == true) {
        if (n == 1) {
          this.tutorial.steps[i].uploadingImage1 = false;
          this.tutorial.steps[i].image1 = data.image;
        } else if (n == 2) {
          this.tutorial.steps[i].uploadingImage2 = false;
          this.tutorial.steps[i].image2 = data.image;
        } else {
          this.tutorial.steps[i].uploadingImage3 = false;
          this.tutorial.steps[i].image3 = data.image;
        }
      }
    });
  }

  public getSrc(img) {
    return config.apiUrl +
      "?getTutorialFile=" +
      img +
      "&token=" +
      this.authService.currentUserValue.token;
  }

  public deleteStep(index) {
    if (confirm("Soll dieser Schritt wirklich gelöscht werden?")) {
      this.remoteService
        .getNoCache("tutorialsDeleteStep", {
          id: this.tutorial.steps[index].id,
        })
        .subscribe((data) => {
          if (data && data.status == true) {
            this.tutorial.steps.splice(index, 1);
            this.alertService.success(
              "Schritt erfolgreich gelöscht",
            );
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
    this.tutorial = tutorial;
    this.tutorialForm.get("description").setValue(tutorial.description);
    this.tutorialForm.get("title").setValue(tutorial.title);
    this.navbarService.setHeadline(`Tutorial bearbeiten: ${tutorial.title}`);
  }

}
