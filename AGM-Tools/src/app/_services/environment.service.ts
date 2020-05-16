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
    public async loadEnvironment(url?): Promise<boolean> {
        this.environment = environment;
        if (isElectron() && url) {
            if (!url.endswith("/")) {
                url += "/";
            }
            url += "config.json";
            return new Promise((resolve) => {
                this.http.get(url).subscribe((d) => {
                    console.log(d);
                    this.environment = d;
                    resolve(true);
                });
            });
        }
        return true;
    }
}
