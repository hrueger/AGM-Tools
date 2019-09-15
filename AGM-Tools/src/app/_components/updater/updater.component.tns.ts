import { Component, OnInit } from "@angular/core";
import * as application from "tns-core-modules/application";
import * as utils from "tns-core-modules/utils/utils";
import config from "../../_config/config";

@Component({
  selector: "app-updater",
  styleUrls: ["./updater.component.scss"],
  templateUrl: "./updater.component.html",
})
export class UpdaterComponent implements OnInit {

  public ngOnInit() {
    application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
      args.cancel = true;
    });
  }

  public downloadUpdate() {
    utils.openUrl(`${config.apiUrl}?downloadMobileLatest`);
  }

}
