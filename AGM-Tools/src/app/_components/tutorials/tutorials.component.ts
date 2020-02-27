import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../_services/alert.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";
import { TinyConfigService } from "../../_services/tiny-config.service";
import { MarkdownService } from "../../_services/markdown.service";

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
  public onlyDisplayingProject: boolean = false;
  public tutorials = [];
  public TINYCONFIG = {};
  @ViewChild("newTutorialModal") private newTutorialModal;

  constructor(private navbarService: NavbarService,
              private fb: FormBuilder,
              private remoteService: RemoteService,
              private modalService: NgbModal,
              private fts: FastTranslateService,
              private alertService: AlertService,
              private route: ActivatedRoute,
              private router: Router,
              private tinyConfigService: TinyConfigService,
              private markdownService: MarkdownService) { }

  public async ngOnInit() {
    if (this.route.snapshot.params.projectId && this.route.snapshot.params.projectName) {
      this.onlyDisplayingProject = true;
      this.remoteService.get("get", `tutorials/project/${this.route.snapshot.params.projectId}`).subscribe((res) => {
        this.tutorials = res;
      });
      this.navbarService.setHeadline(`${await this.fts.t("tutorials.onlyDisplayingProjectName")} ${this.route.snapshot.params.projectName}`);
    } else {
      this.remoteService.get("get", "tutorials/").subscribe((res) => {
        this.tutorials = res;
      });
      this.navbarService.setHeadline(await this.fts.t("tutorials.tutorials"));
    }
    this.newTutorialForm = this.fb.group({
      description: [this.description, [Validators.required]],
      title: [this.title, [Validators.required]],
    });
    if (this.router.url.endsWith("new")) {
      this.newTutorial(this.newTutorialModal);
    }
    this.TINYCONFIG = this.tinyConfigService.get();
  }

  public async displayAll() {
    this.navbarService.setHeadline(await this.fts.t("tutorials.tutorials"));
    this.remoteService.get("get", "tutorials/").subscribe((res) => {
      this.tutorials = res;
    });
    this.router.navigate(["/", "tutorials"]);
    this.onlyDisplayingProject = false;
  }

  public newTutorial(content) {
    this.modalService
      .open(content, { size: "lg" })
      .result.then(
        (result) => {
          this.invalidMessage = false;

          this.remoteService
            .getNoCache("post", "tutorials/", {
              description: this.markdownService.from(this.newTutorialForm.get("description").value),
              title: this.newTutorialForm.get("title").value,
            })
            .subscribe(async (data) => {
              if (data && data.status == true) {
                this.alertService.success(await this.fts.t("tutorials.tutorialCreatedSuccessfully"));
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
