import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
    FormGroup, FormBuilder, Validators, FormControl,
} from "@angular/forms";
import { RemoteService } from "../../_services/remote.service";
import { AlertService } from "../../_services/alert.service";
import { FastTranslateService } from "../../_services/fast-translate.service";

@Component({
    selector: "app-drop-folder",
    styleUrls: ["./drop-folder.component.css"],
    templateUrl: "./drop-folder.component.html",
})
export class DropFolderComponent {
    public title = "";
    public description = "";
    public additionalFields: string[] = [];
    public form: FormGroup;
    public uploading = false;
    public year: number = new Date().getFullYear();
    public success = false;

    constructor(
        private remoteService: RemoteService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private alertService: AlertService,
        private fts: FastTranslateService,
    ) { }

    public ngOnInit() {
        this.form = this.fb.group({
            file: [null, [Validators.required]],
        });
        this.remoteService.get("get", `files/dropFolder/${this.route.snapshot.params.id}`).subscribe((data) => {
            if (data) {
                this.title = data.dropFolder.title;
                this.description = data.dropFolder.description;
                this.additionalFields = data.dropFolder.additionalFields;
                for (const f of this.additionalFields) {
                    this.form.registerControl(f, new FormControl("", [Validators.required]));
                }
            }
        });
    }

    public uploadFile(event) {
        const file = (event.target as HTMLInputElement).files[0];
        this.form.patchValue({
            file,
        });
        this.form.get("file").updateValueAndValidity();
    }

    public async submit() {
        if (this.form.invalid) {
            this.alertService.error(await this.fts.t(this.form.controls.file.invalid ? "errors.noFileSelected" : "errors.requiredFieldsMissing"));
            return;
        }
        const fileName = `${this.additionalFields.length > 0 ? `${this.additionalFields.map((f) => this.form.controls[f].value).join("_")}_` : ""}${Math.round(Math.random() * 1000000)}.${this.form.value.file.name.split(".").pop()}`;
        this.uploading = true;
        this.remoteService.uploadFile(
            `files/dropFolder/${this.route.snapshot.params.id}`,
            "file",
            this.form.value.file,
            {
                fileName,
            },
        ).subscribe((data) => {
            if (data && data.status) {
                this.success = true;
                this.uploading = false;
            }
        });
    }
}
