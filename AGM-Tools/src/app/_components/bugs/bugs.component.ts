import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { NavbarService } from "../../_services/navbar.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../_services/alert.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: "app-bugs",
    templateUrl: "./bugs.component.html",
    styleUrls: ["./bugs.component.scss"]
})
export class BugsComponent implements OnInit {
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private NavbarService: NavbarService
    ) {}
    bugs: any;
    type: string;
    place: string;
    headline: string;
    description: string;
    invalidMessage: boolean = false;
    newBugForm: FormGroup;
    ngOnInit() {
        this.remoteService.get("bugsGetBugs").subscribe(data => {
            this.bugs = data;
        });
        this.NavbarService.setHeadline("Fehler / Verbesserungen");
        this.newBugForm = this.fb.group({
            type: [this.type, [Validators.required]],
            place: [this.place, [Validators.required]],
            headline: [this.headline, [Validators.required]],
            description: [this.description, [Validators.required]]
        });
    }
    openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                result => {
                    this.invalidMessage = false;

                    this.remoteService
                        .getNoCache("bugsNewBug", {
                            type: this.newBugForm.get("type").value,
                            place: this.newBugForm.get("place").value,
                            headline: this.newBugForm.get("headline").value,
                            description: this.newBugForm.get("description")
                                .value
                        })
                        .subscribe(data => {
                            if (data && data.status == true) {
                                this.alertService.success(
                                    "Fehler / Verbesserungsvorschlag erfolgreich erstellt!"
                                );
                                this.remoteService
                                    .get("bugsGetBugs")
                                    .subscribe(data => {
                                        this.bugs = data;
                                    });
                            }
                        });
                },
                reason => {}
            );
    }
    deleteBug(bug: any) {
        if (
            confirm(
                "Möchten Sie diesen Fehler / Verbesserungsvorschlag wirklich löschen?"
            ) == true
        ) {
            console.log(bug);
            this.remoteService
                .getNoCache("bugsDeleteBug", {
                    id: bug.id
                })
                .subscribe(data => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Fehler / Verbesserungsvorschlag erfolgreich gelöscht"
                        );
                        this.remoteService
                            .get("bugsGetBugs")
                            .subscribe(data => {
                                this.bugs = data;
                            });
                    }
                });
        }
    }
}
