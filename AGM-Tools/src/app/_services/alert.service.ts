import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { FastTranslateService } from "./fast-translate.service";

@Injectable({ providedIn: "root" })
export class AlertService {
    private configSet = false;
    private readonly timeouts = {
        error: 999999,
        info: 20000,
        success: 5000,
        warning: 999999,
    };
    constructor(private toastr: ToastrService, private fts: FastTranslateService) {
    }

    public async success(message: string) {
        this.config();
        this.toastr.success(message, `${await this.fts.t("general.colors.success")}!`, { timeOut: this.timeouts.success });
    }

    public async error(message: string) {
        this.config();
        this.toastr.error(message, `${await this.fts.t("general.error")}!`, { timeOut: this.timeouts.error });
    }

    public async info(message: string) {
        this.config();
        this.toastr.info(message, `${await this.fts.t("general.colors.info")}:`, { timeOut: this.timeouts.info });
    }

    public async warning(message: string) {
        this.config();
        this.toastr.warning(message, `${await this.fts.t("general.colors.warning")}!`, { timeOut: this.timeouts.warning });
    }

    public snackbar(message) {
        this.config();
        this.info(message);
    }

    public config() {
        if (!this.configSet) {
            this.toastr.toastrConfig.preventDuplicates = true;
            this.configSet = true;
        }
    }
}
