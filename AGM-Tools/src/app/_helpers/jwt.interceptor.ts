import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { getString } from "tns-core-modules/application-settings";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = req.clone({
        headers: new HttpHeaders({
            authorization: getString("jwt_token"),
        }),
    });
    return next.handle(authReq);
  }
}
