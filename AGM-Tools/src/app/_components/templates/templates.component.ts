import { Component, OnInit } from "@angular/core";
import {
    FormControl,
    FormGroup,
    Validators,
} from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";
import { TinyConfigService } from "../../_services/tiny-config.service";
import { MarkdownService } from "../../_services/markdown.service";
import { getApiUrl } from "../../_helpers/getApiUrl";

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
    public invalidMessage = false;
    public TINYCONFIG = {};
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private authenticationService: AuthenticationService,
        private navbarService: NavbarService,
        private fts: FastTranslateService,
        private alertService: AlertService,
        private tinyConfigService: TinyConfigService,
        private markdownService: MarkdownService,
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
        this.TINYCONFIG = this.tinyConfigService.get();
    }
    public show(template, content) {
        this.imgUrl = `${getApiUrl()}templates/${template.filename}?authorization=${this.authenticationService.currentUserValue.token}`;
        this.modalService
            .open(content, {})
            .result.then();
    }
    public openNewModal(content) {
        this.modalService
            .open(content, { size: "lg" })
            .result.then(
                async () => {
                    this.invalidMessage = false;
                    this.alertService.success(await this.fts.t("general.uploadStartedPleaseWait"));
                    this.remoteService.uploadFile("templates", "file", this.newTemplateForm.get("file").value, {
                        description: this.markdownService.from(this.newTemplateForm.get("description").value),
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
        // eslint-disable-next-line
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
