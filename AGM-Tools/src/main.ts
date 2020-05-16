import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import isElectron from "is-electron";
import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

if (environment.production || isElectron()) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    // eslint-disable-next-line no-console
    .catch((err) => console.log(err));
