import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class AlertService {
  constructor(private toastr: ToastrService) {
  }

  success(message: string) {
    this.toastr.success(message, "Erfolg!", { timeOut: 999999 });
  }

  error(message: string) {
    this.toastr.error(message, "Fehler!", { timeOut: 999999 });
  }

  info(message: string) {
    this.toastr.info(message, "Information:", { timeOut: 999999 });
  }

  warning(message: string) {
    this.toastr.warning(message, "Warnung!", { timeOut: 999999 });
  }



}
