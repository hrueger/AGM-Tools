import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class CacheService {
    public put(data, action, ...args): void {
        // console.log("set");
        return localStorage.setItem(
            JSON.stringify({ action, ...args }),
            JSON.stringify(data),
        );
    }
    public get(action, ...args): Observable<any> {
        return new Observable((observer) => {
            observer.next(
                JSON.parse(
                    localStorage.getItem(JSON.stringify({ action, ...args })) ||
                    null,
                ) || null,
            );
            observer.complete();
        });
    }
}
