import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class NavbarService {

  headline: string = "AGM-Tools";

  @Output() change: EventEmitter<string> = new EventEmitter();

  setHeadline(headline) {
    this.headline = headline;
    this.change.emit(this.headline);
    //console.log("Headline changed");
  }

}