import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class AlertService {
  constructor() {
  }

  success(message: string) {
    console.log(message, "Erfolg!", { timeOut: 999999 });
  }

  error(message: string) {
    console.log(message, "Fehler!", { timeOut: 999999 });
  }

  info(message: string) {
    console.log(message, "Information:", { timeOut: 999999 });
  }

  warning(message: string) {
    console.log(message, "Warnung!", { timeOut: 999999 });
  }



}
