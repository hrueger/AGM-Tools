import { Injectable } from "@angular/core";
import { getString, setString } from "tns-core-modules/application-settings";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class CacheService {
    constructor() {}
    put(data, action, ...args): void {
        //console.log("set");
        return;
    }
    get(action, ...args): Observable<any> {
        return new Observable(observer => {
            observer.next(null);
            observer.complete();
        });
    }
}
