import { Injectable } from "@angular/core";
import isElectron from "is-electron";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: "root",
})
export class EnvironmentService {
    private envLoaded = false;
    constructor(private http: HttpClient) {}
    public environment: any = environment;
    public async loadEnvironment(url?: string): Promise<boolean> {
        this.environment = environment;
        if (isElectron() && url) {
            if (url.indexOf("#")) {
                [url] = url.split("#");
            }
            if (!url.endsWith("/")) {
                url += "/";
            }
            url += "config.json";
            return new Promise((resolve, reject) => {
                this.http.get(url).subscribe((d) => {
                    console.log(d);
                    this.environment = d;
                    resolve(true);
                }, (e) => {
                    reject(e);
                });
            });
        }
        return true;
    }
}
