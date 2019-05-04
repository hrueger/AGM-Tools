import { Component, OnInit } from "@angular/core";

import { DashboardDataService } from "../../_services/dashboard.data.service";


@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit {
  spaceChartData: { name: string, amount: string }[] = [];
  whatsnew;
  dates;

constructor(private dashboardDataService: DashboardDataService) {};

  ngOnInit() {
    this.initChart();
  }
  initChart() {
    this.dashboardDataService.getSpaceChartData().subscribe(data => {
      this.spaceChartData = [
        {name: "Verfügbar", amount: data[0]},
        {name: "Vom System belegt", amount: data[1]},
        {name: "Von Daten belegt", amount: data[2]},
    ];
    });
    this.dashboardDataService.getWhatsNew().subscribe(data => {
      this.whatsnew = data;
    });
    this.dashboardDataService.getDates().subscribe(data => {
      this.dates = data;
      console.log(data);
    });
  }
  
}
