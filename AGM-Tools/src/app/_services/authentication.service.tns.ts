import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import config from "../_config/config";
import { User } from "../_models/user.model";
require("nativescript-localstorage");

const httpOptions = {
    headers: new HttpHeaders({
        "Content-Type": "application/json",
    }),
};

@Injectable({ providedIn: "root" })
export class AuthenticationService {

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }
    public currentUser: Observable<User>;
    private currentUserSubject: BehaviorSubject<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(
            JSON.parse(localStorage.getItem("currentUser")),
        );
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public resetPassword(username: string): Observable<boolean> {
        return new Observable<boolean>();
    }

    public login(username: string, password: string) {
        const action = "authenticate";

        return this.http
            .post<any>(
                `${config.apiUrl}`,
                {
                    action,
                    password,
                    username,
                },
                httpOptions,
            )
            .pipe(
                map((user) => {
                    // login successful if there's a jwt token in the response
                    if (user && user.token) {
                        // store user details and jwt token in local
                        // storage to keep user logged in between page refreshes
                        localStorage.setItem(
                            "currentUser",
                            JSON.stringify(user),
                        );
                        this.currentUserSubject.next(user);
                    }

                    return user;
                }),
            );
    }

    public logout() {
        // remove user from local storage to log user out
        localStorage.removeItem("currentUser");
        this.currentUserSubject.next(null);
    }
}
