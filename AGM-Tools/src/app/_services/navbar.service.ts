import { EventEmitter, Injectable, Output } from "@angular/core";

@Injectable()
export class NavbarService {
    public headline = "AGM-Tools";

    @Output() public change: EventEmitter<string> = new EventEmitter();

    public setHeadline(headline: string) {
        this.headline = headline;
        setTimeout(() => { this.change.emit(this.headline); }, 0);
    }
}
