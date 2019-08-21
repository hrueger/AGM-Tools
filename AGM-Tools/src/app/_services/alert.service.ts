import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class AlertService {
  constructor(private toastr: ToastrService) {
  }

  public success(message: string) {
    this.toastr.success(message, "Erfolg!", { timeOut: 999999 });
  }

  public error(message: string) {
    this.toastr.error(message, "Fehler!", { timeOut: 999999 });
  }

  public info(message: string) {
    this.toastr.info(message, "Information:", { timeOut: 999999 });
  }

  public warning(message: string) {
    this.toastr.warning(message, "Warnung!", { timeOut: 999999 });
  }

  public snackbar(message) {
    this.info(message);
  }

}
