import { Injectable } from "@angular/core";
import { FastTranslateService } from "./fast-translate.service";
import { environment } from "../../environments/environment";

@Injectable()
export class TinyConfigService {
    constructor(private fts: FastTranslateService) {}
    public get() {
        return {
            // eslint-disable-next-line @typescript-eslint/camelcase
            base_url: `${environment.appUrl.replace("/#/", "/")}assets/tinymce`,
            suffix: ".min",
            statusbar: false,
            menubar: false,
            language: this.fts.getLang(),
            plugins: [
                "advlist autolink lists link searchreplace hr insertdatetime paste",
            ],
            toolbar:
                "undo redo | formatselect bold italic | link hr | bullist numlist outdent indent | insertdatetime",
        };
    }
}
