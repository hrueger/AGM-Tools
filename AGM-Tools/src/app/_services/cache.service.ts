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
        return setString(
            JSON.stringify({ action, ...args }),
            JSON.stringify(data)
        );
    }
    get(action, ...args): Observable<any> {
        return new Observable(observer => {
            observer.next(
                JSON.parse(getString(JSON.stringify({ action, ...args })))
            );
            observer.complete();
        });
    }
}
