import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../_services/alert.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-bugs",
    styleUrls: ["./bugs.component.scss"],
    templateUrl: "./bugs.component.html",
})
export class BugsComponent implements OnInit {
    public bugs: any;
    public type: string;
    public place: string;
    public headline: string;
    public description: string;
    public invalidMessage: boolean = false;
    public newBugForm: FormGroup;
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private navbarService: NavbarService,
    ) { }
    public ngOnInit() {
        this.remoteService.get("post", "bugsGetBugs").subscribe((data) => {
            this.bugs = data;
        });
        this.navbarService.setHeadline("Fehler / Verbesserungen");
        this.newBugForm = this.fb.group({
            description: [this.description, [Validators.required]],
            headline: [this.headline, [Validators.required]],
            place: [this.place, [Validators.required]],
            type: [this.type, [Validators.required]],
        });
    }
    public openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                (result) => {
                    this.invalidMessage = false;

                    this.remoteService
                        .getNoCache("post", "bugsNewBug", {
                            description: this.newBugForm.get("description").value,
                            headline: this.newBugForm.get("headline").value,
                            place: this.newBugForm.get("place").value,
                            type: this.newBugForm.get("type").value,
                        })
                        .subscribe((data) => {
                            if (data && data.status === true) {
                                this.alertService.success(
                                    "Fehler / Verbesserungsvorschlag erfolgreich erstellt!",
                                );
                                this.remoteService
                                    .get("post", "bugsGetBugs")
                                    .subscribe((res) => {
                                        this.bugs = res;
                                    });
                            }
                        });
                },
            );
    }
    public deleteBug(bug: any) {
        if (
            confirm(
                "Möchten Sie diesen Fehler / Verbesserungsvorschlag wirklich löschen?",
                // tslint:disable-next-line: triple-equals
            ) == true
        ) {
            this.remoteService
                .getNoCache("post", "bugsDeleteBug", {
                    id: bug.id,
                })
                .subscribe((data) => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Fehler / Verbesserungsvorschlag erfolgreich gelöscht",
                        );
                        this.remoteService
                            .get("post", "bugsGetBugs")
                            .subscribe((res) => {
                                this.bugs = res;
                            });
                    }
                });
        }
    }
}
