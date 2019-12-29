import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ChartOptions, ChartType } from "chart.js";
import { Label, MultiDataSet } from "ng2-charts";
// tslint:disable-next-line: max-line-length
import * as pluginDataLabels from "../../../../node_modules/chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.js";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-dashboard",
    styleUrls: ["./dashboard.component.scss"],
    templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
    public spaceChartLabels: Label[] = ["", "", ""];
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
    public lastUpdated: any = {
        changelog: "",
        events: "",
        space: "",
        version: "",
    };
    constructor(
        private remoteService: RemoteService,
        private navbarService: NavbarService,
        private fts: FastTranslateService,
    ) { }

    public async ngOnInit() {
        this.navbarService.setHeadline("Dashboard");
        this.spaceChartLabels = [
            await this.fts.t("dashboard.remainingDiskSpace"),
            await this.fts.t("dashboard.diskSpaceUsedBySystem"),
            await this.fts.t("dashboard.diskSpaceUsedByData"),
        ];
        this.initChart();
    }

    public getTimeDifference(time) {
        return new Date().getTime();
    }

    public initChart() {
        this.remoteService.get("get", "dashboard/spaceChartData").subscribe((data) => {
            this.setSpaceChartData(data);
            this.lastUpdated.space = data.lastUpdated;
        });
        this.remoteService.get("get", "dashboard/whatsnew").subscribe((data) => {
            this.whatsnew = data.changelog;
            this.lastUpdated.changelog = data.lastUpdated;
        });
        this.remoteService.get("get", "dashboard/events").subscribe((data) => {
            this.dates = data.events;
            this.lastUpdated.events = data.lastUpdated;
            const that = this;
            setInterval(() => {
                for (const event of that.dates) {
                    const d = this.dateDiff(new Date().getTime(), new Date(event.start).getTime());
                    const a = [];
                    if (d.months) { a.push(`${d.months} Monat${(d.months > 1 ? "e" : "")}`); }
                    if (d.days) { a.push(`${d.days} Tag${(d.days > 1 ? "e" : "")}`); }
                    if (d.hours) { a.push(`${d.hours} Stunde${(d.hours > 1 ? "n" : "")}`); }
                    if (d.minutes) { a.push(`${d.minutes} Minute${(d.minutes > 1 ? "n" : "")}`); }
                    if (d.seconds) { a.push(`${d.seconds} Sekunde${(d.seconds > 1 ? "n" : "")}`); }
                    event.countdownTime = a.join(", ");
                }
            });
        });
        this.remoteService.get("get", "dashboard/version").subscribe((data) => {
            this.version = data.version;
            this.lastUpdated.version = data.lastUpdated;
        });
        this.remoteService
            .get("get", "dashboard/notifications/")
            .subscribe((data) => {
                this.notifications = data.notifications;
                this.lastUpdated.notifications = data.lastUpdated;
            });
    }

    public updateChart() {
        this.remoteService
            .getNoCache("post", "dashboard/spaceChartData")
            .subscribe((data) => {
                this.setSpaceChartData(data);
                this.lastUpdated.space = data.lastUpdated;
            });
    }

    public seen(notification) {
        this.remoteService
            .get("post", `dashboard/notifications/${notification.id}`)
            .subscribe((data) => {
                if (data && data.status == true) {
                    this.notifications = this.notifications.filter(
                        (n) => n.id !== notification.id,
                    );
                }
            });
    }

    private setSpaceChartData(data: any) {
        this.spaceChartData = [data.free, data.system, data.used];
    }

    private dateDiff(a, b) {
        let delta = Math.abs(b - a) / 1000;
        const months = Math.floor(delta / 2592000);
        delta -= months * 2592000;
        const days = Math.floor(delta / 86400);
        delta -= days * 86400;
        const hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        const minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        const seconds = Math.floor(delta % 60);
        return {
            days,
            hours,
            minutes,
            months,
            seconds,
        };
    }
}
