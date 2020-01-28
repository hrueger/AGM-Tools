import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class AlertService {
  private readonly timeouts = {
    error: 999999,
    info: 20000,
    success: 5000,
    warning: 999999,
  };
  constructor(private toastr: ToastrService) {
  }

  public success(message: string) {
    this.toastr.success(message, "Erfolg!", { timeOut: this.timeouts.success });
  }

  public error(message: string) {
    this.toastr.error(message, "Fehler!", { timeOut: this.timeouts.error });
  }

  public info(message: string) {
    this.toastr.info(message, "Information:", { timeOut: this.timeouts.info });
  }

  public warning(message: string) {
    this.toastr.warning(message, "Warnung!", { timeOut: this.timeouts.warning });
  }

  public snackbar(message) {
    this.info(message);
  }

}
