import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AlertService } from "./alert.service";
import { Observable, Subject, of } from "rxjs";
import config from "../_config/config";
import { tap, catchError, first } from "rxjs/operators";
import { CacheService } from "./cache.service";

@Injectable({
    providedIn: "root"
})
export class RemoteService {
    constructor(
        private http: HttpClient,
        private alertService: AlertService,
        private cacheService: CacheService
    ) {}

    get(action: string, ...args: any[]): Observable<any> {
        //var action = "dashboardGetSpaceChartData";
        let subject = new Subject();
        let cacheData = null;
        let echtDaten = false;
        this.http
            .post<any>(`${config.apiUrl}`, {
                action,
                ...args
            })
            .pipe(
                tap(_ => this.log("fetched " + action)),
                catchError(this.handleError<any>(action, false))
            )
            .pipe(first())
            .subscribe(data => {
                console.log("internetdaten bekommen");
                if (cacheData == 0 || !this.isEquivalent(cacheData, data)) {
                    console.log("Cache Daten: " + cacheData);
                    console.log("Echte Daten: " + data);
                    console.log(this.isEquivalent(cacheData, data));
                    console.log(typeof cacheData);
                    console.log(typeof data);
                    subject.next(data);
                    this.cacheService.put(data, action, ...args);
                    console.log("cache updated and new data served");
                } else {
                    console.log("cache the same as internet");
                }
                echtDaten = true;
                subject.complete();
            });
        this.cacheService
            .get(action, ...args)
            .pipe(first())
            .subscribe(d => {
                console.log("cacheDaten bekommen");
                if (echtDaten == false) {
                    subject.next(d);
                    cacheData = d;
                    console.log("served from cache");
                }
            });
        return subject.asObservable();
    }
    private handleError<T>(operation = "operation", result?: T) {
        return (error: any): Observable<T> => {
            console.error(error);

            this.log(`${operation} failed: ${error.message}`);

            this.alertService.error(error);

            return of(result as T);
        };
    }

    private log(message: string) {
        console.log(`DashboardDataService Log: ${message}`);
    }
    private isEquivalent(a, b) {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

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
