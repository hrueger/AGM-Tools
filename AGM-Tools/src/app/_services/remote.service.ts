import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, first, tap } from "rxjs/operators";
import config from "../_config/config";
import { AlertService } from "./alert.service";
import { CacheService } from "./cache.service";

@Injectable({
    providedIn: "root",
})
export class RemoteService {
    constructor(
        private http: HttpClient,
        private alertService: AlertService,
        private cacheService: CacheService,
    ) { }

    public get(action: string, ...args: any): Observable<any> {
        // var action = "dashboardGetSpaceChartData";
        const subject = new BehaviorSubject(null);
        let cacheData = null;
        let echtDaten = false;
        // console.log("hole internetdaten");
        this.http
            .post<any>(`${config.apiUrl}`, {
                action,
                args,
            })
            .pipe(
                tap((_) =>
                    this.log(
                        "fetched " +
                        action +
                        " with data " +
                        JSON.stringify(args),
                    ),
                ),
                catchError(this.handleError<any>(action, false)),
            )
            .subscribe((data) => {
                // console.log("internetdaten bekommen");
                if (cacheData == null || !this.isEquivalent(cacheData, data)) {
                    // console.log("Cache Daten: " + cacheData);
                    // console.log("Echte Daten: " + data);
                    if (data) {
                        subject.next(data);
                        this.cacheService.put(data, action, args);
                    } else {
                        this.alertService.snackbar("Offline-Modus (Daten können veraltet sein)");
                    }

                    // console.log("cache updated and new data served: " + data);
                } else {
                    // console.log("cache the same as internet");
                }
                echtDaten = true;
                subject.complete();
            });
        // console.log("hole cachedaten");
        this.cacheService
            .get(action, args)

            .subscribe((d) => {
                // console.log("cacheDaten bekommen");
                if (echtDaten == false) {
                    subject.next(d);
                    cacheData = d;
                    // console.log("served from cache:" + cacheData);
                }
            });
        return subject.asObservable();
    }
    public getNoCache(action: string, ...args: any): Observable<any> {
        this.log(
            "fetching " +
            action +
            " with data " +
            JSON.stringify(args),
        );
        return this.http
            .post<any>(`${config.apiUrl}`, {
                action,
                args,
            })
            .pipe(
                tap((_) =>
                    this.log(
                        "fetched " +
                        action +
                        " with data " +
                        JSON.stringify(args),
                    ),
                ),
                catchError(this.handleError<any>(action, false)),
            );
    }
    private handleError<T>(operation = "operation", result?: T) {
        return (error: any): Observable<T> => {
            console.error("Error occured in remote.service.ts:", error);

            if (!error.startsWith("java.net.UnknownHostException")) {
                this.log(`${operation} failed: ${error.message}`);
                console.log(result);

                this.alertService.error(error);
            }

            return of(result as T);
        };
    }

    private log(message: string) {
        console.log(`RemoteService Log: ${message}`);
    }
    private isEquivalent(a, b) {
        // console.log("a");
        // console.log(a);
        // console.log("b");
        // console.log(b);
        // Create arrays of property names
        const aProps = Object.getOwnPropertyNames(a);
        const bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (let i = 0; i < aProps.length; i++) {
            const propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    }
}
