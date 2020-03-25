import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
    providedIn: "root",
})
export class FastTranslateService {
    private currentLang: string;
    constructor(private translateService: TranslateService) { }

    public t(key: string): Promise<string> {
        return this.translateService.get(key).toPromise();
    }
    public setLang(lang: string) {
        this.currentLang = lang;
        this.translateService.use(lang);
    }
    public getLang() {
        return this.currentLang ? this.currentLang : this.translateService.getBrowserLang();
    }
}
