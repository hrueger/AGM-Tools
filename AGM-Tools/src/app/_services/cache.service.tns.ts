import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { getString, setString } from "tns-core-modules/application-settings";

@Injectable({
    providedIn: "root",
})
export class CacheService {
    public put(data, action, ...args): void {
        return setString(
            JSON.stringify({ action, ...args }),
            JSON.stringify(data),
        );
    }
    public get(action, ...args): Observable<any> {
        return new Observable((observer) => {
            observer.next(
                JSON.parse(
                    getString(JSON.stringify({ action, ...args })) || null,
                ) || null,
            );
            observer.complete();
        });
    }
}
