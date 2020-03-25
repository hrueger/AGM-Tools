
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { filter, tap } from "rxjs/operators";
import { AuthenticationService } from "../_services/authentication.service";

@Injectable()
export class RenewJwtTokenInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService, private router: Router) {}

    public intercept(
        request: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            // There may be other events besides the response.
            filter((event) => event instanceof HttpResponse),
            tap(() => {
                // console.log(event.headers);
            }),
        );
    }
}
