import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ChartOptions, ChartType } from "chart.js";
import { Label, MultiDataSet } from "ng2-charts";
// tslint:disable-next-line: max-line-length
import * as pluginDataLabels from "../../../../node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.js";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-dashboard",
    styleUrls: ["./dashboard.component.scss"],
    templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
    public spaceChartLabels: Label[] = [
        "Verfügbarer Speicherplatz",
        "Vom System belegt",
        "Von Daten belegt",
    ];
    public spaceChartData: MultiDataSet = [[0, 0, 0]]; // [[350, 450, 100]];
    public spaceChartColors = [
        {
            backgroundColor: [
                "rgb(151, 214, 237)",
                "rgb(237, 237, 237)",
                "rgb(160, 160, 160)",
            ],
        },
    ];
    public spaceChartType: ChartType = "doughnut";
    public spaceChartOptions: ChartOptions = {
        plugins: {
            datalabels: {
                formatter: (value, ctx) => {
                    return "";
                },
            },
        },
    };
    public spaceChartPlugins = [pluginDataLabels];
    public whatsnew: any;
    public dates: any;
    public cellSpacing: any;
    public version: string;
    public notifications: any[] = [];
    constructor(
        private remoteService: RemoteService,
        private navbarService: NavbarService,
    ) { }

    public ngOnInit() {
        this.navbarService.setHeadline("Dashboard");
        this.initChart();
    }

    public initChart() {
        this.remoteService.get("dashboardGetSpaceChartData").subscribe((data) => {
            this.spaceChartData = [data];
        });
        this.remoteService.get("dashboardGetWhatsnew").subscribe((data) => {
            this.whatsnew = data;
        });
        this.remoteService.get("dashboardGetDates").subscribe((data) => {
            this.dates = data;
        });
        this.remoteService.get("dashboardGetVersion").subscribe((data) => {
            this.version = data;
        });
        this.remoteService
            .getNoCache("dashboardGetNotifications")
            .subscribe((data) => {
                this.notifications = data.notifications;
            });
    }

    public makeNotificationSeen(notification) {
        this.remoteService
            .getNoCache("dashboardMakeNotificationSeen", {
                id: notification.id,
            })
            .subscribe((data) => {
                if (data.status == true) {
                    // console.log(true);
                    this.notifications = this.notifications.filter(
                        (obj) => obj.id !== notification.id,
                    );
                }
            });
    }
}
