import { HttpClient, HttpEventType } from "@angular/common/http";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "../../../environments/environment";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-templates",
    styleUrls: ["./templates.component.scss"],
    templateUrl: "./templates.component.html",
})
export class TemplatesComponent implements OnInit {
    public imgUrl: string;
    public templates: any;
    public newTemplateForm: FormGroup;
    public name: string;
    public group: string;
    public description: string;
    public invalidMessage: boolean = false;
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private authenticationService: AuthenticationService,
        private navbarService: NavbarService,
        private fts: FastTranslateService,
        private alertService: AlertService,
    ) { }
    public async ngOnInit() {
        this.navbarService.setHeadline(await this.fts.t("templates.templates"));
        this.loadTemplates();
        this.newTemplateForm = new FormGroup({
            description: new FormControl(null, Validators.required),
            file: new FormControl(null, [Validators.required]),
            group: new FormControl(null, Validators.required),
            name: new FormControl(null, Validators.required),
        });
    }
    public show(template, content) {
        this.imgUrl = `${environment.apiUrl}templates/${template.filename}?authorization=${this.authenticationService.currentUserValue.token}`;
        this.modalService
            .open(content, {})
            .result.then();
    }
    public openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                async (result) => {
                    this.invalidMessage = false;
                    this.alertService.success(await this.fts.t("general.uploadStartedPleaseWait"));
                    this.remoteService.uploadFile("templates", "file", this.newTemplateForm.get("file").value, {
                        description: this.newTemplateForm.get("description").value,
                        group: this.newTemplateForm.get("group").value,
                        name: this.newTemplateForm.get("name").value,
                    }).subscribe(async (data) => {
                        if (data && data.status == true) {
                            this.alertService.success(await this.fts.t("templates.templateCreatedSuccessfully"));
                            this.loadTemplates();
                        }
                    });
                },
            );
    }

    public async delete(template, event) {
        if (confirm(await this.fts.t("templates.confirmDelete"))) {
            this.remoteService.get("delete", `templates/${template.id}`).subscribe((data) => {
                if (data && data.status == true) {
                    this.loadTemplates();
                }
            });
        }
        event.preventDefault();
    }

    private loadTemplates() {
        this.remoteService.get("get", "templates").subscribe((d) => {
            this.templates = d;
        });
    }
}
