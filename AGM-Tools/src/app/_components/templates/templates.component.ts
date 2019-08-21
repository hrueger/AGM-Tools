import { HttpClient, HttpEventType } from "@angular/common/http";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import config from "../../_config/config";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-templates",
    templateUrl: "./templates.component.html",
    styleUrls: ["./templates.component.scss"],
})
export class TemplatesComponent implements OnInit {
    public imgUrl: string;
    public templates: any;
    public newTemplateForm: FormGroup;
    public name: string;
    public type: string;
    public description: string;
    public invalidMessage: boolean = false;
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private authenticationService: AuthenticationService,
        private NavbarService: NavbarService,
        private httpClient: HttpClient,
        private alertService: AlertService,
    ) {}
    public ngOnInit() {
        this.NavbarService.setHeadline("Vorlagen");
        this.remoteService.get("templatesGetTemplates").subscribe((data) => {
            this.templates = data;
        });
        this.newTemplateForm = new FormGroup({
            name: new FormControl(null, Validators.required),
            description: new FormControl(null, Validators.required),
            type: new FormControl(null, Validators.required),
            file: new FormControl(null, [Validators.required]),
        });
    }
    public show(template, content) {
        this.imgUrl =
            config.apiUrl +
            "getTemplate.php?tid=" +
            template.id +
            "&token=" +
            this.authenticationService.currentUserValue.token;
        this.modalService
            .open(content, {})
            .result.then((result) => {}, (reason) => {});
    }
    public openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                (result) => {
                    this.invalidMessage = false;

                    /*this.remoteService
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
                        });*/
                    this.alertService.success(
                        "Hochladen gestartet, bitte warten!",
                    );
                    this.httpClient
                        .post(
                            config.apiUrl,

                            this.toFormData(this.newTemplateForm.value),
                        )
                        .subscribe((data) => {
                            // @ts-ignore
                            if (data && data.status == true) {
                                this.alertService.success(
                                    "Vorlage erfolgreich hochgeladen",
                                );
                            }
                        });
                },
                (reason) => {},
            );
    }
    public toFormData<T>(formValue: T) {
        const formData = new FormData();

        for (const key of Object.keys(formValue)) {
            const value = formValue[key];
            formData.append(key, value);
        }
        formData.append("action", "templatesNewTemplate");

        return formData;
    }
}
