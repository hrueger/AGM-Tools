import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import config from "../../_config/config";
import { AuthenticationService } from "../../_services/authentication.service";
import { NavbarService } from "../../_services/navbar.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AlertService } from "../../_services/alert.service";

@Component({
    selector: "app-templates",
    templateUrl: "./templates.component.html",
    styleUrls: ["./templates.component.scss"]
})
export class TemplatesComponent implements OnInit {
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private authenticationService: AuthenticationService,
        private NavbarService: NavbarService,
        private fb: FormBuilder,
        private alertService: AlertService
    ) {}
    imgUrl: string;
    templates: any;
    newTemplateForm: FormGroup;
    name: string;
    type: string;
    description: string;
    invalidMessage: boolean = false;
    ngOnInit() {
        this.NavbarService.setHeadline("Vorlagen");
        this.remoteService.get("templatesGetTemplates").subscribe(data => {
            this.templates = data;
        });
        this.newTemplateForm = this.fb.group({
            name: [this.name, [Validators.required]],
            description: [this.description, [Validators.required]],
            type: [this.type, [Validators.required]]
        });
    }
    show(template, content) {
        this.imgUrl =
            config.apiUrl +
            "getTemplate.php?tid=" +
            template.id +
            "&token=" +
            this.authenticationService.currentUserValue.token;
        this.modalService
            .open(content, {})
            .result.then(result => {}, reason => {});
    }
    openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                result => {
                    this.invalidMessage = false;

                    this.remoteService
                        .getNoCache("templateNewTemplate", {
                            name: this.newTemplateForm.get("name").value,
                            description: this.newTemplateForm.get("description")
                                .value,
                            type: this.newTemplateForm.get("type").value
                        })
                        .subscribe(data => {
                            if (data && data.status == true) {
                                this.alertService.success(
                                    "Vorlage erfolgreich hochgeladen"
                                );
                            }
                        });
                },
                reason => {}
            );
    }
}
