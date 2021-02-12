import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { getApiUrl } from "../_helpers/getApiUrl";
import { AlertService } from "./alert.service";
import { CacheService } from "./cache.service";

@Injectable({
    providedIn: "root",
})
export class RemoteService {
    public constructor(
        private http: HttpClient,
        private alertService: AlertService,
        private cacheService: CacheService,
    ) { }

    public get(type: "get" | "post" | "put" | "delete", path: string, args?: any): Observable<any> {
        const subject = new BehaviorSubject(null);
        let cacheData = null;
        let echtDaten = false;
        const req = this.getRequest(type, path, args);
        req.pipe(
            tap((): void => this.log(
                `fetched ${
                    path
                } with data ${
                    JSON.stringify(args)}`,
            )),
            catchError(this.handleError<any>(path, false)),
        )
            .subscribe((data): void => {
                // console.log("internetdaten bekommen");
                if (cacheData == null || !this.isEquivalent(cacheData, data)) {
                    // console.log("Cache Daten: " + cacheData);
                    // console.log("Echte Daten: " + data);
                    if (data) {
                        subject.next(data);
                        this.cacheService.put(data, path, args);
                    } else {
                        // ToDo this.alertService.snackbar
                        // ("Offline-Modus (Daten können veraltet sein)");
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
            .get(path, args)

            .subscribe((d): void => {
                // console.log("cacheDaten bekommen");
                if (echtDaten == false) {
                    subject.next(d);
                    cacheData = d;
                    // console.log("served from cache:" + cacheData);
                }
            });
        return subject.asObservable();
    }

    public getNoCache(type, path: string, args?: any): Observable<any> {
        this.log(
            `fetching ${
                path
            } with data ${
                JSON.stringify(args)}`,
        );
        return this.getRequest(type, path, args)
            .pipe(
                tap((): void => this.log(
                    `fetched ${
                        path
                    } with data ${
                        JSON.stringify(args)}`,
                )),
                catchError(this.handleError<any>(path, false)),
            );
    }
    public uploadFile(url: string, name: string, file: any, args: object = {}): Observable<any> {
        this.log(`uploading file ${file.name}`);
        const formData: FormData = new window.FormData();
        formData.append(name, file, file.name);
        for (const key in args) {
            if (args.hasOwnProperty(key)) {
                formData.append(key, args[key]);
            }
        }
        return this.http
            .post<any>(`${getApiUrl()}${url}`, formData, {
                /* reportProgress: true,
                observe: "events", */
                headers: new HttpHeaders({
                    "Content-Type": "multipart/form-data",
                }),
            })
            .pipe(
                tap((): void => this.log(`uploading file ${file.name}`)),
                catchError(this.handleError<any>("fileUpload", false)),
            );
    }

    private getRequest(type: string, path: string, args: any): Observable<any> {
        let req;
        if (type == "get") {
            req = this.http.get<any>(`${getApiUrl()}${path}`, {
                ...args,
            });
        } else if (type == "post") {
            req = this.http.post<any>(`${getApiUrl()}${path}`, {
                ...args,
            });
        } else if (type == "put") {
            req = this.http.put<any>(`${getApiUrl()}${path}`, {
                ...args,
            });
        } else if (type == "delete") {
            req = this.http.delete<any>(`${getApiUrl()}${path}`, {
                ...args,
            });
        }
        return req;
    }

    private handleError<T>(operation = "operation", result?: T): any {
        return (error: any): Observable<T> => {
            // eslint-disable-next-line no-console
            console.error("Error occured in remote.service.ts:", error);

            if (!error.startsWith("java.net.UnknownHostException")) {
                this.log(`${operation} failed: ${error.message}`);
                // eslint-disable-next-line no-console
                console.log(result);

                this.alertService.error(error);
            }

            return of(result as T);
        };
    }

    private log(message: string): void {
        // eslint-disable-next-line no-console
        console.log(`RemoteService Log: ${message}`);
    }

    private isEquivalent(a, b): boolean {
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
