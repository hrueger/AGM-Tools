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
    public showDashboardLayout: boolean = false;
    constructor(
        private remoteService: RemoteService,
        private navbarService: NavbarService,
    ) { }

    public ngOnInit() {
        this.navbarService.setHeadline("Dashboard");
        this.initChart();
    }

    public initChart() {
        this.remoteService.get("get", "dashboard/spaceChartData").subscribe((data) => {
            this.setSpaceChartData(data);
        });
        this.remoteService.get("get", "dashboard/whatsnew").subscribe((data) => {
            this.whatsnew = data;
        });
        this.remoteService.get("get", "dashboard/events").subscribe((data) => {
            this.dates = data;
        });
        this.remoteService.get("get", "dashboard/version").subscribe((data) => {
            this.version = data;
        });
        this.remoteService
            .getNoCache("get", "dashboard/notification/")
            .subscribe((data) => {
                this.notifications = data;
            });
        window.setInterval(() => {
            this.showDashboardLayout = true;
        }, 300);
    }

    

    public updateChart() {
        this.remoteService
            .getNoCache("post", "dashboard/spaceChartData")
            .subscribe((data) => {
                this.setSpaceChartData(data);
            });
    }

    public makeNotificationSeen(notification) {
        this.remoteService
            .getNoCache("post", `dashboard/notifications/${notification.id}`)
            .subscribe((data) => {
                if (data.status == true) {
                    this.notifications = this.notifications.filter(
                        (obj) => obj.id !== notification.id,
                    );
                }
            });
    }

    private setSpaceChartData(data: any) {
        this.spaceChartData = [data.free, data.system, data.used];
    }
}
