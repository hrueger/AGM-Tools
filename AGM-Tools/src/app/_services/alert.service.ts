import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable({ providedIn: "root" })
export class AlertService {
    //private subject = new Subject<any>();
    //private keepAfterNavigationChange = false;

    constructor(private toastr: ToastrService) {
        // clear alert message on route change
        /*router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterNavigationChange) {
          // only keep for a single location change
          this.keepAfterNavigationChange = false;
        } else {
          // clear alert
          this.subject.next();
        }
      }
    });*/
    }

    success(message: string) {
        this.toastr.success(message, "Erfolg!", { timeOut: 999999999 });
        //this.keepAfterNavigationChange = keepAfterNavigationChange;
        //this.subject.next({ type: "success", text: message });
    }

    error(message: string) {
        this.toastr.error(message, "Fehler!", { timeOut: 999999999 });
        //this.keepAfterNavigationChange = keepAfterNavigationChange;
        //this.subject.next({ type: "error", text: message });
    }

    //getMessage(): Observable<any> {
    //return this.subject.asObservable();
    //}
}
