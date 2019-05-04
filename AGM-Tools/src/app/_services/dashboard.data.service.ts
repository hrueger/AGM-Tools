import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import config from "../_config/config";
import { Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { AlertService } from "../_services/alert.service";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost"
  })
};

@Injectable({ providedIn: "root" })
export class DashboardDataService {
  constructor(private http: HttpClient, private alertService: AlertService) {}

  getSpaceChartData(): Observable<any> {
    var action = "dashboardGetSpaceChartData";
    return this.http
      .post<any>(`${config.apiUrl}`, {
        action
      })
      .pipe(
        tap(_ => this.log("fetched " + action)),
        catchError(this.handleError<any>(action, false))
      );
  }
  getWhatsNew(): Observable<any> {
    var action = "dashboardGetWhatsnew";
    return this.http
      .post<any>(`${config.apiUrl}`, {
        action
      })
      .pipe(
        tap(_ => this.log("fetched " + action)),
        catchError(this.handleError<any>(action, false))
      );
  }
  getDates(): Observable<any> {
    var action = "dashboardGetDates";
    return this.http
      .post<any>(`${config.apiUrl}`, {
        action
      })
      .pipe(
        tap(_ => this.log("fetched " + action)),
        catchError(this.handleError<any>(action, false))
      );
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
}
