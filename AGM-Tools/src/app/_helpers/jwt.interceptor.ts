import {
    HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token = sessionStorage.getItem("jwt_token");
        if (!token) {
            token = "";
        }
        const authReq = req.clone({
            headers: new HttpHeaders({
                authorization: token,
            }),
        });
        return next.handle(authReq);
    }
}
