import { Component, OnInit } from "@angular/core";
import { Label, MultiDataSet } from "ng2-charts";
import { ChartType, ChartOptions } from "chart.js";
import { DashboardDataService } from "../../_services/dashboard.data.service";
import * as pluginDataLabels from "../../../../node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.js";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit {
  public spaceChartLabels: Label[] = [
    "Verfügbarer Speicherplatz",
    "Vom System belegt",
    "Von Daten belegt"
  ];
  public spaceChartData: MultiDataSet = [[0, 0, 0]]; //[[350, 450, 100]];
  public spaceChartColors = [
    {
      backgroundColor: [
        "rgb(151, 214, 237)",
        "rgb(237, 237, 237)",
        "rgb(160, 160, 160)"
      ]
    }
  ];
  public spaceChartType: ChartType = "doughnut";
  public spaceChartOptions: ChartOptions = {
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          return "";
        }
      }
    }
  };
  public spaceChartPlugins = [pluginDataLabels];
  public whatsnew: any;
  public dates: any;
  constructor(private dashboardDataService: DashboardDataService) {}

  ngOnInit() {
    this.initChart();
  }
  initChart() {
    this.dashboardDataService.getSpaceChartData().subscribe(data => {
      this.spaceChartData = [data];
    });
    this.dashboardDataService.getWhatsNew().subscribe(data => {
      this.whatsnew = data;
    });
    this.dashboardDataService.getDates().subscribe(data => {
      this.dates = data;
    });
  }
}
