import { Component, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { TabComponent } from "@syncfusion/ej2-angular-navigations";
import { createElement } from "@syncfusion/ej2-base";
import { AlertService } from "../../_services/alert.service";
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

  public updateStep(step) {
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
        if (data && data.status == true) {
          this.alertService.success(
            "Schritt erfolgreich gespeichert",
          );
        }
      });
  }

  private gotNewTutorialData(tutorial: any) {
    this.tutorial = tutorial;
    this.tutorialForm.get("description").setValue(tutorial.description);
    this.tutorialForm.get("title").setValue(tutorial.title);
    this.navbarService.setHeadline(`Tutorial bearbeiten: ${tutorial.title}`);
  }

}
