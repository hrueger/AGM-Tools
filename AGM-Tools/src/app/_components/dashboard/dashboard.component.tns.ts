import { Component, OnInit } from "@angular/core";
import {NavbarService} from "../../_services/navbar.service"
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
  selectedIndexes = [0,3];
  items: any = [];
  

constructor(private dashboardDataService: DashboardDataService, private NavbarService: NavbarService) {};

  ngOnInit() {
    this.initChart();
    this.items = [
      {
          title: '1',
          footer: '10',
          headerText: 'First',
          footerText: '4',
          image: 'http://placehold.it/120x120&text=First',
          items: [{image: '~/images/a9ff17db85f8136619feb0d5a200c0e4.png', text: 'Stop'}, {
              text: 'Drop',
              image: '~/images/shazam.jpg'
          }]
      },
      {
          title: '2',
          footer: '20',
          headerText: 'Second',
          footerText: '5',
          image: 'http://placehold.it/120x120&text=Second',
          items: [{
              text: 'Drop',
              image: '~/images/batman.jpg'
          }, {text: 'Drop', image: '~/images/f29.png'}]
      },
      {
          title: '3',
          footer: '30',
          headerText: 'Third',
          footerText: '6',
          image: 'http://placehold.it/120x120&text=Third',
          items: [{text: 'Drop', image: '~/images/strider.png'}, {
              text: 'Drop',
              image: '~/images/f29.png'
          }]
      }
  ];
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
    
    this.NavbarService.setHeadline("Dashboard");
  }
  
}
