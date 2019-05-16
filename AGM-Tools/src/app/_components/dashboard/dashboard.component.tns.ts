import { Component, OnInit } from "@angular/core";
import { NavbarService } from "../../_services/navbar.service";
import { DashboardDataService } from "../../_services/dashboard.data.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit {
    spaceChartData: { name: string; amount: string }[] = [];
    whatsnew;
    dates;
    selectedIndexes = [0, 3];
    items: any = [];

    constructor(
        private dashboardDataService: DashboardDataService,
        private remoteService: RemoteService,
        private NavbarService: NavbarService
    ) {}

    ngOnInit() {
        this.initChart();
    }
    initChart() {
        this.remoteService.get("dashboardGetSpaceChartData").subscribe(data => {
            console.log("Bekommene Daten");
            console.log(data);
            this.spaceChartData = [
                { name: "Verfügbar", amount: data[0] },
                { name: "Vom System belegt", amount: data[1] },
                { name: "Von Daten belegt", amount: data[2] }
            ];
        });
        this.dashboardDataService.getWhatsNew().subscribe(data => {
            this.whatsnew = data;
        });
        this.dashboardDataService.getDates().subscribe(data => {
            this.dates = data;
            //console.log(data);
        });

        this.NavbarService.setHeadline("Dashboard");
    }
}
