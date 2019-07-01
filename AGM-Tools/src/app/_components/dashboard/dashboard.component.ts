import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Label, MultiDataSet } from "ng2-charts";
import { ChartType, ChartOptions } from "chart.js";
import * as pluginDataLabels from "../../../../node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.js";
import { RemoteService } from "../../_services/remote.service";
import { NavbarService } from "../../_services/navbar.service";

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
    version: string;
    constructor(
        private remoteService: RemoteService,
        private NavbarService: NavbarService
    ) {}

    ngOnInit() {
        this.NavbarService.setHeadline("Dashboard");
        this.initChart();
    }

    initChart() {
        this.remoteService.get("dashboardGetSpaceChartData").subscribe(data => {
            this.spaceChartData = [data];
        });
        this.remoteService.get("dashboardGetWhatsnew").subscribe(data => {
            this.whatsnew = data;
        });
        this.remoteService.get("dashboardGetDates").subscribe(data => {
            this.dates = data;
        });
        this.remoteService.get("dashboardGetVersion").subscribe(data => {
            this.version = data;
        });
    }
}
