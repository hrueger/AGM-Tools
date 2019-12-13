import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../_services/alert.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
  selector: "app-tutorials",
  styleUrls: ["./tutorials.component.css"],
  templateUrl: "./tutorials.component.html",
})
export class TutorialsComponent implements OnInit {
  public newTutorialForm: FormGroup;
  public title: string;
  public description: string;
  public invalidMessage: boolean;
  public tutorials = [];

  constructor(private navbarService: NavbarService,
              private fb: FormBuilder,
              private remoteService: RemoteService,
              private modalService: NgbModal,
              private fts: FastTranslateService,
              private alertService: AlertService) { }

  public async ngOnInit() {
    this.remoteService
    .get("get", "tutorials/")
    .subscribe((res) => {
      this.tutorials = res;
    });
    this.navbarService.setHeadline(await this.fts.t("tutorials.tutorials"));
    this.newTutorialForm = this.fb.group({
      description: [this.description, [Validators.required]],
      title: [this.title, [Validators.required]],
    });
  }

  public newTutorial(content) {
    this.modalService
      .open(content, { ariaLabelledBy: "modal-basic-title" })
      .result.then(
        (result) => {
          this.invalidMessage = false;

          this.remoteService
            .getNoCache("post", "tutorials/", {
              description: this.newTutorialForm.get("description").value,
              title: this.newTutorialForm.get("title").value,
            })
            .subscribe(async (data) => {
              if (data && data.status == true) {
                this.alertService.success(await this.fts.t("tutorials.tutorialCreatedSucessfully"));
                this.remoteService
                  .get("get", "tutorials/")
                  .subscribe((res) => {
                    this.tutorials = res;
                  });
              }
            });
        },
      );
  }
}
