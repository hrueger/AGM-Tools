import { EventEmitter, Injectable, Output } from "@angular/core";
import { ElectronService } from "./electron.service";

@Injectable()
export class NavbarService {
    public headline = "AGM-Tools";

    @Output() public change: EventEmitter<string> = new EventEmitter();

    constructor(private electronService: ElectronService) {}

    public setHeadline(headline: string) {
        this.headline = headline;
        setTimeout(() => { this.change.emit(this.headline); }, 0);
        this.electronService.setTitle(headline);
    }
}
