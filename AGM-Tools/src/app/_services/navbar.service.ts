import { EventEmitter, Injectable, Output } from "@angular/core";

@Injectable()
export class NavbarService {
    public headline: string = "AGM-Tools";

    @Output() public change: EventEmitter<string> = new EventEmitter();

    public setHeadline(headline) {
        this.headline = headline;
        this.change.emit(this.headline);
        // console.log("Headline changed");
    }
}
