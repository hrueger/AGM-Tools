import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import * as applicationSettings from "tns-core-modules/application-settings";
import { environment } from "../../environments/environment";
import { User } from "../_models/user.model";

const httpOptions = {
    headers: new HttpHeaders({
        "Content-Type": "application/json",
    }),
};

@Injectable({ providedIn: "root" })
export class AuthenticationService {
    public currentUser: Observable<User>;
    private currentUserSubject: BehaviorSubject<User>;

    constructor(private http: HttpClient) {
        let u = applicationSettings.getString("currentUser");
        if (u) {
            u = JSON.parse(u);
        } else {
            u = null;
        }
        this.currentUserSubject = new BehaviorSubject<any>(
            u,
        );
        this.currentUser = this.currentUserSubject.asObservable();
    }

    // eslint-disable-next-line
    public resetPassword(username) {
        return new Observable<boolean>();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public login(username: string, password: string) {
        return this.http
            .post<any>(
                `${environment.apiUrl}auth/login`,
                {
                    password,
                    username,
                },
                httpOptions,
            )
            .pipe(
                map((user) => {
                    // login successful if there's a jwt token in the response
                    if (user && user.token) {
                        // store user details and jwt token in local storage to
                        // keep user logged in between page refreshes
                        applicationSettings.setString(
                            "currentUser",
                            JSON.stringify(user),
                        );
                        this.saveJwtToken(user);
                        this.currentUserSubject.next(user);
                    }

                    return user;
                }),
            );
    }

    public saveJwtToken(user: User) {
        applicationSettings.setString("jwt_token", user.token);
    }

    public logout() {
        // remove user from local storage to log user out
        applicationSettings.remove("currentUser");
        this.currentUserSubject.next(null);
    }
}
